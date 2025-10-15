import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  BarChart3,
  Code,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useProgress } from "../contexts/ProgressContext";

const Exam = () => {
  const { t, language } = useLanguage();
  const { progress, addExamResult } = useProgress();
  const navigate = useNavigate();
  const [examState, setExamState] = useState("setup"); // setup, taking, completed
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [codeOutputs, setCodeOutputs] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examConfig, setExamConfig] = useState({
    chapter: "all",
    difficulty: "all",
    numberOfQuestions: 20,
    timeLimit: 30, // minutes
  });
  const [isLoading, setIsLoading] = useState(false);

  // 本地存储键名
  const STORAGE_KEY = "exam_state";

  // 保存考试状态到本地存储
  const saveExamState = () => {
    const examStateData = {
      examState,
      questions,
      currentQuestionIndex,
      answers,
      codeOutputs,
      timeRemaining,
      examConfig,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(examStateData));
  };

  // 从本地存储加载考试状态
  const loadExamState = () => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const examStateData = JSON.parse(savedState);
        // 检查状态是否过期（超过24小时）
        const isExpired =
          Date.now() - examStateData.timestamp > 24 * 60 * 60 * 1000;

        if (!isExpired && examStateData.examState === "taking") {
          setExamState(examStateData.examState);
          setQuestions(examStateData.questions || []);
          setCurrentQuestionIndex(examStateData.currentQuestionIndex || 0);
          setAnswers(examStateData.answers || {});
          setCodeOutputs(examStateData.codeOutputs || {});
          setTimeRemaining(examStateData.timeRemaining || 0);
          setExamConfig(examStateData.examConfig || examConfig);
          return true;
        } else if (isExpired) {
          // 清除过期状态
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Error loading exam state:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
    return false;
  };

  // 清除考试状态
  const clearExamState = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const chapters = [
    { id: "all", name: { zh: "全部章节", en: "All Chapters" } },
    { id: "python-basics", name: { zh: "Python基础", en: "Python Basics" } },
    { id: "numpy", name: { zh: "NumPy", en: "NumPy" } },
    { id: "pandas", name: { zh: "Pandas", en: "Pandas" } },
    { id: "matplotlib", name: { zh: "Matplotlib", en: "Matplotlib" } },
    { id: "ai-intro", name: { zh: "AI入门", en: "AI Introduction" } },
    { id: "midterm-exam", name: { zh: "期中考试", en: "Midterm Exam" } },
  ];

  const difficulties = [
    { id: "all", name: { zh: "全部难度", en: "All Difficulties" } },
    { id: "easy", name: { zh: "简单", en: "Easy" } },
    { id: "medium", name: { zh: "中等", en: "Medium" } },
    { id: "hard", name: { zh: "困难", en: "Hard" } },
  ];

  const questionCounts = [10, 15, 20, 25, 30];
  const timeLimits = [15, 30, 45, 60];

  // 组件挂载时尝试加载保存的考试状态
  useEffect(() => {
    loadExamState();
  }, []);

  // 保存考试状态到本地存储
  useEffect(() => {
    if (examState === "taking") {
      saveExamState();
    }
  }, [
    examState,
    questions,
    currentQuestionIndex,
    answers,
    codeOutputs,
    timeRemaining,
    examConfig,
  ]);

  useEffect(() => {
    if (examState === "taking" && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleExamComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examState, timeRemaining]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const chapterFiles =
        examConfig.chapter === "all"
          ? [
              "python-basics",
              "numpy",
              "pandas",
              "matplotlib",
              "ai-intro",
              "midterm-exam",
            ]
          : [examConfig.chapter];

      const allQuestions = [];
      for (const chapter of chapterFiles) {
        try {
          const response = await fetch(`/data/questions/${chapter}.json`);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Response is not JSON");
          }
          const data = await response.json();
          allQuestions.push(...data.questions);
        } catch (error) {
          console.error(`Error loading questions for ${chapter}:`, error);
        }
      }

      // Filter by difficulty and question type (multiple choice and coding for exams)
      let filteredQuestions = allQuestions.filter(
        (q) => q.type === "multiple-choice" || q.type === "coding"
      );

      if (examConfig.difficulty !== "all") {
        filteredQuestions = filteredQuestions.filter(
          (q) => q.difficulty === examConfig.difficulty
        );
      }

      // Shuffle and select questions
      const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, examConfig.numberOfQuestions);

      setQuestions(selectedQuestions);
      setAnswers({});
      setCodeOutputs({});
      setCurrentQuestionIndex(0);
      setTimeRemaining(examConfig.timeLimit * 60);
      setExamState("taking");
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleCodeOutput = (questionId, output) => {
    setCodeOutputs((prev) => ({
      ...prev,
      [questionId]: output,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleExamComplete = () => {
    const results = questions.map((question) => {
      const userAnswer = answers[question.id];
      let isCorrect = false;
      let correctAnswer = "";

      if (question.type === "multiple-choice") {
        isCorrect = userAnswer === question.correct;
        correctAnswer = question.options[question.correct];
      } else if (question.type === "coding") {
        const userCodeOutput = codeOutputs[question.id] || "";
        isCorrect = userCodeOutput.trim() === question.expected_output.trim();
        correctAnswer = question.expected_output;
      } else {
        // fill-in-blank
        isCorrect =
          userAnswer?.toLowerCase() === question.answer?.toLowerCase();
        correctAnswer = question.answer;
      }

      return {
        questionId: question.id,
        question: question.question,
        userAnswer:
          question.type === "coding"
            ? codeOutputs[question.id] || ""
            : userAnswer,
        correctAnswer,
        isCorrect,
        explanation: question.explanation,
      };
    });

    const correctCount = results.filter((r) => r.isCorrect).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 70;

    const examResult = {
      id: Date.now(),
      chapter: examConfig.chapter,
      difficulty: examConfig.difficulty,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      score,
      passed,
      timeSpent: examConfig.timeLimit * 60 - timeRemaining,
      results,
    };

    addExamResult(examResult);
    clearExamState(); // 清除本地存储的考试状态
    setExamState("completed");
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getTimeClass = () => {
    if (timeRemaining <= 300) return "timer danger"; // 5 minutes
    if (timeRemaining <= 600) return "timer warning"; // 10 minutes
    return "timer";
  };

  if (examState === "setup") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <FileText className="w-16 h-16 text-algonquin-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("exam.title")}
          </h1>
          <p className="text-gray-600">
            {language === "zh"
              ? "配置您的考试设置，然后开始考试"
              : "Configure your exam settings and start the exam"}
          </p>
        </div>

        <div className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("exam.selectChapter")}
            </label>
            <select
              value={examConfig.chapter}
              onChange={(e) =>
                setExamConfig((prev) => ({ ...prev, chapter: e.target.value }))
              }
              className="input-field"
            >
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.name[language]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("exam.selectDifficulty")}
            </label>
            <select
              value={examConfig.difficulty}
              onChange={(e) =>
                setExamConfig((prev) => ({
                  ...prev,
                  difficulty: e.target.value,
                }))
              }
              className="input-field"
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty.id} value={difficulty.id}>
                  {difficulty.name[language]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("exam.numberOfQuestions")}
            </label>
            <select
              value={examConfig.numberOfQuestions}
              onChange={(e) =>
                setExamConfig((prev) => ({
                  ...prev,
                  numberOfQuestions: parseInt(e.target.value),
                }))
              }
              className="input-field"
            >
              {questionCounts.map((count) => (
                <option key={count} value={count}>
                  {count} {language === "zh" ? "题" : "questions"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "zh" ? "时间限制" : "Time Limit"}
            </label>
            <select
              value={examConfig.timeLimit}
              onChange={(e) =>
                setExamConfig((prev) => ({
                  ...prev,
                  timeLimit: parseInt(e.target.value),
                }))
              }
              className="input-field"
            >
              {timeLimits.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} {language === "zh" ? "分钟" : "minutes"}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadQuestions}
            disabled={isLoading}
            className="btn-primary w-full text-lg py-3"
          >
            {isLoading ? t("common.loading") : t("exam.startExam")}
          </button>
        </div>
      </div>
    );
  }

  if (examState === "taking") {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className={getTimeClass()}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {t("exam.currentQuestion")}: {currentQuestionIndex + 1} /{" "}
              {questions.length}
            </div>
          </div>

          <div className="progress-bar w-48">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="question-card">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestion.question[language]}
            </h2>

            {currentQuestion.type === "multiple-choice" ? (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      handleAnswerSelect(currentQuestion.id, index)
                    }
                    className={`option-button ${
                      answers[currentQuestion.id] === index ? "selected" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-3 flex items-center justify-center">
                        {answers[currentQuestion.id] === index && (
                          <div className="w-3 h-3 bg-algonquin-600 rounded-full"></div>
                        )}
                      </div>
                      <span>{option[language]}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : currentQuestion.type === "coding" ? (
              <div className="space-y-4">
                {/* 代码模板提示 */}
                {currentQuestion.code_template && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center">
                        <Code className="w-4 h-4 mr-2" />
                        {language === "zh" ? "代码模板" : "Code Template"}
                      </h4>
                    </div>
                    <pre className="bg-white p-3 rounded border text-sm font-mono text-gray-800 overflow-x-auto">
                      <code>{currentQuestion.code_template[language]}</code>
                    </pre>
                  </div>
                )}

                {/* 代码编辑器 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {language === "zh" ? "您的代码输出:" : "Your Code Output:"}
                  </label>
                  <textarea
                    value={codeOutputs[currentQuestion.id] || ""}
                    onChange={(e) =>
                      handleCodeOutput(currentQuestion.id, e.target.value)
                    }
                    placeholder={
                      language === "zh"
                        ? "请在此输入您的代码运行后的输出结果..."
                        : "Please enter the output of your code here..."
                    }
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-algonquin-500 focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) =>
                    handleAnswerSelect(currentQuestion.id, e.target.value)
                  }
                  placeholder={
                    language === "zh"
                      ? "请输入您的答案..."
                      : "Enter your answer..."
                  }
                  className="input-field"
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("common.previous")}
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button onClick={handleNext} className="btn-primary">
                {t("common.next")}
              </button>
            ) : (
              <button onClick={handleExamComplete} className="btn-primary">
                {t("common.finish")}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (examState === "completed") {
    const lastExam = progress.examHistory[progress.examHistory.length - 1];
    const correctCount = lastExam.correctAnswers;
    const totalQuestions = lastExam.totalQuestions;
    const score = lastExam.score;
    const passed = lastExam.passed;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              passed ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {passed ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("exam.examComplete")}
          </h1>
          <p
            className={`text-xl font-semibold ${
              passed ? "text-green-600" : "text-red-600"
            }`}
          >
            {passed ? t("exam.passed") : t("exam.failed")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <BarChart3 className="w-8 h-8 text-algonquin-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{score}%</div>
            <div className="text-gray-600">{t("exam.finalScore")}</div>
          </div>

          <div className="card text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {correctCount}
            </div>
            <div className="text-gray-600">{t("common.correct")}</div>
          </div>

          <div className="card text-center">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {totalQuestions - correctCount}
            </div>
            <div className="text-gray-600">{t("common.incorrect")}</div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              clearExamState();
              setExamState("setup");
            }}
            className="btn-primary"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t("common.retry")}
          </button>
          <button onClick={() => navigate("/progress")} className="btn-outline">
            {t("exam.reviewAnswers")}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Exam;
