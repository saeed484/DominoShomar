/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DominoProvider, useDomino } from './context/DominoContext';
import { AndroidFrame } from './components/AndroidFrame';
import { Scoreboard } from './components/Scoreboard';
import { GameSetup } from './components/GameSetup';
import { PlayersView } from './components/PlayersView';
import { HistoryView } from './components/HistoryView';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';
import { VictoryModal } from './components/VictoryModal';

const MainContent: React.FC = () => {
  const { activeTab, activeGame } = useDomino();

  return (
    <>
      {activeTab === 'game' && (
        activeGame && activeGame.status === 'active' ? <Scoreboard /> : <GameSetup />
      )}
      {activeTab === 'players' && <PlayersView />}
      {activeTab === 'history' && <HistoryView />}
      {activeTab === 'stats' && <StatsView />}
      {activeTab === 'settings' && <SettingsView />}

      {/* Global Victory / Barbook Celebration Dialog */}
      <VictoryModal />
    </>
  );
};

export default function App() {
  return (
    <DominoProvider>
      <AndroidFrame>
        <MainContent />
      </AndroidFrame>
    </DominoProvider>
  );
}
