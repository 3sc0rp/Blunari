import React from 'react';
import { TrendingUp, DollarSign, Target, Users } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$12,845',
      change: '+12.5%',
      icon: DollarSign,
      positive: true
    },
    {
      title: 'Menu Items',
      value: '156',
      change: '+3 new',
      icon: Target,
      positive: true
    },
    {
      title: 'Avg. Profit Margin',
      value: '24.8%',
      change: '+2.1%',
      icon: TrendingUp,
      positive: true
    },
    {
      title: 'Customer Orders',
      value: '1,247',
      change: '+8.2%',
      icon: Users,
      positive: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, John!</h1>
        <p className="text-gray-400">Here's what's happening with your restaurant today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-[#0F1A2E] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#00C4CC]/20 to-[#007DFF]/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#00C4CC]" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.positive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-400 text-sm">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Menu Performance */}
        <div className="bg-[#0F1A2E] border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Top Performing Items</h3>
          <div className="space-y-4">
            {[
              { name: 'Grilled Salmon', orders: 89, revenue: '$1,245' },
              { name: 'Caesar Salad', orders: 67, revenue: '$892' },
              { name: 'Beef Tenderloin', orders: 45, revenue: '$1,350' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-b-0">
                <div>
                  <p className="text-white font-medium">{item.name}</p>
                  <p className="text-gray-400 text-sm">{item.orders} orders</p>
                </div>
                <div className="text-[#00C4CC] font-semibold">
                  {item.revenue}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#0F1A2E] border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-[#00C4CC]/10 to-[#007DFF]/10 border border-[#00C4CC]/30 rounded-lg hover:from-[#00C4CC]/20 hover:to-[#007DFF]/20 transition-all duration-200">
              <span className="text-white font-medium">Upload New Menu</span>
              <span className="text-[#00C4CC]">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-800/30 border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-all duration-200">
              <span className="text-white font-medium">Generate Insights</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-gray-800/30 border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-all duration-200">
              <span className="text-white font-medium">Export Report</span>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;