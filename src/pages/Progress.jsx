import React, { useState, useEffect } from 'react'
import { BarChart3, Clock, CheckCircle, XCircle, TrendingUp, Download, Upload, RotateCcw } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useProgress } from '../contexts/ProgressContext'

const Progress = () => {
  const { t } = useLanguage()
  const { progress, resetProgress, exportProgress, importProgress } = useProgress()
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const overallStats = {
    totalQuestions: progress.practiceStats.totalQuestions,
    correctAnswers: progress.practiceStats.correctAnswers,
    accuracy: progress.practiceStats.totalQuestions > 0 
      ? Math.round((progress.practiceStats.correctAnswers / progress.practiceStats.totalQuestions) * 100)
      : 0,
    totalTime: progress.practiceStats.totalTime,
    streak: progress.practiceStats.streak,
    examsTaken: progress.examHistory.length,
    examsPassed: progress.examHistory.filter(exam => exam.passed).length
  }

  const handleImport = (event) => {
    const file = event.target.files[0]
    if (file) {
      importProgress(file)
        .then(() => {
          alert(t('language') === 'zh' ? '数据导入成功！' : 'Data imported successfully!')
        })
        .catch(() => {
          alert(t('language') === 'zh' ? '数据导入失败！' : 'Data import failed!')
        })
    }
  }

  const handleReset = () => {
    resetProgress()
    setShowResetConfirm(false)
    alert(t('language') === 'zh' ? '进度已重置！' : 'Progress has been reset!')
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const getChapterName = (chapterId) => {
    const names = {
      'python-basics': { zh: 'Python基础', en: 'Python Basics' },
      'numpy': { zh: 'NumPy', en: 'NumPy' },
      'pandas': { zh: 'Pandas', en: 'Pandas' },
      'ai-intro': { zh: 'AI入门', en: 'AI Introduction' },
      'all': { zh: '全部章节', en: 'All Chapters' }
    }
    return names[chapterId]?.[t('language')] || chapterId
  }

  const getDifficultyName = (difficulty) => {
    const names = {
      'easy': { zh: '简单', en: 'Easy' },
      'medium': { zh: '中等', en: 'Medium' },
      'hard': { zh: '困难', en: 'Hard' },
      'all': { zh: '全部难度', en: 'All Difficulties' }
    }
    return names[difficulty]?.[t('language')] || difficulty
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('progress.title')}
        </h1>
        <p className="text-gray-600">
          {t('language') === 'zh' 
            ? '查看您的学习进度和统计数据'
            : 'View your learning progress and statistics'
          }
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <BarChart3 className="w-8 h-8 text-algonquin-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{overallStats.accuracy}%</div>
          <div className="text-gray-600">{t('progress.accuracy')}</div>
        </div>
        
        <div className="card text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{overallStats.totalQuestions}</div>
          <div className="text-gray-600">{t('progress.questionsAnswered')}</div>
        </div>
        
        <div className="card text-center">
          <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{formatTime(overallStats.totalTime)}</div>
          <div className="text-gray-600">{t('progress.totalTime')}</div>
        </div>
        
        <div className="card text-center">
          <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{overallStats.streak}</div>
          <div className="text-gray-600">{t('progress.streak')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chapter Progress */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {t('progress.chapterProgress')}
          </h2>
          
          <div className="space-y-4">
            {Object.entries(progress.chapters).map(([chapterId, chapterData]) => {
              const totalTopics = Object.keys(chapterData).length
              const completedTopics = Object.values(chapterData).filter(topic => topic.completed).length
              const progressPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
              
              return (
                <div key={chapterId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">
                      {getChapterName(chapterId)}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {completedTopics}/{totalTopics}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {progressPercentage}% {t('lessons.completed')}
                  </div>
                </div>
              )
            })}
            
            {Object.keys(progress.chapters).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t('language') === 'zh' ? '暂无章节进度数据' : 'No chapter progress data'}
              </div>
            )}
          </div>
        </div>

        {/* Exam History */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {t('progress.examHistory')}
          </h2>
          
          <div className="space-y-4">
            {progress.examHistory.slice(-5).reverse().map((exam) => (
              <div key={exam.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {exam.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className="font-medium text-gray-900">
                      {getChapterName(exam.chapter)} - {getDifficultyName(exam.difficulty)}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    exam.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {exam.passed ? t('exam.passed') : t('exam.failed')}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">{t('exam.finalScore')}</div>
                    <div className="font-semibold">{exam.score}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">{t('common.correct')}</div>
                    <div className="font-semibold">{exam.correctAnswers}/{exam.totalQuestions}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">{t('common.time')}</div>
                    <div className="font-semibold">{formatTime(exam.timeSpent)}</div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(exam.completedAt).toLocaleString()}
                </div>
              </div>
            ))}
            
            {progress.examHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t('language') === 'zh' ? '暂无考试记录' : 'No exam history'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t('settings.title')}
        </h2>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={exportProgress}
            className="btn-outline"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('settings.exportData')}
          </button>
          
          <label className="btn-outline cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            {t('settings.importData')}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          
          <button
            onClick={() => setShowResetConfirm(true)}
            className="btn-secondary"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('settings.resetProgress')}
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('language') === 'zh' ? '确认重置进度' : 'Confirm Reset Progress'}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('language') === 'zh' 
                ? '此操作将删除所有学习进度和统计数据，无法撤销。您确定要继续吗？'
                : 'This action will delete all learning progress and statistics and cannot be undone. Are you sure you want to continue?'
              }
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="btn-secondary"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleReset}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Progress