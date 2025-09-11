import React from 'react';

const Goal7 = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-4">SDG 7 Affordable and Clean Energy</h2>
      <a
        href="https://sdg-tracker.org/energy"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        https://sdg-tracker.org/energy
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
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">7.1</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Universal access to modern energy</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, ensure universal access to affordable, reliable and modern energy services.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">7.2</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Increase global percentage of renewable energy</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, increase substantially the share of renewable energy in the global energy mix.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">7.3</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Double the improvement in energy efficiency</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, double the global rate of improvement in energy efficiency.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">7.A</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Promote access, technology and investments in clean energy</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, enhance international cooperation to facilitate access to clean energy research and technology, including renewable energy, energy efficiency and advanced and cleaner fossil-fuel technology, and promote investment in energy infrastructure and clean energy technology.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">7.B</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Expand and upgrade energy services for developing countries</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, expand infrastructure and upgrade technology for supplying modern and sustainable energy services for all in developing countries, in particular least developed countries, small island developing States and landlocked developing countries, in accordance with their respective programmes of support.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Goal7;
