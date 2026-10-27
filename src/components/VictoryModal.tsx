/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Flame, RotateCcw, CheckCircle, Award } from 'lucide-react';
import { useDomino } from '../context/DominoContext';
import { toPersianDigits } from '../utils/persianDate';
import { DominoTile } from './DominoTile';

export const VictoryModal: React.FC = () => {
  const { activeGame, rematchActiveGame, cancelActiveGame, players } = useDomino();

  useEffect(() => {
    if (activeGame && activeGame.status === 'finished') {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#ffffff'],
        });
      } catch {
        // Silently ignore
      }
    }
  }, [activeGame?.status]);

  if (!activeGame || activeGame.status !== 'finished' || !activeGame.winnerTeam) {
    return null;
  }

  const isTeam1Winner = activeGame.winnerTeam === 'team1';
  const winner = isTeam1Winner ? activeGame.team1 : activeGame.team2;
  const loser = isTeam1Winner ? activeGame.team2 : activeGame.team1;

  const winnerPlayer1 = players.find((p) => p.id === winner.playerIds[0]);
  const winnerPlayer2 = players.find((p) => p.id === winner.playerIds[1]);

  const loserPlayer1 = players.find((p) => p.id === loser.playerIds[0]);
  const loserPlayer2 = players.find((p) => p.id === loser.playerIds[1]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Barbook special banner if applicable */}
        {activeGame.isBarbookWin && (
          <div className="mb-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white font-black text-lg shadow-lg shadow-rose-900/50 animate-bounce">
            <Flame className="w-5 h-5 text-amber-300" />
            <span>بربوک!</span>
            <Flame className="w-5 h-5 text-amber-300" />
          </div>
        )}

        {/* Icon & Crown */}
        <div className="relative mx-auto w-20 h-20 mb-3 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 p-0.5 shadow-xl shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div className="absolute -bottom-2 -left-2 rotate-12">
            <DominoTile top={6} bottom={6} size="sm" />
          </div>
        </div>

        {/* Announcement */}
        <h2 className="text-xl font-black text-slate-100 mb-1">
          {activeGame.isBarbookWin ? 'پیروزی کوبنده با بربوک!' : 'پایان بازی و اعلام برنده'}
        </h2>

        <p className="text-xs text-amber-300 font-medium mb-4">
          {activeGame.isBarbookWin
            ? 'تیم برنده بدون از دست دادن حتی یک امتیاز، حریف را بربوک کرد!'
            : `تیم پیروز به امتیاز هدف ${toPersianDigits(activeGame.targetScore)} رسید.`}
        </p>

        {/* Winner Highlight Card */}
        <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-4 mb-4 text-right">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              تیم قهرمان:
            </span>
            <span className="text-sm font-black text-amber-300">{winner.name}</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex -space-x-2 space-x-reverse">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow"
                style={{ backgroundColor: winnerPlayer1?.avatarColor || '#f59e0b' }}
              >
                {winnerPlayer1?.name.charAt(0)}
              </div>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow"
                style={{ backgroundColor: winnerPlayer2?.avatarColor || '#3b82f6' }}
              >
                {winnerPlayer2?.name.charAt(0)}
              </div>
            </div>
            <span className="text-xs text-slate-200">
              {winnerPlayer1?.name} و {winnerPlayer2?.name}
            </span>
          </div>

          {/* Score confrontation */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 text-center">
            <div className="bg-slate-900/80 rounded-xl p-2">
              <div className="text-[10px] text-slate-400">امتیاز {winner.name}</div>
              <div className="text-xl font-bold text-emerald-400 tabular-nums">
                {toPersianDigits(winner.score)}
              </div>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-2">
              <div className="text-[10px] text-slate-400">امتیاز {loser.name}</div>
              <div className="text-xl font-bold text-rose-400 tabular-nums">
                {toPersianDigits(loser.score)}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Match Stats */}
        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 mb-5">
          <div className="bg-slate-900/60 rounded-xl p-2">
            <div className="text-[10px]">تعداد دست‌ها</div>
            <div className="font-bold text-slate-200 mt-0.5 tabular-nums">
              {toPersianDigits(activeGame.rounds.length)} دست
            </div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-2">
            <div className="text-[10px]">دفعات صفر شدن</div>
            <div className="font-bold text-amber-400 mt-0.5 tabular-nums">
              {toPersianDigits(activeGame.barbookResetCount)} بار
            </div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-2">
            <div className="text-[10px]">حالت بازی</div>
            <div className="font-bold text-slate-200 mt-0.5">
              {activeGame.mode === 'standard' && 'امتیازی'}
              {activeGame.mode === 'barbook' && 'بربوک'}
              {activeGame.mode === 'hybrid' && 'ترکیبی'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={rematchActiveGame}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>بازی مجدد با همین ترکیب</span>
          </button>

          <button
            onClick={cancelActiveGame}
            className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>ثبت در تاریخچه و شروع بازی جدید</span>
          </button>
        </div>
      </div>
    </div>
  );
};
