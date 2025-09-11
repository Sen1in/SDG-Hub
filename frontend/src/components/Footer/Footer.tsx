import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const footerLinks = {
    'Resources': [
      { name: 'SDG Actions', path: '/actions' },
      { name: 'SDG Education', path: '/education' },
      { name: 'Keyword Search', path: '/keywords' },
      { name: 'AI Assistant', path: '/chat' },
    ],
    'About': [
      { name: 'About Us', path: '/about-us' },
      { name: 'Contact', path: '/about-us#contact' },
    ],
    'Legal': [
      { name: 'Terms of Service', path: '/terms' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row gap-12 mb-8">
          {/* Brand Section */}
          <div className="lg:flex-1 lg:max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/SDG_logo.png"
                  alt="SDG Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">SDG Knowledge System</h3>
                <p className="text-xs text-gray-400">Sustainable Development Goals</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering individuals, educators, and organizations to engage meaningfully 
              with the UN's 17 Sustainable Development Goals.
            </p>
          </div>

          {/* Links Sections */}
          <div className="flex flex-col md:flex-row lg:flex-row gap-6 lg:gap-12">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="min-w-0">
                <h4 className="text-white font-semibold mb-4 text-base">{category}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="text-gray-400 hover:text-white transition-colors duration-200 text-base"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-xs text-gray-400">
              © 2025 SDG Knowledge System. All rights reserved.
            </div>
            <div className="text-xs text-gray-400">
              <a
                href="https://www.unsw.edu.au/business/about-us/bus-sdg"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                Sponsored by UNSW Business School SDG Committee
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;