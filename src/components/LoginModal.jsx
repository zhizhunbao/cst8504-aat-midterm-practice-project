import React, { useState } from "react";
import { X, User, Loader2 } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";

const LoginModal = ({ isOpen, onClose, forceLogin = false }) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading } = useUser();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError(t("login.usernameRequired"));
      return;
    }

    if (username.length < 2) {
      setError(t("login.usernameTooShort"));
      return;
    }

    try {
      await login(username.trim());
      setUsername("");
      onClose();
    } catch (error) {
      setError(t("login.loginFailed"));
    }
  };

  const handleGuestMode = () => {
    if (forceLogin) {
      setError(t("login.guestModeNotAllowed"));
      return;
    }
    setUsername("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {forceLogin ? t("login.forceLoginTitle") : t("login.title")}
          </h2>
          {!forceLogin && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("login.username")}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("login.usernamePlaceholder")}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-algonquin-500 focus:border-transparent"
                disabled={isLoading}
                autoFocus
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-algonquin-600 text-white py-2 px-4 rounded-lg hover:bg-algonquin-700 focus:ring-2 focus:ring-algonquin-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("login.loggingIn")}
                </>
              ) : (
                t("login.login")
              )}
            </button>

            {!forceLogin && (
              <button
                type="button"
                onClick={handleGuestMode}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {t("login.guestMode")}
              </button>
            )}
          </div>
        </form>

        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              {t("login.benefits.title")}
            </h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• {t("login.benefits.progress")}</li>
              <li>• {t("login.benefits.history")}</li>
              <li>• {t("login.benefits.sync")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
