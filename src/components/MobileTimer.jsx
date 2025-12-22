import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useGame } from '../context/GameContext';

function MobileTimer() {
    const { gameState } = useGame();
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!gameState.timerActive || !gameState.timerEndTime) {
            setTimeLeft(null);
            return;
        }

        const updateTimer = () => {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((gameState.timerEndTime - now) / 1000));
            setTimeLeft(remaining);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 100);

        return () => clearInterval(interval);
    }, [gameState.timerActive, gameState.timerEndTime]);

    if (timeLeft === null || gameState.isRevealed) return null;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
    };

    const isUrgent = timeLeft <= 10;
    const percentage = gameState.timerDuration > 0
        ? (timeLeft / gameState.timerDuration) * 100
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-xl p-3 mb-4 border ${isUrgent ? 'border-red-500/50' : 'border-christmas-gold/30'}`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <motion.div
                        animate={{ rotate: isUrgent ? [0, 10, -10, 0] : 0 }}
                        transition={{ duration: 0.3, repeat: isUrgent ? Infinity : 0 }}
                    >
                        <Clock size={16} className={isUrgent ? 'text-red-400' : 'text-christmas-gold'} />
                    </motion.div>
                    <span className="text-snow/60 text-xs">Resterende tijd</span>
                </div>
                <motion.span
                    key={timeLeft}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className={`font-bold text-lg tabular-nums ${isUrgent ? 'text-red-400' : 'text-christmas-gold'}`}
                >
                    {formatTime(timeLeft)}
                </motion.span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${isUrgent ? 'bg-red-400' : 'bg-christmas-gold'}`}
                    initial={false}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </motion.div>
    );
}

export default MobileTimer;
