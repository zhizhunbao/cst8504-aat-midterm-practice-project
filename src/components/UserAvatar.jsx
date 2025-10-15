import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import LoginModal from "./LoginModal";

const UserAvatar = () => {
  const { user, logout, isAuthenticated } = useUser();
  const { t } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  // 由于现在强制登录，这个组件只在用户已认证时显示
  if (!isAuthenticated) {
    return null;
  }

  const getInitials = (username) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 text-gray-700 hover:text-algonquin-600 transition-colors"
      >
        <div className="w-8 h-8 bg-algonquin-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
          {getInitials(user.username)}
        </div>
        <span className="text-sm font-medium hidden sm:block">
          {user.username}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500">
                  {t("user.joined")}:{" "}
                  {new Date(user.loginTime).toLocaleDateString()}
                </p>
              </div>

              <Link
                to="/profile"
                onClick={() => setShowDropdown(false)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t("user.settings")}
              </Link>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t("user.logout")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserAvatar;
