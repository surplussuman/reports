import React from 'react';
import { HiOutlineUsers, HiOutlineChartBar, HiOutlineCheckCircle, HiOutlineTrendingUp } from 'react-icons/hi';

const StatsCards = ({ stats, count }) => {
  const cards = [
    {
      title: 'Total SRM Students',
      value: count || 0,
      subtitle: 'With ATS Reports',
      icon: HiOutlineUsers,
      color: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-600',
      iconColor: 'text-violet-500',
    },
    {
      title: 'Average ATS Score',
      value: stats?.avgScore ? `${Math.round(stats.avgScore)}%` : '0%',
      subtitle: 'Across all students',
      icon: HiOutlineChartBar,
      color: 'from-emerald-500 to-green-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      iconColor: 'text-emerald-500',
    },
    {
      title: 'High Scorers (80+)',
      value: stats?.above80 || 0,
      subtitle: stats?.totalStudents
        ? `${Math.round((stats.above80 / stats.totalStudents) * 100)}% of students`
        : '0% of students',
      icon: HiOutlineCheckCircle,
      color: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
      iconColor: 'text-amber-500',
    },
    {
      title: 'Highest Score',
      value: stats?.maxScore ? `${stats.maxScore}%` : '0%',
      subtitle: `Lowest: ${stats?.minScore || 0}%`,
      icon: HiOutlineTrendingUp,
      color: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconColor: 'text-blue-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card, idx) => (
        <div
          key={card.title}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in group"
          style={{ animationDelay: `${idx * 80}ms` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{card.value}</h3>
            </div>
            <div className={`${card.bgLight} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
          </div>
          <p className={`text-sm font-medium ${card.textColor}`}>{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
