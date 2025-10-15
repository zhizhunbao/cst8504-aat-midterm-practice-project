import React from 'react'
import { Settings as SettingsIcon, Globe, Palette, Bell, Volume2, Save, RotateCcw, Download, Upload } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useProgress } from '../contexts/ProgressContext'

const Settings = () => {
  const { t, language, setLanguage } = useLanguage()
  const { resetProgress, exportProgress, importProgress } = useProgress()

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
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
    if (confirm(t('language') === 'zh' 
      ? '确定要重置所有进度吗？此操作无法撤销。'
      : 'Are you sure you want to reset all progress? This action cannot be undone.'
    )) {
      resetProgress()
      alert(t('language') === 'zh' ? '进度已重置！' : 'Progress has been reset!')
    }
  }

  const settingsSections = [
    {
      title: t('settings.language'),
      icon: Globe,
      items: [
        {
          type: 'radio',
          name: 'language',
          options: [
            { value: 'zh', label: '中文' },
            { value: 'en', label: 'English' }
          ],
          currentValue: language,
          onChange: handleLanguageChange
        }
      ]
    },
    {
      title: t('settings.notifications'),
      icon: Bell,
      items: [
        {
          type: 'checkbox',
          name: 'notifications',
          label: t('language') === 'zh' ? '启用通知' : 'Enable Notifications',
          checked: true
        }
      ]
    },
    {
      title: t('settings.sound'),
      icon: Volume2,
      items: [
        {
          type: 'checkbox',
          name: 'sound',
          label: t('language') === 'zh' ? '启用声音' : 'Enable Sound',
          checked: true
        }
      ]
    },
    {
      title: t('settings.autoSave'),
      icon: Save,
      items: [
        {
          type: 'checkbox',
          name: 'autoSave',
          label: t('language') === 'zh' ? '自动保存进度' : 'Auto Save Progress',
          checked: true
        }
      ]
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('settings.title')}
        </h1>
        <p className="text-gray-600">
          {t('language') === 'zh' 
            ? '自定义您的学习体验和应用程序设置'
            : 'Customize your learning experience and application settings'
          }
        </p>
      </div>

      <div className="space-y-6">
        {/* Settings Sections */}
        {settingsSections.map((section, index) => (
          <div key={index} className="card">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-algonquin-100 rounded-lg flex items-center justify-center mr-3">
                <section.icon className="w-5 h-5 text-algonquin-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {section.title}
              </h2>
            </div>
            
            <div className="space-y-4">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between">
                  {item.type === 'radio' ? (
                    <div className="flex space-x-4">
                      {item.options.map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            name={item.name}
                            value={option.value}
                            checked={item.currentValue === option.value}
                            onChange={(e) => item.onChange(e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-700">{item.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name={item.name}
                          checked={item.checked}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-algonquin-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-algonquin-600"></div>
                      </label>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Data Management */}
        <div className="card">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-algonquin-100 rounded-lg flex items-center justify-center mr-3">
              <SettingsIcon className="w-5 h-5 text-algonquin-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('language') === 'zh' ? '数据管理' : 'Data Management'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={exportProgress}
              className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-algonquin-500 hover:bg-algonquin-50 transition-colors"
            >
              <Download className="w-5 h-5 text-algonquin-600 mr-2" />
              <span className="font-medium">{t('settings.exportData')}</span>
            </button>
            
            <label className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-algonquin-500 hover:bg-algonquin-50 transition-colors cursor-pointer">
              <Upload className="w-5 h-5 text-algonquin-600 mr-2" />
              <span className="font-medium">{t('settings.importData')}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleReset}
              className="flex items-center justify-center p-4 border border-red-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors text-red-600"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              <span className="font-medium">{t('settings.resetProgress')}</span>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('language') === 'zh' ? '应用程序信息' : 'Application Information'}
          </h2>
          
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>{t('language') === 'zh' ? '版本' : 'Version'}:</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>{t('language') === 'zh' ? '课程' : 'Course'}:</span>
              <span>CST8504 - Python for Computer Science and Data Science</span>
            </div>
            <div className="flex justify-between">
              <span>{t('language') === 'zh' ? '开发者' : 'Developer'}:</span>
              <span>Algonquin College</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings