import { SDG_COLORS, SDG_TITLES } from './constants';

export const getSDGColor = (goal: number): string => {
  return SDG_COLORS[goal - 1] || 'bg-gray-500';
};

export const getSDGTitle = (goal: number): string => {
  return SDG_TITLES[goal - 1] || 'Unknown';
};