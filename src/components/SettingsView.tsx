/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Palette,
  Volume2,
  VolumeX,
  Smartphone,
  Download,
  Upload,
  RotateCcw,
  BookOpen,
  Check,
  AlertTriangle,
  Flame,
  Info,
} from 'lucide-react';
import { useDomino } from '../context/DominoContext';
import { ThemeType } from '../types/domino';
import { toPersianDigits } from '../utils/persianDate';
import { soundManager } from '../utils/soundEffects';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportDataJSON,
    importDataJSON,
    clearAllData,
  } = useDomino();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importSuccess, setImportSuccess] = useState<boolean | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const handleThemeChange = (theme: ThemeType) => {
    soundManager.playTap();
    updateSettings({ theme });
  };

  const handleDownloadBackup = () => {
    soundManager.playTap();
    const dataStr = exportDataJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `domino_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        setImportSuccess(success);
        setTimeout(() => setImportSuccess(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-3.5 p-3.5">
      {/* Theme Selection */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Palette className="w-4 h-4 text-amber-400" />
          <span>انتخاب ظاهر و تم برنامه</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Domino Dark */}
          <button
            onClick={() => handleThemeChange('domino-dark')}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-right ${
              settings.theme === 'domino-dark'
                ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-black border border-amber-500/40 flex items-center justify-center shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div>
              <span className="text-xs font-bold block">مشکی دومینو</span>
              <span className="text-[9px] text-slate-500">کلاسیک لوکس</span>
            </div>
          </button>

          {/* Emerald Table */}
          <button
            onClick={() => handleThemeChange('emerald-table')}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-right ${
              settings.theme === 'emerald-table'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-500/50 flex items-center justify-center shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-bold block">سبز مخملی</span>
              <span className="text-[9px] text-slate-500">میز بازی دومینو</span>
            </div>
          </button>

          {/* Royal Navy */}
          <button
            onClick={() => handleThemeChange('royal-gold')}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-right ${
              settings.theme === 'royal-gold'
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-slate-900 border border-indigo-500/50 flex items-center justify-center shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div>
              <span className="text-xs font-bold block">سرمه‌ای سلطنتی</span>
              <span className="text-[9px] text-slate-500">آبی و طلایی</span>
            </div>
          </button>

          {/* Clean Light */}
          <button
            onClick={() => handleThemeChange('clean-light')}
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-right ${
              settings.theme === 'clean-light'
                ? 'bg-amber-600/15 border-amber-600 text-amber-700'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
            </div>
            <div>
              <span className="text-xs font-bold block">تم روشن</span>
              <span className="text-[9px] text-slate-500">شفاف روزانه</span>
            </div>
          </button>
        </div>
      </div>

      {/* Sound & Haptics */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span>صدا و بازخورد لمسی (Haptic)</span>
        </div>

        <div className="flex flex-col gap-2">
          {/* Sound toggle */}
          <div className="flex items-center justify-between p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              <div>
                <span className="text-xs font-bold text-slate-200 block">افکت‌های صوتی</span>
                <span className="text-[10px] text-slate-400">
                  صدای کلیک سنگ دومینو، ثبت امتیاز و زنگ بربوک
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playTap();
                updateSettings({ soundEnabled: !settings.soundEnabled });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.soundEnabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-0' : '-translate-x-5'
                }`}
              />
            </button>
          </div>

          {/* Vibration toggle */}
          <div className="flex items-center justify-between p-2.5 bg-slate-950/70 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">لرزش و ویبره</span>
                <span className="text-[10px] text-slate-400">
                  بازخورد لمسی گوشی هنگام لمس دکمه‌ها
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playTap();
                updateSettings({ vibrationEnabled: !settings.vibrationEnabled });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.vibrationEnabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.vibrationEnabled ? 'translate-x-0' : '-translate-x-5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Rules Guide Button */}
      <button
        onClick={() => {
          soundManager.playTap();
          setShowRulesModal(true);
        }}
        className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl flex items-center justify-between text-amber-300 text-xs font-bold hover:bg-amber-500/15 transition-all"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>راهنمای قوانین بازی دومینو و اصطلاح «بربوک»</span>
        </div>
        <span>مشاهده ←</span>
      </button>

      {/* Backup & Restore */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Download className="w-4 h-4 text-amber-400" />
          <span>پشتیبان‌گیری و بازیابی داده‌ها</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownloadBackup}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>دانلود پشتیبان (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>بازیابی فایل پشتیبان</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {importSuccess === true && (
          <div className="p-2 bg-emerald-950/60 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2 justify-center">
            <Check className="w-4 h-4" />
            <span>اطلاعات با موفقیت بازیابی شد!</span>
          </div>
        )}
        {importSuccess === false && (
          <div className="p-2 bg-rose-950/60 border border-rose-500/60 rounded-xl text-rose-300 text-xs flex items-center gap-2 justify-center">
            <AlertTriangle className="w-4 h-4" />
            <span>فرمت فایل پشتیبان نامعتبر است!</span>
          </div>
        )}
      </div>

      {/* Reset & Wipe */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>مدیریت سابقه و پاکسازی اطلاعات</span>
        </div>
        <p className="text-[10px] text-slate-400">
          در صورت تمایل می‌توانید کلیه آمار، سوابق بازی‌ها و بازیکنان را به حالت اولیه بازگردانید.
        </p>

        {showClearConfirm ? (
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => {
                clearAllData();
                setShowClearConfirm(false);
              }}
              className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs"
            >
              بله، پاکسازی کامل شود
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
            >
              انصراف
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-2 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 text-rose-400 font-bold text-xs transition-colors"
          >
            بازنشانی به حالت کارخانه
          </button>
        )}
      </div>

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-3 relative max-h-[85vh]">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">
                راهنمای جامع قوانین دومینو و اصطلاح «بربوک»
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar text-xs text-slate-300 leading-relaxed space-y-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-400 mb-1">صفر شدن امتیازات در حالت بربوک:</h4>
                <p>
                  در حالت بربوک زمانی که تیمی که امتیازش صفر است امتیازی بگیرد، امتیاز هر دو تیم صفر می‌شود و امتیازشماری از اول انجام می‌پذیرد و <strong>بربوک ثبت نمی‌شود</strong>.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-rose-400 mb-1">ثبت پیروزی بربوک:</h4>
                <p>
                  فقط و فقط زمانی <strong>بربوک</strong> ثبت می‌شود که تیمی با اختلاف بیش از ۱۰۱ امتیاز و بدون دادن حتی یک امتیاز به حریف (مثلاً ۱۰۲ به ۰) بازی را برنده شود.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-emerald-400 mb-1">قانون حالت ترکیبی:</h4>
                <p>
                  بازی با شرط صفر شدن امتیازات آغاز می‌شود. اگر تیمی به صورت بربوک پیروز شود، برنده نهایی بوده و بازی هرگز به حالت امتیازی نخواهد رفت. <strong>فقط در صورتی بازی به امتیازی تبدیل می‌شود که قبل از آن بربوک رخ ندهد</strong> و تعداد دفعات صفر شدن به سقف انتخابی کاربر برسد.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
