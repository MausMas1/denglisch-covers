import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useGame } from '../context/GameContext';

function CountdownTimer({ onTimeUp }) {
    const { gameState } = useGame();
    const [timeLeft, setTimeLeft] = useState(null);
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        if (!gameState.timerActive || !gameState.timerEndTime) {
            setTimeLeft(null);
            return;
        }

        const updateTimer = () => {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((gameState.timerEndTime - now) / 1000));
            setTimeLeft(remaining);
            setIsUrgent(remaining <= 10);

            if (remaining === 0 && onTimeUp) {
                onTimeUp();
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 100);

        return () => clearInterval(interval);
    }, [gameState.timerActive, gameState.timerEndTime, onTimeUp]);

    if (timeLeft === null || gameState.isRevealed) return null;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}`;
    };

    const percentage = gameState.timerDuration > 0
        ? (timeLeft / gameState.timerDuration) * 100
        : 0;

    return (
        <AnimatePresence>
            {timeLeft !== null && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="fixed top-32 right-6 z-50"
                >
                    <motion.div
                        animate={{
                            scale: isUrgent ? [1, 1.05, 1] : 1,
                            borderColor: isUrgent ? ['#ef4444', '#f97316', '#ef4444'] : '#f59e0b'
                        }}
                        transition={{ duration: 0.5, repeat: isUrgent ? Infinity : 0 }}
                        className="glass rounded-2xl p-4 border-2 shadow-2xl min-w-[120px]"
                    >
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={{ rotate: isUrgent ? [0, 10, -10, 0] : 0 }}
                                transition={{ duration: 0.3, repeat: isUrgent ? Infinity : 0 }}
                            >
                                <Clock
                                    size={24}
                                    className={isUrgent ? 'text-red-400' : 'text-christmas-gold'}
                                />
                            </motion.div>
                            <motion.span
                                key={timeLeft}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className={`text-3xl font-bold tabular-nums ${isUrgent ? 'text-red-400' : 'text-white'
                                    }`}
                            >
                                {formatTime(timeLeft)}
                            </motion.span>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${isUrgent ? 'bg-red-400' : 'bg-christmas-gold'
                                    }`}
                                initial={false}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default CountdownTimer;
