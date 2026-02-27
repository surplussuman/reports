import React from 'react';

const Loader = () => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-brand-light rounded-full animate-spin border-t-brand-purple" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-brand-purple/10" />
      </div>
    </div>
    <p className="mt-6 text-gray-500 font-medium">Loading dashboard data...</p>
    <p className="text-sm text-gray-400 mt-1">Fetching from database</p>
  </div>
);

export default Loader;
