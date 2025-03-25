import React from 'react';

interface StatsPanelProps {
  stats: {
    total: number;
    easy: number;
    medium: number;
    hard: number;
    sent: number;
  }
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  const sentPercentage = stats.total > 0 ? (stats.sent / stats.total) * 100 : 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6 max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Question Statistics</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="Total Questions" 
          value={stats.total} 
          bgColor="bg-blue-50" 
          textColor="text-blue-600" 
        />
        <StatCard 
          label="Easy" 
          value={stats.easy} 
          bgColor="bg-green-50" 
          textColor="text-green-600" 
        />
        <StatCard 
          label="Medium" 
          value={stats.medium} 
          bgColor="bg-yellow-50" 
          textColor="text-yellow-600" 
        />
        <StatCard 
          label="Hard" 
          value={stats.hard} 
          bgColor="bg-red-50" 
          textColor="text-red-600" 
        />
      </div>
      
      {/* Progress Bar */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-700 text-sm font-medium">Questions Sent:</span>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <span className="font-semibold text-gray-800">{stats.sent}</span>
              <span className="mx-1 text-gray-400">/</span>
              <span className="text-gray-600">{stats.total}</span>
            </div>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {sentPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-700 ease-in-out" 
            style={{ width: `${sentPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Helper component for stat cards
interface StatCardProps {
  label: string;
  value: number;
  bgColor: string;
  textColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, bgColor, textColor }) => (
  <div className={`${bgColor} p-3 rounded-lg text-center`}>
    <div className={`text-xl font-bold ${textColor}`}>{value.toLocaleString()}</div>
    <div className="text-xs text-gray-600 font-medium mt-1">{label}</div>
  </div>
);

export default StatsPanel; 