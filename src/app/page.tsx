'use client';

import { BoltIcon, ClockIcon, ChartBarIcon, CheckIcon } from '@heroicons/react/24/outline';

import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { scrumScales } from '@/lib/scaleTypes';
import { useRoom } from '@/hooks/useRoom';
import Header from '@/components/Header';
import NameModal from '@/components/NameModal';
import DecorativeElements from '@/assets/components/DecorativeElements';
import SpinnerIcon from '@/assets/icons/SpinnerIcon';

export const runtime = 'edge';

export default function Home() {
  const { t } = useLanguage();
  const { theme } = useTheme();

  const {
    roomName,
    setRoomName,
    scaleType,
    setScaleType,
    isCreating,
    showNameModal,
    setShowNameModal,
    isJoining,
    handleCreateRoom,
    handleJoinAsAdmin
  } = useRoom();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <DecorativeElements />

        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Info */}
          <div className="text-left space-y-8">
            <div>
              <h1 className={`text-6xl font-bold mb-6 ${theme === 'dark'
                ? 'bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600'
                } bg-clip-text text-transparent leading-normal`}>
                {t.common.appName}
              </h1>
              <p className={`text-xl ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>
                {t.common.appDescription}
              </p>
            </div>

            <div className={`
                backdrop-blur-lg
                rounded-2xl 
                p-8 
                space-y-6 
                shadow-xl 
                border 
                ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/90 border-purple-100'}
              `}>
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateRoom();
                }}
              >
                <div className="relative">
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                    {t.room.name}
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder={t.room.name}
                    className={`w-full h-12 px-4 rounded-lg border-2 focus:ring focus:ring-opacity-50 placeholder-gray-400 shadow-sm ${theme === 'dark'
                      ? 'bg-slate-700 border-slate-600 focus:border-purple-500 focus:ring-purple-500/20 text-slate-200'
                      : 'bg-white border-purple-100 focus:border-purple-300 focus:ring-purple-200 text-gray-900'
                      }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                    {t.room.pointScale}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(scrumScales).map(([key, scale]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setScaleType(key)}
                        className={`relative h-20 rounded-lg font-medium transition-all overflow-hidden ${scaleType === key
                          ? theme === 'dark'
                            ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900'
                            : 'ring-2 ring-purple-500 ring-offset-2'
                          : theme === 'dark'
                            ? 'hover:bg-slate-700/50'
                            : 'hover:bg-white/50'
                          }`}
                      >
                        <div className={`absolute inset-0 ${scaleType === key
                          ? theme === 'dark'
                            ? 'bg-gradient-to-r from-indigo-900 to-purple-900'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                          : theme === 'dark'
                            ? 'bg-slate-800'
                            : 'bg-white'
                          }`}></div>
                        <div className="relative">
                          <div className={`text-lg font-bold ${scaleType === key
                            ? 'text-white'
                            : theme === 'dark'
                              ? 'text-slate-200'
                              : 'text-gray-900'
                            }`}>
                            {scale.name}
                          </div>
                          <div className={`text-sm ${scaleType === key
                            ? 'text-white/80'
                            : theme === 'dark'
                              ? 'text-slate-400'
                              : 'text-gray-500'
                            }`}>
                            {scale.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className={`w-full h-12 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 ${theme === 'dark'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    }`}
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center">
                      <SpinnerIcon />
                      {t.room.creating}
                    </span>
                  ) : (
                    t.room.create
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Side - Features */}
          <div
            className={`
              backdrop-blur-lg
              rounded-2xl
              p-8
              space-y-6
              shadow-xl 
              border 
              ${theme === 'dark' ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-purple-100'}
            `}>
            <h2 className={`text-2xl font-bold mb-8 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'
              }`}>
              {t.common.quickAndEasy}
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${theme === 'dark'
                  ? 'bg-gradient-to-br from-indigo-600/30 to-purple-600/30'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                  } rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <BoltIcon className={`w-6 h-6 ${theme === 'dark' ? 'text-indigo-300' : 'text-white'}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>
                    {t.common.quickAndEasy}
                  </h3>
                  <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                    {t.common.quickAndEasyDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${theme === 'dark'
                  ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  } rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <ClockIcon className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-300' : 'text-white'}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>
                    {t.common.realTime}
                  </h3>
                  <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                    {t.common.realTimeDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${theme === 'dark'
                  ? 'bg-gradient-to-br from-pink-600/30 to-rose-600/30'
                  : 'bg-gradient-to-br from-pink-500 to-rose-500'
                  } rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <ChartBarIcon className={`w-6 h-6 ${theme === 'dark' ? 'text-pink-300' : 'text-white'}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold mb-1 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>
                    {t.common.detailedAnalysis}
                  </h3>
                  <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                    {t.common.detailedAnalysisDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={`py-20 px-4 ${theme === 'dark'
        ? 'bg-slate-900/50'
        : 'bg-white/50'
        } backdrop-blur-sm`}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-16">
            {t.common.howItWorks}
          </h2>
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform -translate-y-1/2 hidden md:block"></div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              <div className={`backdrop-blur-sm rounded-xl p-8 shadow-xl text-center group hover:scale-105 transition-all duration-300 relative ${theme === 'dark'
                ? 'bg-slate-800/90 border border-slate-700/50'
                : 'bg-white/90 border border-purple-100'
                }`}>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
                    {t.common.createRoom}
                  </h3>
                  <p className={`mb-6 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                    {t.common.createRoomDesc}
                  </p>
                  <ul className={`text-sm space-y-3 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
                    <li className={`flex items-center gap-3 ${theme === 'dark'
                      ? 'bg-slate-700/50'
                      : 'bg-gradient-to-r from-indigo-50 to-purple-50'
                      } p-3 rounded-lg`}>
                      <CheckIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                      <span>{t.common.customizableRoomName}</span>
                    </li>
                    <li className={`flex items-center gap-3 ${theme === 'dark'
                      ? 'bg-slate-700/50'
                      : 'bg-gradient-to-r from-indigo-50 to-purple-50'
                      } p-3 rounded-lg`}>
                      <CheckIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                      <span>{t.common.differentPointScales}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className={`backdrop-blur-sm rounded-xl p-8 shadow-xl text-center group hover:scale-105 transition-all duration-300 relative ${theme === 'dark'
                ? 'bg-slate-800/90 border border-slate-700/50'
                : 'bg-white/90 border border-purple-100'
                }`}>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                    {t.common.invite}
                  </h3>
                  <p className={`mb-6 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                    {t.common.inviteDesc}
                  </p>
                  <ul className={`text-sm space-y-3 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
                    <li className={`flex items-center gap-3 ${theme === 'dark'
                      ? 'bg-slate-700/50'
                      : 'bg-gradient-to-r from-purple-50 to-pink-50'
                      } p-3 rounded-lg`}>
                      <CheckIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                      <span>{t.common.easySharing}</span>
                    </li>
                    <li className={`flex items-center gap-3 ${theme === 'dark'
                      ? 'bg-slate-700/50'
                      : 'bg-gradient-to-r from-purple-50 to-pink-50'
                      } p-3 rounded-lg`}>
                      <CheckIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}`} />
                      <span>{t.common.qrCodeSupport}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className={`backdrop-blur-sm rounded-xl p-8 shadow-xl text-center group hover:scale-105 transition-all duration-300 relative ${theme === 'dark'
                ? 'bg-slate-800/90 border border-slate-700/50'
                : 'bg-white/90 border border-purple-100'
                }`}>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 mb-4">
                    {t.common.vote}
                  </h3>
                  <p className={`mb-6 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                    {t.common.voteDesc}
                  </p>
                  <ul className={`text-sm space-y-3 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
                    <li className={`flex items-center gap-3 ${theme === 'dark'
                      ? 'bg-slate-700/50'
                      : 'bg-gradient-to-r from-pink-50 to-rose-50'
                      } p-3 rounded-lg`}>
                      <CheckIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}`} />
                      <span>{t.common.secretVoting}</span>
                    </li>
                    <li className={`flex items-center gap-3 ${theme === 'dark'
                      ? 'bg-slate-700/50'
                      : 'bg-gradient-to-r from-pink-50 to-rose-50'
                      } p-3 rounded-lg`}>
                      <CheckIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-rose-400' : 'text-rose-600'}`} />
                      <span>{t.common.instantResults}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${theme === 'dark'
        ? 'bg-slate-800/90 border-slate-700'
        : 'bg-white/90 border-purple-100'
        } backdrop-blur-sm border-t`}>
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="text-center max-w-2xl mx-auto">
            <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
              {t.common.footerText}
            </p>
            <div className={`mt-8 pt-8 ${theme === 'dark' ? 'border-slate-700 text-slate-400' : 'border-purple-100 text-gray-600'} border-t`}>
              <p>© {new Date().getFullYear()} {t.common.appName}</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Kullanıcı Adı Modal */}
      <NameModal
        isOpen={showNameModal}
        isLoading={isJoining}
        onClose={() => setShowNameModal(false)}
        onSubmit={(value) => handleJoinAsAdmin(value)}
        submitButtonText={t.room.joinRoom}
        loadingText={t.room.joining}
      />
    </div>
  );
}