/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings, DominoGame, GameMode, Player, PlayerStats, RoundRecord, ThemeType } from '../types/domino';
import { calculateRoundOutcome, recalculateGameRounds } from '../utils/dominoRules';
import { getFormattedPersianDate } from '../utils/persianDate';
import { soundManager } from '../utils/soundEffects';

interface DominoContextType {
  players: Player[];
  activeGame: DominoGame | null;
  gameHistory: DominoGame[];
  settings: AppSettings;
  activeTab: 'game' | 'players' | 'history' | 'stats' | 'settings';
  setActiveTab: (tab: 'game' | 'players' | 'history' | 'stats' | 'settings') => void;
  bannerAlert: { type: 'barbook' | 'hybrid-switch' | 'win'; title: string; subtitle: string } | null;
  clearBannerAlert: () => void;

  // Game actions
  startNewGame: (config: {
    team1Players: [string, string];
    team2Players: [string, string];
    team1Name?: string;
    team2Name?: string;
    mode: GameMode;
    targetScore: number;
    maxBarbooksInHybrid?: number;
  }) => void;
  addRoundScore: (scoringTeam: 'team1' | 'team2', points: number) => void;
  undoLastRound: () => void;
  finishActiveGame: () => void;
  cancelActiveGame: () => void;
  rematchActiveGame: () => void;

  // Player actions
  addPlayer: (name: string) => Player | null;
  updatePlayer: (id: string, name: string) => void;
  deletePlayer: (id: string) => void;
  getPlayerStats: (playerId: string) => PlayerStats;

  // Settings & Storage
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  clearAllData: () => void;
}

const STORAGE_KEY_PLAYERS = 'domino_score_players_v1';
const STORAGE_KEY_ACTIVE_GAME = 'domino_score_active_game_v1';
const STORAGE_KEY_HISTORY = 'domino_score_history_v1';
const STORAGE_KEY_SETTINGS = 'domino_score_settings_v1';

const DEFAULT_PLAYERS: Player[] = [
  { id: 'p1', name: 'علی', avatarColor: '#3b82f6', createdAt: 1700000000000 },
  { id: 'p2', name: 'رضا', avatarColor: '#10b981', createdAt: 1700000001000 },
  { id: 'p3', name: 'سجاد', avatarColor: '#f59e0b', createdAt: 1700000002000 },
  { id: 'p4', name: 'مهدی', avatarColor: '#ec4899', createdAt: 1700000003000 },
  { id: 'p5', name: 'حسین', avatarColor: '#8b5cf6', createdAt: 1700000004000 },
  { id: 'p6', name: 'کامران', avatarColor: '#06b6d4', createdAt: 1700000005000 },
];

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'domino-dark',
  soundEnabled: true,
  vibrationEnabled: true,
  defaultTargetScore: 102,
  defaultHybridBarbooks: 2,
};

const DominoContext = createContext<DominoContextType | undefined>(undefined);

