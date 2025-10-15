import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Code,
  Lightbulb,
  Play,
  RotateCcw,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  tomorrow,
  vscDarkPlus,
  oneDark,
  dracula,
  materialDark,
  atomDark,
  nightOwl,
  nord,
  okaidia,
  prism,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useLanguage } from "../contexts/LanguageContext";
import { useProgress } from "../contexts/ProgressContext";

const LessonDetail = () => {
  const { t, language } = useLanguage();
  const { progress, updateChapterProgress } = useProgress();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 代码高亮主题选择
  const [selectedTheme, setSelectedTheme] = useState("tomorrow");

  const themes = {
    tomorrow: { name: "Tomorrow", style: tomorrow },
    vscDarkPlus: { name: "VS Code Dark+", style: vscDarkPlus },
    oneDark: { name: "One Dark", style: oneDark },
    dracula: { name: "Dracula", style: dracula },
    materialDark: { name: "Material Dark", style: materialDark },
    atomDark: { name: "Atom Dark", style: atomDark },
    nightOwl: { name: "Night Owl", style: nightOwl },
    nord: { name: "Nord", style: nord },
    okaidia: { name: "Okaidia", style: okaidia },
    prism: { name: "Prism", style: prism },
  };
  const [chapters, setChapters] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [theoryContent, setTheoryContent] = useState(null);

  useEffect(() => {
    // Load chapters data
    fetch("/src/data/lessons/chapters.json")
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
      .then((data) => {
        setChapters(data.chapters);

        // Find current chapter and topic
        const chapterId = searchParams.get("chapter");
        const topicId = searchParams.get("topic");

        if (chapterId && topicId) {
          const chapter = data.chapters.find((c) => c.id === chapterId);
          const topic = chapter?.topics.find((t) => t.id === topicId);

          setCurrentChapter(chapter);
          setCurrentTopic(topic);

          // Load theory content for this topic
          if (chapter && topic) {
            loadTheoryContent(chapterId, topicId);
          }
        }
      })
      .catch((error) => console.error("Error loading chapters:", error));
  }, [searchParams]);

  const loadTheoryContent = async (chapterId, topicId) => {
    try {
      const response = await fetch(
        `/src/data/lessons/${chapterId}/theory.json`
      );
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }
        const theoryData = await response.json();
        const content = theoryData[topicId];
        if (content) {
          setTheoryContent(content);
        } else {
          console.warn(
            `Topic ${topicId} not found in theory data for chapter ${chapterId}`
          );
          setTheoryContent(null);
        }
      } else {
        console.warn(`Theory file not found for ${chapterId}/${topicId}`);
        setTheoryContent(null);
      }
    } catch (error) {
      console.error("Error loading theory content:", error);
      setTheoryContent(null);
    }
  };

  const handleStartPractice = () => {
    const chapterId = searchParams.get("chapter");
    const topicId = searchParams.get("topic");
    navigate(`/practice?chapter=${chapterId}&topic=${topicId}`);
  };

  const handleRestudy = () => {
    const chapterId = searchParams.get("chapter");
    const topicId = searchParams.get("topic");
    // Mark topic as not completed to allow restudy
    updateChapterProgress(chapterId, topicId, false);
  };

  const isTopicCompleted = () => {
    const chapterId = searchParams.get("chapter");
    const topicId = searchParams.get("topic");
    return progress.chapters[chapterId]?.[topicId]?.completed || false;
  };

  if (!currentTopic || !currentChapter) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {language === "zh" ? "加载中..." : "Loading..."}
          </h2>
        </div>
      </div>
    );
  }

  const isCompleted = isTopicCompleted();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/lessons")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "zh" ? "返回课程" : "Back to Lessons"}
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentTopic.title[language]}
            </h1>
            <p className="text-lg text-gray-600">
              {currentChapter.title[language]} •{" "}
              {currentTopic.content[language]}
            </p>
          </div>

          {isCompleted && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-6 h-6 mr-2" />
              <span className="font-medium">
                {language === "zh" ? "已完成" : "Completed"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Learning Content */}
      {theoryContent && theoryContent[language] ? (
        <div className="space-y-8">
          {/* Concepts */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
              {language === "zh" ? "核心概念" : "Key Concepts"}
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <ul className="space-y-3">
                {theoryContent[language].concepts.map((concept, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{concept}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Examples */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Code className="w-6 h-6 mr-2 text-green-600" />
                {language === "zh" ? "代码示例" : "Code Examples"}
              </h2>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  {language === "zh" ? "主题:" : "Theme:"}
                </label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-algonquin-500"
                >
                  {Object.entries(themes).map(([key, theme]) => (
                    <option key={key} value={key}>
                      {theme.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-6">
              {theoryContent[language].examples.map((example, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-6"
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {example.title}
                  </h3>
                  <SyntaxHighlighter
                    language="python"
                    style={themes[selectedTheme].style}
                    customStyle={{
                      borderRadius: "0.5rem",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                    showLineNumbers={true}
                    wrapLines={true}
                  >
                    {example.code}
                  </SyntaxHighlighter>
                </div>
              ))}
            </div>
          </section>

          {/* Key Points */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="w-6 h-6 mr-2 text-yellow-600" />
              {language === "zh" ? "重要提示" : "Important Tips"}
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <ul className="space-y-3">
                {theoryContent[language].keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {language === "zh"
              ? "理论内容加载中..."
              : "Loading theory content..."}
          </h3>
          <p className="text-gray-600">
            {language === "zh"
              ? "正在加载详细的理论内容和代码示例"
              : "Loading detailed theory content and code examples"}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleStartPractice}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Play className="w-5 h-5 mr-2" />
          {language === "zh" ? "开始练习" : "Start Practice"}
        </button>

        {isCompleted && (
          <button
            onClick={handleRestudy}
            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            {language === "zh" ? "重新学习" : "Restudy"}
          </button>
        )}
      </div>

      {/* Study Time Estimate */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center text-gray-600">
          <Clock className="w-5 h-5 mr-2" />
          <span className="text-sm">
            {language === "zh"
              ? "预计学习时间: 10-15分钟"
              : "Estimated study time: 10-15 minutes"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;
