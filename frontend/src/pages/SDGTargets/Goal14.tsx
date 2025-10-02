import React from 'react';
import { useNavigate } from 'react-router-dom';

const Goal14 = () => {
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
      <h2 className="text-3xl font-bold mb-4">SDG 14 Life Below Water</h2>
      <p className="mb-4">
        Conserve and sustainably use the oceans, seas and marine resources.
      </p>
      <a
        href="https://sdg-tracker.org/oceans"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        https://sdg-tracker.org/oceans
      </a>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">14.1</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Reduce marine pollution</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2025, prevent and significantly reduce marine pollution of all kinds, in particular from land-based activities, including marine debris and nutrient pollution.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">14.2</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Protect and restore ecosystems</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2020, sustainably manage and protect marine and coastal ecosystems to avoid significant adverse impacts, including by strengthening their resilience, and take action for their restoration in order to achieve healthy and productive oceans.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">14.3</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Reduce ocean acidification</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Minimize and address the impacts of ocean acidification, including through enhanced scientific cooperation at all levels.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">14.4</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sustainable fishing</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2020, effectively regulate harvesting and end overfishing, illegal, unreported and unregulated fishing and destructive fishing practice and implement science-based management plans, in order to restore fish stocks in the shortest time feasible, at least to levels that can produce maximum sustainable yield as determined by their biological characteristics.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">14.5</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Conserve coastal and marine areas</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2020, conserve at least 10 per cent of coastal and marine areas, consistent with national and international law and based on the best available scientific information.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">14.6</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">End subsidies contributing to overfishing</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2020, prohibit certain forms of fisheries subsidies which contribute to overcapacity and overfishing, eliminate subsidies that contribute to illegal, unreported and unregulated fishing and refrain from introducing new such subsidies, recognizing that appropriate and effective special and differential treatment for developing and least developed countries should be an integral part of the World Trade Organization fisheries subsidies negotiation.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">14.7</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Increase the economic benefits from sustainable use of marine resource</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, increase the economic benefits to small island developing States and least developed countries from the sustainable use of marine resource, including through sustainable management of fisheries, aquaculture and tourism.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">14.A</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Increase scientific knowledge, research and technology for ocean health</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Increase scientific knowledge, develop research capacity and transfer marine technology, taking into account the Intergovernmental Oceanographic Commission Criteria and Guidelines on the Transfer of Marine Technology, in order to improve ocean health and to enhance the contribution of marine biodiversity to the development of developing countries, in particular small island developing States and least developed countries.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">14.B</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Support small scale fishers</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Provide access for small-scale artisanal  to marine resource and markets.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">14.C</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Implement and enforce international sea law</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Enhance the conservation and sustainable use of oceans and their resource by implementing international law as reflected in the United Nations Convention on the Law of the Sea, which provides the legal framework for the conservation and sustainable use of oceans and their resource, as recalled in paragraph 158 of “The future we want”.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Goal14;
