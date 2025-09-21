import { useState, useEffect, useRef } from 'react';
import { extractMatchingKeywords, KeywordSuggestion } from '../utils/keywordExtractor';

/**
 * 首页搜索Hook
 * 复用现有的Actions和Education搜索API，提取关键词建议
 */
export const useHomeSearch = (inputValue: string) => {
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const requestIdRef = useRef<number>(0);

  useEffect(() => {
    // 清除之前的定时器
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // 输入太短时隐藏建议
    if (inputValue.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // 防抖搜索 - 200ms延迟
    debounceTimeoutRef.current = setTimeout(async () => {
      const currentRequestId = ++requestIdRef.current;
      
      try {
        // 并行调用Actions和Education搜索API，获取更多结果用于统计
        const [actionsResponse, educationResponse] = await Promise.all([
          fetch(`/api/actions/?search=${encodeURIComponent(inputValue)}&page=1&page_size=20`),
          fetch(`/api/education/?search=${encodeURIComponent(inputValue)}&page=1&page_size=20`)
        ]);

        // 检查请求是否被新的请求覆盖
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        // 检查响应状态
        if (!actionsResponse.ok || !educationResponse.ok) {
          throw new Error('Failed to fetch search results');
        }

        // 解析响应数据
        const [actionsData, educationData] = await Promise.all([
          actionsResponse.json(),
          educationResponse.json()
        ]);

        // 合并搜索结果
        const allResults = [
          ...(actionsData.results || []),
          ...(educationData.results || [])
        ];

        // 提取关键词
        const keywords = extractMatchingKeywords(allResults, inputValue);

        // 更新状态
        setSuggestions(keywords);
        setIsOpen(keywords.length > 0);
        setIsLoading(false);
        setError(null);

      } catch (err) {
        // 检查请求是否被新的请求覆盖
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        console.error('Error fetching search suggestions:', err);
        setError('Failed to load suggestions');
        setIsLoading(false);
        setIsOpen(false);
      }
    }, 200); // 200ms防抖延迟

    // 清理函数
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [inputValue]);

  // 清除错误状态
  const clearError = () => setError(null);

  return {
    suggestions,
    isLoading,
    isOpen,
    error,
    clearError
  };
};