export const DominoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLAYERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return DEFAULT_PLAYERS;
  });

  const [activeGame, setActiveGame] = useState<DominoGame | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_GAME);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return null;
  });

  const [gameHistory, setGameHistory] = useState<DominoGame[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // Ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<'game' | 'players' | 'history' | 'stats' | 'settings'>('game');
  const [bannerAlert, setBannerAlert] = useState<{
    type: 'barbook' | 'hybrid-switch' | 'win';
    title: string;
    subtitle: string;
  } | null>(null);

  // Sync sound settings with SoundController
  useEffect(() => {
    soundManager.setPreferences(settings.soundEnabled, settings.vibrationEnabled);
  }, [settings.soundEnabled, settings.vibrationEnabled]);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players));
    } catch {
      // Ignore
    }
  }, [players]);

  useEffect(() => {
    try {
      if (activeGame) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_GAME, JSON.stringify(activeGame));
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE_GAME);
      }
    } catch {
      // Ignore
    }
  }, [activeGame]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(gameHistory));
    } catch {
      // Ignore
    }
  }, [gameHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  const clearBannerAlert = () => {
    setBannerAlert(null);
  };

  const startNewGame = (config: {
    team1Players: [string, string];
    team2Players: [string, string];
    team1Name?: string;
    team2Name?: string;
    mode: GameMode;
    targetScore: number;
    maxBarbooksInHybrid?: number;
  }) => {
    const newGame: DominoGame = {
      id: `game_${Date.now()}`,
      date: getFormattedPersianDate(),
      timestamp: Date.now(),
      mode: config.mode,
      targetScore: config.targetScore || settings.defaultTargetScore || 102,
      maxBarbooksInHybrid: config.maxBarbooksInHybrid || settings.defaultHybridBarbooks || 2,
      barbookResetCount: 0,
      currentHybridPhase: 'barbook',
      team1: {
        name: config.team1Name?.trim() || 'تیم ۱',
        playerIds: config.team1Players,
        score: 0,
      },
      team2: {
        name: config.team2Name?.trim() || 'تیم ۲',
        playerIds: config.team2Players,
        score: 0,
      },
      rounds: [],
      status: 'active',
      winnerTeam: null,
      isBarbookWin: false,
    };

    setActiveGame(newGame);
    setActiveTab('game');
    soundManager.playTap();
  };

  const addRoundScore = (scoringTeam: 'team1' | 'team2', points: number) => {
    if (!activeGame || activeGame.status !== 'active') return;

    const outcome = calculateRoundOutcome(activeGame, scoringTeam, points);

    const newRound: RoundRecord = {
      roundNumber: activeGame.rounds.length + 1,
      scoringTeam,
      pointsEntered: points,
      team1ScoreBefore: activeGame.team1.score,
      team2ScoreBefore: activeGame.team2.score,
      team1ScoreAfter: outcome.team1ScoreAfter,
      team2ScoreAfter: outcome.team2ScoreAfter,
      isZeroReset: outcome.isZeroReset,
      isBarbookReset: outcome.isZeroReset,
      timestamp: Date.now(),
      note: outcome.message,
    };

    const updatedGame: DominoGame = {
      ...activeGame,
      team1: { ...activeGame.team1, score: outcome.team1ScoreAfter },
      team2: { ...activeGame.team2, score: outcome.team2ScoreAfter },
      barbookResetCount: outcome.newZeroResetCount,
      currentHybridPhase: outcome.newHybridPhase,
      rounds: [newRound, ...activeGame.rounds], // Newest first for quick access
      status: outcome.isGameOver ? 'finished' : 'active',
      winnerTeam: outcome.isGameOver ? outcome.winnerTeam : null,
      isBarbookWin: outcome.isBarbookWin,
      finishedAt: outcome.isGameOver ? Date.now() : undefined,
    };

    setActiveGame(updatedGame);

    if (outcome.isZeroReset) {
      soundManager.playUndo();
      setBannerAlert({
        type: 'barbook',
        title: 'صفر شدن امتیازات',
        subtitle: `امتیاز هر دو تیم صفر شد و امتیازشماری از نو آغاز می‌شود (بربوک ثبت نمی‌شود).`,
      });
    } else if (
      activeGame.mode === 'hybrid' &&
      activeGame.currentHybridPhase === 'barbook' &&
      outcome.newHybridPhase === 'standard'
    ) {
      soundManager.playScoreAdd();
      setBannerAlert({
        type: 'hybrid-switch',
        title: 'تغییر به حالت امتیازی',
        subtitle: `سقف صفر شدن امتیازات (${activeGame.maxBarbooksInHybrid} بار) تکمیل شد و بربوک رخ نداد. بازی اکنون به حالت امتیازی ادامه پیدا می‌کند.`,
      });
    } else if (outcome.isGameOver) {
      soundManager.playVictory();
      if (outcome.isBarbookWin) {
        setBannerAlert({
          type: 'win',
          title: 'بربوک!',
          subtitle: `پیروزی قاطعانه و نهایی ${outcome.winnerTeam === 'team1' ? updatedGame.team1.name : updatedGame.team2.name} با بربوک حریف (اختلاف بیش از ۱۰۱ امتیاز و حریف صفر)!`,
        });
      } else {
        setBannerAlert({
          type: 'win',
          title: 'پایان بازی و پیروزی!',
          subtitle: `${outcome.winnerTeam === 'team1' ? updatedGame.team1.name : updatedGame.team2.name} به امتیاز هدف رسید!`,
        });
      }

      // Automatically add to history
      setGameHistory((prev) => [updatedGame, ...prev]);
    } else {
      soundManager.playScoreAdd();
    }
  };

  const undoLastRound = () => {
    if (!activeGame || activeGame.rounds.length === 0) return;

    soundManager.playUndo();

    // Replay rounds from oldest to newest excluding the latest one
    const chronologicalRounds = [...activeGame.rounds].reverse();
    const roundsExceptLast = chronologicalRounds.slice(0, -1);

    const recalculated = recalculateGameRounds(
      {
        ...activeGame,
        team1: { ...activeGame.team1, score: 0 },
        team2: { ...activeGame.team2, score: 0 },
        barbookResetCount: 0,
        currentHybridPhase: 'barbook',
        status: 'active',
        winnerTeam: null,
        isBarbookWin: false,
        finishedAt: undefined,
      },
      roundsExceptLast
    );

    // Keep activeGame rounds array newest-first
    const updatedGame: DominoGame = {
      ...recalculated,
      rounds: [...recalculated.rounds].reverse(),
    };

    setActiveGame(updatedGame);
  };

  const finishActiveGame = () => {
    if (!activeGame) return;
    const winner: 'team1' | 'team2' =
      activeGame.team1.score >= activeGame.team2.score ? 'team1' : 'team2';
    const finished: DominoGame = {
      ...activeGame,
      status: 'finished',
      winnerTeam: winner,
      finishedAt: Date.now(),
    };
    setGameHistory((prev) => [finished, ...prev]);
    setActiveGame(finished);
    soundManager.playVictory();
  };

  const cancelActiveGame = () => {
    soundManager.playTap();
    setActiveGame(null);
  };

  const rematchActiveGame = () => {
    if (!activeGame) return;
    startNewGame({
      team1Players: activeGame.team1.playerIds,
      team2Players: activeGame.team2.playerIds,
      team1Name: activeGame.team1.name,
      team2Name: activeGame.team2.name,
      mode: activeGame.mode,
      targetScore: activeGame.targetScore,
      maxBarbooksInHybrid: activeGame.maxBarbooksInHybrid,
    });
  };

  const addPlayer = (name: string): Player | null => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newPlayer: Player = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      avatarColor: randomColor,
      createdAt: Date.now(),
    };
    setPlayers((prev) => [...prev, newPlayer]);
    soundManager.playTap();
    return newPlayer;
  };

  const updatePlayer = (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: trimmed } : p))
    );
    soundManager.playTap();
  };

  const deletePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    soundManager.playTap();
  };

  const getPlayerStats = (playerId: string): PlayerStats => {
    let gamesPlayed = 0;
    let wins = 0;
    let losses = 0;
    let totalPointsScored = 0;
    let highestRoundScore = 0;
    let barbookWins = 0;
    let zeroResetsCount = 0;
    const teammateCount: Record<string, number> = {};

    // Combine finished games in history + finished active game
    const allGames = [...gameHistory];
    if (activeGame && activeGame.status === 'finished' && !allGames.some((g) => g.id === activeGame.id)) {
      allGames.unshift(activeGame);
    }

    allGames.forEach((game) => {
      const inTeam1 = game.team1.playerIds.includes(playerId);
      const inTeam2 = game.team2.playerIds.includes(playerId);

      if (!inTeam1 && !inTeam2) return;

      gamesPlayed++;
      const isWinner =
        (inTeam1 && game.winnerTeam === 'team1') ||
        (inTeam2 && game.winnerTeam === 'team2');

      if (isWinner) {
        wins++;
        if (game.isBarbookWin) {
          barbookWins++;
        }
      } else if (game.winnerTeam !== null) {
        losses++;
      }

      // Track teammates
      const partnerId = inTeam1
        ? game.team1.playerIds.find((id) => id !== playerId)
        : game.team2.playerIds.find((id) => id !== playerId);
      if (partnerId) {
        teammateCount[partnerId] = (teammateCount[partnerId] || 0) + 1;
      }

      // Track round contributions
      game.rounds.forEach((round) => {
        const teamScored =
          (inTeam1 && round.scoringTeam === 'team1') ||
          (inTeam2 && round.scoringTeam === 'team2');
        if (teamScored) {
          totalPointsScored += round.pointsEntered;
          if (round.pointsEntered > highestRoundScore) {
            highestRoundScore = round.pointsEntered;
          }
        }
        if (round.isZeroReset || round.isBarbookReset) {
          zeroResetsCount++;
        }
      });
    });

    // Best teammate
    let bestTeammateId: string | null = null;
    let maxPartnership = 0;
    Object.entries(teammateCount).forEach(([tId, count]) => {
      if (count > maxPartnership) {
        maxPartnership = count;
        bestTeammateId = tId;
      }
    });

    const partner = players.find((p) => p.id === bestTeammateId);

    return {
      gamesPlayed,
      wins,
      losses,
      winRate: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0,
      totalPointsScored,
      highestRoundScore,
      barbookWins,
      zeroResetsCount,
      favoriteTeammateId: bestTeammateId,
      favoriteTeammateName: partner ? partner.name : null,
    };
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const exportDataJSON = (): string => {
    const backup = {
      version: 1,
      exportedAt: Date.now(),
      players,
      gameHistory,
      settings,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data && Array.isArray(data.players)) {
        setPlayers(data.players);
        if (Array.isArray(data.gameHistory)) {
          setGameHistory(data.gameHistory);
        }
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
        soundManager.playScoreAdd();
        return true;
      }
    } catch {
      // Parse error
    }
    return false;
  };

  const clearAllData = () => {
    soundManager.playUndo();
    setPlayers(DEFAULT_PLAYERS);
    setActiveGame(null);
    setGameHistory([]);
    setSettings(DEFAULT_SETTINGS);
    localStorage.clear();
  };

  return (
    <DominoContext.Provider
      value={{
        players,
        activeGame,
        gameHistory,
        settings,
        activeTab,
        setActiveTab,
        bannerAlert,
        clearBannerAlert,
        startNewGame,
        addRoundScore,
        undoLastRound,
        finishActiveGame,
        cancelActiveGame,
        rematchActiveGame,
        addPlayer,
        updatePlayer,
        deletePlayer,
        getPlayerStats,
        updateSettings,
        exportDataJSON,
        importDataJSON,
        clearAllData,
      }}
    >
      {children}
    </DominoContext.Provider>
  );
};

export const useDomino = () => {
  const context = useContext(DominoContext);
  if (!context) {
    throw new Error('useDomino must be used within a DominoProvider');
  }
  return context;
};
