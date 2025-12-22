import { motion } from 'framer-motion';
import { Clock, Play, Square } from 'lucide-react';
import { useGame } from '../../context/GameContext';

const TIMER_PRESETS = [
    { label: 'Uit', value: 0 },
    { label: '30s', value: 30 },
    { label: '45s', value: 45 },
    { label: '60s', value: 60 },
    { label: '90s', value: 90 },
];

function TimerSettings() {
    const { gameState, setTimerDuration, startTimer, stopTimer } = useGame();
    const timerActive = gameState.timerActive;
    const currentDuration = gameState.timerDuration || 0;

    return (
        <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-christmas-gold" />
                <span className="text-white font-medium text-sm">Antwoord Timer</span>
            </div>

            {/* Duration presets */}
            <div className="flex flex-wrap gap-2 mb-3">
                {TIMER_PRESETS.map((preset) => (
                    <motion.button
                        key={preset.value}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setTimerDuration(preset.value)}
                        disabled={timerActive}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentDuration === preset.value
                                ? 'bg-christmas-gold text-black'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            } ${timerActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {preset.label}
                    </motion.button>
                ))}
            </div>

            {/* Start/Stop buttons */}
            {currentDuration > 0 && (
                <div className="flex gap-2">
                    {!timerActive ? (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={startTimer}
                            className="flex items-center gap-2 px-4 py-2 bg-christmas-green rounded-lg text-white text-sm font-medium"
                        >
                            <Play size={14} />
                            <span>Start Timer</span>
                        </motion.button>
                    ) : (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={stopTimer}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg text-white text-sm font-medium"
                        >
                            <Square size={14} />
                            <span>Stop Timer</span>
                        </motion.button>
                    )}
                </div>
            )}

            {currentDuration === 0 && (
                <p className="text-gray-500 text-xs">
                    Selecteer een tijd om de timer in te schakelen
                </p>
            )}
        </div>
    );
}

export default TimerSettings;
