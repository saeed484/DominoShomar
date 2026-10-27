/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DominoGame, GameMode, RoundRecord } from '../types/domino';

export interface ScoreCalculationResult {
  team1ScoreAfter: number;
  team2ScoreAfter: number;
  isZeroReset: boolean;
  newZeroResetCount: number;
  newHybridPhase: 'barbook' | 'standard';
  isGameOver: boolean;
  winnerTeam: 'team1' | 'team2' | null;
  isBarbookWin: boolean;
  message?: string;
}

/**
 * Calculates the outcome of adding a round of points according to Domino rules
 */
export function calculateRoundOutcome(
  game: DominoGame,
  scoringTeam: 'team1' | 'team2',
  points: number
): ScoreCalculationResult {
  const currentTeam1Score = game.team1.score;
  const currentTeam2Score = game.team2.score;
  const pointsClean = Math.max(0, Math.floor(points));

  // Determine current active rule phase
  const isCurrentlyInBarbookRule =
    game.mode === 'barbook' ||
    (game.mode === 'hybrid' && game.currentHybridPhase === 'barbook');

  let isZeroReset = false;
  let newTeam1Score = currentTeam1Score;
  let newTeam2Score = currentTeam2Score;
  let newZeroResetCount = game.barbookResetCount;
  let newHybridPhase = game.currentHybridPhase;
  let message: string | undefined;

  if (isCurrentlyInBarbookRule && pointsClean > 0) {
    // Condition for Zero-Reset:
    // "در حالت بربوک زمانی که تیمی که امتیازش صفر است اگر امتیازی گرفت، امتیاز هر دو تیم صفر می شود
    // و امتیاز شماری از اول انجام می شود و بربوک ثبت نمی شود"
    const isTeam1ScoringFromZeroAgainstLead =
      scoringTeam === 'team1' && currentTeam1Score === 0 && currentTeam2Score > 0;
    const isTeam2ScoringFromZeroAgainstLead =
      scoringTeam === 'team2' && currentTeam2Score === 0 && currentTeam1Score > 0;

    if (isTeam1ScoringFromZeroAgainstLead || isTeam2ScoringFromZeroAgainstLead) {
      // Both teams drop to 0 and counting starts from beginning (NOT a Barbook win)
      isZeroReset = true;
      newTeam1Score = 0;
      newTeam2Score = 0;
      newZeroResetCount += 1;

      message = `امتیاز هر دو تیم صفر شد و امتیازشماری از نو آغاز می‌شود (نوبت ${newZeroResetCount} صفر شدن).`;

      // In hybrid mode: check if max zero-resets reached without a Barbook occurring
      // "فقط در صورتی بازی به امتیازی تبدیل شود که قبل از آن بربوک رخ ندهد."
      if (game.mode === 'hybrid' && newZeroResetCount >= game.maxBarbooksInHybrid) {
        newHybridPhase = 'standard';
        message = `سقف ${game.maxBarbooksInHybrid} بار صفر شدن امتیازها تکمیل شد و بربوک رخ نداد. بازی از این پس به حالت امتیازی ادامه پیدا می‌کند.`;
      }
    } else {
      // Normal point accumulation (either opening hand where both were 0, or the leading team scores more)
      if (scoringTeam === 'team1') {
        newTeam1Score += pointsClean;
      } else {
        newTeam2Score += pointsClean;
      }
    }
  } else {
    // Standard scoring phase
    if (scoringTeam === 'team1') {
      newTeam1Score += pointsClean;
    } else {
      newTeam2Score += pointsClean;
    }
  }

  // Check Game Over condition
  const target = game.targetScore;
  let isGameOver = false;
  let winnerTeam: 'team1' | 'team2' | null = null;
  let isBarbookWin = false;

  if (newTeam1Score >= target || newTeam2Score >= target) {
    isGameOver = true;
    if (newTeam1Score >= target && newTeam2Score >= target) {
      winnerTeam = newTeam1Score >= newTeam2Score ? 'team1' : 'team2';
    } else if (newTeam1Score >= target) {
      winnerTeam = 'team1';
    } else {
      winnerTeam = 'team2';
    }

    // Check Barbook Win condition:
    // "فقط زمانی بربوک ثبت شود که تیمی با اختلاف بیش از 101 امتیاز و بدون دادن امتیاز به حریف برنده شود."
    const winningScore = winnerTeam === 'team1' ? newTeam1Score : newTeam2Score;
    const losingScore = winnerTeam === 'team1' ? newTeam2Score : newTeam1Score;
    const diff = winningScore - losingScore;

    if (diff > 101 && losingScore === 0) {
      isBarbookWin = true;
      // "در حالت ترکیبی اگر تیمی بصورت بربوک پیروز شود برنده نهایی بوده و بازی به حالت امتیازی نخواهد رفت."
      // Game terminates as complete Barbook victory!
      message = 'بربوک! پیروزی قاطعانه و نهایی با اختلاف بیش از ۱۰۱ امتیاز بدون دادن امتیاز به حریف!';
    }
  }

  return {
    team1ScoreAfter: newTeam1Score,
    team2ScoreAfter: newTeam2Score,
    isZeroReset,
    newZeroResetCount,
    newHybridPhase,
    isGameOver,
    winnerTeam,
    isBarbookWin,
    message,
  };
}

