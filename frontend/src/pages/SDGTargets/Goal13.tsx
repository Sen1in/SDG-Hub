import React from 'react';

const Goal13 = () => {
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
      <h2 className="text-3xl font-bold mb-4">SDG 13 Climate Action</h2>
      <a
        href="https://sdg-tracker.org/climate-change"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        https://sdg-tracker.org/climate-change
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
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">13.1</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Strengthen resilience and adaptive capacity to climate-related disasters</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Strengthen resilience and adaptive capacity to climate-related hazards and natural disasters in all countries.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">13.2</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Integrate climate change measures into policy and planning</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Integrate climate change measures into national policies, strategies and planning.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">13.3</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Build knowledge and capacity to meet climate change</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Improve education, awareness-raising and human and institutional capacity on climate change mitigation, adaptation, impact reduction and early warning.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">13.A</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Implement the UN Framework Convention on Climate Change</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Implement the commitment undertaken by developed-country parties to the United Nations Framework Convention on Climate Change to a goal of mobilizing jointly $100 billion annually by 2020 from all sources to address the needs of developing countries in the context of meaningful mitigation actions and transparency on implementation and fully operationalize the Green Climate Fund through its capitalization as soon as possible.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">13.B</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Promote mechanisms to raise capacity for planning and management</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Promote mechanisms for raising capacity for effective climate change-related planning and management in least developed countries and small island developing States, including focusing on women, youth and local and marginalized communities.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Goal13;
