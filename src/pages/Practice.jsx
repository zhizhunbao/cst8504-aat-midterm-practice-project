import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDataPath } from "../utils/pathUtils";
import {
  CheckCircle,
  BarChart3,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  EyeOff,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useProgress } from "../contexts/ProgressContext";
import { useQuestionTypeState } from "../contexts/QuestionTypeStateContext";

const Practice = () => {
  const { t, language } = useLanguage();
  const { progress, updatePracticeStats } = useProgress();
  const navigate = useNavigate();

  // 状态管理
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // 使用题目状态管理
  const questionState = useQuestionTypeState();

  // 章节文件列表
  const chapterFiles = [
    "python-basics",
    "numpy",
    "pandas",
    "matplotlib",
    "ai-intro",
    "midterm-exam",
  ];

  // 章节信息映射
  const chapterInfo = {
    "python-basics": { name: "Python Basics", icon: "🐍" },
    numpy: { name: "NumPy", icon: "🔢" },
    pandas: { name: "Pandas", icon: "🐼" },
    matplotlib: { name: "Matplotlib", icon: "📊" },
    "ai-intro": { name: "AI Introduction", icon: "🤖" },
    "midterm-exam": { name: "Midterm Exam", icon: "📝" },
  };

  // 题目类型信息
  const questionTypes = {
    "multiple-choice": { name: "Multiple Choice", icon: "📝", color: "blue" },
    coding: { name: "Coding", icon: "💻", color: "green" },
    "fill-in-blank": { name: "Fill in Blank", icon: "✏️", color: "purple" },
    essay: { name: "Essay", icon: "📄", color: "orange" },
  };

  // 难度颜色映射
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // 加载所有题目
  const loadAllQuestions = async () => {
    setIsLoading(true);
    try {
      const allQuestions = [];

      // 从 public 目录加载所有章节数据
      const chapterModules = await Promise.all([
        fetch(getDataPath("questions/python-basics.json")).then((res) =>
          res.json()
        ),
        fetch(getDataPath("questions/numpy.json")).then((res) => res.json()),
        fetch(getDataPath("questions/pandas.json")).then((res) => res.json()),
        fetch(getDataPath("questions/matplotlib.json")).then((res) => res.json()),
        fetch(getDataPath("questions/ai-intro.json")).then((res) => res.json()),
        fetch(getDataPath("questions/midterm-exam.json")).then((res) =>
          res.json()
        ),
      ]);

      chapterModules.forEach((chapterData, index) => {
        const chapterFile = chapterFiles[index];
        try {
          const chapterQuestions = chapterData.questions || chapterData;

          // 为每个题目添加章节信息
          const questionsWithChapter = chapterQuestions.map((question) => ({
            ...question,
            chapter: chapterFile,
            chapterName: chapterInfo[chapterFile]?.name || chapterFile,
          }));

          allQuestions.push(...questionsWithChapter);
        } catch (error) {
          console.warn(
            `Failed to process questions from ${chapterFile}:`,
            error
          );
        }
      });

      setQuestions(allQuestions);
      if (allQuestions.length > 0) {
        setCurrentQuestion(allQuestions[0]);
        setCurrentQuestionIndex(0); // 重置为第一题
      }
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 下一题
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      setShowResult(false);
      setShowAnswer(false);
    }
  };

  // 上一题
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setCurrentQuestion(questions[prevIndex]);
      setShowResult(false);
      setShowAnswer(false);
    }
  };

  // 切换答案显示/隐藏
  const handleToggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  // 提交答案
  const submitAnswer = () => {
    setShowResult(true);
    // 这里可以添加答案验证逻辑
  };

  // 获取多语言文本
  const getText = (textObj) => {
    if (typeof textObj === "string") return textObj;
    if (typeof textObj === "object" && textObj !== null) {
      return textObj[language] || textObj.en || textObj.zh || "";
    }
    return "";
  };

  // 渲染选择题
  const renderMultipleChoice = () => {
    if (!currentQuestion) return null;

    return (
      <div className="space-y-4">
        <div className="text-lg font-medium text-gray-900 mb-4">
          {getText(currentQuestion.question)}
        </div>

        {currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="answer"
                  value={index}
                  className="mr-3"
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [currentQuestionIndex]: e.target.value,
                    })
                  }
                />
                <span className="text-gray-700">{getText(option)}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  // 渲染编程题
  const renderCoding = () => {
    if (!currentQuestion) return null;

    // 检查是否是演示型编程题（codeTemplate包含完整代码）
    const isDemoQuestion =
      currentQuestion.codeTemplate &&
      currentQuestion.codeTemplate.includes("plt.plot") &&
      currentQuestion.codeTemplate.includes("plt.show()") &&
      !currentQuestion.codeTemplate.includes("# 请完成以下代码：") &&
      !currentQuestion.codeTemplate.includes("# TODO:");

    return (
      <div className="space-y-4">
        <div className="text-lg font-medium text-gray-900 mb-4">
          {getText(currentQuestion.question)}
        </div>

        {isDemoQuestion && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-800 mb-2">
              {language === "zh" ? "提示" : "Hint"}
            </div>
            <div className="text-sm text-blue-700">
              {language === "zh"
                ? "这是一个演示题目，请在下方输入你的代码来创建图表。"
                : "This is a demo question. Please enter your code below to create the plot."}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === "zh" ? "你的代码" : "Your Code"}
          </label>
          <textarea
            className="w-full h-64 p-3 border rounded-lg font-mono text-sm"
            placeholder={
              language === "zh"
                ? "在这里输入你的代码..."
                : "Enter your code here..."
            }
            value={answers[currentQuestionIndex] || ""}
            onChange={(e) =>
              setAnswers({ ...answers, [currentQuestionIndex]: e.target.value })
            }
          />
        </div>
      </div>
    );
  };

  // 渲染填空题
  const renderFillInBlank = () => {
    if (!currentQuestion) return null;

    return (
      <div className="space-y-4">
        <div className="text-lg font-medium text-gray-900 mb-4">
          {getText(currentQuestion.question)}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === "zh" ? "你的答案" : "Your Answer"}
          </label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg"
            placeholder={
              language === "zh" ? "输入你的答案..." : "Enter your answer..."
            }
            value={answers[currentQuestionIndex] || ""}
            onChange={(e) =>
              setAnswers({ ...answers, [currentQuestionIndex]: e.target.value })
            }
          />
        </div>
      </div>
    );
  };

  // 渲染问答题
  const renderEssay = () => {
    if (!currentQuestion) return null;

    return (
      <div className="space-y-4">
        <div className="text-lg font-medium text-gray-900 mb-4">
          {getText(currentQuestion.question)}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === "zh" ? "你的回答" : "Your Answer"}
          </label>
          <textarea
            className="w-full h-48 p-3 border rounded-lg"
            placeholder={
              language === "zh"
                ? "在这里输入你的回答..."
                : "Enter your answer here..."
            }
            value={answers[currentQuestionIndex] || ""}
            onChange={(e) =>
              setAnswers({ ...answers, [currentQuestionIndex]: e.target.value })
            }
          />
        </div>
      </div>
    );
  };

  // 渲染答案
  const renderAnswer = () => {
    if (!currentQuestion || !showAnswer) return null;

    return (
      <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
        <div className="flex items-center mb-3">
          <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-blue-800">
            {language === "zh" ? "参考答案" : "Reference Solution"}
          </h3>
        </div>

        {/* 代码/解决方案部分 */}
        {(currentQuestion.type === "coding" && currentQuestion.solution) ||
        (currentQuestion.type === "fill-in-blank" && currentQuestion.answer) ||
        (currentQuestion.type === "multiple-choice" &&
          currentQuestion.options &&
          currentQuestion.correct !== undefined) ||
        (currentQuestion.type === "essay" &&
          currentQuestion.expected_keywords) ? (
          <div className="p-3 bg-white rounded border mb-3">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">
              {currentQuestion.type === "coding" && currentQuestion.solution
                ? getText(currentQuestion.solution)
                : currentQuestion.type === "fill-in-blank" &&
                  currentQuestion.answer
                ? getText(currentQuestion.answer)
                : currentQuestion.type === "multiple-choice" &&
                  currentQuestion.options &&
                  currentQuestion.correct !== undefined
                ? getText(currentQuestion.options[currentQuestion.correct])
                : currentQuestion.type === "essay" &&
                  currentQuestion.expected_keywords
                ? Array.isArray(currentQuestion.expected_keywords)
                  ? currentQuestion.expected_keywords
                      .map((keyword) => getText(keyword))
                      .join("\n")
                  : getText(currentQuestion.expected_keywords)
                : ""}
            </pre>
          </div>
        ) : null}

        {/* 解释部分 */}
        {currentQuestion.explanation && (
          <div className="p-3 bg-white rounded border">
            <span className="font-medium text-gray-700 block mb-2">
              {language === "zh" ? "解释：" : "Explanation: "}
            </span>
            <p className="text-gray-800 text-sm">
              {getText(currentQuestion.explanation)}
            </p>
          </div>
        )}
      </div>
    );
  };

  // 渲染题目内容
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    // 渲染重点题目标记
    const renderKeyQuestionBadge = () => {
      if (currentQuestion.isKeyQuestion) {
        return (
          <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">
                  {language === "zh"
                    ? "🎯 期中考试重点题目"
                    : "🎯 Key Midterm Question"}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  {currentQuestion.keyQuestionReason ||
                    (language === "zh"
                      ? "这是期中考试的重点题目"
                      : "This is a key question for the midterm exam")}
                </p>
              </div>
            </div>
          </div>
        );
      }
      return null;
    };

    return (
      <div>
        {renderKeyQuestionBadge()}
        <div>
          {(() => {
            switch (currentQuestion.type) {
              case "multiple-choice":
                return renderMultipleChoice();
              case "coding":
                return renderCoding();
              case "fill-in-blank":
                return renderFillInBlank();
              case "essay":
                return renderEssay();
              default:
                return <div>Unknown question type</div>;
            }
          })()}
        </div>
      </div>
    );
  };

  // 组件挂载时加载题目
  useEffect(() => {
    loadAllQuestions();
  }, []);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-algonquin-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading questions...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {language === "zh" ? "没有可用的题目" : "No Questions Available"}
          </h2>
          <p className="text-gray-600">
            {language === "zh"
              ? "请检查题目文件是否正确加载"
              : "Please check if question files are loaded correctly"}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题和导航 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {language === "zh" ? "练习" : "Practice"}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/practice")}
              className="btn-primary flex items-center"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {language === "zh" ? "筛选练习" : "Filtered Practice"}
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {language === "zh" ? "返回首页" : "Back to Home"}
            </button>
          </div>
        </div>

        {/* 题目内容 */}
        <div className="card mb-6">
          {renderQuestion()}
          {renderAnswer()}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === "zh" ? "上一题" : "Previous"}
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleToggleAnswer}
              className="btn-primary flex items-center"
            >
              {showAnswer ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  {language === "zh" ? "隐藏答案" : "Hide Answer"}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {language === "zh" ? "显示答案" : "Show Answer"}
                </>
              )}
            </button>

            <button
              onClick={
                currentQuestionIndex === questions.length - 1
                  ? () => navigate("/")
                  : nextQuestion
              }
              className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={questions.length === 1}
            >
              {currentQuestionIndex === questions.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {language === "zh"
                    ? "最后一题 - 返回首页"
                    : "Last Question - Back to Home"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  {language === "zh" ? "下一题" : "Next"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Practice;
