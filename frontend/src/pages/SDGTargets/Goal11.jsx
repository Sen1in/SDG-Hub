import React from 'react';

const Goal11 = () => {
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
      <h2 className="text-3xl font-bold mb-4">SDG 11 Sustainable Cities and Communities</h2>
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
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">11.1</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Safe and affordable housing</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, ensure access for all to adequate, safe and affordable housing and basic services and upgrade slums.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">11.2</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Affordable and sustainable transport systems</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, provide access to safe, affordable, accessible and sustainable transport systems for all, improving road safety, notably by expanding public transport, with special attention to the needs of those in vulnerable situations, women, children, persons with disabilities and older persons.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">11.3</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Inclusive and sustainable urbanization</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, enhance inclusive and sustainable urbanization and capacity for participatory, integrated and sustainable human settlement planning and management in all countries.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">11.4</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Protect the world's cultural and natural heritage</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Strengthen efforts to protect and safeguard the world's cultural and natural heritage.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">11.5</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Reduce the adverse effects of natural disasters</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, significantly reduce the number of deaths and the number of people affected and substantially decrease the direct economic losses relative to global gross domestic product caused by disasters, including water-related disasters, with a focus on protecting the poor and people in vulnerable situations.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">11.6</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Reduce the environmental impacts of cities</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, reduce the adverse per capita environmental impact of cities, including by paying special attention to air quality and municipal and other waste management.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">11.7</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Provide access to safe and inclusive green and public spaces</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, provide universal access to safe, inclusive and accessible, green and public spaces, in particular for women and children, older persons and Persons With Disabilities.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">11.A</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Strong national and regional development planning</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Support positive economic, social and environmental links between urban, peri-urban and rural areas by strengthening national and regional development planning.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">11.B</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Implement policies for inclusion, resource efficiency and disaster risk reduction</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2020, substantially increase the number of cities and human settlements adopting and implementing integrated policies and plans towards inclusion, resource efficiency, mitigation and adaptation to climate change, resilience to disasters, and develop and implement, in line with the Sendai Framework for Disaster risk reduction 2015–2030, holistic disaster risk management at all levels.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">11.C</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Support least developed countries in sustainable and resilient building</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Support least developed countries, including through financial and technical assistance, in building sustainable and resilient buildings utilizing local materials.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Goal11;
