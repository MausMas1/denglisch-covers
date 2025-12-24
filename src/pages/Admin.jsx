import { motion } from 'framer-motion';
import { Wifi, WifiOff, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import SongCard from '../components/admin/SongCard';
import PlaybackControls from '../components/admin/PlaybackControls';
import GameControls from '../components/admin/GameControls';
import SongSelector from '../components/admin/SongSelector';
import ScoreManager from '../components/admin/ScoreManager';
import AnswersPanel from '../components/admin/AnswersPanel';
import SeekableProgressBar from '../components/admin/SeekableProgressBar';
import PointsSettings from '../components/admin/PointsSettings';
import ResetControls from '../components/admin/ResetControls';
import SongManager from '../components/admin/SongManager';
import EnableDisplayButton from '../components/admin/EnableDisplayButton';
import TimerSettings from '../components/admin/TimerSettings';
import AccessCodeSettings from '../components/admin/AccessCodeSettings';
import QRCodeToggle from '../components/admin/QRCodeToggle';
import SpeedBonusSettings from '../components/admin/SpeedBonusSettings';
import LeaderControls from '../components/admin/LeaderControls';
import InterimControls from '../components/admin/InterimControls';
import FinalControls from '../components/admin/FinalControls';
import AnswerHistory from '../components/admin/AnswerHistory';

function Admin() {
    const { isConnected, currentSong } = useGame();

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3">
                <div className="flex items-center justify-between">
                    <Link to="/">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                        >
                            <Home size={20} />
                        </motion.button>
                    </Link>

                    <h1 className="text-lg font-bold text-gradient">🎵 Denglisch Controller</h1>

                    <div className="flex items-center gap-2">
                        {isConnected ? (
                            <div className="flex items-center gap-1 text-christmas-green text-sm">
                                <Wifi size={16} />
                                <span>Live</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-red-500 text-sm">
                                <WifiOff size={16} />
                                <span>Offline</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-4 py-6 space-y-6 pb-20">
                {/* Current Song */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Huidig Nummer
                    </h2>
                    <SongCard />
                </section>

                {/* Enable TV Audio Button */}
                <section className="flex gap-3">
                    <EnableDisplayButton />
                    <QRCodeToggle />
                </section>

                {/* Seekable Audio Progress */}
                <section>
                    <SeekableProgressBar />
                </section>

                {/* Playback Controls */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Afspelen
                    </h2>
                    <PlaybackControls />
                </section>

                {/* Game Controls (Reveal/Lyrics/Next) */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Spelverloop
                    </h2>
                    <GameControls />
                </section>

                {/* Incoming Answers Panel - directly under reveal */}
                <section className="bg-gray-800/50 rounded-2xl p-4 border border-christmas-gold/20">
                    <AnswersPanel songId={currentSong?.id} songTitle={currentSong?.titleOriginal} />
                </section>

                {/* Timer Settings - under answers */}
                <section>
                    <TimerSettings />
                </section>

                {/* Points Settings */}
                <section>
                    <PointsSettings />
                </section>

                {/* Speed Bonus Settings */}
                <section>
                    <SpeedBonusSettings />
                </section>

                {/* Score Manager */}
                <section className="bg-gray-800/50 rounded-2xl p-4">
                    <ScoreManager />
                </section>

                {/* Answer History */}
                <section>
                    <AnswerHistory />
                </section>

                {/* Song Selector */}
                <section className="bg-gray-800/50 rounded-2xl p-4">
                    <SongSelector />
                </section>

                {/* Leader Song / Opening */}
                <section>
                    <LeaderControls />
                </section>

                {/* Interim Standings & Score Visibility */}
                <section>
                    <InterimControls />
                </section>

                {/* Final Standings Reveal */}
                <section>
                    <FinalControls />
                </section>

                {/* Reset Controls */}
                <section>
                    <ResetControls />
                </section>

                {/* Song Manager */}
                <section>
                    <SongManager />
                </section>

                {/* Access Code Settings */}
                <section>
                    <AccessCodeSettings />
                </section>
            </main>
        </div>
    );
}

export default Admin;
