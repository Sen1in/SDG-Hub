/**
 * 从搜索结果中提取关键词的工具函数
 * 用于首页搜索框的关键词建议功能
 */

export interface KeywordSuggestion {
  term: string;
  type: 'keyword';
  count: number;
}

/**
 * 从搜索结果中提取包含查询词的关键词，并按出现频率排序
 * @param results 搜索结果数组
 * @param query 用户输入的查询词
 * @returns 按频率排序的关键词建议数组
 */
export const extractMatchingKeywords = (
  results: any[], 
  query: string
): KeywordSuggestion[] => {
  const keywordCounts = new Map<string, number>();
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery || normalizedQuery.length < 2) {
    return [];
  }
  
  results.forEach(result => {
    // 从不同字段中提取文本内容
    const textFields = [
      result.title,
      result.actions, // Actions资源的标题字段
      result.description,
      result.action_detail, // Actions资源的详情字段
      result.aims // Education资源的目标字段
    ].filter(Boolean); // 过滤掉空值
    
    textFields.forEach(text => {
      if (typeof text === 'string') {
        // 将文本转换为小写并分割成单词
        const words = text.toLowerCase()
          .replace(/[^\w\s]/g, ' ') // 移除标点符号
          .split(/\s+/)
          .filter(word => word.length > 0);
        
        words.forEach(word => {
          // 检查单词是否以查询词开头且长度大于查询词
          if (word.startsWith(normalizedQuery) && word.length > normalizedQuery.length) {
            // 统计关键词出现次数
            const currentCount = keywordCounts.get(word) || 0;
            keywordCounts.set(word, currentCount + 1);
          }
        });
      }
    });
  });
  
  // 转换为建议格式，按频率排序，并限制数量
  return Array.from(keywordCounts.entries())
    .sort((a, b) => b[1] - a[1]) // 按频率降序排序
    .slice(0, 5) // 最多返回5个关键词
    .map(([keyword, count]) => ({
      term: keyword,
      type: 'keyword' as const,
      count: count
    }));
};

/**
 * 从单个文本中提取以查询词开头的关键词
 * @param text 文本内容
 * @param query 查询词
 * @returns 关键词数组
 */
export const extractKeywordsFromText = (text: string, query: string): string[] => {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedText = text.toLowerCase();
  
  if (!normalizedQuery || normalizedQuery.length < 2) {
    return [];
  }
  
  const words = normalizedText
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  return words.filter(word => 
    word.startsWith(normalizedQuery) && word.length > normalizedQuery.length
  );
};
