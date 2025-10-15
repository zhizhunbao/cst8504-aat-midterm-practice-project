import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Lessons from "./pages/Lessons";
import LessonDetail from "./pages/LessonDetail";
import Practice from "./pages/Practice";
import FilteredPractice from "./pages/FilteredPractice";
import Exam from "./pages/Exam";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import AuthGuard from "./components/AuthGuard";
import { LanguageProvider } from "./contexts/LanguageContext";
import { UserProvider } from "./contexts/UserContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import { AppStateProvider } from "./contexts/AppStateContext";
import { QuestionTypeStateProvider } from "./contexts/QuestionTypeStateContext";

function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <ProgressProvider>
          <AppStateProvider>
            <QuestionTypeStateProvider>
              <Router
                basename={
                  import.meta.env.DEV
                    ? "/"
                    : "/cst8504-aat-midterm-practice-project"
                }
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <div className="min-h-screen bg-gray-50">
                  <Header />
                  <main className="container mx-auto px-4 py-8">
                    <AuthGuard>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/lessons" element={<Lessons />} />
                        <Route path="/lesson" element={<LessonDetail />} />
                        <Route
                          path="/practice"
                          element={<FilteredPractice />}
                        />
                        <Route path="/simple-practice" element={<Practice />} />
                        <Route path="/exam" element={<Exam />} />
                        <Route path="/progress" element={<Progress />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/profile" element={<UserProfile />} />
                      </Routes>
                    </AuthGuard>
                  </main>
                </div>
              </Router>
            </QuestionTypeStateProvider>
          </AppStateProvider>
        </ProgressProvider>
      </UserProvider>
    </LanguageProvider>
  );
}

export default App;
