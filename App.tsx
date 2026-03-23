import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useGame } from './src/game/useGame';
import { StatsModal } from './src/components/statsModal';
import { HelpModal } from './src/components/helpModal';
import { HomeInfoModal } from './src/components/HomeInfoModal';
import { HomeSettingsModal } from './src/components/HomeSettingsModal';
import { LoadingScreen } from './src/components/loadingScreen';
import { HomeScreen } from './src/components/HomeScreen';
import { DailyWordleScreen } from './src/screens/DailyWordleScreen';
import {
  setupReminderNotificationsAsync,
  // showcaseAllReminderMessagesForTestingAsync,
} from './src/notifications/reminders';

type AppRoute = 'home' | 'daily-wordle';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void setupReminderNotificationsAsync();
    // if (__DEV__) {
    //   void showcaseAllReminderMessagesForTestingAsync();
    // }
  }, []);

  return (
    <SafeAreaProvider>
      {!isReady ? (
        <LoadingScreen onFinish={() => setIsReady(true)} />
      ) : (
        <AppInner />
      )}
    </SafeAreaProvider>
  );
}

function AppInner() {
  const game = useGame();
  const [route, setRoute] = useState<AppRoute>('home');
  const [selectedModeId, setSelectedModeId] = useState<AppRoute>('daily-wordle');
  const [showModal, setShowModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHomeInfo, setShowHomeInfo] = useState(false);
  const [showHomeSettings, setShowHomeSettings] = useState(false);

  useEffect(() => {
    if (game.status !== 'playing') {
      void setupReminderNotificationsAsync();
    }
  }, [game.status]);

  useEffect(() => {
    if (game.status === 'playing') {
      setShowModal(false);
      return;
    }

    setShowModal(false);
    const delayMs = game.status === 'lost' ? 500 : 1000;
    const timer = setTimeout(() => setShowModal(true), delayMs);
    return () => clearTimeout(timer);
  }, [game.status]);

  return (
    <>
      {route === 'home' ? (
        <HomeScreen
          stats={game.stats}
          selectedModeId={selectedModeId}
          onSelectMode={modeId => setSelectedModeId(modeId as AppRoute)}
          onOpenHelp={() => setShowHomeInfo(true)}
          onOpenSettings={() => setShowHomeSettings(true)}
          onStartMode={modeId => {
            if (modeId === 'daily-wordle') {
              setRoute('daily-wordle');
            }
          }}
        />
      ) : (
        <DailyWordleScreen
          game={game}
          onBack={() => setRoute('home')}
          setShowHelp={setShowHelp}
          setShowStats={setShowStats}
          showModal={showModal}
          setShowModal={setShowModal}
        />
      )}

      <HelpModal visible={showHelp} onClose={() => setShowHelp(false)} />
      <HomeInfoModal visible={showHomeInfo} onClose={() => setShowHomeInfo(false)} />
      <HomeSettingsModal visible={showHomeSettings} onClose={() => setShowHomeSettings(false)} />
      <StatsModal visible={showStats} stats={game.stats} onClose={() => setShowStats(false)} />
    </>
  );
}
