import { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { AuthContext } from "../../App";

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { user, isAuthenticated } = useSelector((state) => state.user);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const userInitial = user.firstName?.charAt(0)?.toUpperCase() || 
                     user.name?.charAt(0)?.toUpperCase() || 
                     user.emailAddress?.charAt(0)?.toUpperCase() || 'U';
  
  const userName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.name || user.emailAddress || 'User';

  const menuItems = [
    {
      icon: "User",
      label: "Profile",
      href: "/profile",
    },
    {
      icon: "Calendar",
      label: "My Events",
      href: "/my-events",
    },
    {
      icon: "Settings",
      label: "Dashboard",
      href: "/dashboard",
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all duration-200"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full flex items-center justify-center text-sm font-semibold">
          {userInitial}
        </div>
        <ApperIcon 
          name={isOpen ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          className="text-gray-600 hidden sm:block"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50"
          >
            {/* User Info Section */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark text-white rounded-full flex items-center justify-center font-semibold">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.emailAddress || user.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 hover:text-primary transition-all duration-150"
                >
                  <ApperIcon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Logout Section */}
            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 w-full text-left"
              >
                <ApperIcon name="LogOut" size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;