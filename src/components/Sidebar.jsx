import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronUp,
  FiCommand,
  FiLogOut,
  FiUser,
  FiHelpCircle,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useSession } from "../hooks/useSession";
import { supabase } from "../SupabaseClient";
import { sidebarConfig } from "./sidebarConfig";

const DropdownOption = ({ icon: Icon, label, to, variant = "default" }) => (
  <NavLink
    to={to}
    className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg w-full transition-all duration-200 group ${
      variant === "danger"
        ? "text-red-600 hover:text-red-700 hover:bg-red-50"
        : "text-gray-600 hover:text-[#1F5A3D] hover:bg-[#1F5A3D]/8"
    }`}
  >
    <Icon
      className={`w-4 h-4 transition-transform group-hover:scale-105 ${
        variant === "danger"
          ? "text-red-500"
          : "text-gray-500 group-hover:text-[#1F5A3D]"
      }`}
    />
    <span className="font-medium">{label}</span>
  </NavLink>
);

function AccountToggle({ user }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex p-3 hover:bg-[#1F5A3D]/8 rounded-xl transition-all duration-200 relative gap-3 w-full items-center group focus:outline-none focus:ring-2 focus:ring-[#1F5A3D]/20"
        aria-expanded={isExpanded}
        aria-label="Account menu"
      >
        <div className="relative">
          <img
            src="https://api.dicebear.com/9.x/notionists/svg"
            alt="User avatar"
            className="size-11 rounded-full shrink-0 bg-gradient-to-br from-[#1F5A3D] to-emerald-600 shadow-md ring-2 ring-white border border-gray-100"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-sm"></div>
        </div>
        <div className="text-start flex-1 min-w-0">
          <span className="text-sm font-semibold block text-gray-900 truncate">
            {displayName}
          </span>
        </div>
        <div className="text-gray-400 group-hover:text-[#1F5A3D] transition-all duration-200 ml-2">
          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3 pl-3 space-y-1 animate-in slide-in-from-top-2 duration-200 fade-in-50">
          <DropdownOption icon={FiUser} label="Profile Settings" to="/dashboard/member/profile" />
          <DropdownOption icon={FiHelpCircle} label="Help & Support" to="/dashboard/member/help" />
        </div>
      )}
    </div>
  );
}

function NavGroup({ title = "MENU", items }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-1">
      <h4 className="text-lg font-bold text-center text-gray-700 px-4 pb-1 tracking-tight">
        {title}
      </h4>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.path}>
            <NavItem item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavItem({ item }) {
  const { label, path, icon: Icon, badge } = item;

  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
          isActive
            ? "bg-[#1F5A3D] text-white shadow-lg shadow-[#1F5A3D]/25"
            : "bg-white text-gray-700 hover:bg-[#1F5A3D]/5 hover:text-[#1F5A3D]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`h-5 w-5 transition-transform group-hover:scale-110 ${
              isActive ? "text-white" : "text-gray-500 group-hover:text-[#1F5A3D]"
            }`}
          />
          <span className="font-medium">{label}</span>
          {badge && (
            <span
              className={`ml-auto px-2 py-0.5 text-xs rounded-full font-medium ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-[#1F5A3D]/10 text-[#1F5A3D] group-hover:bg-[#1F5A3D]/20"
              }`}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const { user, role } = useSession();
  const navigate = useNavigate();

  const filteredItems = sidebarConfig[role] || [];
  const mainItems = filteredItems.filter((item) => !item.group);
  const managementItems = filteredItems.filter((item) => item.group === "management");
  const settingsItems = filteredItems.filter((item) => item.group === "settings");

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <aside className="w-80 fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#1F5A3D] to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-black/5">
            <FiCommand className="w-6 h-6 text-white drop-shadow-sm" />
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-xl text-gray-900 tracking-tight">TableBank</h1>
            <p className="text-sm text-gray-500 capitalize font-medium">
              {role || "Member"} Dashboard
            </p>
          </div>
        </div>
        <AccountToggle user={user} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 pt-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        <NavGroup title="MENU" items={mainItems} />
        {managementItems.length > 0 && <NavGroup title="Management" items={managementItems} />}
        {settingsItems.length > 0 && <NavGroup title="Settings" items={settingsItems} />}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <Button
          onClick={handleLogout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 transition-all duration-200 focus:ring-2 focus:ring-red-200 hover:shadow-md font-medium"
          variant="outline"
        >
          <FiLogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
