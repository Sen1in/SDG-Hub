import React from 'react';

const Goal16 = () => {
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
      <h2 className="text-3xl font-bold mb-4">SDG 16 Justice, Peace and Strong Institutions</h2>
      <a
        href="https://sdg-tracker.org/peace-justice"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        https://sdg-tracker.org/peace-justice
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
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">16.1</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Reduce violence everywhere</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Significantly reduce all forms of violence and related death rates everywhere.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">16.2</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Protect children from abuse, exploitation, trafficking and violence</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                End abuse, exploitation, trafficking and all forms of violence against and torture of children.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">16.3</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Promote the rule of law and ensure equal access to justice</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Promote the rule of law at the national and international levels and ensure equal access to justice for all.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">16.4</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Combat organized crime and illicit financial and arms flows</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, significantly reduce illicit financial and arms flows, strengthen the recovery and return of stolen assets and combat all forms of organized crime.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">16.5</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Substantially reduce corruption and bribery</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Substantially reduce corruption and bribery in all their forms.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">16.6</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Develop effective, accountable and transparent institutions</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Develop effective, accountable and transparent institutions at all levels.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">16.7</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Ensure responsive, inclusive and representative decision-making</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Ensure responsive, inclusive, participatory and representative decision-making at all levels.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">16.8</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Strengthen the participation in global governance</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Broaden and strengthen the participation of developing countries in the institutions of global governance.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">16.9</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Provide universal legal identity</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                By 2030, provide legal identity for all, including birth registration.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">16.10</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Ensure public access to information and protect fundamental freedoms</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Ensure public access to information and protect fundamental freedoms, in accordance with national legislation and international agreements.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">16.A</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Strengthen national institutions to prevent violence and combat crime and terrorism</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Strengthen relevant national institutions, including through international cooperation, for building capacity at all levels, in particular in developing countries, to prevent violence and combat terrorism and crime.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">16.B</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Strengthen national institutions to prevent violence and combat crime and terrorism</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Strengthen relevant national institutions, including through international cooperation, for building capacity at all levels, in particular in developing countries, to prevent violence and combat terrorism and crime.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Goal16;
