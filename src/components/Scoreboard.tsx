/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  RotateCcw,
  Flag,
  Flame,
  AlertCircle,
  Plus,
  Delete,
  Check,
  ChevronDown,
  ChevronUp,
  History as HistoryIcon,
} from 'lucide-react';
import { useDomino } from '../context/DominoContext';
import { toPersianDigits } from '../utils/persianDate';
import { soundManager } from '../utils/soundEffects';

export const Scoreboard: React.FC = () => {
  const {
    activeGame,
    addRoundScore,
    undoLastRound,
    finishActiveGame,
    cancelActiveGame,
    players,
  } = useDomino();

  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2'>('team1');
  const [pointsInput, setPointsInput] = useState<string>('');
  const [showRoundsHistory, setShowRoundsHistory] = useState<boolean>(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState<boolean>(false);

  if (!activeGame) return null;

  const team1Player1 = players.find((p) => p.id === activeGame.team1.playerIds[0]);
  const team1Player2 = players.find((p) => p.id === activeGame.team1.playerIds[1]);

  const team2Player1 = players.find((p) => p.id === activeGame.team2.playerIds[0]);
  const team2Player2 = players.find((p) => p.id === activeGame.team2.playerIds[1]);

  const isBarbookRuleActive =
    activeGame.mode === 'barbook' ||
    (activeGame.mode === 'hybrid' && activeGame.currentHybridPhase === 'barbook');

  // Check if there is an imminent Barbook threat
  const team1AtZero = activeGame.team1.score === 0;
  const team2AtZero = activeGame.team2.score === 0;
  const barbookThreatTeam =
    isBarbookRuleActive &&
    ((team1AtZero && !team2AtZero && selectedTeam === 'team1') ||
      (team2AtZero && !team1AtZero && selectedTeam === 'team2'));

  const handleKeypadPress = (digit: string) => {
    soundManager.playTap();
    if (pointsInput.length >= 3) return;
    if (pointsInput === '0' && digit === '0') return;
    if (pointsInput === '0') {
      setPointsInput(digit);
    } else {
      setPointsInput((prev) => prev + digit);
    }
  };

  const handleClear = () => {
    soundManager.playTap();
    setPointsInput('');
  };

  const handleBackspace = () => {
    soundManager.playTap();
    setPointsInput((prev) => prev.slice(0, -1));
  };

  const handleQuickAdd = (amount: number) => {
    soundManager.playTap();
    const current = parseInt(pointsInput || '0', 10);
    const next = current + amount;
    if (next <= 300) {
      setPointsInput(String(next));
    }
  };

  const handleSubmitScore = () => {
    const pts = parseInt(pointsInput, 10);
    if (isNaN(pts) || pts <= 0) return;

    addRoundScore(selectedTeam, pts);
    setPointsInput('');
  };

  const target = activeGame.targetScore;
  const team1Progress = Math.min(100, Math.round((activeGame.team1.score / target) * 100));
  const team2Progress = Math.min(100, Math.round((activeGame.team2.score / target) * 100));

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Top Match Info Pill */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">
            {activeGame.mode === 'standard' && 'حالت امتیازی'}
            {activeGame.mode === 'barbook' && 'حالت بربوک'}
            {activeGame.mode === 'hybrid' &&
              (activeGame.currentHybridPhase === 'barbook'
                ? `ترکیبی (صفر شدن: ${toPersianDigits(activeGame.barbookResetCount)} از ${toPersianDigits(activeGame.maxBarbooksInHybrid)})`
                : 'ترکیبی (مرحله امتیازی)')}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">
            هدف: <strong className="text-slate-100">{toPersianDigits(target)}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <span>دست شماره</span>
          <span className="font-bold text-slate-100 tabular-nums">
            {toPersianDigits(activeGame.rounds.length + 1)}
          </span>
        </div>
      </div>

      {/* Main Scoreboard: Team 1 vs Team 2 */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Team 1 Card */}
        <div
          onClick={() => {
            soundManager.playTap();
            setSelectedTeam('team1');
          }}
          className={`relative p-3 rounded-2xl border-2 transition-all cursor-pointer ${
            selectedTeam === 'team1'
              ? 'bg-gradient-to-b from-blue-950/60 to-slate-900/90 border-blue-500 shadow-lg shadow-blue-500/20'
              : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          {selectedTeam === 'team1' && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-500 text-[10px] font-bold text-white rounded-full">
              تیم انتخابی
            </div>
          )}

          <div className="text-xs font-bold text-slate-200 truncate mb-1">
            {activeGame.team1.name}
          </div>

          <div className="text-[10px] text-slate-400 truncate mb-2">
            {team1Player1?.name} و {team1Player2?.name}
          </div>

          {/* Big Score Display */}
          <div className="flex items-baseline justify-center my-1">
            <span className="text-4xl font-black text-blue-400 tabular-nums tracking-tight">
              {toPersianDigits(activeGame.team1.score)}
            </span>
            <span className="text-xs text-slate-500 mr-1">امتیاز</span>
          </div>

          {/* Progress bar to target */}
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden mt-2">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${team1Progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] text-slate-500 mt-1">
            <span>{toPersianDigits(team1Progress)}٪ تا برد</span>
            <span>باقی‌مانده: {toPersianDigits(Math.max(0, target - activeGame.team1.score))}</span>
          </div>
        </div>

        {/* Team 2 Card */}
        <div
          onClick={() => {
            soundManager.playTap();
            setSelectedTeam('team2');
          }}
          className={`relative p-3 rounded-2xl border-2 transition-all cursor-pointer ${
            selectedTeam === 'team2'
              ? 'bg-gradient-to-b from-emerald-950/60 to-slate-900/90 border-emerald-500 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          {selectedTeam === 'team2' && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-emerald-500 text-[10px] font-bold text-white rounded-full">
              تیم انتخابی
            </div>
          )}

          <div className="text-xs font-bold text-slate-200 truncate mb-1">
            {activeGame.team2.name}
          </div>

          <div className="text-[10px] text-slate-400 truncate mb-2">
            {team2Player1?.name} و {team2Player2?.name}
          </div>

          {/* Big Score Display */}
          <div className="flex items-baseline justify-center my-1">
            <span className="text-4xl font-black text-emerald-400 tabular-nums tracking-tight">
              {toPersianDigits(activeGame.team2.score)}
            </span>
            <span className="text-xs text-slate-500 mr-1">امتیاز</span>
          </div>

          {/* Progress bar to target */}
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${team2Progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] text-slate-500 mt-1">
            <span>{toPersianDigits(team2Progress)}٪ تا برد</span>
            <span>باقی‌مانده: {toPersianDigits(Math.max(0, target - activeGame.team2.score))}</span>
          </div>
        </div>
      </div>

      {/* Zero Reset Threat Warning if applicable */}
      {barbookThreatTeam && (
        <div className="bg-rose-950/90 border border-rose-500/60 rounded-xl p-2.5 flex items-center gap-2 text-rose-200 text-xs animate-pulse">
          <RotateCcw className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="text-[11px] leading-relaxed">
            <strong>هشدار صفر شدن امتیازات:</strong> با ثبت امتیاز برای تیم صفر، امتیاز هر دو تیم صفر خواهد شد و شمارش از نو آغاز می‌شود (بربوک ثبت نمی‌شود).
          </span>
        </div>
      )}

      {/* Manual Score Input Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2.5 shadow-md">
        {/* Scoring Team Toggle & Display */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300 font-medium">ثبت امتیاز این دست برای:</span>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                soundManager.playTap();
                setSelectedTeam('team1');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedTeam === 'team1'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {activeGame.team1.name}
            </button>
            <button
              onClick={() => {
                soundManager.playTap();
                setSelectedTeam('team2');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedTeam === 'team2'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {activeGame.team2.name}
            </button>
          </div>
        </div>

        {/* Value Display Box */}
        <div className="flex items-center justify-between bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-2">
          <span className="text-xs text-slate-400">امتیاز وارد شده:</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-amber-400 tabular-nums">
              {pointsInput ? toPersianDigits(pointsInput) : '۰'}
            </span>
            {pointsInput && (
              <button
                onClick={handleClear}
                className="text-[11px] text-slate-500 hover:text-slate-300 underline"
              >
                پاک
              </button>
            )}
          </div>
        </div>

        {/* Quick Add Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[5, 10, 15, 20, 25, 30, 40].map((amt) => (
            <button
              key={amt}
              onClick={() => handleQuickAdd(amt)}
              className="shrink-0 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 active:scale-95 transition-all"
            >
              +{toPersianDigits(amt)}
            </button>
          ))}
        </div>

        {/* Tactile Numeric Keypad */}
        <div className="grid grid-cols-3 gap-1.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeypadPress(digit)}
              className="h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-bold text-base border border-slate-700/60 active:scale-95 active:bg-slate-600 transition-all flex items-center justify-center"
            >
              {toPersianDigits(digit)}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-10 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs border border-rose-800/40 active:scale-95 transition-all flex items-center justify-center"
          >
            پاک کردن
          </button>
          <button
            onClick={() => handleKeypadPress('0')}
            className="h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-bold text-base border border-slate-700/60 active:scale-95 active:bg-slate-600 transition-all flex items-center justify-center"
          >
            {toPersianDigits('0')}
          </button>
          <button
            onClick={handleBackspace}
            className="h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700/60 active:scale-95 transition-all flex items-center justify-center"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Submit Button */}
        <button
          onClick={handleSubmitScore}
          disabled={!pointsInput || parseInt(pointsInput, 10) <= 0}
          className={`w-full h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all ${
            pointsInput && parseInt(pointsInput, 10) > 0
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>
            ثبت {pointsInput ? toPersianDigits(pointsInput) : ''} امتیاز برای{' '}
            {selectedTeam === 'team1' ? activeGame.team1.name : activeGame.team2.name}
          </span>
        </button>
      </div>

      {/* Match Actions Toolbar */}
      <div className="flex items-center gap-2">
        <button
          onClick={undoLastRound}
          disabled={activeGame.rounds.length === 0}
          className={`flex-1 h-10 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-medium transition-all ${
            activeGame.rounds.length > 0
              ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 active:scale-95'
              : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>بازگشت دست قبل ({toPersianDigits(activeGame.rounds.length)})</span>
        </button>

        <button
          onClick={() => setShowFinishConfirm(true)}
          className="px-3 h-10 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium flex items-center gap-1"
        >
          <Flag className="w-3.5 h-3.5 text-amber-400" />
          <span>پایان زودهنگام</span>
        </button>

        <button
          onClick={() => setShowCancelConfirm(true)}
          className="px-2.5 h-10 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-950/40 text-xs font-medium flex items-center"
        >
          انصراف
        </button>
      </div>

      {/* Live Hand History Accordion */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden mt-1">
        <button
          onClick={() => setShowRoundsHistory((prev) => !prev)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-300 hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-4 h-4 text-amber-400" />
            <span>تاریخچه دست‌های این بازی</span>
            <span className="text-[10px] text-slate-500">
              ({toPersianDigits(activeGame.rounds.length)} دست)
            </span>
          </div>
          {showRoundsHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showRoundsHistory && (
          <div className="p-3 border-t border-slate-800/80 flex flex-col gap-2 max-h-56 overflow-y-auto no-scrollbar">
            {activeGame.rounds.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500">
                هنوز دستی ثبت نشده است. اولین امتیاز را ثبت کنید!
              </div>
            ) : (
              activeGame.rounds.map((round) => {
                const scoringTeamName =
                  round.scoringTeam === 'team1' ? activeGame.team1.name : activeGame.team2.name;

                return (
                  <div
                    key={round.roundNumber}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      round.isBarbookReset
                        ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                        : 'bg-slate-950/70 border-slate-800/70 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 font-bold text-[10px] flex items-center justify-center tabular-nums">
                        {toPersianDigits(round.roundNumber)}
                      </span>
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span
                            className={
                              round.scoringTeam === 'team1' ? 'text-blue-400' : 'text-emerald-400'
                            }
                          >
                            {scoringTeamName}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            (+{toPersianDigits(round.pointsEntered)})
                          </span>
                        </div>
                        {(round.isZeroReset || round.isBarbookReset) && (
                          <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                            <RotateCcw className="w-3 h-3 text-amber-400" />
                            <span>امتیاز هر دو تیم صفر شد (شمارش از نو)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black tabular-nums tracking-wide">
                        <span className="text-blue-400">{toPersianDigits(round.team1ScoreAfter)}</span>
                        <span className="text-slate-500 mx-1">-</span>
                        <span className="text-emerald-400">{toPersianDigits(round.team2ScoreAfter)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-xs w-full text-center">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-100 mb-1">انصراف از بازی جاری؟</h3>
            <p className="text-xs text-slate-400 mb-4">
              با انصراف، بازی بدون ثبت در تاریخچه لغو خواهد شد.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  cancelActiveGame();
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs"
              >
                بله، لغو شود
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                ادامه بازی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Early Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-xs w-full text-center">
            <Flag className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-100 mb-1">پایان زودهنگام بازی؟</h3>
            <p className="text-xs text-slate-400 mb-4">
              بازی با امتیازات فعلی به پایان رسیده و تیمی که امتیاز بیشتری دارد برنده اعلام می‌شود.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowFinishConfirm(false);
                  finishActiveGame();
                }}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs"
              >
                ثبت و پایان
              </button>
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                بازگشت
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
