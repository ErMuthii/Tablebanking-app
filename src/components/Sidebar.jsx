import { NavLink, useNavigate } from "react-router-dom";
import { sidebarConfig } from "./sidebarConfig";
import { useSession } from "../hooks/useSession";
import { supabase } from "../SupabaseClient"; // Make sure this import exists

export function Sidebar() {
  const { user, role } = useSession();
  const items = sidebarConfig[role] || [];
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/"); // Redirect to landing page
  };

  return (
    <aside className="w-64 h-screen bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="font-medium">
          {user ? user.email : <span className="text-gray-400">Not logged in</span>}
        </div>
        <div className="text-sm text-gray-500">{role || <span className="text-gray-400">No role</span>}</div>
        {/* Logout Button */}
        {user && (
          <button
            onClick={handleLogout}
            className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-sm"
          >
            Logout
          </button>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto">
        <ul>
          {items.map(({ label, path, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 hover:bg-gray-100 ${
                    isActive ? "bg-gray-200 font-semibold" : "text-gray-700"
                  }`
                }
              >
                <Icon className="h-5 w-5 mr-3" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}