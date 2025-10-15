import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";

const ProgressContext = createContext();

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
};

export const ProgressProvider = ({ children }) => {
  const { user } = useUser();

  const getStorageKey = () => {
    return user
      ? `learning-progress-${user.username}`
      : "learning-progress-guest";
  };

  const [progress, setProgress] = useState(() => {
    const storageKey = getStorageKey();
    const saved = localStorage.getItem(storageKey);
    return saved
      ? JSON.parse(saved)
      : {
          chapters: {},
          practiceStats: {
            totalQuestions: 0,
            correctAnswers: 0,
            totalTime: 0,
            streak: 0,
          },
          examHistory: [],
        };
  });

  // 当用户切换时，加载对应的进度数据
  useEffect(() => {
    const storageKey = getStorageKey();
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setProgress(JSON.parse(saved));
    } else {
      // 新用户，重置进度
      setProgress({
        chapters: {},
        practiceStats: {
          totalQuestions: 0,
          correctAnswers: 0,
          totalTime: 0,
          streak: 0,
        },
        examHistory: [],
      });
    }
  }, [user]);

  useEffect(() => {
    const storageKey = getStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress, user]);

  const updateChapterProgress = (chapterId, topicId, completed) => {
    setProgress((prev) => ({
      ...prev,
      chapters: {
        ...prev.chapters,
        [chapterId]: {
          ...prev.chapters[chapterId],
          [topicId]: {
            ...prev.chapters[chapterId]?.[topicId],
            completed,
            completedAt: completed ? new Date().toISOString() : null,
          },
        },
      },
    }));
  };

  const updatePracticeStats = (correct, timeSpent) => {
    setProgress((prev) => ({
      ...prev,
      practiceStats: {
        ...prev.practiceStats,
        totalQuestions: prev.practiceStats.totalQuestions + 1,
        correctAnswers: prev.practiceStats.correctAnswers + (correct ? 1 : 0),
        totalTime: prev.practiceStats.totalTime + timeSpent,
      },
    }));
  };

  const addExamResult = (examData) => {
    setProgress((prev) => ({
      ...prev,
      examHistory: [
        ...prev.examHistory,
        {
          ...examData,
          completedAt: new Date().toISOString(),
        },
      ],
    }));
  };

  const resetAllProgress = () => {
    setProgress({
      chapters: {},
      practiceStats: {
        totalQuestions: 0,
        correctAnswers: 0,
        totalTime: 0,
        streak: 0,
      },
      examHistory: [],
    });
  };

  const exportProgress = () => {
    const dataStr = JSON.stringify(progress, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "learning-progress.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importProgress = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setProgress(imported);
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
    progress,
    updateChapterProgress,
    updatePracticeStats,
    addExamResult,
    resetAllProgress,
    exportProgress,
    importProgress,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};
