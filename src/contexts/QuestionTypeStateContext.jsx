import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";

const QuestionTypeStateContext = createContext();

export const useQuestionTypeState = () => {
  const context = useContext(QuestionTypeStateContext);
  if (!context) {
    throw new Error(
      "useQuestionTypeState must be used within a QuestionTypeStateProvider"
    );
  }
  return context;
};

export const QuestionTypeStateProvider = ({ children }) => {
  const { user } = useUser();

  // 获取存储键名
  const getStorageKey = (questionType, mode) => {
    return user
      ? `question-state-${questionType}-${mode}-${user.username}`
      : `question-state-${questionType}-${mode}-guest`;
  };

  // 通用状态管理函数
  const saveState = (questionType, mode, state) => {
    try {
      const storageKey = getStorageKey(questionType, mode);
      const stateData = {
        ...state,
        timestamp: Date.now(),
        user: user?.username || "guest",
      };
      localStorage.setItem(storageKey, JSON.stringify(stateData));
    } catch (error) {
      console.error("Error saving state:", error);
    }
  };

  const loadState = (questionType, mode, defaultState = {}) => {
    try {
      const storageKey = getStorageKey(questionType, mode);
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedState = JSON.parse(saved);
        return parsedState;
      }
    } catch (error) {
      console.error("Error loading state:", error);
    }
    return defaultState;
  };

  const clearState = (questionType, mode) => {
    try {
      const storageKey = getStorageKey(questionType, mode);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Error clearing state:", error);
    }
  };

  // 选择题状态管理
  const [multipleChoicePracticeState, setMultipleChoicePracticeState] =
    useState(() => {
      return loadState("multiple-choice", "practice", {
        questions: [],
        currentQuestionIndex: 0,
        selectedAnswers: {}, // { questionId: selectedOption }
        showResult: false,
        isCorrect: false,
        startTime: null,
        selectedChapter: "all",
        selectedDifficulty: "all",
        answers: {},
        hasAnsweredCorrectly: false,
        showReferenceAnswer: false,
        showHint: false,
      });
    });

  const [multipleChoiceExamState, setMultipleChoiceExamState] = useState(() => {
    return loadState("multiple-choice", "exam", {
      examState: "setup",
      questions: [],
      currentQuestionIndex: 0,
      selectedAnswers: {},
      timeRemaining: 0,
      examConfig: {
        chapter: "all",
        difficulty: "all",
        numberOfQuestions: 10,
        timeLimit: 15,
      },
      isLoading: false,
    });
  });

  // 填空题状态管理
  const [fillInBlankPracticeState, setFillInBlankPracticeState] = useState(
    () => {
      return loadState("fill-in-blank", "practice", {
        questions: [],
        currentQuestionIndex: 0,
        userAnswers: {}, // { questionId: userAnswer }
        showResult: false,
        isCorrect: false,
        startTime: null,
        selectedChapter: "all",
        selectedDifficulty: "all",
        answers: {},
        hasAnsweredCorrectly: false,
        showReferenceAnswer: false,
        showHint: false,
      });
    }
  );

  const [fillInBlankExamState, setFillInBlankExamState] = useState(() => {
    return loadState("fill-in-blank", "exam", {
      examState: "setup",
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: {},
      timeRemaining: 0,
      examConfig: {
        chapter: "all",
        difficulty: "all",
        numberOfQuestions: 5,
        timeLimit: 10,
      },
      isLoading: false,
    });
  });

  // 编程题状态管理
  const [codingPracticeState, setCodingPracticeState] = useState(() => {
    return loadState("coding", "practice", {
      questions: [],
      currentQuestionIndex: 0,
      userCode: {}, // { questionId: userCode }
      codeOutputs: {}, // { questionId: output }
      executionErrors: {}, // { questionId: error }
      isExecuting: false,
      showResult: false,
      isCorrect: false,
      startTime: null,
      selectedChapter: "all",
      selectedDifficulty: "all",
      answers: {},
      hasAnsweredCorrectly: false,
      showReferenceAnswer: false,
      showHint: false,
      showPlot: false,
    });
  });

  const [codingExamState, setCodingExamState] = useState(() => {
    return loadState("coding", "exam", {
      examState: "setup",
      questions: [],
      currentQuestionIndex: 0,
      userCode: {},
      codeOutputs: {},
      executionErrors: {},
      isExecuting: false,
      timeRemaining: 0,
      examConfig: {
        chapter: "all",
        difficulty: "all",
        numberOfQuestions: 3,
        timeLimit: 20,
      },
      isLoading: false,
    });
  });

  // 论述题状态管理
  const [essayPracticeState, setEssayPracticeState] = useState(() => {
    return loadState("essay", "practice", {
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: {}, // { questionId: userAnswer }
      showResult: false,
      isCorrect: false,
      startTime: null,
      selectedChapter: "all",
      selectedDifficulty: "all",
      answers: {},
      hasAnsweredCorrectly: false,
      showReferenceAnswer: false,
      showHint: false,
    });
  });

  const [essayExamState, setEssayExamState] = useState(() => {
    return loadState("essay", "exam", {
      examState: "setup",
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: {},
      timeRemaining: 0,
      examConfig: {
        chapter: "all",
        difficulty: "all",
        numberOfQuestions: 2,
        timeLimit: 25,
      },
      isLoading: false,
    });
  });

  // 当用户切换时，重新加载所有状态
  useEffect(() => {
    setMultipleChoicePracticeState(
      loadState("multiple-choice", "practice", multipleChoicePracticeState)
    );
    setMultipleChoiceExamState(
      loadState("multiple-choice", "exam", multipleChoiceExamState)
    );
    setFillInBlankPracticeState(
      loadState("fill-in-blank", "practice", fillInBlankPracticeState)
    );
    setFillInBlankExamState(
      loadState("fill-in-blank", "exam", fillInBlankExamState)
    );
    setCodingPracticeState(
      loadState("coding", "practice", codingPracticeState)
    );
    setCodingExamState(loadState("coding", "exam", codingExamState));
    setEssayPracticeState(loadState("essay", "practice", essayPracticeState));
    setEssayExamState(loadState("essay", "exam", essayExamState));
  }, [user]);

  // 自动保存状态到 localStorage
  useEffect(() => {
    if (multipleChoicePracticeState.questions?.length > 0) {
      saveState("multiple-choice", "practice", multipleChoicePracticeState);
    }
  }, [multipleChoicePracticeState, user]);

  useEffect(() => {
    if (multipleChoiceExamState.questions?.length > 0) {
      saveState("multiple-choice", "exam", multipleChoiceExamState);
    }
  }, [multipleChoiceExamState, user]);

  useEffect(() => {
    if (fillInBlankPracticeState.questions?.length > 0) {
      saveState("fill-in-blank", "practice", fillInBlankPracticeState);
    }
  }, [fillInBlankPracticeState, user]);

  useEffect(() => {
    if (fillInBlankExamState.questions?.length > 0) {
      saveState("fill-in-blank", "exam", fillInBlankExamState);
    }
  }, [fillInBlankExamState, user]);

  useEffect(() => {
    if (codingPracticeState.questions?.length > 0) {
      saveState("coding", "practice", codingPracticeState);
    }
  }, [codingPracticeState, user]);

  useEffect(() => {
    if (codingExamState.questions?.length > 0) {
      saveState("coding", "exam", codingExamState);
    }
  }, [codingExamState, user]);

  useEffect(() => {
    if (essayPracticeState.questions?.length > 0) {
      saveState("essay", "practice", essayPracticeState);
    }
  }, [essayPracticeState, user]);

  useEffect(() => {
    if (essayExamState.questions?.length > 0) {
      saveState("essay", "exam", essayExamState);
    }
  }, [essayExamState, user]);

  // 状态更新函数
  const updateMultipleChoicePracticeState = (updates) => {
    setMultipleChoicePracticeState((prev) => ({ ...prev, ...updates }));
  };

  const updateMultipleChoiceExamState = (updates) => {
    setMultipleChoiceExamState((prev) => ({ ...prev, ...updates }));
  };

  const updateFillInBlankPracticeState = (updates) => {
    setFillInBlankPracticeState((prev) => ({ ...prev, ...updates }));
  };

  const updateFillInBlankExamState = (updates) => {
    setFillInBlankExamState((prev) => ({ ...prev, ...updates }));
  };

  const updateCodingPracticeState = (updates) => {
    setCodingPracticeState((prev) => ({ ...prev, ...updates }));
  };

  const updateCodingExamState = (updates) => {
    setCodingExamState((prev) => ({ ...prev, ...updates }));
  };

  const updateEssayPracticeState = (updates) => {
    setEssayPracticeState((prev) => ({ ...prev, ...updates }));
  };

  const updateEssayExamState = (updates) => {
    setEssayExamState((prev) => ({ ...prev, ...updates }));
  };

  // 重置函数
  const resetMultipleChoicePracticeState = () => {
    const defaultState = {
      questions: [],
      currentQuestionIndex: 0,
      selectedAnswers: {},
      showResult: false,
      isCorrect: false,
      startTime: null,
      selectedChapter: "all",
      selectedDifficulty: "all",
      answers: {},
      hasAnsweredCorrectly: false,
      showReferenceAnswer: false,
      showHint: false,
    };
    setMultipleChoicePracticeState(defaultState);
    clearState("multiple-choice", "practice");
  };

  const resetMultipleChoiceExamState = () => {
    const defaultState = {
      examState: "setup",
      questions: [],
      currentQuestionIndex: 0,
      selectedAnswers: {},
      timeRemaining: 0,
      examConfig: {
        chapter: "all",
        difficulty: "all",
        numberOfQuestions: 10,
        timeLimit: 15,
      },
      isLoading: false,
    };
    setMultipleChoiceExamState(defaultState);
    clearState("multiple-choice", "exam");
  };

  const resetFillInBlankPracticeState = () => {
    const defaultState = {
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: {},
      showResult: false,
      isCorrect: false,
      startTime: null,
      selectedChapter: "all",
      selectedDifficulty: "all",
      answers: {},
      hasAnsweredCorrectly: false,
      showReferenceAnswer: false,
      showHint: false,
    };
    setFillInBlankPracticeState(defaultState);
    clearState("fill-in-blank", "practice");
  };

  const resetFillInBlankExamState = () => {
    const defaultState = {
      examState: "setup",
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: {},
      timeRemaining: 0,
      examConfig: {
        chapter: "all",
        difficulty: "all",
        numberOfQuestions: 5,
        timeLimit: 10,
      },
      isLoading: false,
    };
    setFillInBlankExamState(defaultState);
    clearState("fill-in-blank", "exam");
  };

  const resetCodingPracticeState = () => {
    const defaultState = {
      questions: [],
      currentQuestionIndex: 0,
      userCode: {},
      codeOutputs: {},
      executionErrors: {},
      isExecuting: false,
      showResult: false,
      isCorrect: false,
      startTime: null,
      selectedChapter: "all",
      selectedDifficulty: "all",
      answers: {},
      hasAnsweredCorrectly: false,
      showReferenceAnswer: false,
      showHint: false,
      showPlot: false,
    };
    setCodingPracticeState(defaultState);
    clearState("coding", "practice");
  };

  const resetCodingExamState = () => {
    const defaultState = {
      examState: "setup",
      questions: [],
      currentQuestionIndex: 0,
      userCode: {},
      codeOutputs: {},
      executionErrors: {},
      isExecuting: false,
      timeRemaining: 0,
      examConfig: {
        chapter: "all",
        difficulty: "all",
        numberOfQuestions: 3,
        timeLimit: 20,
      },
      isLoading: false,
    };
    setCodingExamState(defaultState);
    clearState("coding", "exam");
  };

  const resetEssayPracticeState = () => {
    const defaultState = {
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: {},
      showResult: false,
      isCorrect: false,
      startTime: null,
      selectedChapter: "all",
      selectedDifficulty: "all",
      answers: {},
      hasAnsweredCorrectly: false,
      showReferenceAnswer: false,
      showHint: false,
    };
    setEssayPracticeState(defaultState);
    clearState("essay", "practice");
  };

  const resetEssayExamState = () => {
    const defaultState = {
      examState: "setup",
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: {},
      timeRemaining: 0,
      examConfig: {
        chapter: "all",
        difficulty: "all",
        numberOfQuestions: 2,
        timeLimit: 25,
      },
      isLoading: false,
    };
    setEssayExamState(defaultState);
    clearState("essay", "exam");
  };

  // 清除所有状态
  const clearAllStates = () => {
    clearState("multiple-choice", "practice");
    clearState("multiple-choice", "exam");
    clearState("fill-in-blank", "practice");
    clearState("fill-in-blank", "exam");
    clearState("coding", "practice");
    clearState("coding", "exam");
    clearState("essay", "practice");
    clearState("essay", "exam");

    resetMultipleChoicePracticeState();
    resetMultipleChoiceExamState();
    resetFillInBlankPracticeState();
    resetFillInBlankExamState();
    resetCodingPracticeState();
    resetCodingExamState();
    resetEssayPracticeState();
    resetEssayExamState();
  };

  const value = {
    // 状态
    multipleChoicePracticeState,
    multipleChoiceExamState,
    fillInBlankPracticeState,
    fillInBlankExamState,
    codingPracticeState,
    codingExamState,
    essayPracticeState,
    essayExamState,

    // 更新函数
    updateMultipleChoicePracticeState,
    updateMultipleChoiceExamState,
    updateFillInBlankPracticeState,
    updateFillInBlankExamState,
    updateCodingPracticeState,
    updateCodingExamState,
    updateEssayPracticeState,
    updateEssayExamState,

    // 重置函数
    resetMultipleChoicePracticeState,
    resetMultipleChoiceExamState,
    resetFillInBlankPracticeState,
    resetFillInBlankExamState,
    resetCodingPracticeState,
    resetCodingExamState,
    resetEssayPracticeState,
    resetEssayExamState,
    clearAllStates,

    // 工具函数
    saveState,
    loadState,
    clearState,
  };

  return (
    <QuestionTypeStateContext.Provider value={value}>
      {children}
    </QuestionTypeStateContext.Provider>
  );
};
