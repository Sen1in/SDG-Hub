import React from 'react';

const Goal10 = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-4">SDG 10 Reduced Inequalities</h2>
      <a
        href="https://sdg-tracker.org/inequality"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        https://sdg-tracker.org/inequality
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
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">10.1</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Reduce income inequalities</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, progressively achieve and sustain income growth of the bottom 40 per cent of the population at a rate higher than the national average.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">10.2</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Promote universal social, economic and political inclusion</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, empower and promote the social, economic and political inclusion of all, irrespective of age, sex, disability, race, ethnicity, origin, religion or economic or other status.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">10.3</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Ensure equal opportunities and end discrimination</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Ensure equal opportunity and reduce inequalities of outcome, including by eliminating discriminatory laws, policies and practices and promoting appropriate legislation, policies and action in this regard.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">10.4</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Adopt fiscal and social policies that promotes equality</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Adopt policies, especially fiscal, wage and social protection policies, and progressively achieve greater equality.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">10.5</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Improved regulation of global financial markets and institutions</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Improve the regulation and monitoring of global financial markets and institutions and strengthen the implementation of such regulations.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">10.6</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Enhanced representation for developing countries in financial institutions</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Ensure significant mobilization of resources from a variety of sources, including through enhanced development cooperation, in order to provide adequate and predictable means for developing countries, in particular least developed countries, to implement programmes and policies to end poverty in all its dimensions.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">10.7</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Responsible and well-managed migration policies</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Facilitate orderly, safe, regular and responsible migration and mobility of people, including through the implementation of planned and well-managed migration policies.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">10.a</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Special and differential treatment for developing countries</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Implement the principle of special and differential treatment for developing countries, in particular least developed countries, in accordance with World Trade Organization agreements.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">10.b</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Special and differential treatment for developing countries</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Implement the principle of special and differential treatment for developing countries, in particular least developed countries, in accordance with World Trade Organization agreements.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Goal10;
