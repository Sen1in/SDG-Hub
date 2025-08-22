import React from 'react';

interface KeywordsProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const Keywords: React.FC<KeywordsProps> = ({ 
  placeholder = "Search SDG content...", 
  onSearch 
}) => {
  const [query, setQuery] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
      >
        🔍
      </button>
    </form>
  );
};

export default Keywords;