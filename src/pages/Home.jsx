import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Brain,
  FileText,
  BarChart3,
  Play,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useProgress } from "../contexts/ProgressContext";

const Home = () => {
  const { t } = useLanguage();
  const { progress } = useProgress();

  const features = [
    {
      icon: BookOpen,
      title: "lessons.title",
      description: "学习Python基础、NumPy、Pandas和AI入门知识",
      descriptionEn: "Learn Python basics, NumPy, Pandas and AI fundamentals",
      path: "/lessons",
      color: "bg-blue-500",
    },
    {
      icon: Brain,
      title: "practice.title",
      description: "通过筛选练习题目巩固所学知识",
      descriptionEn:
        "Reinforce your knowledge through filtered practice questions",
      path: "/practice",
      color: "bg-green-500",
    },
    {
      icon: FileText,
      title: "exam.title",
      description: "模拟考试，检验学习成果",
      descriptionEn: "Take practice exams to test your learning",
      path: "/exam",
      color: "bg-purple-500",
    },
    {
      icon: BarChart3,
      title: "progress.title",
      description: "查看学习进度和统计数据",
      descriptionEn: "View your learning progress and statistics",
      path: "/progress",
      color: "bg-orange-500",
    },
  ];

  const stats = [
    {
      label: "progress.questionsAnswered",
      value: progress.practiceStats.totalQuestions,
      icon: Brain,
    },
    {
      label: "progress.accuracy",
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
    },
    {
      label: "progress.streak",
      value: progress.practiceStats.streak,
      icon: Play,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
          CST8504
        </h1>
        <p className="text-lg text-gray-600 mb-6 max-w-xl mx-auto">
          {t("language") === "zh"
            ? "AI驱动的Python学习与考试系统 - 掌握从Python基础到NumPy/Pandas的期中考试核心知识"
            : "AI-driven Python Learning and Exam System - Master core knowledge from Python basics to NumPy/Pandas for midterm exams"}
        </p>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.path}
            className="card hover:shadow-lg transition-shadow duration-200 group"
          >
            <div className="flex items-center mb-3">
              <div
                className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center`}
              >
                <feature.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t(feature.title)}
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              {t("language") === "zh"
                ? feature.description
                : feature.descriptionEn}
            </p>
            <div className="flex items-center text-algonquin-600 font-medium group-hover:text-algonquin-700">
              {t("common.start")}
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="card text-center">
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 bg-algonquin-100 rounded-lg flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-algonquin-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stat.value}
              {stat.suffix}
            </div>
            <div className="text-gray-600">{t(stat.label)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
