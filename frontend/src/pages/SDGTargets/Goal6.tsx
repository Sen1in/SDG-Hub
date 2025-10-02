import React from 'react';
import { useNavigate } from 'react-router-dom';

const Goal6 = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/#sdg-goals');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={handleGoBack}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Go Back
      </button>
      <h2 className="text-3xl font-bold mb-4">SDG 6 Clean Water and Sanitation</h2>
      <p className="text-lg mb-4">
        Ensure availability and sustainable management of water and sanitation for all.
      </p>
      <a
        href="https://sdg-tracker.org/water-and-sanitation"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        https://sdg-tracker.org/water-and-sanitation
      </a>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Targets</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">6.1</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Safe and affordable drinking water</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, achieve universal and equitable access to safe and affordable drinking water for all.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">6.2</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">End open defecation and provide access to sanitation and hygiene</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, achieve access to adequate and equitable sanitation and hygiene for all and end open defecation, paying special attention to the needs of women and girls and those in vulnerable situations.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">6.3</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Improve water quality, wastewater treatment and safe reuse</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, improve water quality by reducing pollution, eliminating dumping and minimizing release of hazardous chemicals and materials, halving the proportion of untreated wastewater and substantially increasing recycling and safe reuse globally.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">6.4</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Increase water use efficiency and ensure freshwater supplies</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, substantially increase water-use efficiency across all sectors and ensure sustainable withdrawals and supply of freshwater to address water scarcity and substantially reduce the number of people suffering from water scarcity.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">6.5</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Implement integrated water resources management</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, implement integrated water resources management at all levels, including through transboundary cooperation as appropriate.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">6.6</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Protect and restore water-related ecosystems</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2020, protect and restore water-related ecosystems, including mountains, forests, wetlands, rivers, aquifers and lakes.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">6.A</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Expand water and sanitation support to developing countries</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, expand international cooperation and capacity-building support to developing countries in water- and sanitation-related activities and programmes, including water harvesting, desalination, water efficiency, wastewater treatment, recycling and reuse technologies.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">6.B</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Support local engagement in water and sanitation management</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Support and strengthen the participation of local communities in improving water and sanitation management.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Goal6;
