import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Menu, BarChart3, Settings, Upload } from 'lucide-react';

const Sidebar = ({ currentPath }) => {
  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/dashboard'
    },
    {
      icon: Upload,
      label: 'Menu Upload',
      path: '/menu-upload'
    },
    {
      icon: Menu,
      label: 'Menus',
      path: '/menus'
    },
    {
      icon: BarChart3,
      label: 'Insights',
      path: '/insights'
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/settings'
    }
  ];

  return (
    <div className="w-64 bg-[#0F1A2E] border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[#00C4CC] to-[#007DFF] rounded-lg flex items-center justify-center">
            <Menu className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">MenuIQ</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00C4CC]/20 to-[#007DFF]/20 text-[#00C4CC] border border-[#00C4CC]/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 text-center">
          MenuIQ v1.0.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;