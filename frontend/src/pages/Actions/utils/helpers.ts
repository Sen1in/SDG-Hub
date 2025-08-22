export const safeValue = (value: any, fallback = 'Not specified'): string => {
  return value && value.trim() ? value : fallback;
};

export const safeArray = <T>(arr: T[]): T[] => {
  return Array.isArray(arr) ? arr : [];
};