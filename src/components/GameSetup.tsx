/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Play,
  Shuffle,
  Plus,
  HelpCircle,
  Flame,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useDomino } from '../context/DominoContext';
import { GameMode } from '../types/domino';
import { toPersianDigits } from '../utils/persianDate';
import { soundManager } from '../utils/soundEffects';

export const GameSetup: React.FC = () => {
  const { players, addPlayer, startNewGame, settings } = useDomino();

  // Selected player IDs for Team 1 & Team 2
  const [team1P1, setTeam1P1] = useState<string>(players[0]?.id || '');
  const [team1P2, setTeam1P2] = useState<string>(players[1]?.id || '');
  const [team2P1, setTeam2P1] = useState<string>(players[2]?.id || '');
  const [team2P2, setTeam2P2] = useState<string>(players[3]?.id || '');

  const [team1Name, setTeam1Name] = useState<string>('تیم ۱');
  const [team2Name, setTeam2Name] = useState<string>('تیم ۲');

  const [mode, setMode] = useState<GameMode>('hybrid');
  const [targetScore, setTargetScore] = useState<number>(settings.defaultTargetScore || 102);
  const [maxBarbooks, setMaxBarbooks] = useState<number>(settings.defaultHybridBarbooks || 2);

  // Quick player add state
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [showAddPlayerModal, setShowAddPlayerModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const selectedPlayerIds = [team1P1, team1P2, team2P1, team2P2].filter(Boolean);
  const hasDuplicatePlayers = new Set(selectedPlayerIds).size !== selectedPlayerIds.length;
  const isSelectionComplete = selectedPlayerIds.length === 4 && !hasDuplicatePlayers;

  const handleShuffleTeams = () => {
    soundManager.playTap();
    if (players.length < 4) return;
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    setTeam1P1(shuffled[0].id);
    setTeam1P2(shuffled[1].id);
    setTeam2P1(shuffled[2].id);
    setTeam2P2(shuffled[3].id);
  };

  const handleSwapPartners = () => {
    soundManager.playTap();
    // Swap team1P2 with team2P1
    const temp = team1P2;
    setTeam1P2(team2P1);
    setTeam2P1(temp);
  };

  const handleAddQuickPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    const created = addPlayer(newPlayerName.trim());
    if (created) {
      // Auto-assign to any empty or duplicate slot
      if (!team1P1 || selectedPlayerIds.includes(team1P1)) setTeam1P1(created.id);
      else if (!team1P2) setTeam1P2(created.id);
      else if (!team2P1) setTeam2P1(created.id);
      else if (!team2P2) setTeam2P2(created.id);

      setNewPlayerName('');
      setShowAddPlayerModal(false);
    }
  };

  const handleStartGame = () => {
    if (!isSelectionComplete) {
      setErrorMsg('لطفاً ۴ بازیکن متمایز برای دو تیم انتخاب کنید.');
      soundManager.playUndo();
      return;
    }
    setErrorMsg('');
    startNewGame({
      team1Players: [team1P1, team1P2],
      team2Players: [team2P1, team2P2],
      team1Name: team1Name.trim() || 'تیم ۱',
      team2Name: team2Name.trim() || 'تیم ۲',
      mode,
      targetScore: targetScore || 102,
      maxBarbooksInHybrid: maxBarbooks || 2,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-3.5 animate-in fade-in duration-200">
      {/* Hero Visual Card */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-xl bg-slate-900 min-h-[140px] flex flex-col justify-end p-4">
        <img
          src="/src/assets/images/domino_luxury_board_1793121059435.jpg"
          alt="میز دومینو"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>مسابقه دونفره تیمی</span>
          </div>
          <h2 className="text-lg font-black text-white">آماده‌سازی بازی جدید</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            بازیکنان را بچینید، حالت بازی را انتخاب کنید و مسابقه را آغاز نمایید.
          </p>
        </div>
      </div>

      {/* Team & Player Selection */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Users className="w-4 h-4 text-amber-400" />
            <span>انتخاب ۴ بازیکن (دو تیم دونفره)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShuffleTeams}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1"
              title="چینش تصادفی"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span>تصادفی</span>
            </button>
            <button
              onClick={handleSwapPartners}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1"
              title="تعویض یار"
            >
              <span>تعویض یار</span>
            </button>
          </div>
        </div>

        {/* Team 1 Section */}
        <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={team1Name}
              onChange={(e) => setTeam1Name(e.target.value)}
              placeholder="نام تیم ۱"
              className="bg-slate-900/80 border border-blue-800/60 rounded-lg px-2.5 py-1 text-xs font-bold text-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500 w-28"
            />
            <span className="text-[10px] text-blue-400 font-medium">تیم اول (آبی)</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">بازیکن ۱</label>
              <select
                value={team1P1}
                onChange={(e) => setTeam1P1(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-blue-500"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">بازیکن ۲</label>
              <select
                value={team1P2}
                onChange={(e) => setTeam1P2(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-blue-500"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Team 2 Section */}
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={team2Name}
              onChange={(e) => setTeam2Name(e.target.value)}
              placeholder="نام تیم ۲"
              className="bg-slate-900/80 border border-emerald-800/60 rounded-lg px-2.5 py-1 text-xs font-bold text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-28"
            />
            <span className="text-[10px] text-emerald-400 font-medium">تیم دوم (سبز)</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">بازیکن ۱</label>
              <select
                value={team2P1}
                onChange={(e) => setTeam2P1(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">بازیکن ۲</label>
              <select
                value={team2P2}
                onChange={(e) => setTeam2P2(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Add Player Trigger */}
        <div className="flex justify-between items-center pt-1">
          <button
            onClick={() => setShowAddPlayerModal(true)}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن نام بازیکن جدید</span>
          </button>

          {hasDuplicatePlayers && (
            <span className="text-[11px] text-rose-400 font-bold">
              خطا: یک بازیکن دوبار انتخاب شده است!
            </span>
          )}
        </div>
      </div>

      {/* Game Mode Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-3 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>انتخاب حالت بازی</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Mode 1: Standard */}
          <button
            type="button"
            onClick={() => {
              soundManager.playTap();
              setMode('standard');
            }}
            className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
              mode === 'standard'
                ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-5 h-5 mb-1 text-blue-400" />
            <span className="text-xs font-bold">امتیازی</span>
            <span className="text-[9px] text-slate-400 mt-1">جمع ساده دست‌ها</span>
          </button>

          {/* Mode 2: Barbook */}
          <button
            type="button"
            onClick={() => {
              soundManager.playTap();
              setMode('barbook');
            }}
            className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
              mode === 'barbook'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-5 h-5 mb-1 text-rose-400" />
            <span className="text-xs font-bold">بربوک</span>
            <span className="text-[9px] text-slate-400 mt-1">صفر شدن با امتیاز تیم صفر</span>
          </button>

          {/* Mode 3: Hybrid */}
          <button
            type="button"
            onClick={() => {
              soundManager.playTap();
              setMode('hybrid');
            }}
            className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
              mode === 'hybrid'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-1 text-amber-400" />
            <span className="text-xs font-bold">ترکیبی</span>
            <span className="text-[9px] text-slate-400 mt-1">بربوک سپس امتیازی</span>
          </button>
        </div>

        {/* Mode Rules Explanation Pill */}
        <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-2.5 text-[11px] leading-relaxed text-slate-300">
          {mode === 'standard' && (
            <p>
              <strong>حالت امتیازی:</strong> امتیازات هر تیم در پایان هر دست جمع زده می‌شود و تیمی که
              زودتر به {toPersianDigits(targetScore)} برسد برنده خواهد شد.
            </p>
          )}
          {mode === 'barbook' && (
            <p>
              <strong>حالت بربوک:</strong> اگر تیمی که امتیازش صفر است در دستی امتیازی بگیرد، امتیاز
              هر دو تیم صفر شده و امتیازشماری از نو آغاز می‌شود (بربوک ثبت نمی‌شود). بربوک فقط زمانی ثبت
              می‌شود که تیمی با اختلاف بیش از ۱۰۱ امتیاز و بدون امتیاز دادن به حریف برنده شود.
            </p>
          )}
          {mode === 'hybrid' && (
            <p>
              <strong>حالت ترکیبی:</strong> بازی با شرط صفر شدن امتیازات شروع می‌شود. اگر تیمی با بربوک
              پیروز شود، برنده نهایی مسابقه بوده و بازی به حالت امتیازی نخواهد رفت. فقط در صورتی بازی به حالت
              امتیازی تبدیل می‌شود که قبل از آن بربوک رخ ندهد و تعداد دفعات صفر شدن امتیازها به{' '}
              <strong>{toPersianDigits(maxBarbooks)} بار</strong> برسد.
            </p>
          )}
        </div>

        {/* If Hybrid: Set Max Zero Resets */}
        {mode === 'hybrid' && (
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-200">سقف دفعات صفر شدن امتیاز:</span>
              <p className="text-[10px] text-slate-400">دفعاتی که امتیازها صفر می‌شوند (قبل از امتیازی شدن)</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    soundManager.playTap();
                    setMaxBarbooks(num);
                  }}
                  className={`w-7 h-7 rounded-md font-bold text-xs transition-all ${
                    maxBarbooks === num
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {toPersianDigits(num)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Target Score Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200">امتیاز هدف نهایی برای برد:</span>
          <span className="text-sm font-black text-amber-400 tabular-nums">
            {toPersianDigits(targetScore)} امتیاز
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[50, 102, 150, 200].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => {
                soundManager.playTap();
                setTargetScore(score);
              }}
              className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                targetScore === score
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {toPersianDigits(score)}
              {score === 102 && <span className="block text-[8px] text-amber-400/80 font-normal">پیش‌فرض</span>}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-300 text-center font-bold">
          {errorMsg}
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={handleStartGame}
        disabled={!isSelectionComplete}
        className={`w-full h-13 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all ${
          isSelectionComplete
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 cursor-pointer'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
        }`}
      >
        <Play className="w-5 h-5 fill-current" />
        <span>شروع مسابقه دومینو</span>
      </button>

      {/* Quick Add Player Modal */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleAddQuickPlayer}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-xs w-full flex flex-col gap-3 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-slate-100">افزودن نام بازیکن جدید</h3>
            <input
              type="text"
              autoFocus
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="مثال: آرش، کامبیز، پوریا..."
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                افزودن
              </button>
              <button
                type="button"
                onClick={() => setShowAddPlayerModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
