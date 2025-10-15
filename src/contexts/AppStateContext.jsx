import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";

const AppStateContext = createContext();

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};

export const AppStateProvider = ({ children }) => {
  const { user } = useUser();

  // 获取存储键名
  const getStorageKey = (page) => {
    return user
      ? `app-state-${page}-${user.username}`
      : `app-state-${page}-guest`;
  };

  // 通用状态管理函数
  const savePageState = (page, state) => {
    try {
      const storageKey = getStorageKey(page);
      const stateData = {
        ...state,
        timestamp: Date.now(),
        user: user?.username || "guest",
      };
      localStorage.setItem(storageKey, JSON.stringify(stateData));
    } catch (error) {
      // Error saving state
    }
  };

  const loadPageState = (page, defaultState = {}) => {
    try {
      const storageKey = getStorageKey(page);
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedState = JSON.parse(saved);
        return parsedState;
      }
    } catch (error) {
      // Error loading state
    }
    return defaultState;
  };

  const clearPageState = (page) => {
    try {
      const storageKey = getStorageKey(page);
      localStorage.removeItem(storageKey);
    } catch (error) {
      // Error clearing state
    }
  };

  // Practice 页面状态管理
  const [practiceState, setPracticeState] = useState(() => {
    return loadPageState("practice", {
      questions: [],
      currentQuestionIndex: 0,
      selectedAnswer: null,
      userAnswer: "",
      showResult: false,
      isCorrect: false,
      startTime: null,
      selectedChapter: "all",
      selectedDifficulty: "all",
      selectedQuestionType: "all",
      availableQuestionTypes: [],
      answers: {},
      codeOutputs: {},
      hasAnsweredCorrectly: false,
      showReferenceAnswer: false,
      showHint: false,
      showPlot: false,
    });
  });

  // Exam 页面状态管理
  const [examState, setExamState] = useState(() => {
    return loadPageState("exam", {
      examState: "setup", // setup, taking, completed
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      codeOutputs: {},
      timeRemaining: 0,
      examConfig: {
        chapter: "all",
        difficulty: "all",
        numberOfQuestions: 20,
        timeLimit: 30,
      },
      isLoading: false,
    });
  });

  // Lessons 页面状态管理
  const [lessonsState, setLessonsState] = useState(() => {
    return loadPageState("lessons", {
      selectedChapter: null,
      completedTopics: [],
      currentTopic: null,
      lessonProgress: {},
    });
  });

  // Progress 页面状态管理
  const [progressState, setProgressState] = useState(() => {
    return loadPageState("progress", {
      selectedTimeRange: "all",
      selectedChapter: "all",
      selectedDifficulty: "all",
      viewMode: "overview", // overview, detailed, charts
    });
  });

  // Settings 页面状态管理
  const [settingsState, setSettingsState] = useState(() => {
    return loadPageState("settings", {
      theme: "light",
      fontSize: "medium",
      autoSave: true,
      notifications: true,
      soundEffects: true,
    });
  });

  // UserProfile 页面状态管理
  const [userProfileState, setUserProfileState] = useState(() => {
    return loadPageState("userProfile", {
      editingProfile: false,
      selectedTab: "profile", // profile, achievements, statistics
      showChangePassword: false,
    });
  });

  // 当用户切换时，重新加载所有页面状态
  useEffect(() => {
    setPracticeState(loadPageState("practice", practiceState));
    setExamState(loadPageState("exam", examState));
    setLessonsState(loadPageState("lessons", lessonsState));
    setProgressState(loadPageState("progress", progressState));
    setSettingsState(loadPageState("settings", settingsState));
    setUserProfileState(loadPageState("userProfile", userProfileState));
  }, [user]);

  // 自动保存状态到 localStorage
  useEffect(() => {
    if (practiceState.questions?.length > 0) {
      savePageState("practice", practiceState);
    }
  }, [practiceState, user]);

  useEffect(() => {
    if (examState.questions?.length > 0) {
      savePageState("exam", examState);
    }
  }, [examState, user]);

  useEffect(() => {
    savePageState("lessons", lessonsState);
  }, [lessonsState, user]);

  useEffect(() => {
    savePageState("progress", progressState);
  }, [progressState, user]);

  useEffect(() => {
    savePageState("settings", settingsState);
  }, [settingsState, user]);

  useEffect(() => {
    savePageState("userProfile", userProfileState);
  }, [userProfileState, user]);

  // Practice 页面状态更新函数
  const updatePracticeState = (updates) => {
    setPracticeState((prev) => ({ ...prev, ...updates }));
  };

  const resetPracticeState = () => {
    const defaultState = {
      questions: [],
      currentQuestionIndex: 0,
      selectedAnswer: null,
      userAnswer: "",
      showResult: false,
      isCorrect: false,
      startTime: null,
      selectedChapter: "all",
      selectedDifficulty: "all",
      selectedQuestionType: "all",
      availableQuestionTypes: [],
      answers: {},
      codeOutputs: {},
      hasAnsweredCorrectly: false,
      showReferenceAnswer: false,
      showHint: false,
      showPlot: false,
    };
    setPracticeState(defaultState);
    clearPageState("practice");
  };

  // Exam 页面状态更新函数
  const updateExamState = (updates) => {
    setExamState((prev) => ({ ...prev, ...updates }));
  };

  const resetExamState = () => {
    const defaultState = {
      examState: "setup",
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      codeOutputs: {},
      timeRemaining: 0,
      examConfig: {
        chapter: "all",
        difficulty: "all",
        numberOfQuestions: 20,
        timeLimit: 30,
      },
      isLoading: false,
    };
    setExamState(defaultState);
    clearPageState("exam");
  };

  // Lessons 页面状态更新函数
  const updateLessonsState = (updates) => {
    setLessonsState((prev) => ({ ...prev, ...updates }));
  };

  // Progress 页面状态更新函数
  const updateProgressState = (updates) => {
    setProgressState((prev) => ({ ...prev, ...updates }));
  };

  // Settings 页面状态更新函数
  const updateSettingsState = (updates) => {
    setSettingsState((prev) => ({ ...prev, ...updates }));
  };

  // UserProfile 页面状态更新函数
  const updateUserProfileState = (updates) => {
    setUserProfileState((prev) => ({ ...prev, ...updates }));
  };

  // 清除所有页面状态
  const clearAllStates = () => {
    clearPageState("practice");
    clearPageState("exam");
    clearPageState("lessons");
    clearPageState("progress");
    clearPageState("settings");
    clearPageState("userProfile");

    // 重置所有状态
    resetPracticeState();
    resetExamState();
    setLessonsState({
      selectedChapter: null,
      completedTopics: [],
      currentTopic: null,
      lessonProgress: {},
    });
    setProgressState({
      selectedTimeRange: "all",
      selectedChapter: "all",
      selectedDifficulty: "all",
      viewMode: "overview",
    });
    setSettingsState({
      theme: "light",
      fontSize: "medium",
      autoSave: true,
      notifications: true,
      soundEffects: true,
    });
    setUserProfileState({
      editingProfile: false,
      selectedTab: "profile",
      showChangePassword: false,
    });
  };

  // 导出所有状态
  const exportAllStates = () => {
    const allStates = {
      practice: practiceState,
      exam: examState,
      lessons: lessonsState,
      progress: progressState,
      settings: settingsState,
      userProfile: userProfileState,
      exportDate: new Date().toISOString(),
      user: user?.username || "guest",
    };

    const dataStr = JSON.stringify(allStates, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "app-states-backup.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  // 导入状态
  const importStates = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);

          if (imported.practice) setPracticeState(imported.practice);
          if (imported.exam) setExamState(imported.exam);
          if (imported.lessons) setLessonsState(imported.lessons);
          if (imported.progress) setProgressState(imported.progress);
          if (imported.settings) setSettingsState(imported.settings);
          if (imported.userProfile) setUserProfileState(imported.userProfile);

          resolve(imported);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const value = {
    // 状态
    practiceState,
    examState,
    lessonsState,
    progressState,
    settingsState,
    userProfileState,

    // 更新函数
    updatePracticeState,
    updateExamState,
    updateLessonsState,
    updateProgressState,
    updateSettingsState,
    updateUserProfileState,

    // 重置函数
    resetPracticeState,
    resetExamState,
    clearAllStates,

    // 工具函数
    savePageState,
    loadPageState,
    clearPageState,
    exportAllStates,
    importStates,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};
