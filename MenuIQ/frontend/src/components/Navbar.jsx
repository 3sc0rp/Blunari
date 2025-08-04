import React from 'react';
import { Bell, User, LogOut, Search } from 'lucide-react';

const Navbar = () => {
  const userName = "John Doe"; // This would come from auth context

  const handleLogout = () => {
    // Logout logic will be implemented later
    console.log('Logging out...');
  };

  return (
    <header className="h-16 bg-[#0F1A2E] border-b border-gray-800 flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search menus, items..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C4CC]/50 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Side - User Info & Actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#00C4CC] rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-800/50">
            <div className="w-8 h-8 bg-gradient-to-r from-[#00C4CC] to-[#007DFF] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white">{userName}</p>
              <p className="text-xs text-gray-400">Restaurant Owner</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;