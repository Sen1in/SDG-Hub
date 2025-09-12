import React from 'react';

const Goal9 = () => {
  const handleGoBack = () => {
    window.history.back();
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
      <h2 className="text-3xl font-bold mb-4">SDG 9 Industry, Innovation and Infrastructure</h2>
      <a
        href="https://sdg-tracker.org/infrastructure-industrialization"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        https://sdg-tracker.org/infrastructure-industrialization
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
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">9.1</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Develop sustainable, resilient and inclusive infrastructures</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Develop quality, reliable, sustainable and resilient infrastructure, including regional and transborder infrastructure, to support economic development and human well-being, with a focus on affordable and equitable access for all.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">9.2</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Promote inclusive and sustainable industrialization</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Promote inclusive and sustainable industrialization and, by 2030, significantly raise industry’s share of employment and gross domestic product, in line with national circumstances, and double its share in least developed countries.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">9.3</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Increase access to financial services and markets</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Increase the access of small-scale industrial and other enterprises, in particular in developing countries, to financial services, including affordable credit, and their integration into value chains and markets.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">9.4</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Upgrade all industries and infrastructures for sustainability</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, upgrade infrastructure and retrofit industries to make them sustainable, with increased resource-use efficiency and greater adoption of clean and environmentally sound technologies and industrial processes, with all countries taking action in accordance with their respective capabilities.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">9.5</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Enhance research and upgrade industrial technologies</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Enhance scientific research, upgrade the technological capabilities of industrial sectors in all countries, in particular developing countries, including, by 2030, encouraging innovation and substantially increasing the number of research and development workers per 1 million people and public and private research and development spending.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">9.A</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Facilitate sustainable infrastructure development for developing countries</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Facilitate sustainable and resilient infrastructure development in developing countries through enhanced financial, technological and technical support to African countries, least developed countries, landlocked developing countries and small island developing States.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">9.B</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Support domestic technology development and industrial diversification</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Support domestic technology development, research and innovation in developing countries, including by ensuring a conducive policy environment for, inter alia, industrial diversification and value addition to commodities.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">9.C</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Universal access to information and communications technology</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Significantly increase access to information and communications technology and strive to provide universal and affordable access to the Internet in least developed countries by 2020.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Goal9;
