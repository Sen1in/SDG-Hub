import React from 'react';

const Goal1 = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-4">SDG 1 No Poverty</h2>
      <p className="text-lg mb-4">
        Sustainable Development Goal 1 aims to eradicate extreme poverty by 2030.
      </p>
      <a
        href="https://sdg-tracker.org/no-poverty"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        https://sdg-tracker.org/no-poverty
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
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1.1</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Eradicate extreme poverty</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, eradicate extreme poverty for all people everywhere, currently measured as people living on less than $1.25 a day.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1.2</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Reduce poverty by at least 50%</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, reduce at least by half the proportion of men, women and children of all ages living in poverty in all its dimensions according to national definitions.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1.3</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Implement social protection systems</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Implement nationally appropriate social protection systems and measures for all, including floors, and by 2030 achieve substantial coverage of the poor and the vulnerable.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1.4</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Equal rights to ownership, basic services, technology and economic resources</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, ensure that all men and women, in particular the poor and the vulnerable, have equal rights to economic resources, as well as access to basic services, ownership and control over land and other forms of property, inheritance, natural resources, appropriate new technology and financial services, including microfinance.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1.5</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Build resilience to environmental, economic and social disasters</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, build the resilience of the poor and those in vulnerable situations and reduce their exposure and vulnerability to climate-related extreme events and other economic, social and environmental shocks and disasters.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1.A</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Mobilisation of resources to end poverty</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Ensure significant mobilization of resources from a variety of sources, including through enhanced development cooperation, in order to provide adequate and predictable means for developing countries, in particular least developed countries, to implement programmes and policies to end poverty in all its dimensions.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">1.B</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Create Pro-poor and Gender-sensitive policy frameworks</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Create sound policy frameworks at the national, regional and international levels, based on pro-poor and gender-sensitive development strategies, to support accelerated investment in poverty eradication actions.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Goal1;
