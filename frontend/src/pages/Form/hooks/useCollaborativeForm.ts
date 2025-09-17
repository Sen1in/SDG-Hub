import { useState, useEffect, useCallback, useRef } from 'react';
import { FormContent, ActiveEditor } from '../types/collaboration';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

interface CollaborativeFormState {
  content: FormContent | null;
  activeEditors: ActiveEditor[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  hasUnsavedChanges: boolean;
  userPermission: string | null;
  canEdit: boolean;
  wsConnectionAttempted: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' | 'permission_denied';
}

export const useCollaborativeForm = (formId: string) => {
  const [state, setState] = useState<CollaborativeFormState>({
    content: null,
    activeEditors: [],
    isLoading: true,
    error: null,
    isConnected: false,
    hasUnsavedChanges: false,
    userPermission: null,
    canEdit: false,
    wsConnectionAttempted: false,
    connectionStatus: 'disconnected'
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const editTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef<number>(0);
  const maxReconnectAttempts = 3;
  const pendingChangesRef = useRef<Map<string, any>>(new Map());

  const fetchFormContent = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const token = localStorage.getItem('accessToken');
      
      const permissionResponse = await fetch(`${API_BASE_URL}/api/forms/${formId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!permissionResponse.ok) {
        throw new Error(`Failed to fetch form permissions: ${permissionResponse.status}`);
      }
      
      const formData = await permissionResponse.json();
      const permission = formData.permission;
      const canEdit = permission === 'admin' || permission === 'write';
      
      console.log('Form permission:', permission, 'Can edit:', canEdit);
      
      // 获取协作表单内容
      const contentResponse = await fetch(`${API_BASE_URL}/api/forms/${formId}/collaborative/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!contentResponse.ok) {
        throw new Error(`Failed to fetch form content: ${contentResponse.status}`);
      }
      
      const contentData = await contentResponse.json();
      
      setState(prev => ({
        ...prev,
        content: contentData,
        userPermission: permission,
        canEdit,
        hasUnsavedChanges: false,
        isLoading: false
      }));
      
      pendingChangesRef.current.clear();
      
    } catch (err) {
      console.error('Error fetching form content:', err);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        isLoading: false
      }));
    }
  }, [formId]);

  const savePendingChanges = useCallback(async () => {
    if (pendingChangesRef.current.size === 0) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const changes = Object.fromEntries(pendingChangesRef.current);
      
      const response = await fetch(`${API_BASE_URL}/api/forms/${formId}/collaborative/batch/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          changes: changes
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save content');
      }
      
      const result = await response.json();
      
      setState(prev => ({
        ...prev,
        content: prev.content ? {
          ...prev.content,
          version: result.version
        } : null,
        hasUnsavedChanges: false
      }));
      
      pendingChangesRef.current.clear();
      
    } catch (err) {
      console.error('Error saving changes:', err);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to save content'
      }));
    }
  }, [formId]);

  const connectWebSocket = useCallback(() => {
    if (!state.canEdit) {
      console.log('No edit permission, skipping WebSocket connection');
      return;
    }

    if (state.wsConnectionAttempted && wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setState(prev => ({ 
      ...prev, 
      connectionStatus: 'connecting',
      wsConnectionAttempted: true 
    }));

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setState(prev => ({
        ...prev,
        error: 'No authentication token found',
        connectionStatus: 'error'
      }));
      return;
    }

    const wsUrl = `${WS_BASE_URL}/ws/form/${formId}/?token=${token}`;
    console.log('Attempting WebSocket connection to:', wsUrl);
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected successfully');
        reconnectAttempts.current = 0;
        setState(prev => ({
          ...prev,
          isConnected: true,
          connectionStatus: 'connected',
          error: null
        }));
      };
      
      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setState(prev => ({ ...prev, isConnected: false }));
        
        // 处理不同的关闭代码
        if (event.code === 4403) {
          setState(prev => ({
            ...prev,
            error: 'Permission denied - you do not have edit access to this form',
            connectionStatus: 'permission_denied'
          }));
        } else if (event.code === 1006 && reconnectAttempts.current < maxReconnectAttempts) {
          // 意外断开连接，尝试重连
          console.log(`Attempting to reconnect (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          reconnectAttempts.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 2000 * reconnectAttempts.current);
        } else {
          setState(prev => ({
            ...prev,
            connectionStatus: 'disconnected'
          }));
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({
          ...prev,
          isConnected: false,
          error: 'WebSocket connection error',
          connectionStatus: 'error'
        }));
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      setState(prev => ({
        ...prev,
        error: 'Failed to create WebSocket connection',
        connectionStatus: 'error'
      }));
    }
  }, [formId, state.canEdit, state.wsConnectionAttempted]);

  // 处理WebSocket消息
  const handleWebSocketMessage = useCallback((data: any) => {
    console.log('Received WebSocket message:', data.type);
    
    switch (data.type) {
      case 'field_update':
        setState(prev => ({
          ...prev,
          content: prev.content ? {
            ...prev.content,
            [data.field_name]: data.field_value,
            version: data.version || prev.content.version
          } : null
        }));
        break;
        
      case 'batch_update':
        setState(prev => ({
          ...prev,
          content: prev.content ? {
            ...prev.content,
            ...data.changes,
            version: data.version || prev.content.version
          } : null
        }));
        break;
        
      case 'user_editing':
        setState(prev => {
          const filtered = prev.activeEditors.filter(editor => editor.user_id !== data.user_id);
          return {
            ...prev,
            activeEditors: [...filtered, {
              user_id: data.user_id,
              user_name: data.user_name,
              field_name: data.field_name,
              cursor_position: data.cursor_position,
              last_activity: new Date().toISOString()
            }]
          };
        });
        break;
        
      case 'user_stopped_editing':
        setState(prev => ({
          ...prev,
          activeEditors: prev.activeEditors.filter(editor => editor.user_id !== data.user_id)
        }));
        break;
        
      case 'cursor_update':
        setState(prev => ({
          ...prev,
          activeEditors: prev.activeEditors.map(editor => 
            editor.user_id === data.user_id 
              ? {
                  ...editor,
                  cursor_position: data.cursor_position,
                  selection_start: data.selection_start,
                  selection_end: data.selection_end,
                  field_name: data.field_name
                }
              : editor
          )
        }));
        break;
        
      case 'active_editors':
        setState(prev => ({
          ...prev,
          activeEditors: data.editors
        }));
        break;
        
      case 'version_saved':
        setState(prev => ({
          ...prev,
          content: prev.content ? {
            ...prev.content,
            version: data.version
          } : null,
          hasUnsavedChanges: false
        }));
        pendingChangesRef.current.clear();
        break;
    }
  }, []);

  // 更新本地内容
  const updateLocalContent = useCallback((fieldName: string, value: any) => {
    setState(prev => ({
      ...prev,
      content: prev.content ? {
        ...prev.content,
        [fieldName]: value
      } : null,
      hasUnsavedChanges: true
    }));
    
    pendingChangesRef.current.set(fieldName, value);
  }, []);

  // 防抖批量保存
  const debouncedBatchSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      savePendingChanges();
    }, 3000);
  }, [savePendingChanges]);

  // 广播字段更改
  const broadcastFieldChange = useCallback((fieldName: string, value: any) => {
    if (editTimeoutRef.current) {
      clearTimeout(editTimeoutRef.current);
    }
    
    editTimeoutRef.current = setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'field_update',
          field_name: fieldName,
          field_value: value
        }));
      }
    }, 300);
  }, []);

  // 防抖更新
  const debouncedUpdate = useCallback((fieldName: string, value: any) => {
    if (!state.canEdit) {
      setState(prev => ({
        ...prev,
        error: 'You do not have permission to edit this form'
      }));
      return;
    }
    
    updateLocalContent(fieldName, value);
    broadcastFieldChange(fieldName, value);
    debouncedBatchSave();
  }, [updateLocalContent, broadcastFieldChange, debouncedBatchSave, state.canEdit]);

  // 立即保存
  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await savePendingChanges();
  }, [savePendingChanges]);

  // WebSocket操作函数
  const startEditing = useCallback((fieldName: string, cursorPosition: number = 0) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'start_editing',
        field_name: fieldName,
        cursor_position: cursorPosition
      }));
    }
  }, []);

  const stopEditing = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'stop_editing'
      }));
    }
  }, []);

  const updateCursor = useCallback((fieldName: string, cursorPosition: number, selectionStart?: number, selectionEnd?: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'cursor_move',
        field_name: fieldName,
        cursor_position: cursorPosition,
        selection_start: selectionStart,
        selection_end: selectionEnd
      }));
    }
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 重新尝试连接
  const retryConnection = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      wsConnectionAttempted: false,
      connectionStatus: 'disconnected'
    }));
    reconnectAttempts.current = 0;
    connectWebSocket();
  }, [connectWebSocket]);

  // 页面卸载前保存
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges || pendingChangesRef.current.size > 0) {
        e.preventDefault();
        e.returnValue = '';
        saveNow();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.hasUnsavedChanges, saveNow]);

  // 页面隐藏时自动保存
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && (state.hasUnsavedChanges || pendingChangesRef.current.size > 0)) {
        saveNow();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.hasUnsavedChanges, saveNow]);

  // 初始化
  useEffect(() => {
    fetchFormContent();
  }, [formId]);
  
  // 建立WebSocket连接
  useEffect(() => {
    // 只有在获取到权限信息且用户有编辑权限时才尝试建立WebSocket连接
    if (state.userPermission !== null && state.canEdit && !state.wsConnectionAttempted) {
      console.log('User has edit permission, attempting WebSocket connection');
      connectWebSocket();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (editTimeoutRef.current) {
        clearTimeout(editTimeoutRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [state.userPermission, state.canEdit, state.wsConnectionAttempted, connectWebSocket]);

  return {
    content: state.content,
    activeEditors: state.activeEditors,
    isLoading: state.isLoading,
    error: state.error,
    isConnected: state.isConnected,
    canEdit: state.canEdit,
    userPermission: state.userPermission,
    hasUnsavedChanges: state.hasUnsavedChanges || pendingChangesRef.current.size > 0,
    connectionStatus: state.connectionStatus,
    debouncedUpdate,
    startEditing,
    stopEditing,
    updateCursor,
    saveNow,
    clearError,
    retryConnection,
    refetch: fetchFormContent
  };
};