import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function ProgressBar({ audioRef }) {
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const animationRef = useRef(null);

    useEffect(() => {
        const audio = audioRef?.current;
        if (!audio) return;

        const updateProgress = () => {
            if (audio.duration && !isNaN(audio.duration)) {
                setProgress((audio.currentTime / audio.duration) * 100);
                setCurrentTime(audio.currentTime);
                setDuration(audio.duration);
            }
            animationRef.current = requestAnimationFrame(updateProgress);
        };

        updateProgress();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [audioRef]);

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Time display */}
            <div className="flex justify-between text-sm text-snow/60 mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </div>

            {/* Progress bar container */}
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                {/* Progress fill */}
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-christmas-red via-christmas-gold to-christmas-green rounded-full"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                />

                {/* Glow effect */}
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-christmas-red via-christmas-gold to-christmas-green rounded-full blur-sm opacity-50"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

export default ProgressBar;
