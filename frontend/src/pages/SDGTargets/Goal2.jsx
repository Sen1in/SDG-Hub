import React from 'react';

const Goal2 = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-4">SDG 2 Zero Hunger</h2>
      <p className="text-lg mb-4"></p>
      <a
        href="https://sdg-tracker.org/zero-hunger"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        https://sdg-tracker.org/zero-hunger
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
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2.1</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Universal access to safe and nutritious food</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, end hunger and ensure access by all people, in particular the poor and people in vulnerable situations, including infants, to safe, nutritious and sufficient food all year round.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2.2</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">End all forms of malnutrition</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, end all forms of malnutrition, including achieving, by 2025, the internationally agreed targets on stunting and wasting in children under 5 years of age, and address the nutritional needs of adolescent girls, pregnant and lactating women and older persons.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2.3</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Double the productivity and incomes of small-scale food producers</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, double the agricultural productivity and incomes of small-scale food producers, in particular women, indigenous peoples, family farmers, pastoralists and fishers, including through secure and equal access to land, other productive resources and inputs, knowledge, financial services, markets and opportunities for value addition and non-farm employment.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2.4</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sustainable food production and resilient agricultural practices</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, ensure sustainable food production systems and implement resilient agricultural practices that increase productivity and production, that help maintain ecosystems, that strengthen capacity for adaptation to climate change, extreme weather, drought, flooding and other disasters and that progressively improve land and soil quality.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2.5</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Maintain the genetic diversity in food production</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2020, maintain the genetic diversity of seeds, cultivated plants and farmed and domesticated animals and their related wild species, including through soundly managed and diversified seed and plant banks at the national, regional and international levels, and promote access to and fair and equitable sharing of benefits arising from the utilization of genetic resources and associated traditional knowledge, as internationally agreed.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2.A</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Invest in rural infrastructure, agricultural research, technology and gene banks</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Increase investment, including through enhanced international cooperation, in rural infrastructure, agricultural research and extension services, technology development and plant and livestock gene banks in order to enhance agricultural productive capacity in developing countries, in particular least developed countries.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2.B</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Prevent agricultural trade restrictions, market distortions and export subsidies</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Correct and prevent trade restrictions and distortions in world agricultural markets, including through the parallel elimination of all forms of agricultural export subsidies and all export measures with equivalent effect, in accordance with the mandate of the Doha Development Round.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">2.C</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Ensure stable food commodity markets and timely access to information</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Adopt measures to ensure the proper functioning of food commodity markets and their derivatives and facilitate timely access to market information, including on food reserves, in order to help limit extreme food price volatility.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Goal2;
