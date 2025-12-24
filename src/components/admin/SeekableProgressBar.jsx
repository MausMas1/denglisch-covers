import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase';
import { ref, onValue, set } from 'firebase/database';

function SeekableProgressBar() {
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [localProgress, setLocalProgress] = useState(0); // Local state during drag
    const barRef = useRef(null);
    const lastSeekRef = useRef(0);

    // Listen to audio state from Firebase (broadcasted by Display)
    useEffect(() => {
        const progressRef = ref(db, 'audioProgress');
        const durationRef = ref(db, 'audioDuration');
        const currentTimeRef = ref(db, 'audioCurrentTime');

        const unsubProgress = onValue(progressRef, (snapshot) => {
            const val = snapshot.val();
            // Only update if not dragging AND not recently seeked (1.5s cooldown)
            if (val !== null && !isDragging && Date.now() - lastSeekRef.current > 1500) {
                setProgress(val);
                setLocalProgress(val);
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
            // Only update if not dragging AND not recently seeked
            if (val !== null && !isDragging && Date.now() - lastSeekRef.current > 1500) {
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
        lastSeekRef.current = Date.now();
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

        // Update local state immediately for smooth UI
        setLocalProgress(percent * 100);
        setCurrentTime(newTime);

        return newTime;
    }, [duration]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        const newTime = handleSeek(e.clientX);
        if (newTime !== undefined) {
            sendSeekCommand(newTime);
        }
    };

    const handleMouseMove = useCallback((e) => {
        if (isDragging) {
            handleSeek(e.clientX);
        }
    }, [isDragging, handleSeek]);

    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            // Send final seek command on release
            const finalTime = (localProgress / 100) * duration;
            sendSeekCommand(finalTime);
            setProgress(localProgress);
        }
        setIsDragging(false);
    }, [isDragging, localProgress, duration, sendSeekCommand]);

    // Touch support
    const handleTouchStart = (e) => {
        setIsDragging(true);
        const newTime = handleSeek(e.touches[0].clientX);
        if (newTime !== undefined) {
            sendSeekCommand(newTime);
        }
    };

    const handleTouchMove = useCallback((e) => {
        if (isDragging) {
            handleSeek(e.touches[0].clientX);
        }
    }, [isDragging, handleSeek]);

    const handleTouchEnd = useCallback(() => {
        if (isDragging) {
            const finalTime = (localProgress / 100) * duration;
            sendSeekCommand(finalTime);
            setProgress(localProgress);
        }
        setIsDragging(false);
    }, [isDragging, localProgress, duration, sendSeekCommand]);

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

    // Display localProgress during drag, otherwise use synced progress
    const displayProgress = isDragging ? localProgress : progress;

    return (
        <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </div>

            <div
                ref={barRef}
                className="relative h-8 bg-gray-700 rounded-full cursor-pointer group touch-none"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                {/* Progress fill */}
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-christmas-red via-christmas-gold to-christmas-green rounded-full"
                    style={{ width: `${displayProgress}%` }}
                />

                {/* Draggable handle - always visible */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full shadow-lg border-2 border-christmas-gold cursor-grab active:cursor-grabbing"
                    style={{ left: `calc(${displayProgress}% - 14px)` }}
                    animate={{ scale: isDragging ? 1.3 : 1 }}
                />
            </div>

            <p className="text-xs text-gray-500 mt-2 text-center">
                Sleep om naar een ander punt te gaan
            </p>
        </div>
    );
}

export default SeekableProgressBar;

