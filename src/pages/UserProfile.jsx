import React, { useState } from "react";
import {
  User,
  Calendar,
  BarChart3,
  Download,
  Upload,
  Trash2,
  Settings,
} from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { useProgress } from "../contexts/ProgressContext";
import { useLanguage } from "../contexts/LanguageContext";

const UserProfile = () => {
  const { user, logout } = useUser();
  const { progress, exportProgress, importProgress, resetProgress } =
    useProgress();
  const { t } = useLanguage();
  const [isResetting, setIsResetting] = useState(false);

  const handleExport = () => {
    exportProgress();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      importProgress(file)
        .then(() => {
          alert(t("settings.importSuccess"));
        })
        .catch(() => {
          alert(t("settings.importError"));
        });
    }
  };

  const handleReset = async () => {
    if (window.confirm(t("settings.resetConfirm"))) {
      setIsResetting(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟延迟
        resetProgress();
        alert(t("settings.resetSuccess"));
      } catch (error) {
        alert(t("settings.resetError"));
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm(t("user.logoutConfirm"))) {
      logout();
    }
  };

  const stats = [
    {
      label: t("progress.questionsAnswered"),
      value: progress.practiceStats.totalQuestions,
      icon: BarChart3,
      color: "bg-blue-500",
    },
    {
      label: t("progress.accuracy"),
      value:
        progress.practiceStats.totalQuestions > 0
          ? Math.round(
              (progress.practiceStats.correctAnswers /
                progress.practiceStats.totalQuestions) *
                100
            )
          : 0,
      suffix: "%",
      icon: BarChart3,
      color: "bg-green-500",
    },
    {
      label: t("progress.streak"),
      value: progress.practiceStats.streak,
      icon: Calendar,
      color: "bg-orange-500",
    },
    {
      label: t("progress.totalTime"),
      value: Math.round(progress.practiceStats.totalTime / 60),
      suffix: " min",
      icon: BarChart3,
      color: "bg-purple-500",
    },
  ];

  const completedChapters = Object.keys(progress.chapters).length;
  const totalExams = progress.examHistory.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* User Info Card */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-algonquin-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.username?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.username}
            </h1>
            <p className="text-gray-600">
              {t("user.joined")}:{" "}
              {new Date(user?.loginTime).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              {t("progress.chapterProgress")}
            </h3>
            <p className="text-2xl font-bold text-algonquin-600">
              {completedChapters}
            </p>
            <p className="text-sm text-gray-600">
              {t("progress.chaptersCompleted")}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">
              {t("progress.examHistory")}
            </h3>
            <p className="text-2xl font-bold text-algonquin-600">
              {totalExams}
            </p>
            <p className="text-sm text-gray-600">{t("progress.examsTaken")}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="card text-center">
            <div className="flex justify-center mb-3">
              <div
                className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
              {stat.suffix}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Data Management */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          {t("settings.dataManagement")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleExport}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t("settings.exportData")}</span>
          </button>

          <label className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>{t("settings.importData")}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {isResetting ? t("common.loading") : t("settings.resetProgress")}
            </span>
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t("user.account")}
        </h2>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          {t("user.logout")}
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
