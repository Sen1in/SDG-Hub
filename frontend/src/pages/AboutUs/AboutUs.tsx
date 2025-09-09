import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sdg-primary via-blue-600 to-sdg-secondary overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              About Us
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto">
              We developed the SDG Knowledge System to provide comprehensive information on the United Nations' 17 Sustainable Development Goals
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              The <strong>SDG Knowledge System</strong> empowers individuals, educators, and organizations to engage meaningfully with the SDGs, fostering informed decision-making and real-world action.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Platform Features</h2>
            
            <div className="space-y-6 mb-12">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">SDG Education Database</h3>
                <p className="text-gray-700">With over 3,100 entries, this extensive collection offers in-depth insights into SDG-related education.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">SDG Action Database</h3>
                <p className="text-gray-700">Featuring 2,200+ curated items, this database highlights actionable SDG plans and real-world examples, supporting the effective implementation of sustainable practices.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">SDG Keyword Search</h3>
                <p className="text-gray-700">Users can search specific words or phrases to determine their relevance to the <strong>17 SDGs and 169 targets</strong>.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">SDG Expert Chatbot</h3>
                <p className="text-gray-700">Designed to assist users in quickly finding relevant SDG information and brainstorming impactful SDG action plans.</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Partners</h2>
            
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              The SDG Knowledge System is part of the{' '}
              <a 
                href="https://www.unsw.edu.au/business/our-research/research-centres-institutes/ds-hub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sdg-primary hover:text-sdg-secondary transition-colors duration-200 underline"
              >
                Digital Sustainability Knowledge Hub
              </a>{' '}
              Education projects and is sponsored by the{' '}
              <a 
                href="https://www.unsw.edu.au/business/about-us/bus-sdg" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sdg-primary hover:text-sdg-secondary transition-colors duration-200 underline"
              >
                UNSW Business School SDG Committee
              </a>.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-12">
              The Digital Sustainability Knowledge Hub engages in multi-disciplinary research, education, and engagement with the aim of advancing UN Sustainable Development Goals (UN SDGs).
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-lg text-gray-700">
                For inquiries, partnerships, or technical support, please contact us at:{' '}
                <a 
                  href="mailto:contactus@sdg.unswzoo.com"
                  className="text-sdg-primary hover:text-sdg-secondary transition-colors duration-200 underline font-medium"
                >
                  contactus@sdg.unswzoo.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;