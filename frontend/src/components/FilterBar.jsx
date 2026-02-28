import React from 'react';
import { HiOutlineSearch, HiOutlineAdjustments } from 'react-icons/hi';

const FilterBar = ({
  searchTerm,
  setSearchTerm,
  maxScore,
  setMaxScore,
  activeFilter,
  setActiveFilter,
}) => {
  const filterChips = [
    { key: 'all', label: 'All Students', color: 'bg-gray-100 text-gray-700 border-gray-200', activeColor: 'bg-brand-purple text-white border-brand-purple' },
    { key: 'high', label: 'High Performers (80+)', color: 'bg-green-50 text-green-700 border-green-200', activeColor: 'bg-green-600 text-white border-green-600' },
    { key: 'medium', label: 'Average (50-79)', color: 'bg-amber-50 text-amber-700 border-amber-200', activeColor: 'bg-amber-500 text-white border-amber-500' },
    { key: 'low', label: 'Needs Improvement (<50)', color: 'bg-red-50 text-red-700 border-red-200', activeColor: 'bg-red-500 text-white border-red-500' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <HiOutlineAdjustments className="w-5 h-5 text-brand-purple" />
        <h2 className="text-lg font-semibold text-gray-900">Filter Options</h2>
        {(searchTerm || maxScore < 100 || activeFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setMaxScore(100);
              setActiveFilter('all');
            }}
            className="ml-auto text-sm text-brand-purple hover:text-brand-violet font-medium transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {filterChips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setActiveFilter(chip.key)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200
              ${activeFilter === chip.key ? chip.activeColor : chip.color}
              hover:shadow-sm
            `}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Search and Score Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Search Candidates</label>
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Name or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Min Score Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Maximum ATS Score: <span className="text-brand-purple font-bold">{maxScore}%</span>
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-medium">0</span>
            <input
              type="range"
              min="0"
              max="100"
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-brand-purple
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:cursor-pointer
                bg-gradient-to-r from-brand-light to-brand-purple/30"
            />
            <span className="text-xs text-gray-400 font-medium">100</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