/**
 * Recalculates entire game state from a list of rounds (useful for undo operations)
 */
export function recalculateGameRounds(
  baseGame: DominoGame,
  roundsToReplay: RoundRecord[]
): DominoGame {
  let team1Score = 0;
  let team2Score = 0;
  let zeroResetCount = 0;
  let hybridPhase: 'barbook' | 'standard' = 'barbook';

  const newRounds: RoundRecord[] = [];

  for (let i = 0; i < roundsToReplay.length; i++) {
    const r = roundsToReplay[i];
    const dummyGame: DominoGame = {
      ...baseGame,
      team1: { ...baseGame.team1, score: team1Score },
      team2: { ...baseGame.team2, score: team2Score },
      barbookResetCount: zeroResetCount,
      currentHybridPhase: hybridPhase,
    };

    const outcome = calculateRoundOutcome(dummyGame, r.scoringTeam, r.pointsEntered);

    newRounds.push({
      roundNumber: i + 1,
      scoringTeam: r.scoringTeam,
      pointsEntered: r.pointsEntered,
      team1ScoreBefore: team1Score,
      team2ScoreBefore: team2Score,
      team1ScoreAfter: outcome.team1ScoreAfter,
      team2ScoreAfter: outcome.team2ScoreAfter,
      isZeroReset: outcome.isZeroReset,
      isBarbookReset: outcome.isZeroReset, // compatibility
      timestamp: r.timestamp,
      note: outcome.message,
    });

    team1Score = outcome.team1ScoreAfter;
    team2Score = outcome.team2ScoreAfter;
    zeroResetCount = outcome.newZeroResetCount;
    hybridPhase = outcome.newHybridPhase;
  }

  // Check victory status
  let isGameOver = false;
  let winnerTeam: 'team1' | 'team2' | null = null;
  let isBarbookWin = false;

  if (team1Score >= baseGame.targetScore || team2Score >= baseGame.targetScore) {
    isGameOver = true;
    winnerTeam = team1Score >= team2Score ? 'team1' : 'team2';
    const winningScore = winnerTeam === 'team1' ? team1Score : team2Score;
    const losingScore = winnerTeam === 'team1' ? team2Score : team1Score;
    if (winningScore - losingScore > 101 && losingScore === 0) {
      isBarbookWin = true;
    }
  }

  return {
    ...baseGame,
    team1: { ...baseGame.team1, score: team1Score },
    team2: { ...baseGame.team2, score: team2Score },
    barbookResetCount: zeroResetCount,
    currentHybridPhase: hybridPhase,
    rounds: newRounds,
    status: isGameOver ? 'finished' : 'active',
    winnerTeam: isGameOver ? winnerTeam : null,
    isBarbookWin: isGameOver ? isBarbookWin : false,
    finishedAt: isGameOver ? Date.now() : undefined,
  };
}

/**
 * Returns human-readable label for game mode in Persian
 */
export function getGameModeLabel(mode: GameMode): string {
  switch (mode) {
    case 'standard':
      return 'حالت امتیازی';
    case 'barbook':
      return 'حالت بربوک';
    case 'hybrid':
      return 'حالت ترکیبی';
  }
}
