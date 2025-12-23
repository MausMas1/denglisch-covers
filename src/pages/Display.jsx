import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Music, Trophy } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { db } from '../firebase';
import { ref, set, onValue } from 'firebase/database';
import Snowfall from '../components/Snowfall';
import ChristmasLights from '../components/ChristmasLights';
import ProgressBar from '../components/ProgressBar';
import Confetti from '../components/Confetti';
import Scoreboard from '../components/Scoreboard';
import TeamPopups from '../components/TeamPopups';
import LyricsDisplay from '../components/LyricsDisplay';
import FlyingEmojis from '../components/FlyingEmojis';
import TypingIndicators from '../components/TypingIndicators';
import CountdownTimer from '../components/CountdownTimer';
import StatisticsOverlay from '../components/StatisticsOverlay';
import DisplayQRCode from '../components/DisplayQRCode';

function Display() {
    const { gameState, currentSong, audioRef, getActiveAudioUrl } = useGame();
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [wasRevealed, setWasRevealed] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [displayedSong, setDisplayedSong] = useState(null);
    const [currentAudioUrl, setCurrentAudioUrl] = useState('');
    const [showAwardPopup, setShowAwardPopup] = useState(false);
    const [remoteAudioRequest, setRemoteAudioRequest] = useState(false);
    const prevSongIdRef = useRef(null);
    const progressBroadcastRef = useRef(null);

    // Listen for remote audio activation from admin
    useEffect(() => {
        const enableRef = ref(db, 'enableDisplayAudio');
        const unsubscribe = onValue(enableRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.enabled && !audioEnabled) {
                // Check if request is recent (within 10 seconds)
                if (Date.now() - data.timestamp < 10000) {
                    setRemoteAudioRequest(true);
                }
            }
        });
        return () => unsubscribe();
    }, [audioEnabled]);

    // Handle song transitions
    useEffect(() => {
        if (!currentSong) return;

        if (displayedSong && currentSong.id !== displayedSong.id && wasRevealed) {
            setIsTransitioning(true);
            setTimeout(() => {
                setDisplayedSong(currentSong);
                setIsTransitioning(false);
            }, 300);
        } else if (!displayedSong || currentSong.id !== displayedSong.id) {
            setDisplayedSong(currentSong);
        }
    }, [currentSong?.id]);

    // Handle audio source
    useEffect(() => {
        if (!audioRef.current || !audioEnabled || !currentSong) return;

        const newUrl = getActiveAudioUrl(currentSong, gameState.isRevealed);
        const songChanged = prevSongIdRef.current !== currentSong.id;
        const urlChanged = newUrl !== currentAudioUrl;

        if (newUrl && (songChanged || urlChanged)) {
            const wasPlaying = !audioRef.current.paused;
            audioRef.current.src = newUrl;
            setCurrentAudioUrl(newUrl);
            prevSongIdRef.current = currentSong.id;

            if (gameState.isPlaying || wasPlaying) {
                audioRef.current.play().catch(console.error);
            }
        }
    }, [currentSong?.id, gameState.isRevealed, audioEnabled, getActiveAudioUrl]);

    // Handle play/pause with proper async handling to avoid race conditions
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audioEnabled) return;

        let cancelled = false;

        const handlePlayback = async () => {
            if (gameState.isPlaying) {
                // Ensure we have a source
                if (!audio.src && currentSong) {
                    const url = getActiveAudioUrl(currentSong, gameState.isRevealed);
                    if (url) {
                        audio.src = url;
                        setCurrentAudioUrl(url);
                        prevSongIdRef.current = currentSong.id;
                    }
                }

                // Only play if not cancelled and we have a source
                if (!cancelled && audio.src) {
                    try {
                        await audio.play();
                    } catch (err) {
                        // Ignore AbortError as it's expected when rapidly switching
                        if (err.name !== 'AbortError') {
                            console.error('Play failed:', err);
                        }
                    }
                }
            } else {
                audio.pause();
            }
        };

        handlePlayback();

        return () => {
            cancelled = true;
        };
    }, [gameState.isPlaying, audioEnabled, currentSong, gameState.isRevealed, getActiveAudioUrl]);

    // Trigger confetti on reveal
    useEffect(() => {
        console.log('Reveal effect triggered:', {
            isRevealed: gameState.isRevealed,
            wasRevealed,
            lastAwardedPoints: gameState.lastAwardedPoints
        });

        if (gameState.isRevealed && !wasRevealed) {
            setShowConfetti(true);
            setWasRevealed(true);
            console.log('Setting showAwardPopup, lastAwardedPoints:', gameState.lastAwardedPoints);
            // Show award popup if points were awarded
            if (gameState.lastAwardedPoints && Object.keys(gameState.lastAwardedPoints).length > 0) {
                console.log('SHOWING AWARD POPUP');
                setShowAwardPopup(true);
                setTimeout(() => setShowAwardPopup(false), 5000);
            }
            setTimeout(() => setShowConfetti(false), 5000);
        } else if (!gameState.isRevealed) {
            setWasRevealed(false);
        }
    }, [gameState.isRevealed, wasRevealed, gameState.lastAwardedPoints]);

    // Broadcast audio progress to Firebase for participants (throttled to 1x/sec)
    useEffect(() => {
        if (!audioEnabled) return;

        const broadcastProgress = () => {
            if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
                const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
                set(ref(db, 'audioProgress'), Math.round(progress));
                set(ref(db, 'audioDuration'), audioRef.current.duration);
                set(ref(db, 'audioCurrentTime'), audioRef.current.currentTime);
            }
        };

        // Throttle to 1 update per second instead of 60fps
        broadcastProgress();
        const intervalId = setInterval(broadcastProgress, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [audioEnabled, audioRef]);

    // Listen for seek commands from admin
    useEffect(() => {
        if (!audioEnabled) return;

        const seekRef = ref(db, 'seekCommand');
        const unsubscribe = onValue(seekRef, (snapshot) => {
            const seekData = snapshot.val();
            if (seekData && audioRef.current && audioRef.current.duration) {
                // Only process if timestamp is recent (within last 2 seconds)
                if (Date.now() - seekData.timestamp < 2000) {
                    audioRef.current.currentTime = seekData.time;
                }
            }
        });

        return () => unsubscribe();
    }, [audioEnabled, audioRef]);

    const handleEnableAudio = () => {
        console.log('Audio enabled by user click');
        setAudioEnabled(true);
        if (audioRef.current && currentSong) {
            const url = getActiveAudioUrl(currentSong, gameState.isRevealed);
            console.log('Setting audio source:', url, 'Song:', currentSong);
            if (url) {
                audioRef.current.src = url;
                setCurrentAudioUrl(url);
                prevSongIdRef.current = currentSong.id;

                // Auto-play if game is already playing
                if (gameState.isPlaying) {
                    console.log('Game is already playing, starting audio');
                    audioRef.current.play().catch(err => {
                        console.error('Failed to start audio:', err);
                    });
                }
            } else {
                console.warn('No audio URL found for song:', currentSong);
            }
        } else {
            console.warn('No audio ref or currentSong:', { hasRef: !!audioRef.current, currentSong });
        }
    };

    const getCoverUrl = () => {
        const song = displayedSong || currentSong;
        if (!song?.coverImage) return 'https://placehold.co/600x600/1a1a2e/f59e0b?text=🎵';
        if (song.coverImage.startsWith('/') || song.coverImage.startsWith('http')) {
            return song.coverImage;
        }
        return `/covers/${song.coverImage}`;
    };

    const shouldBlur = !gameState.isRevealed || isTransitioning;

    return (
        <div className="min-h-screen animated-gradient relative overflow-hidden">
            <Snowfall />
            <ChristmasLights />
            <Confetti isActive={showConfetti} />
            <FlyingEmojis />
            {!gameState.isRevealed && <TeamPopups songId={currentSong?.id} />}
            {!gameState.isRevealed && <TypingIndicators songId={currentSong?.id} />}
            {!gameState.isRevealed && <CountdownTimer />}
            <StatisticsOverlay />
            <DisplayQRCode />

            {/* Karaoke Lyrics Display - centered, adjusts for reveal */}
            {gameState.showLyrics && (
                (() => {
                    // Select correct lyrics file based on reveal state
                    const lyricsFile = gameState.isRevealed
                        ? currentSong?.lyricsFileDutch
                        : currentSong?.lyricsFileEnglish;

                    if (!lyricsFile) return null;

                    return (
                        <LyricsDisplay
                            lyricsFile={lyricsFile}
                            audioRef={audioRef}
                            isPlaying={gameState.isPlaying}
                            isRevealed={gameState.isRevealed}
                        />
                    );
                })()
            )}

            {/* Award Popup */}
            <AnimatePresence>
                {showAwardPopup && gameState.lastAwardedPoints && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-6 right-6 z-50"
                    >
                        <div className="glass rounded-2xl p-6 border-2 border-christmas-gold shadow-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <Trophy className="text-christmas-gold" size={32} />
                                <span className="text-2xl font-bold text-white">Punten Toegekend!</span>
                            </div>
                            <div className="space-y-2">
                                {Object.entries(gameState.lastAwardedPoints).map(([teamName, points], index) => (
                                    <motion.div
                                        key={teamName}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center justify-between gap-4 bg-christmas-green/20 rounded-xl px-4 py-2"
                                    >
                                        <span className="text-white font-medium">{teamName}</span>
                                        <span className="text-christmas-gold font-bold text-xl">+{points}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />

            {/* Click to start overlay */}
            <AnimatePresence>
                {!audioEnabled && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer"
                        onClick={handleEnableAudio}
                    >
                        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
                            <motion.div
                                animate={{
                                    scale: remoteAudioRequest ? [1, 1.3, 1] : [1, 1.1, 1],
                                    boxShadow: remoteAudioRequest
                                        ? ['0 0 20px #f59e0b', '0 0 60px #f59e0b', '0 0 20px #f59e0b']
                                        : undefined
                                }}
                                transition={{ duration: remoteAudioRequest ? 0.5 : 2, repeat: Infinity }}
                                className={`w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-christmas-gold to-christmas-gold-light rounded-full flex items-center justify-center shadow-lg neon-glow ${remoteAudioRequest ? 'ring-4 ring-christmas-gold' : ''}`}
                                style={{ color: '#f59e0b' }}
                            >
                                <Volume2 size={64} className="text-christmas-red-dark" />
                            </motion.div>
                            <h2 className="text-4xl font-bold text-white mb-4 neon-glow-gold">🎵 Denglisch Covers 🎵</h2>
                            {remoteAudioRequest ? (
                                <motion.p
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                    className="text-2xl text-christmas-gold font-bold"
                                >
                                    ⚡ KLIK NU OM TE STARTEN! ⚡
                                </motion.p>
                            ) : (
                                <p className="text-xl text-snow/70">Klik om te starten</p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 py-12">
                {/* Genre Badge */}
                <AnimatePresence>
                    {!gameState.isRevealed && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-8"
                        >
                            <div className="glass px-6 py-3 rounded-full border border-christmas-gold/30">
                                <div className="flex items-center gap-3">
                                    <Music className="text-christmas-gold" size={24} />
                                    <span className="text-xl font-bold text-gradient">
                                        {(displayedSong || currentSong)?.genre}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Cover Image + Title Container */}
                <motion.div
                    layout
                    className="flex flex-col items-center mb-8"
                    animate={{ opacity: isTransitioning ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Cover Image */}
                    <motion.div
                        layout
                        className={`w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl border-4 transition-all duration-500 ${gameState.isRevealed ? 'border-christmas-gold neon-glow' : 'border-christmas-gold/30'
                            }`}
                        style={{
                            filter: shouldBlur ? 'blur(20px) brightness(0.7)' : 'blur(0) brightness(1)',
                            transform: shouldBlur ? 'scale(1.1)' : 'scale(1)',
                            color: '#f59e0b',
                        }}
                    >
                        <img
                            src={getCoverUrl()}
                            alt="Album Cover"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://placehold.co/600x600/1a1a2e/f59e0b?text=🎵'; }}
                        />
                    </motion.div>

                    {/* Playing indicator - fixed at bottom to not overlap lyrics */}
                    <AnimatePresence>
                        {gameState.isPlaying && !gameState.isRevealed && !isTransitioning && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10"
                            >
                                <div className="glass px-4 py-2 rounded-full flex items-center gap-2 border border-blue-500/30">
                                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                                    <span className="text-snow text-sm font-medium">🇬🇧 Speelt af...</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Title and Artist on reveal */}
                    <AnimatePresence>
                        {gameState.isRevealed && !isTransitioning && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
                                className="text-center mt-6"
                            >
                                <motion.h1
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className="text-4xl md:text-6xl font-bold text-gradient mb-3"
                                >
                                    {(displayedSong || currentSong)?.titleOriginal}
                                </motion.h1>
                                <motion.h2
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                    className="text-2xl md:text-3xl text-snow/90"
                                >
                                    {(displayedSong || currentSong)?.artistOriginal}
                                </motion.h2>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7, duration: 0.4 }}
                                    className="mt-4 flex items-center justify-center gap-3"
                                >
                                    <span className="text-3xl">🇳🇱</span>
                                    <span className="text-xl text-christmas-gold font-medium neon-glow-gold">Zing mee!</span>
                                    <span className="text-3xl">🎤</span>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Progress Bar */}
                {audioEnabled && (
                    <div className="w-full max-w-md mb-6">
                        <ProgressBar audioRef={audioRef} />
                    </div>
                )}




            </div>

            <Scoreboard currentSongId={currentSong?.id} />
        </div>
    );
}

export default Display;
