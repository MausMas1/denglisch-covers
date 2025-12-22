import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LyricsDisplay - Shows synchronized lyrics karaoke-style
 * 
 * Expects lyrics file in format:
 * {
 *   "lyrics": [
 *     { "time": 0.0, "text": "First line..." },
 *     { "time": 4.5, "text": "Second line..." }
 *   ]
 * }
 */
function LyricsDisplay({ lyricsFile, audioRef, isPlaying, isRevealed }) {
    const [lyrics, setLyrics] = useState([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(-1);
    const animationRef = useRef(null);

    // Load lyrics file
    useEffect(() => {
        if (!lyricsFile) {
            setLyrics([]);
            setCurrentLineIndex(-1);
            return;
        }

        const loadLyrics = async () => {
            try {
                const response = await fetch(`${import.meta.env.BASE_URL}lyrics/${lyricsFile}`);
                if (response.ok) {
                    const data = await response.json();
                    setLyrics(data.lyrics || []);
                    setCurrentLineIndex(-1);
                }
            } catch (error) {
                console.error('Failed to load lyrics:', error);
                setLyrics([]);
            }
        };

        loadLyrics();
    }, [lyricsFile]);

    // Sync with audio playback
    useEffect(() => {
        if (!audioRef?.current || lyrics.length === 0 || !isPlaying) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            return;
        }

        const syncLyrics = () => {
            const currentTime = audioRef.current?.currentTime || 0;

            // Find the current line based on time
            let newIndex = -1;
            for (let i = lyrics.length - 1; i >= 0; i--) {
                if (currentTime >= lyrics[i].time) {
                    newIndex = i;
                    break;
                }
            }

            if (newIndex !== currentLineIndex) {
                setCurrentLineIndex(newIndex);
            }

            animationRef.current = requestAnimationFrame(syncLyrics);
        };

        syncLyrics();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [audioRef, lyrics, isPlaying, currentLineIndex]);

    // Reset when not playing
    useEffect(() => {
        if (!isPlaying) {
            setCurrentLineIndex(-1);
        }
    }, [isPlaying]);

    if (lyrics.length === 0 || currentLineIndex < 0) {
        return null;
    }

    const currentLine = lyrics[currentLineIndex];
    const nextLine = lyrics[currentLineIndex + 1];

    // During reveal: position above visualizer with background. During quiz: position higher up
    const positionClasses = isRevealed
        ? "absolute bottom-40 left-0 right-0 flex flex-col items-center pointer-events-none z-30"
        : "absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 pb-32";

    return (
        <div className={positionClasses}>
            <div className={`max-w-4xl w-full px-8 text-center ${!isRevealed ? '-mt-20' : ''}`}>
                {/* Glass background for revealed lyrics */}
                <div className={isRevealed ? "bg-black/60 backdrop-blur-sm rounded-2xl px-6 py-4 mx-auto inline-block" : ""}>
                    {/* Current Line */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentLineIndex}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 1.1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="mb-2"
                        >
                            <p className={`font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] leading-tight ${isRevealed ? 'text-2xl md:text-3xl lg:text-4xl' : 'text-4xl md:text-5xl lg:text-6xl'}`}>
                                {currentLine?.text}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Next Line Preview */}
                    {nextLine && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            className={`text-white/50 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${isRevealed ? 'text-base md:text-lg' : 'text-xl md:text-2xl'}`}
                        >
                            {nextLine.text}
                        </motion.p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LyricsDisplay;
