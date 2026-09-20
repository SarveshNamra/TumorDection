import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, User, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import toast from "react-hot-toast";

// Mirrors Sidebar's nav items for mobile, since Sidebar is hidden below md.
const mobileNavItems = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/patients", label: "Patients", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
];

const Topbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div>
          <p className="text-sm text-gray-500">
            Welcome, <span className="font-medium text-gray-800">{user?.name}</span>
          </p>
          <p className="text-xs text-gray-400">Role: {user?.role}</p>
        </div>

        <button
          onClick={handleLogout}
          className="md:hidden flex items-center gap-1 text-sm text-gray-600 hover:text-red-600"
          aria-label="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>

      <nav className="md:hidden flex items-center justify-around border-t border-gray-100 px-2 py-2">
        {mobileNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs px-3 py-1 rounded-md ${
                isActive ? "text-blue-700" : "text-gray-500"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default Topbar;