/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Users,
  History,
  BarChart3,
  Settings,
  Wifi,
  Battery,
  AlertTriangle,
  X,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { useDomino } from '../context/DominoContext';
import { toPersianDigits } from '../utils/persianDate';
import { DominoTile } from './DominoTile';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const {
    activeTab,
    setActiveTab,
    activeGame,
    bannerAlert,
    clearBannerAlert,
    settings,
  } = useDomino();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(toPersianDigits(`${hours}:${mins}`));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Theme-specific styles
  const getThemeClasses = () => {
    switch (settings.theme) {
      case 'emerald-table':
        return {
          bg: 'bg-emerald-950',
          frameBg: 'bg-[#051c14] border-emerald-900/60',
          navBg: 'bg-[#041610]/95 border-emerald-800/40 text-emerald-100',
          activeTab: 'text-amber-400 bg-emerald-900/40',
          inactiveTab: 'text-emerald-400/70 hover:text-emerald-200',
          headerBg: 'bg-[#051c14]/95 border-emerald-800/40',
          accent: 'text-amber-400',
        };
      case 'royal-gold':
        return {
          bg: 'bg-slate-950',
          frameBg: 'bg-[#0a1128] border-indigo-900/50',
          navBg: 'bg-[#070d1f]/95 border-indigo-800/30 text-indigo-100',
          activeTab: 'text-amber-400 bg-indigo-950/60',
          inactiveTab: 'text-indigo-300/70 hover:text-indigo-100',
          headerBg: 'bg-[#0a1128]/95 border-indigo-800/30',
          accent: 'text-amber-400',
        };
      case 'clean-light':
        return {
          bg: 'bg-slate-100',
          frameBg: 'bg-white border-slate-200 text-slate-800',
          navBg: 'bg-white/95 border-slate-200 text-slate-700',
          activeTab: 'text-amber-600 bg-amber-50',
          inactiveTab: 'text-slate-500 hover:text-slate-800',
          headerBg: 'bg-white/95 border-slate-200',
          accent: 'text-amber-600',
        };
      case 'domino-dark':
      default:
        return {
          bg: 'bg-black',
          frameBg: 'bg-[#090d16] border-slate-800/80',
          navBg: 'bg-[#070a12]/95 border-slate-800/80 text-slate-200',
          activeTab: 'text-amber-400 bg-amber-500/10',
          inactiveTab: 'text-slate-400 hover:text-slate-200',
          headerBg: 'bg-[#090d16]/95 border-slate-800/80',
          accent: 'text-amber-400',
        };
    }
  };

  const themeStyle = getThemeClasses();

  return (
    <div className={`min-h-screen ${themeStyle.bg} flex justify-center items-center md:p-3 transition-colors duration-300`}>
      {/* Ambient background glow for desktop showcase */}
      <div className="fixed inset-0 pointer-events-none opacity-20 hidden md:block">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl" />
      </div>

      {/* Android Device Shell Container */}
      <main
        className={`w-full max-w-md h-screen md:h-[920px] md:max-h-[96vh] ${themeStyle.frameBg} md:rounded-[40px] md:border-2 md:shadow-2xl md:shadow-black/70 flex flex-col overflow-hidden relative`}
      >
        {/* Android Status Bar */}
        <div className="h-7 px-5 flex items-center justify-between text-xs text-slate-400/80 shrink-0 select-none pt-1">
          <div className="font-medium tracking-wider">{currentTime || '۱۲:۰۰'}</div>
          {/* Simulated top camera notch / speaker pill */}
          <div className="w-16 h-4 bg-black/60 rounded-full hidden md:flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800/60" />
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">%۹۵</span>
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Mobile Top App Bar */}
        <header
          className={`h-14 px-4 flex items-center justify-between border-b ${themeStyle.headerBg} backdrop-blur-md shrink-0 z-20`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <DominoTile top={6} bottom={6} size="sm" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <span>دومینو اسکور</span>
                <span className="text-[10px] text-amber-400 font-normal px-1 py-0.5 bg-amber-500/10 rounded">
                  حرفه‌ای
                </span>
              </h1>
              <div className="text-[10px] text-slate-400">
                {activeTab === 'game' && (activeGame?.status === 'active' ? 'صفحه امتیازدهی زنده' : 'شروع بازی جدید')}
                {activeTab === 'players' && 'مدیریت و کارنامه بازیکنان'}
                {activeTab === 'history' && 'سوابق و دست‌های بازی‌ها'}
                {activeTab === 'stats' && 'رتبه‌بندی و رکوردهای برتر'}
                {activeTab === 'settings' && 'تنظیمات و پشتیبان‌گیری'}
              </div>
            </div>
          </div>

          {/* Quick Active Game Shortcut if user navigated to other tabs */}
          {activeGame && activeGame.status === 'active' && activeTab !== 'game' ? (
            <button
              onClick={() => setActiveTab('game')}
              className="flex items-center gap-1.5 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg px-2.5 py-1.5 animate-pulse"
            >
              <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>بازی فعال:</span>
              <span className="font-bold tabular-nums">
                {toPersianDigits(activeGame.team1.score)} - {toPersianDigits(activeGame.team2.score)}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          )}
        </header>

        {/* Global Toast / Banner for Barbook or Switch alert */}
        {bannerAlert && (
          <aside
            aria-label="اعلان بازی"
            className={`mx-3 mt-2 px-3.5 py-2.5 rounded-xl border flex items-start justify-between gap-3 shadow-lg z-30 transition-all ${
              bannerAlert.type === 'barbook'
                ? 'bg-rose-950/90 border-rose-500/60 text-rose-100'
                : bannerAlert.type === 'hybrid-switch'
                ? 'bg-amber-950/90 border-amber-500/60 text-amber-100'
                : 'bg-emerald-950/90 border-emerald-500/60 text-emerald-100'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  bannerAlert.type === 'barbook'
                    ? 'text-rose-400'
                    : bannerAlert.type === 'hybrid-switch'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              />
              <div>
                <div className="text-xs font-bold">{bannerAlert.title}</div>
                <div className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                  {bannerAlert.subtitle}
                </div>
              </div>
            </div>
            <button
              onClick={clearBannerAlert}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300 shrink-0"
              aria-label="بستن"
            >
              <X className="w-4 h-4" />
            </button>
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col pb-20">
          {children}
        </div>

        {/* Android Bottom Navigation Bar */}
        <nav
          className={`absolute bottom-0 left-0 right-0 h-16 border-t ${themeStyle.navBg} backdrop-blur-lg flex items-center justify-around px-2 z-30`}
        >
          <button
            onClick={() => setActiveTab('game')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all relative ${
              activeTab === 'game' ? themeStyle.activeTab : themeStyle.inactiveTab
            }`}
          >
            <div className="relative">
              <Trophy className="w-5 h-5" />
              {activeGame && activeGame.status === 'active' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
              )}
            </div>
            <span className="text-[11px] font-medium mt-1">بازی</span>
          </button>

          <button
            onClick={() => setActiveTab('players')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
              activeTab === 'players' ? themeStyle.activeTab : themeStyle.inactiveTab
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[11px] font-medium mt-1">بازیکنان</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
              activeTab === 'history' ? themeStyle.activeTab : themeStyle.inactiveTab
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[11px] font-medium mt-1">تاریخچه</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
              activeTab === 'stats' ? themeStyle.activeTab : themeStyle.inactiveTab
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[11px] font-medium mt-1">آمار</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all ${
              activeTab === 'settings' ? themeStyle.activeTab : themeStyle.inactiveTab
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[11px] font-medium mt-1">تنظیمات</span>
          </button>
        </nav>
      </main>
    </div>
  );
};
