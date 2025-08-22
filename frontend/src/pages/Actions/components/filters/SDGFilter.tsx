import React from 'react';
import { SDGBadge } from '../shared/SDGBadge';
import { getSDGTitle } from '../../utils/sdg';

interface SDGFilterProps {
  selectedSDGs: number[];
  onToggle: (sdg: number) => void;
  sdgOptions: Array<{value: number; label: string}>;
  sdgDistribution?: Record<string, number>;
}

export const SDGFilter: React.FC<SDGFilterProps> = ({
  selectedSDGs,
  onToggle,
  sdgOptions,
  sdgDistribution
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Related SDGs
      </label>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {sdgOptions.map(sdg => (
          <label key={sdg.value} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedSDGs.includes(sdg.value)}
              onChange={() => onToggle(sdg.value)}
              className="mr-2"
            />
            <SDGBadge sdg={sdg.value} size="sm" className="mr-2" />
            <span className="text-sm">SDG {sdg.value} - {getSDGTitle(sdg.value)}</span>
            {sdgDistribution?.[`sdg_${sdg.value}`] && (
              <span className="ml-auto text-xs text-gray-500">
                {sdgDistribution[`sdg_${sdg.value}`]}
              </span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
};
