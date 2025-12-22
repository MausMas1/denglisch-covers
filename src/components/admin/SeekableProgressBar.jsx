import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { ref, onValue, set } from 'firebase/database';

function SeekableProgressBar() {
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const barRef = useRef(null);

    // Listen to audio state from Firebase (broadcasted by Display)
    useEffect(() => {
        const progressRef = ref(db, 'audioProgress');
        const durationRef = ref(db, 'audioDuration');
        const currentTimeRef = ref(db, 'audioCurrentTime');

        const unsubProgress = onValue(progressRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null && !isDragging) {
                setProgress(val);
            }
        });

        const unsubDuration = onValue(durationRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null) {
                setDuration(val);
            }
        });

        const unsubCurrentTime = onValue(currentTimeRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null && !isDragging) {
                setCurrentTime(val);
            }
        });

        return () => {
            unsubProgress();
            unsubDuration();
            unsubCurrentTime();
        };
    }, [isDragging]);

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const sendSeekCommand = useCallback((newTime) => {
        // Send seek command to Display via Firebase
        set(ref(db, 'seekCommand'), {
            time: newTime,
            timestamp: Date.now()
        });
    }, []);

    const handleSeek = useCallback((clientX) => {
        if (!barRef.current || duration === 0) return;

        const rect = barRef.current.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const newTime = percent * duration;

        setProgress(percent * 100);
        setCurrentTime(newTime);
        sendSeekCommand(newTime);
    }, [duration, sendSeekCommand]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        handleSeek(e.clientX);
    };

    const handleMouseMove = useCallback((e) => {
        if (isDragging) {
            handleSeek(e.clientX);
        }
    }, [isDragging, handleSeek]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Touch support
    const handleTouchStart = (e) => {
        setIsDragging(true);
        handleSeek(e.touches[0].clientX);
    };

    const handleTouchMove = useCallback((e) => {
        if (isDragging) {
            handleSeek(e.touches[0].clientX);
        }
    }, [isDragging, handleSeek]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleTouchEnd);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    return (
        <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </div>

            <div
                ref={barRef}
                className="relative h-6 bg-gray-700 rounded-full cursor-pointer group"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                {/* Progress fill */}
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-christmas-red via-christmas-gold to-christmas-green rounded-full"
                    style={{ width: `${progress}%` }}
                />

                {/* Draggable handle - always visible */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-christmas-gold cursor-grab active:cursor-grabbing"
                    style={{ left: `calc(${progress}% - 12px)` }}
                    animate={{ scale: isDragging ? 1.2 : 1 }}
                />
            </div>

            <p className="text-xs text-gray-500 mt-2 text-center">
                Klik of sleep om naar een ander punt te gaan
            </p>
        </div>
    );
}

export default SeekableProgressBar;
