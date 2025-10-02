import React from 'react';
import { useNavigate } from 'react-router-dom';

const Goal17 = () => {
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
      <h2 className="text-3xl font-bold mb-4">SDG 17 Partnership for the Goals</h2>
      <p className="mb-4">
        Revitalize the global partnership for sustainable development.
      </p>
      <a
        href="https://sdg-tracker.org/global-partnerships"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        https://sdg-tracker.org/global-partnerships
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
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.1</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Mobilize resources to improve domestic revenue collection</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Strengthen domestic resource mobilization, including through international support to developing countries, to improve domestic capacity for tax and other revenue collection.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.2</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Implement all development assistance commitments</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Developed countries to implement fully their official development assistance commitments, including the commitment by many developed countries to achieve the target of 0.7 per cent of gross national income for official development assistance (ODA/GNI) to developing countries and 0.15 to 0.20 per cent of ODA/GNI to least developed countries; ODA providers are encouraged to consider setting a target to provide at least 0.20 per cent of ODA/GNI to least developed countries.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.3</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Mobilize financial resources for developing countries</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Mobilize additional financial resources for developing countries from multiple sources.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.4</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Assist developing countries in attaining debt sustainability</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Assist developing countries in attaining long-term debt sustainability through coordinated policies aimed at fostering debt financing, debt relief and debt restructuring, as appropriate, and address the external debt of highly indebted poor countries to reduce debt distress.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.5</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Invest in least-developed countries</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Adopt and implement investment promotion regimes for least developed countries.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.6</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Knowledge sharing and cooperation for access to science, technology and innovation</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Enhance North-South, South-South and triangular regional and international cooperation on and access to science, technology and innovation and enhance knowledge sharing on mutually agreed terms, including through improved coordination among existing mechanisms, in particular at the United Nations level, and through a global technology facilitation mechanism.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.7</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Promote sustainable technologies to developing countries</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Promote the development, transfer, dissemination and diffusion of environmentally sound technologies to developing countries on favourable terms, including on concessional and preferential terms, as mutually agreed.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.8</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Strengthen the science, technology and innovation capacity for least-developed countries</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Fully operationalize the technology bank and science, technology and innovation capacity-building mechanism for least developed countries by 2017 and enhance the use of enabling technology, in particular information and communications technology.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.9</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Enhanced SDG capacity in developing countries</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Enhance international support for implementing effective and targeted capacity-building in developing countries to support national plans to implement all the Sustainable Development Goals, including through North-South, South-South and triangular cooperation.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.10</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Promote a universal trading system under the WTO</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Promote a universal, rules-based, open, non-discriminatory and equitable multilateral trading system under the World Trade Organization, including through the conclusion of negotiations under its Doha Development Agenda.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.11</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Increase the exports of developing countries</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Significantly increase the exports of developing countries, in particular with a view to doubling the least developed countries’ share of global exports by 2020.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.12</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Remove trade barriers for least-developed countries</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Realize timely implementation of duty-free and quota-free market access on a lasting basis for all least developed countries, consistent with World Trade Organization decisions, including by ensuring that preferential rules of origin applicable to imports from least developed countries are transparent and simple, and contribute to facilitating market access.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.13</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Enhance global macroeconomic stability</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Enhance global macroeconomic stability, including through policy coordination and policy coherence.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.14</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Enhance policy coherence for sustainable development</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Enhance policy coherence for sustainable development.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.15</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Respect national leadership to implement policies for the sustainable development goals</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Respect each country’s policy space and leadership to establish and implement policies for poverty eradication and sustainable development.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.16</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Enhance the global partnership for sustainable development</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Enhance the Global Partnership for Sustainable Development, complemented by multi-stakeholder partnerships that mobilize and share knowledge, expertise, technology and financial resources, to support the achievement of the Sustainable Development Goals in all countries, in particular developing countries.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.17</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Encourage effective partnerships</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Encourage and promote effective public, public-private and civil society partnerships, building on the experience and resourcing strategies of partnerships.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.18</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Enhance availability of reliable data</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2020, enhance capacity-building support to developing countries, including for least developed countries and small island developing States, to increase significantly the availability of high-quality, timely and reliable data disaggregated by income, gender, age, race, ethnicity, migratory status, disability, geographic location and other characteristics relevant in national contexts.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">17.19</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Further develop measurements of progress</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, build on existing initiatives to develop measurements of progress on sustainable development that complement gross domestic product, and support statistical capacity-building in developing countries.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Goal17;


