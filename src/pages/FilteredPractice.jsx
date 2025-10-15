import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  BarChart3,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Filter,
  ChevronDown,
  EyeOff,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useProgress } from "../contexts/ProgressContext";
import { useQuestionTypeState } from "../contexts/QuestionTypeStateContext";

const FilteredPractice = () => {
  const { t, language } = useLanguage();
  const { progress, updatePracticeStats } = useProgress();
  const navigate = useNavigate();

  // 状态管理
  const [allQuestions, setAllQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answerStatus, setAnswerStatus] = useState({}); // 记录每题的答案状态：'correct', 'incorrect', 'unanswered'

  // 筛选状态
  const [selectedChapter, setSelectedChapter] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

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
    "python-basics": {
      name: { zh: "Python基础", en: "Python Basics" },
      icon: "🐍",
    },
    numpy: {
      name: { zh: "NumPy", en: "NumPy" },
      icon: "🔢",
    },
    pandas: {
      name: { zh: "Pandas", en: "Pandas" },
      icon: "🐼",
    },
    matplotlib: {
      name: { zh: "Matplotlib", en: "Matplotlib" },
      icon: "📊",
    },
    "ai-intro": {
      name: { zh: "AI入门", en: "AI Introduction" },
      icon: "🤖",
    },
    "midterm-exam": {
      name: { zh: "期中考试", en: "Midterm Exam" },
      icon: "📝",
    },
  };

  // 题目类型信息
  const questionTypes = {
    "multiple-choice": { name: "Multiple Choice", icon: "📝", color: "blue" },
    coding: { name: "Coding", icon: "💻", color: "green" },
    "fill-in-blank": { name: "Fill in Blank", icon: "✏️", color: "purple" },
    essay: { name: "Essay", icon: "📄", color: "orange" },
  };

  // 难度选项
  const difficultyOptions = [
    {
      value: "all",
      label: language === "zh" ? "所有难度" : "All Difficulties",
    },
    { value: "easy", label: language === "zh" ? "简单" : "Easy" },
    { value: "medium", label: language === "zh" ? "中等" : "Medium" },
    { value: "hard", label: language === "zh" ? "困难" : "Hard" },
  ];

  // 题型选项
  const typeOptions = [
    { value: "all", label: language === "zh" ? "所有题型" : "All Types" },
    {
      value: "multiple-choice",
      label: language === "zh" ? "选择题" : "Multiple Choice",
    },
    { value: "coding", label: language === "zh" ? "编程题" : "Coding" },
    {
      value: "fill-in-blank",
      label: language === "zh" ? "填空题" : "Fill in Blank",
    },
    { value: "essay", label: language === "zh" ? "问答题" : "Essay" },
  ];

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
        fetch("/data/questions/python-basics.json").then((res) =>
          res.json()
        ),
        fetch("/data/questions/numpy.json").then((res) => res.json()),
        fetch("/data/questions/pandas.json").then((res) => res.json()),
        fetch("/data/questions/matplotlib.json").then((res) => res.json()),
        fetch("/data/questions/ai-intro.json").then((res) => res.json()),
        fetch("/data/questions/midterm-exam.json").then((res) =>
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
            chapterName:
              chapterInfo[chapterFile]?.name?.[language] || chapterFile,
          }));

          allQuestions.push(...questionsWithChapter);
        } catch (error) {
          console.warn(
            `Failed to process questions from ${chapterFile}:`,
            error
          );
        }
      });

      setAllQuestions(allQuestions);
      setFilteredQuestions(allQuestions);
      if (allQuestions.length > 0) {
        setCurrentQuestion(allQuestions[0]);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取可用的章节选项
  const getAvailableChapters = () => {
    return chapterFiles.filter((chapter) => {
      return allQuestions.some((q) => q.chapter === chapter);
    });
  };

  // 获取可用的难度选项（基于当前章节筛选）
  const getAvailableDifficulties = () => {
    let baseQuestions = allQuestions;

    // 如果选择了特定章节，只考虑该章节的题目
    if (selectedChapter !== "all") {
      baseQuestions = baseQuestions.filter(
        (q) => q.chapter === selectedChapter
      );
    }

    // 如果选择了特定题型，只考虑该题型的题目
    if (selectedType !== "all") {
      baseQuestions = baseQuestions.filter((q) => q.type === selectedType);
    }

    const difficulties = [...new Set(baseQuestions.map((q) => q.difficulty))];
    return difficulties.filter((d) => d && d !== "all");
  };

  // 获取可用的题型选项（基于当前章节和难度筛选）
  const getAvailableTypes = () => {
    let baseQuestions = allQuestions;

    // 如果选择了特定章节，只考虑该章节的题目
    if (selectedChapter !== "all") {
      baseQuestions = baseQuestions.filter(
        (q) => q.chapter === selectedChapter
      );
    }

    // 如果选择了特定难度，只考虑该难度的题目
    if (selectedDifficulty !== "all") {
      baseQuestions = baseQuestions.filter(
        (q) => q.difficulty === selectedDifficulty
      );
    }

    const types = [...new Set(baseQuestions.map((q) => q.type))];
    return types.filter((t) => t && t !== "all");
  };

  // 筛选题目
  const filterQuestions = () => {
    let filtered = allQuestions;

    // 按章节筛选
    if (selectedChapter !== "all") {
      filtered = filtered.filter((q) => q.chapter === selectedChapter);
    }

    // 按难度筛选
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter((q) => q.difficulty === selectedDifficulty);
    }

    // 按题型筛选
    if (selectedType !== "all") {
      filtered = filtered.filter((q) => q.type === selectedType);
    }

    console.log("Filtered questions:", filtered.length);
    console.log("Current filters:", {
      selectedChapter,
      selectedDifficulty,
      selectedType,
    });

    setFilteredQuestions(filtered);

    // 重置当前题目索引
    setCurrentQuestionIndex(0);
    if (filtered.length > 0) {
      setCurrentQuestion(filtered[0]);
    } else {
      setCurrentQuestion(null);
    }
    setShowResult(false);
  };

  // 获取可用的难度选项（基于指定章节和题型筛选）
  const getAvailableDifficultiesForFilters = (chapter, type) => {
    let baseQuestions = allQuestions;

    // 如果指定了特定章节，只考虑该章节的题目
    if (chapter !== "all") {
      baseQuestions = baseQuestions.filter((q) => q.chapter === chapter);
    }

    // 如果指定了特定题型，只考虑该题型的题目
    if (type !== "all") {
      baseQuestions = baseQuestions.filter((q) => q.type === type);
    }

    const difficulties = [...new Set(baseQuestions.map((q) => q.difficulty))];
    return difficulties.filter((d) => d && d !== "all");
  };

  // 获取可用的题型选项（基于指定章节和难度筛选）
  const getAvailableTypesForFilters = (chapter, difficulty) => {
    let baseQuestions = allQuestions;

    // 如果指定了特定章节，只考虑该章节的题目
    if (chapter !== "all") {
      baseQuestions = baseQuestions.filter((q) => q.chapter === chapter);
    }

    // 如果指定了特定难度，只考虑该难度的题目
    if (difficulty !== "all") {
      baseQuestions = baseQuestions.filter((q) => q.difficulty === difficulty);
    }

    const types = [...new Set(baseQuestions.map((q) => q.type))];
    return types.filter((t) => t && t !== "all");
  };

  // 处理章节变化
  const handleChapterChange = (newChapter) => {
    setSelectedChapter(newChapter);

    // 检查当前难度是否还可用
    const availableDifficulties = getAvailableDifficultiesForFilters(
      newChapter,
      selectedType
    );
    if (
      selectedDifficulty !== "all" &&
      !availableDifficulties.includes(selectedDifficulty)
    ) {
      setSelectedDifficulty("all");
    }

    // 检查当前题型是否还可用
    const availableTypes = getAvailableTypesForFilters(
      newChapter,
      selectedDifficulty
    );
    if (selectedType !== "all" && !availableTypes.includes(selectedType)) {
      setSelectedType("all");
    }
  };

  // 处理难度变化
  const handleDifficultyChange = (newDifficulty) => {
    setSelectedDifficulty(newDifficulty);

    // 检查当前题型是否还可用
    const availableTypes = getAvailableTypesForFilters(
      selectedChapter,
      newDifficulty
    );
    if (selectedType !== "all" && !availableTypes.includes(selectedType)) {
      setSelectedType("all");
    }
  };

  // 处理题型变化
  const handleTypeChange = (newType) => {
    setSelectedType(newType);

    // 检查当前难度是否还可用
    const availableDifficulties = getAvailableDifficultiesForFilters(
      selectedChapter,
      newType
    );
    if (
      selectedDifficulty !== "all" &&
      !availableDifficulties.includes(selectedDifficulty)
    ) {
      setSelectedDifficulty("all");
    }
  };

  // 当筛选条件改变时重新筛选
  useEffect(() => {
    if (allQuestions.length > 0) {
      filterQuestions();
    }
  }, [selectedChapter, selectedDifficulty, selectedType, allQuestions]);

  // 下一题
  const nextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(filteredQuestions[nextIndex]);
      setShowResult(false);
      setShowAnswer(false);
    }
  };

  // 上一题
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setCurrentQuestion(filteredQuestions[prevIndex]);
      setShowResult(false);
      setShowAnswer(false);
    }
  };

  // 验证答案
  const validateAnswer = (question, userAnswer) => {
    if (!question || userAnswer === undefined || userAnswer === null) {
      return false;
    }

    switch (question.type) {
      case "multiple-choice":
        return userAnswer === question.correct;
      case "coding":
        // 编程题暂时返回true，可以后续添加代码验证逻辑
        return true;
      case "fill-in-blank":
        // 填空题可以支持多个正确答案
        if (!userAnswer || userAnswer.toString().trim() === "") return false;
        const correctAnswers = Array.isArray(question.correct)
          ? question.correct
          : [question.correct];
        return correctAnswers.some(
          (correct) =>
            userAnswer.toString().toLowerCase().trim() ===
            correct.toString().toLowerCase().trim()
        );
      case "essay":
        // 问答题暂时返回true
        return true;
      default:
        return false;
    }
  };

  // 切换答案显示/隐藏
  const toggleAnswer = () => {
    if (!currentQuestion) return;

    // 如果还没有显示结果，先验证答案
    if (!showResult) {
      const userAnswer = answers[currentQuestionIndex];
      const isCorrect = validateAnswer(currentQuestion, userAnswer);

      // 更新答案状态
      setAnswerStatus({
        ...answerStatus,
        [currentQuestionIndex]: isCorrect ? "correct" : "incorrect",
      });
      setShowResult(true);
    }

    // 切换答案显示状态
    setShowAnswer(!showAnswer);
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

    const currentAnswer = answers[currentQuestionIndex];
    const currentStatus = answerStatus[currentQuestionIndex];
    const isCorrect = currentAnswer === currentQuestion.correct;
    const showFeedback =
      currentStatus === "incorrect" ||
      currentStatus === "correct" ||
      showAnswer;

    return (
      <div className="space-y-4">
        <div className="text-lg font-medium text-gray-900 mb-4">
          {getText(currentQuestion.question)}
        </div>

        <div className="space-y-3">
          {currentQuestion.options?.map((option, index) => {
            let optionClass =
              "flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50";
            let textClass = "text-gray-700";

            if (showFeedback) {
              if (index === currentQuestion.correct) {
                // 正确答案 - 绿色
                optionClass += " bg-green-50 border-green-300";
                textClass = "text-green-800 font-medium";
              } else if (index === currentAnswer && !isCorrect) {
                // 用户选择的错误答案 - 红色
                optionClass += " bg-red-50 border-red-300";
                textClass = "text-red-800 font-medium";
              } else {
                // 其他选项 - 灰色
                optionClass += " bg-gray-50 border-gray-200";
                textClass = "text-gray-500";
              }
            }

            return (
              <label key={index} className={optionClass}>
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={index}
                  checked={currentAnswer === index}
                  onChange={(e) => {
                    const newAnswer = parseInt(e.target.value);
                    setAnswers({
                      ...answers,
                      [currentQuestionIndex]: newAnswer,
                    });

                    // 立即验证答案
                    const isCorrect = validateAnswer(
                      currentQuestion,
                      newAnswer
                    );
                    setAnswerStatus({
                      ...answerStatus,
                      [currentQuestionIndex]: isCorrect
                        ? "correct"
                        : "incorrect",
                    });

                    if (isCorrect) {
                      setShowResult(true);
                    }
                  }}
                  className="mr-3"
                />
                <span className={textClass}>{getText(option)}</span>
                {showFeedback && index === currentQuestion.correct && (
                  <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                )}
              </label>
            );
          })}
        </div>

        {/* 反馈信息 */}
        {showAnswer && (
          <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
            <div className="flex items-center mb-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-blue-800">
                {language === "zh" ? "参考答案" : "Reference Solution"}
              </h3>
            </div>

            <div className="p-3 bg-white rounded border mb-3">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {getText(currentQuestion.options[currentQuestion.correct])}
              </pre>
            </div>

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
        )}
      </div>
    );
  };

  // 渲染编程题
  const renderCoding = () => {
    if (!currentQuestion) return null;

    const currentAnswer = answers[currentQuestionIndex];
    const currentStatus = answerStatus[currentQuestionIndex];
    const showFeedback =
      currentStatus === "correct" || currentStatus === "incorrect";

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

        {/* 反馈信息 */}
        {showAnswer && (
          <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
            <div className="flex items-center mb-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-blue-800">
                {language === "zh" ? "参考答案" : "Reference Solution"}
              </h3>
            </div>

            {currentQuestion.solution && (
              <div className="p-3 bg-white rounded border mb-3">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {getText(currentQuestion.solution)}
                </pre>
              </div>
            )}

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
        )}
      </div>
    );
  };

  // 渲染填空题
  const renderFillInBlank = () => {
    if (!currentQuestion) return null;

    const currentAnswer = answers[currentQuestionIndex];
    const currentStatus = answerStatus[currentQuestionIndex];
    const showFeedback =
      currentStatus === "correct" || currentStatus === "incorrect";

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
            className={`w-full p-3 border rounded-lg ${
              showFeedback
                ? currentStatus === "correct"
                  ? "border-green-300 bg-green-50"
                  : "border-red-300 bg-red-50"
                : ""
            }`}
            placeholder={
              language === "zh" ? "输入你的答案..." : "Enter your answer..."
            }
            value={answers[currentQuestionIndex] || ""}
            onChange={(e) =>
              setAnswers({ ...answers, [currentQuestionIndex]: e.target.value })
            }
          />
        </div>

        {/* 反馈信息 */}
        {showAnswer && (
          <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
            <div className="flex items-center mb-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-blue-800">
                {language === "zh" ? "参考答案" : "Reference Solution"}
              </h3>
            </div>

            <div className="p-3 bg-white rounded border mb-3">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {getText(currentQuestion.answer)}
              </pre>
            </div>

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
        )}
      </div>
    );
  };

  // 渲染问答题
  const renderEssay = () => {
    if (!currentQuestion) return null;

    const currentAnswer = answers[currentQuestionIndex];
    const currentStatus = answerStatus[currentQuestionIndex];
    const showFeedback =
      currentStatus === "correct" || currentStatus === "incorrect";

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
            className={`w-full h-48 p-3 border rounded-lg ${
              showFeedback
                ? currentStatus === "correct"
                  ? "border-green-300 bg-green-50"
                  : "border-red-300 bg-red-50"
                : ""
            }`}
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

        {/* 反馈信息 */}
        {showAnswer && (
          <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
            <div className="flex items-center mb-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-blue-800">
                {language === "zh" ? "参考答案" : "Reference Solution"}
              </h3>
            </div>

            {(currentQuestion.expected_keywords ||
              currentQuestion.sample_answer) && (
              <div className="p-3 bg-white rounded border mb-3">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {currentQuestion.sample_answer
                    ? getText(currentQuestion.sample_answer)
                    : currentQuestion.expected_keywords
                    ? Array.isArray(currentQuestion.expected_keywords)
                      ? currentQuestion.expected_keywords
                          .map((keyword) => getText(keyword))
                          .join("\n")
                      : getText(currentQuestion.expected_keywords)
                    : ""}
                </pre>
              </div>
            )}

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
        )}
      </div>
    );
  };

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

  // 渲染题目内容
  const renderQuestion = () => {
    if (!currentQuestion) return null;

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
                return (
                  <div className="text-center text-gray-500 py-8">
                    {language === "zh"
                      ? "未知题目类型"
                      : "Unknown question type"}
                  </div>
                );
            }
          })()}
        </div>
      </div>
    );
  };

  // 初始化加载
  useEffect(() => {
    loadAllQuestions();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-algonquin-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === "zh" ? "加载题目中..." : "Loading questions..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题和导航 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {language === "zh" ? "练习" : "Practice"}
            </h1>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {language === "zh" ? "返回首页" : "Back to Home"}
          </button>
        </div>

        {/* 筛选器 */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* 课程类别筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "zh" ? "课程类别" : "Chapter"}
              </label>
              <div className="relative">
                <select
                  value={selectedChapter}
                  onChange={(e) => handleChapterChange(e.target.value)}
                  className="w-full p-3 border rounded-lg appearance-none bg-white pr-10"
                >
                  <option value="all">
                    {language === "zh" ? "所有章节" : "All Chapters"}
                  </option>
                  {getAvailableChapters().map((chapter) => (
                    <option key={chapter} value={chapter}>
                      {chapterInfo[chapter]?.name?.[language] || chapter}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* 难度筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "zh" ? "难度" : "Difficulty"}
              </label>
              <div className="relative">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => handleDifficultyChange(e.target.value)}
                  className="w-full p-3 border rounded-lg appearance-none bg-white pr-10"
                >
                  <option value="all">
                    {language === "zh" ? "所有难度" : "All Difficulties"}
                  </option>
                  {getAvailableDifficultiesForFilters(
                    selectedChapter,
                    selectedType
                  ).map((difficulty) => {
                    const option = difficultyOptions.find(
                      (opt) => opt.value === difficulty
                    );
                    return (
                      <option key={difficulty} value={difficulty}>
                        {option ? option.label : difficulty}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* 题型筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "zh" ? "题型" : "Question Type"}
              </label>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full p-3 border rounded-lg appearance-none bg-white pr-10"
                >
                  <option value="all">
                    {language === "zh" ? "所有题型" : "All Types"}
                  </option>
                  {getAvailableTypesForFilters(
                    selectedChapter,
                    selectedDifficulty
                  ).map((type) => {
                    const option = typeOptions.find(
                      (opt) => opt.value === type
                    );
                    return (
                      <option key={type} value={type}>
                        {option ? option.label : type}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="pt-6 border-t">
            <div className="text-base text-gray-700 text-center">
              {language === "zh" ? "当前是第" : "Current Question"}:
              <span className="font-bold text-algonquin-600 ml-2 text-lg">
                {filteredQuestions.length > 0 ? currentQuestionIndex + 1 : 0}
              </span>
              {language === "zh" ? "题" : ""}
              <span className="mx-2 text-gray-400">,</span>
              {language === "zh"
                ? "当前筛选条件下一共"
                : "Total in current filter"}
              :
              <span className="font-bold text-gray-900 ml-2 text-lg">
                {filteredQuestions.length}
              </span>
              {language === "zh" ? "题" : " questions"}
            </div>
          </div>
        </div>

        {/* 无题目时的提示 */}
        {filteredQuestions.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-gray-400 mb-4">
              <BookOpen className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === "zh"
                ? "没有找到匹配的题目"
                : "No matching questions found"}
            </h3>
            <p className="text-gray-600">
              {language === "zh"
                ? "请尝试调整筛选条件"
                : "Please try adjusting your filter criteria"}
            </p>
          </div>
        ) : (
          <>
            {/* 题目内容 */}
            <div className="card mb-6">{renderQuestion()}</div>

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
                  onClick={toggleAnswer}
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
                  onClick={nextQuestion}
                  disabled={
                    currentQuestionIndex === filteredQuestions.length - 1
                  }
                  className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  title={`Current: ${currentQuestionIndex + 1}, Total: ${
                    filteredQuestions.length
                  }, Disabled: ${
                    currentQuestionIndex === filteredQuestions.length - 1
                  }`}
                >
                  {language === "zh" ? "下一题" : "Next"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default FilteredPractice;
