import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  Brain,
  FileText,
  BarChart3,
  Settings,
  Globe,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import UserAvatar from "./UserAvatar";

const Header = () => {
  const { t, toggleLanguage, language } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: BookOpen, label: "nav.home" },
    { path: "/lessons", icon: BookOpen, label: "nav.lessons" },
    { path: "/practice", icon: Brain, label: "nav.practice" },
    { path: "/exam", icon: FileText, label: "nav.exam" },
    { path: "/progress", icon: BarChart3, label: "nav.progress" },
    { path: "/settings", icon: Settings, label: "nav.settings" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-algonquin-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CST8504</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  location.pathname === path
                    ? "bg-algonquin-100 text-algonquin-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t(label)}</span>
              </Link>
            ))}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === "zh" ? "EN" : "中文"}
              </span>
            </button>

            {/* User Avatar */}
            <UserAvatar />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <nav className="flex items-center space-x-1 overflow-x-auto">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  location.pathname === path
                    ? "bg-algonquin-100 text-algonquin-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t(label)}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
