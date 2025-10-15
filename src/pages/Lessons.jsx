import React, { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Play,
  ArrowRight,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useProgress } from "../contexts/ProgressContext";
import { useNavigate } from "react-router-dom";
import { getDataPath } from "../utils/pathUtils";

const Lessons = () => {
  const { t, language } = useLanguage();
  const { progress, updateChapterProgress, resetAllProgress } = useProgress();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);

  useEffect(() => {
    // Load chapters data
    fetch(getDataPath("lessons/chapters.json"))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }
        return response.json();
      })
      .then((data) => setChapters(data.chapters))
      .catch((error) => console.error("Error loading chapters:", error));
  }, []);

  const getTopicStatus = (chapterId, topicId) => {
    return progress.chapters[chapterId]?.[topicId]?.completed
      ? "completed"
      : "not-started";
  };

  const getChapterProgress = (chapterId) => {
    const chapterProgress = progress.chapters[chapterId] || {};
    const totalTopics =
      chapters.find((c) => c.id === chapterId)?.topics?.length || 0;
    const completedTopics = Object.values(chapterProgress).filter(
      (topic) => topic.completed
    ).length;
    return totalTopics > 0
      ? Math.round((completedTopics / totalTopics) * 100)
      : 0;
  };

  const handleStartLearning = (chapterId, topicId) => {
    // Navigate to lesson detail page
    navigate(`/lesson?chapter=${chapterId}&topic=${topicId}`);
  };

  const handleStartPractice = (chapterId, topicId) => {
    // Navigate to practice page with chapter and topic parameters
    navigate(`/practice?chapter=${chapterId}&topic=${topicId}`);
  };

  const handleRestudy = (chapterId, topicId) => {
    // Mark topic as not completed and navigate to lesson detail
    updateChapterProgress(chapterId, topicId, false);
    navigate(`/lesson?chapter=${chapterId}&topic=${topicId}`);
  };

  const handleResetAllProgress = () => {
    if (
      window.confirm(
        language === "zh"
          ? "确定要重置所有学习进度吗？此操作不可撤销。"
          : "Are you sure you want to reset all learning progress? This action cannot be undone."
      )
    ) {
      resetAllProgress();
    }
  };

  if (selectedChapter) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setSelectedChapter(null)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            {t("common.back")}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedChapter.title[language]}
          </h1>
          <p className="text-gray-600 mt-2">
            {selectedChapter.description[language]}
          </p>
        </div>

        <div className="space-y-6">
          {selectedChapter.topics.map((topic, index) => {
            const status = getTopicStatus(selectedChapter.id, topic.id);
            return (
              <div key={topic.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-algonquin-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-algonquin-600 font-semibold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {topic.title[language]}
                      </h3>
                      {status === "completed" && (
                        <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                      )}
                    </div>
                    <p className="text-gray-600 ml-11">
                      {topic.content[language]}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    {status === "completed" ? (
                      <div className="flex flex-col gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t("lessons.completed")}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleStartPractice(selectedChapter.id, topic.id)
                            }
                            className="btn-secondary text-sm px-3 py-1"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            {language === "zh" ? "练习" : "Practice"}
                          </button>
                          <button
                            onClick={() =>
                              handleRestudy(selectedChapter.id, topic.id)
                            }
                            className="btn-secondary text-sm px-3 py-1"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            {language === "zh" ? "重新学习" : "Restudy"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          handleStartLearning(selectedChapter.id, topic.id)
                        }
                        className="btn-primary"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        {language === "zh" ? "开始学习" : "Start Learning"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("lessons.title")}
            </h1>
            <p className="text-gray-600">
              {language === "zh"
                ? "按章节学习Python基础、NumPy、Pandas和AI入门知识"
                : "Learn Python basics, NumPy, Pandas and AI fundamentals by chapter"}
            </p>
          </div>
          <button
            onClick={handleResetAllProgress}
            className="btn-secondary flex items-center gap-2"
            title={
              language === "zh"
                ? "重置所有学习进度"
                : "Reset all learning progress"
            }
          >
            <RefreshCw className="w-4 h-4" />
            {language === "zh" ? "重置学习" : "Reset Learning"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {chapters.map((chapter) => {
          const chapterProgress = getChapterProgress(chapter.id);
          return (
            <div
              key={chapter.id}
              className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => setSelectedChapter(chapter)}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-algonquin-100 rounded-lg flex items-center justify-center mr-3">
                  <BookOpen className="w-6 h-6 text-algonquin-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {chapter.title[language]}
                  </h3>
                  <div className="flex items-center mt-1">
                    <div className="progress-bar flex-1 mr-2">
                      <div
                        className="progress-fill"
                        style={{ width: `${chapterProgress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {chapterProgress}%
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {chapter.description[language]}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {chapter.topics?.length || 0} {t("lessons.topics")}
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Lessons;
