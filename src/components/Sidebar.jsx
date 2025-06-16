
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronUp,
  FiCommand,
  FiSearch,
  FiLogOut,
  FiUser,
  FiSettings,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "../hooks/useSession";
import { supabase } from "../SupabaseClient";
import { sidebarConfig } from "./sidebarConfig";

// AccountToggle
function AccountToggle({ user }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-b mb-6 pb-6 border-stone-200">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex p-3 hover:bg-[#1F5A3D]/5 rounded-xl transition-all duration-200 relative gap-3 w-full items-center group"
      >
        <div className="relative">
          <img
            src="https://api.dicebear.com/9.x/notionists/svg"
            alt="avatar"
            className="size-10 rounded-full shrink-0 bg-gradient-to-br from-[#1F5A3D] to-emerald-600 shadow-lg ring-2 ring-[#1F5A3D]/10"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
        </div>
        <div className="text-start flex-1">
          <span className="text-sm font-semibold block text-gray-900">
            {user?.email?.split("@")[0] || "User"}
          </span>
          <span className="text-xs block text-gray-500">
            {user?.email || "user@email.com"}
          </span>
        </div>
        <div className="text-gray-400 group-hover:text-[#1F5A3D] transition-colors">
          {isExpanded ? (
            <FiChevronUp className="text-sm" />
          ) : (
            <FiChevronDown className="text-sm" />
          )}
        </div>
      </button>
      
      {/* Expanded menu */}
      {isExpanded && (
        <div className="mt-3 pl-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
          <button className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-[#1F5A3D] hover:bg-[#1F5A3D]/5 rounded-lg w-full transition-colors">
            <FiUser className="w-4 h-4" />
            Profile Settings
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-[#1F5A3D] hover:bg-[#1F5A3D]/5 rounded-lg w-full transition-colors">
            <FiSettings className="w-4 h-4" />
            Account Settings
          </button>
        </div>
      )}
    </div>
  );
}

// Search
function Search({ value, onChange }) {
  return (
    <div className="mb-6">
      <div className="bg-gray-50 border border-gray-200 hover:border-[#1F5A3D]/30 focus-within:border-[#1F5A3D] focus-within:bg-white relative rounded-xl flex items-center px-4 py-3 text-sm transition-all duration-200 group">
        <FiSearch className="mr-3 text-gray-400 group-focus-within:text-[#1F5A3D] transition-colors" />
        <Input
          value={value}
          onChange={onChange}
          type="text"
          placeholder="Search menu..."
          className="w-full bg-transparent placeholder:text-gray-400 focus:outline-none border-none shadow-none p-0 h-auto"
        />
        <div className="ml-2 px-2 py-1 bg-gray-200 group-focus-within:bg-[#1F5A3D]/10 rounded text-xs text-gray-500 group-focus-within:text-[#1F5A3D] transition-colors">
          ⌘K
        </div>
      </div>
    </div>
  );
}

// Plan
function Plan() {
  return (
    <div className="sticky bottom-0 bg-gradient-to-r from-[#1F5A3D] to-emerald-600 mx-4 mb-4 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">TableBank Pro</p>
          <p className="text-emerald-100 text-xs">Unlimited access</p>
        </div>
        <Button 
          className="px-3 py-1.5 font-medium bg-white/20 hover:bg-white/30 text-white border-0 text-xs rounded-lg transition-colors"
          variant="secondary"
        >
          Upgrade
        </Button>
      </div>
      <div className="mt-3 bg-white/10 rounded-lg h-2">
        <div className="bg-white/60 h-2 rounded-lg w-3/4"></div>
      </div>
      <p className="text-xs text-emerald-100 mt-2">12 of 16 groups used</p>
    </div>
  );
}

// Navigation Item Component
function NavItem({ item, isActive }) {
  const { label, path, icon: Icon, badge } = item;
  
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-200 group relative ${
          isActive
            ? "bg-[#1F5A3D] text-white shadow-lg shadow-[#1F5A3D]/25"
            : "text-gray-700 hover:bg-[#1F5A3D]/5 hover:text-[#1F5A3D]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${
            isActive ? "text-white" : "text-gray-500 group-hover:text-[#1F5A3D]"
          }`} />
          <span className="font-medium">{label}</span>
          {badge && (
            <span className={`ml-auto px-2 py-0.5 text-xs rounded-full font-medium ${
              isActive 
                ? "bg-white/20 text-white" 
                : "bg-[#1F5A3D]/10 text-[#1F5A3D] group-hover:bg-[#1F5A3D]/20"
            }`}>
              {badge}
            </span>
          )}
          {isActive && (
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"></div>
          )}
        </>
      )}
    </NavLink>
  );
}

// Main Sidebar
export function Sidebar() {
  const { user, role } = useSession();
  const [searchTerm, setSearchTerm] = useState("");

  const allItems = sidebarConfig[role] || [];
  const filteredItems = allItems.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <aside className="w-80 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-[#1F5A3D] to-emerald-600 rounded-xl flex items-center justify-center">
            <FiCommand className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900">TableBank</h1>
            <p className="text-xs text-gray-500 capitalize">{role || 'Member'} Dashboard</p>
          </div>
        </div>
        
        <AccountToggle user={user} />
        <Search
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {filteredItems.length > 0 ? (
          <ul className="space-y-1">
            {filteredItems.map((item) => (
              <li key={item.path}>
                <NavItem item={item} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FiSearch className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No items found</p>
            <p className="text-xs">Try a different search term</p>
          </div>
        )}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <Button
          onClick={handleLogout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 transition-colors duration-200"
          variant="outline"
        >
          <FiLogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Plan Section */}
      <Plan />
    </aside>
  );
}