import { useState, useEffect, useCallback, useRef } from 'react';
import { FormContent, ActiveEditor } from '../types/collaboration';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
export const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';

export const useCollaborativeForm = (formId: string) => {
  const [content, setContent] = useState<FormContent | null>(null);
  const [activeEditors, setActiveEditors] = useState<ActiveEditor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [userPermission, setUserPermission] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [wsConnectionAttempted, setWsConnectionAttempted] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const editTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  

  const pendingChangesRef = useRef<Map<string, any>>(new Map());

  // Obtain the form content
  const fetchFormContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/forms/${formId}/collaborative/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch form content');
      }
      
      const data = await response.json();
      setContent(data);
      setHasUnsavedChanges(false);
      pendingChangesRef.current.clear();
      const permissionResponse = await fetch(`${API_BASE_URL}/api/forms/${formId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (permissionResponse.ok) {
        const formData = await permissionResponse.json();
        const permission = formData.permission;
        setUserPermission(permission);
        const editPermission = permission === 'admin' || permission === 'write';
        setCanEdit(editPermission);
        
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [formId]);

  // Save the content in batches to the server
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
      
      // Update version number
      setContent(prev => prev ? {
        ...prev,
        version: result.version
      } : null);
      
      setHasUnsavedChanges(false);
      pendingChangesRef.current.clear();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content');
    }
  }, [formId]);

  // WebSocket
  const connectWebSocket = useCallback(() => {
    // Don't establish WebSocket connection if no edit permission or already attempted
    if (!canEdit || wsConnectionAttempted) {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setWsConnectionAttempted(true);
    const token = localStorage.getItem('accessToken');
    const wsUrl = `${WS_BASE_URL}/ws/form/${formId}/?token=${token}`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      setIsConnected(true);
    };
    
    wsRef.current.onclose = (event) => {
      setIsConnected(false);
      
      // If permission denied, don't retry
      if (event.code === 4403 || event.wasClean === false) {
        setError('Permission denied - unable to establish real-time connection');
        return;
      }
    };
    
    wsRef.current.onerror = (error) => {
      setIsConnected(false);
      setError('Permission denied - you do not have edit access');
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };
  }, [formId, canEdit, wsConnectionAttempted]);

  // Handling WebSocket messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'field_update':
        // Update the field content and version
        setContent(prev => prev ? {
          ...prev,
          [data.field_name]: data.field_value,
          version: data.version || prev.version
        } : null);
        break;
        
      case 'batch_update':
        // Handle batch updates
        setContent(prev => {
          if (!prev) return null;
          const updates = data.changes || {};
          return {
            ...prev,
            ...updates,
            version: data.version || prev.version
          };
        });
        break;
        
      case 'user_editing':
        setActiveEditors(prev => {
          const filtered = prev.filter(editor => editor.user_id !== data.user_id);
          return [...filtered, {
            user_id: data.user_id,
            user_name: data.user_name,
            field_name: data.field_name,
            cursor_position: data.cursor_position,
            last_activity: new Date().toISOString()
          }];
        });
        break;
        
      case 'user_stopped_editing':
        setActiveEditors(prev => 
          prev.filter(editor => editor.user_id !== data.user_id)
        );
        break;
        
      case 'cursor_update':
        setActiveEditors(prev => 
          prev.map(editor => 
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
        );
        break;
        
      case 'active_editors':
        setActiveEditors(data.editors);
        break;
        
      case 'version_saved':
        setContent(prev => prev ? {
          ...prev,
          version: data.version
        } : null);
        setHasUnsavedChanges(false);
        pendingChangesRef.current.clear();
        break;
    }
  }, []);

  // Immediately update the local content
  const updateLocalContent = useCallback((fieldName: string, value: any) => {
    setContent(prev => prev ? {
      ...prev,
      [fieldName]: value
    } : null);
    setHasUnsavedChanges(true);
    
    pendingChangesRef.current.set(fieldName, value);
  }, []);

  const debouncedBatchSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      savePendingChanges();
    }, 3000);
  }, [savePendingChanges]);

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


  const debouncedUpdate = useCallback((fieldName: string, value: any) => {
    if (!canEdit) {
      setError('You do not have permission to edit this form');
      return;
    }
    
    updateLocalContent(fieldName, value);
    broadcastFieldChange(fieldName, value);
    debouncedBatchSave();
  }, [updateLocalContent, broadcastFieldChange, debouncedBatchSave, canEdit]);


  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    await savePendingChanges();
  }, [savePendingChanges]);

  // Start editing the fields
  const startEditing = useCallback((fieldName: string, cursorPosition: number = 0) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'start_editing',
        field_name: fieldName,
        cursor_position: cursorPosition
      }));
    }
  }, []);

  // Stop editing the fieldsStart editing the fields
  const stopEditing = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'stop_editing'
      }));
    }
  }, []);

  // Update cursor position
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

  // Save before closing the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || pendingChangesRef.current.size > 0) {
        e.preventDefault();
        e.returnValue = '';
        saveNow();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, saveNow]);

  // Automatically saves data when the page is not visible.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && (hasUnsavedChanges || pendingChangesRef.current.size > 0)) {
        saveNow();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [hasUnsavedChanges, saveNow]);

useEffect(() => {
  fetchFormContent();
}, [formId]);
  
  useEffect(() => {
    // Only attempt WebSocket connection for users with edit permission
    if (userPermission !== null && canEdit && !wsConnectionAttempted) {
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
    };
  }, [userPermission, canEdit, connectWebSocket, wsConnectionAttempted]);

  return {
    content,
    activeEditors,
    isLoading,
    error,
    isConnected,
    hasUnsavedChanges: hasUnsavedChanges || pendingChangesRef.current.size > 0,
    debouncedUpdate,
    startEditing,
    stopEditing,
    updateCursor,
    saveNow,
    refetch: fetchFormContent
  };
};