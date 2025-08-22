import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Page content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Page header */}
          <div className="text-center border-b border-gray-200 p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">SDG Knowledge System Terms of Use</h1>
            <div className="bg-gray-100 p-3 rounded-lg inline-block">
              <p className="text-sm text-gray-600">Last Update: December 28, 2024</p>
            </div>
          </div>

          {/* Terms and conditions */}
          <div className="p-8">
            <div className="max-w-none">
              
              <div className="mb-8">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Dear users, welcome to SDG Knowledge System!
                </p>
                <p className="text-gray-700 leading-relaxed">
                  SDG Knowledge System products and services are owned and operated by SDG Knowledge System Co., Ltd. (hereinafter referred to as "<strong>SDG Knowledge System</strong>" or "<strong>we</strong>"). Before using the Services, please make sure to carefully read and understand this "SDG Knowledge System Terms of Use" (hereinafter referred to as "<strong>these Terms</strong>") as well as other related terms, policies, or guidelines of this platform.
                </p>
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Services</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  1.1 SDG Knowledge System's products and services include those provided to you through websites, applications, software development kits (SDKs), application programming interfaces (APIs), and innovative forms that emerge with technological development. These encompass platforms with knowledge sharing services at their core, among other functionalities (hereinafter referred to as "<strong>the Services</strong>").
                </p>
                <p className="text-gray-700 leading-relaxed">
                  1.2 The services provided by SDG Knowledge System are based on advanced technology platforms, which process and analyze user input information (referred to as "<strong>Inputs</strong>"), compute and infer to output corresponding content as a response (referred to as "<strong>Outputs</strong>"), including text, data, and analysis. Users can evaluate the output and provide feedback on their experience about SDG Knowledge System's output information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Activity Recording and Data Protection</h2>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
                  <p className="text-blue-900 font-medium mb-3">
                    <strong>Important Notice:</strong> By using our Services, you acknowledge and agree that we record your activities on the website.
                  </p>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  2.1 <strong>Activity Recording:</strong> We automatically collect and record information about your interactions with our Services, including but not limited to:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <ul className="list-disc pl-6 text-gray-700 space-y-1">
                    <li>Pages visited and time spent on each page</li>
                    <li>Search queries and content interactions</li>
                    <li>Login times and session duration</li>
                    <li>Device information and browser settings</li>
                    <li>IP address and location data (where permitted)</li>
                  </ul>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">
                  2.2 <strong>Data Protection Compliance:</strong> Our data collection and processing practices ensure adherence to relevant data protection regulations, including:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">GDPR Compliance</h4>
                    <p className="text-green-800 text-sm">European Union General Data Protection Regulation requirements for data processing, consent, and user rights.</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">CCPA Compliance</h4>
                    <p className="text-purple-800 text-sm">California Consumer Privacy Act provisions for data transparency and consumer privacy rights.</p>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  2.3 <strong>Your Rights:</strong> You have the right to access, correct, delete, or restrict processing of your personal data. You may also object to certain processing activities or request data portability where applicable under relevant laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Updates and Modifications</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  3.1 In order to provide you with better services or to comply with changes in national laws, regulations, policy adjustments, technical conditions, product functionalities, and other requirements, we may revise these Terms from time to time. The revised content will form an integral part of these Terms. Once announced, it replaces the original terms.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  3.2 Please refer to the latest version of these Terms on the official website. If you do not accept the modified terms, please stop using the Services immediately. Your continued usage of the Service will be considered as your acceptance of the modified terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you notice any violation of laws and regulations or breach of these Terms or you have any opinions or suggestions regarding these Terms or the Services, you can contact us through the following methods:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-2"><strong>Online Complaints and Feedback Portal:</strong> Click the "Contact us" button on the product interface after logging in.</p>
                  <p className="text-gray-700">
                    <strong>Contact Email:</strong> 
                    <a href="mailto:service@sdgknowledge.com" className="text-blue-600 hover:underline ml-1">service@sdgknowledge.com</a> (General Support) / 
                    <a href="mailto:privacy@sdgknowledge.com" className="text-blue-600 hover:underline ml-1">privacy@sdgknowledge.com</a> (Privacy Matters)
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Bottom operation button */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="flex justify-center">
              <p className="text-sm text-gray-600">
                By continuing to use our service, you agree to these terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;