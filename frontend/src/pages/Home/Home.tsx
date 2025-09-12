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
  const [hoveredGoal, setHoveredGoal] = useState<number | null>(null);
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

  // SDG Goals data with static and animated images
  const sdgGoals = [
    { id: 1, staticImage: '/17-SDG-logos/E_WEB_01.png', animatedImage: '/17-SDG-logos/E_GIF_01.gif' },
    { id: 2, staticImage: '/17-SDG-logos/E_WEB_02.png', animatedImage: '/17-SDG-logos/E_GIF_02.gif' },
    { id: 3, staticImage: '/17-SDG-logos/E_WEB_03.png', animatedImage: '/17-SDG-logos/E_GIF_03.gif' },
    { id: 4, staticImage: '/17-SDG-logos/E_WEB_04.png', animatedImage: '/17-SDG-logos/E_GIF_04.gif' },
    { id: 5, staticImage: '/17-SDG-logos/E_WEB_05.png', animatedImage: '/17-SDG-logos/E_GIF_05.gif' },
    { id: 6, staticImage: '/17-SDG-logos/E_WEB_06.png', animatedImage: '/17-SDG-logos/E_GIF_06.gif' },
    { id: 7, staticImage: '/17-SDG-logos/E_WEB_07.png', animatedImage: '/17-SDG-logos/E_GIF_07.gif' },
    { id: 8, staticImage: '/17-SDG-logos/E_WEB_08.png', animatedImage: '/17-SDG-logos/E_GIF_08.gif' },
    { id: 9, staticImage: '/17-SDG-logos/E_WEB_09.png', animatedImage: '/17-SDG-logos/E_GIF_09.gif' },
    { id: 10, staticImage: '/17-SDG-logos/E_WEB_10.png', animatedImage: '/17-SDG-logos/E_GIF_10.gif' },
    { id: 11, staticImage: '/17-SDG-logos/E_WEB_11.png', animatedImage: '/17-SDG-logos/E_GIF_11.gif' },
    { id: 12, staticImage: '/17-SDG-logos/E_WEB_12.png', animatedImage: '/17-SDG-logos/E_GIF_12.gif' },
    { id: 13, staticImage: '/17-SDG-logos/E_WEB_13.png', animatedImage: '/17-SDG-logos/E_GIF_13.gif' },
    { id: 14, staticImage: '/17-SDG-logos/E_WEB_14.png', animatedImage: '/17-SDG-logos/E_GIF_14.gif' },
    { id: 15, staticImage: '/17-SDG-logos/E_WEB_15.png', animatedImage: '/17-SDG-logos/E_GIF_15.gif' },
    { id: 16, staticImage: '/17-SDG-logos/E_WEB_16.png', animatedImage: '/17-SDG-logos/E_GIF_16.gif' },
    { id: 17, staticImage: '/17-SDG-logos/E_WEB_17.png', animatedImage: '/17-SDG-logos/E_GIF_17.gif' },
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

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
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
            
            {/* Search Bar */}
            <div className="mb-12 animate-slide-up">
              <AutocompleteSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                onSuggestionClick={handleSuggestionClick}
              />
            </div>
              
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
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🔥 Popular Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Education Popular Content */}
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

            {/* Action Popular Content */}
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

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {sdgGoals.map((goal, index) => (
              <Link
                key={goal.id}
                to={`/sdg-targets/goal-${goal.id}`}
                className="block rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer group shadow-lg hover:shadow-xl"
                style={{ animationDelay: `${index * 0.05}s` }}
                onMouseEnter={() => setHoveredGoal(goal.id)}
                onMouseLeave={() => setHoveredGoal(null)}
              >
                <img
                  src={hoveredGoal === goal.id ? goal.animatedImage : goal.staticImage}
                  alt={`SDG Goal ${goal.id}`}
                  className="w-full h-auto transition-all duration-300"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;