import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { trackSearch } from '../../services/tracker';
import { AutocompleteSearchBar } from '../../components/AutocompleteSearchBar';
import type { SearchSuggestion } from '../../types/autocomplete';

// Define interface for popular search terms
interface PopularSearchTerm {
  term: string;
  count: number;
}
interface PopularItem {
  id: number;
  title: string;
  count: number;
}


const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [popularTerms, setPopularTerms] = useState<PopularSearchTerm[]>([]);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [popularEdu, setPopularEdu] = useState<PopularItem[]>([]);
  const [popularAct, setPopularAct] = useState<PopularItem[]>([]);
  const [educationCount, setEducationCount] = useState<number>(3100);
  const [actionsCount, setActionsCount] = useState<number>(2200);
  const [keywordsCount, setKeywordsCount] = useState<number>(169);

  // Fetch popular search terms
  useEffect(() => {
    const fetchPopularTerms = async () => {
      setLoadingTerms(true);
      try {
        const response = await fetch('/api/analytics/popular-search-terms/');
        if (response.ok) {
          const data = await response.json();
          setPopularTerms(data);
        } else {
          console.error('Failed to fetch popular search terms');
        }
      } catch (error) {
        console.error('Error fetching popular search terms:', error);
      } finally {
        setLoadingTerms(false);
      }
    };

    fetchPopularTerms();
  }, []);


  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await fetch('/api/analytics/popular/');
        if (!res.ok) {
          console.error('Failed to fetch popular ids');
          return;
        }
        const data = await res.json();

        // education
        const eduDetails = await Promise.all(
          (data.education || []).map(async (item: any) => {
            const detail = await fetch(`/api/education/${item.id}/`).then((r) => r.json());
            return { id: item.id, title: detail.title, count: item.count };
          })
        );
        setPopularEdu(eduDetails);

        // action
        const actDetails = await Promise.all(
          (data.action || []).map(async (item: any) => {
            const detail = await fetch(`/api/actions/${item.id}/`).then((r) => r.json());
            return { id: item.id, title: detail.actions, count: item.count };
          })
        );
        setPopularAct(actDetails);
      } catch (err) {
        console.error('Error fetching popular items', err);
      }
    };
    fetchPopular();
  }, []);

  // Fetch education count
  useEffect(() => {
    const fetchEducationCount = async () => {
      try {
        const response = await fetch('/api/education/stats/');
        if (response.ok) {
          const data = await response.json();
          setEducationCount(data.total_resources);
        }
      } catch (error) {
        console.error('Error fetching education count:', error);
      }
    };

    fetchEducationCount();
  }, []);

    // Fetch actions count
    useEffect(() => {
      const fetchActionsCount = async () => {
        try {
          const response = await fetch('/api/actions/stats/');
          if (response.ok) {
            const data = await response.json();
            setActionsCount(data.total_resources);
          }
        } catch (error) {
          console.error('Error fetching actions count:', error);
        }
      };
  
      fetchActionsCount();
    }, []);

     // Fetch keywords count
  useEffect(() => {
    const fetchKeywordsCount = async () => {
      try {
        const response = await fetch('/api/keywords/stats/');
        if (response.ok) {
          const data = await response.json();
          setKeywordsCount(data.unique_keywords);
        }
      } catch (error) {
        console.error('Error fetching keywords count:', error);
      }
    };

    fetchKeywordsCount();
  }, []);

  // Handle clicking on a popular search term
  const handlePopularTermClick = (term: string) => {
    setSearchQuery(term);
    
    // Track search if user is logged in
    if (user?.id) {
      trackSearch(user.id.toString(), term);
    }
    
    // Navigate to search results
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const sdgGoals = [
    { id: 1, title: 'No Poverty', color: 'bg-red-500', emoji: '🏠' },
    { id: 2, title: 'Zero Hunger', color: 'bg-yellow-500', emoji: '🍎' },
    { id: 3, title: 'Good Health', color: 'bg-green-500', emoji: '🏥' },
    { id: 4, title: 'Quality Education', color: 'bg-red-600', emoji: '📚' },
    { id: 5, title: 'Gender Equality', color: 'bg-orange-500', emoji: '⚖️' },
    { id: 6, title: 'Clean Water', color: 'bg-blue-400', emoji: '💧' },
    { id: 7, title: 'Clean Energy', color: 'bg-yellow-400', emoji: '⚡' },
    { id: 8, title: 'Economic Growth', color: 'bg-red-700', emoji: '💼' },
  ];

  const features = [
    {
      title: 'SDG Education Database',
      description: 'Over 3,100 entries offering in-depth insights into SDG-related education.',
      icon: '📖',
      count: `${educationCount.toLocaleString()}`,
      color: 'from-blue-500 to-blue-600',
      link: '/education'
    },
    {
      title: 'SDG Action Database',
      description: '2,200 curated items highlighting actionable SDG plans and real-world examples.',
      icon: '🎯',
      count: `${actionsCount.toLocaleString()}`,
      color: 'from-green-500 to-green-600',
      link: '/actions'
    },
    {
      title: 'SDG Keyword Search',
      description: 'Search specific words or phrases to determine their relevance to the 17 SDGs.',
      icon: '🔍',
      count: `${keywordsCount.toLocaleString()}`,
      color: 'from-purple-500 to-purple-600',
      link: '/keywords'
    },
    {
      title: 'SDG Expert Chatbot',
      description: 'AI-powered assistant to help you find relevant SDG information quickly.',
      icon: '🤖',
      count: 'AI',
      color: 'from-orange-500 to-orange-600',
      link: '/chatbot'
    }
  ];

  const handleSearch = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    
    if (user?.id) {
      trackSearch(user.id.toString(), trimmedQuery);
    }
    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  /**
   * Handles when user clicks on a suggestion from the autocomplete dropdown
   */
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    // Track the suggestion click separately if needed
    if (user?.id) {
      trackSearch(user.id.toString(), suggestion.term);
    }
    navigate(`/search?q=${encodeURIComponent(suggestion.term)}`);
  };


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
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              SDG Knowledge
              <span className="block text-yellow-300">System</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto animate-slide-up">
              Comprehensive information on the United Nations' 17 Sustainable Development Goals
            </p>
            
            {/* Search Bar with Autocomplete */}
            <div className="max-w-2xl mx-auto mb-12 animate-slide-up">
              <div className="home-search-bar">
                <AutocompleteSearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={handleSearch}
                  onSuggestionClick={handleSuggestionClick}
                  config={{
                    placeholder: "Search SDG actions, education, keywords...",
                    minInputLength: 2,
                    maxSuggestions: 6,
                    debounceMs: 250,
                    showCount: true
                  }}
                />
              </div>
              
              {/* Custom CSS for Home page search bar styling */}
              <style dangerouslySetInnerHTML={{
                __html: `
                  .home-search-bar input {
                    padding: 1rem 4rem 1rem 1.5rem !important;
                    font-size: 1.125rem !important;
                    border-radius: 1rem !important;
                    background-color: rgba(255, 255, 255, 0.95) !important;
                    backdrop-filter: blur(4px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    transition: all 0.3s ease !important;
                  }
                  
                  .home-search-bar input:focus {
                    outline: none !important;
                    ring: 4px rgba(255, 255, 255, 0.3) !important;
                    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3) !important;
                  }
                  
                  .home-search-bar button[type="submit"] {
                    position: absolute !important;
                    right: 0.5rem !important;
                    top: 50% !important;
                    transform: translateY(-50%) !important;
                    padding: 0.75rem 1.5rem !important;
                    background-color: #16a34a !important;
                    color: white !important;
                    border-radius: 0.75rem !important;
                    transition: background-color 0.2s ease !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                  }
                  
                  .home-search-bar button[type="submit"]:hover {
                    background-color: #15803d !important;
                  }
                  
                  .home-search-bar button[type="submit"] svg {
                    width: 1.5rem !important;
                    height: 1.5rem !important;
                  }

                  /* Google-style dropdown styling for home page */
                  .home-search-bar div[role="listbox"] {
                    margin-top: 0.5rem !important;
                    background-color: rgba(255, 255, 255, 0.98) !important;
                    backdrop-filter: blur(8px) !important;
                    border-radius: 0.75rem !important;
                    border: 1px solid rgba(255, 255, 255, 0.3) !important;
                    box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                    animation: fadeIn 0.2s ease-out !important;
                  }

                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }

                  /* Suggestion items styling */
                  .home-search-bar div[role="listbox"] button {
                    height: 40px !important;
                    width: 100% !important;
                    padding: 0 1rem !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 0.75rem !important;
                    text-align: left !important;
                    background-color: transparent !important;
                    border: none !important;
                    border-radius: 0 !important;
                    transition: background-color 0.15s ease-in-out !important;
                    position: relative !important;
                    right: auto !important;
                    top: auto !important;
                    transform: none !important;
                    color: #374151 !important;
                  }

                  .home-search-bar div[role="listbox"] button:hover {
                    background-color: #f2f2f2 !important;
                  }

                  .home-search-bar div[role="listbox"] button[aria-selected="true"] {
                    background-color: #f3f4f6 !important;
                  }

                  /* Add search icon before suggestion text */
                  .home-search-bar div[role="listbox"] button:before {
                    content: '';
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M21 21l-4.35-4.35M16.5 10.5a6 6 0 11-12 0 6 6 0 0112 0z'/%3E%3C/svg%3E");
                    background-size: contain;
                    background-repeat: no-repeat;
                    flex-shrink: 0;
                  }

                  /* Suggestion text styling */
                  .home-search-bar div[role="listbox"] button span:first-of-type {
                    flex: 1 !important;
                    font-size: 0.875rem !important;
                    font-weight: 400 !important;
                    color: #374151 !important;
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                  }

                  /* Count badge styling */
                  .home-search-bar div[role="listbox"] button span:last-of-type {
                    flex-shrink: 0 !important;
                    font-size: 0.75rem !important;
                    font-weight: 400 !important;
                    color: #6B7280 !important;
                    margin-left: 0.5rem !important;
                  }

                  /* Remove existing button styling from suggestions */
                  .home-search-bar div[role="listbox"] button:not([type="submit"]) {
                    padding: 0 1rem !important;
                    background-color: transparent !important;
                    border-radius: 0 !important;
                    color: #374151 !important;
                  }

                  /* Ensure submit button keeps its style */
                  .home-search-bar button[type="submit"] {
                    z-index: 10 !important;
                  }
                `
              }} />
              
              {/* Popular Search Terms */}
              <div className="mt-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-white/90 mb-2">Popular Search Terms</h3>
                </div>
                
                {loadingTerms ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/60"></div>
                  </div>
                ) : popularTerms.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-2">
                    {popularTerms.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handlePopularTermClick(term.term)}
                        className="relative group px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-200 transform hover:scale-105 active:scale-95"
                      >
                        <span className="text-sm font-medium">{term.term}</span>
                        <span className="ml-2 text-xs bg-white/20 text-white/80 rounded-full px-2 py-0.5">
                          {term.count}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-white/60 text-sm">No popular search terms yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🔥 Popular Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 教育热门 */}
            <div className="p-6 bg-white rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-4">📚 Popular Education</h3>
              {popularEdu.length === 0 ? (
                <p className="text-gray-500">No popular education items.</p>
              ) : (
                <ul className="list-disc pl-5 space-y-2">
                  {popularEdu.map(item => (
                    <li key={`edu-${item.id}`}>
                      <Link
                        to={`/education/${item.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {item.title}
                      </Link>{' '}
                      ({item.count} clicks)
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 动作热门 */}
            <div className="p-6 bg-white rounded-xl shadow">
              <h3 className="text-xl font-semibold mb-4">🎯 Popular Actions</h3>
              {popularAct.length === 0 ? (
                <p className="text-gray-500">No popular action items.</p>
              ) : (
                <ul className="list-disc pl-5 space-y-2">
                  {popularAct.map(item => (
                    <li key={`action-${item.id}`}>
                      <Link
                        to={`/actions/${item.id}`}
                        className="text-green-600 hover:underline"
                      >
                        {item.title}
                      </Link>{' '}
                      ({item.count} clicks)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Our Knowledge Base
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover comprehensive resources and tools to engage meaningfully with the SDGs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="card-hover p-6 text-center group cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link to={feature.link} className="block" onClick={() => window.scrollTo(0, 0)}>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                </Link>
                <div className={`text-3xl font-bold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent mb-2`}>
                  {feature.count}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDG Goals Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              17 Sustainable Development Goals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore the UN's blueprint for a sustainable future
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {sdgGoals.map((goal, index) => (
              <div
                key={goal.id}
                className={`${goal.color} rounded-xl p-4 text-white text-center hover:scale-105 transition-transform duration-200 cursor-pointer group`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="text-3xl mb-2 group-hover:animate-bounce-subtle">
                  {goal.emoji}
                </div>
                <div className="text-sm font-bold mb-1">Goal {goal.id}</div>
                <div className="text-xs leading-tight">{goal.title}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/search"
              className="btn-primary px-8 py-4 text-lg hover:scale-105 transition-transform duration-200"
            >
              View All 17 Goals
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div className="text-4xl md:text-5xl font-bold text-sdg-primary mb-4">5,300+</div>
              <div className="text-xl font-semibold text-gray-900 mb-2">Total Resources</div>
              <div className="text-gray-600">Comprehensive database of SDG-related content</div>
            </div>
            <div className="p-8">
              <div className="text-4xl md:text-5xl font-bold text-sdg-secondary mb-4">169</div>
              <div className="text-xl font-semibold text-gray-900 mb-2">SDG Targets</div>
              <div className="text-gray-600">Specific targets across all 17 goals</div>
            </div>
            <div className="p-8">
              <div className="text-4xl md:text-5xl font-bold text-sdg-accent mb-4">∞</div>
              <div className="text-xl font-semibold text-gray-900 mb-2">Impact Potential</div>
              <div className="text-gray-600">Unlimited possibilities for positive change</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;