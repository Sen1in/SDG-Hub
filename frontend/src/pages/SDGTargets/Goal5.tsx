import React from 'react';
import { useNavigate } from 'react-router-dom';

const Goal5 = () => {
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
      <h2 className="text-3xl font-bold mb-4">SDG 5 Gender Equality</h2>
      <p className="text-lg mb-4">
        Achieve gender equality and empower all women and girls.
      </p>
      <a
        href="https://sdg-tracker.org/gender-equality"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        https://sdg-tracker.org/gender-equality
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
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">5.1</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">End discrimination against women and girls</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                End all forms of discrimination against all women and girls everywhere.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">5.2</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">End all violence against and exploitation of women and girls</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Eliminate all forms of violence against all women and girls in the public and private spheres, including trafficking and sexual and other types of exploitation.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">5.3</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Eliminate forced marriages and genital mutilation</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Eliminate all harmful practices, such as child, early and forced marriage and female genital mutilation.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">5.4</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Value unpaid care and promote shared domestic responsibilities</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Recognize and value unpaid care and domestic work through the provision of public services, infrastructure and social protection policies and the promotion of shared responsibility within the household and the family as nationally appropriate.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">5.5</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Ensure full participation in leadership and decision-making</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Ensure women’s full and effective participation and equal opportunities for leadership at all levels of decisionmaking in political, economic and public life.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">5.6</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Universal access to reproductive health and rights</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Ensure universal access to sexual and reproductive health and reproductive rights as agreed in accordance with the Programme of Action of the International Conference on Population and Development and the Beijing Platform for Action and the outcome documents of their review conferences.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">5.A</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Equal rights to economic resources, property ownership and financial services</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Undertake reforms to give women equal rights to economic resources, as well as access to ownership and control over land and other forms of property, financial services, inheritance and natural resources, in accordance with national laws.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">5.B</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Promote empowerment of women through technology</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Enhance the use of enabling technology, in particular information and communications technology, to promote the empowerment of women.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">5.C</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Adopt and strengthen policies and enforceable legislation for gender equality</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                Adopt and strengthen sound policies and enforceable legislation for the promotion of gender equality and the empowerment of all women and girls at all levels.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Goal5;
