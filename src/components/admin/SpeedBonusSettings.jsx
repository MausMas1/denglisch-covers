import { motion } from 'framer-motion';
import { Medal, Trophy } from 'lucide-react';
import { useGame } from '../../context/GameContext';

function SpeedBonusSettings() {
    const { gameState, updateGameState } = useGame();

    const speedEnabled = gameState.speedBonusEnabled ?? true;
    const goldBonus = gameState.speedBonusGold ?? 3;
    const silverBonus = gameState.speedBonusSilver ?? 2;
    const bronzeBonus = gameState.speedBonusBronze ?? 1;

    const handleToggle = () => {
        updateGameState({ speedBonusEnabled: !speedEnabled });
    };

    const handleChange = (field, value) => {
        const numValue = Math.max(0, parseInt(value) || 0);
        updateGameState({ [field]: numValue });
    };

    return (
        <div className="glass rounded-xl p-4 border border-christmas-gold/20">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Medal className="text-christmas-gold" size={20} />
                    <span className="text-white font-medium">Snelheidsbonus</span>
                </div>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggle}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${speedEnabled
                        ? 'bg-christmas-green text-white'
                        : 'bg-gray-700 text-gray-400'
                        }`}
                >
                    {speedEnabled ? 'Aan' : 'Uit'}
                </motion.button>
            </div>

            {speedEnabled && (
                <div className="space-y-3">
                    <p className="text-snow/60 text-xs mb-3">
                        Bonuspunten voor de snelste correcte antwoorden
                    </p>

                    {/* Gold */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🥇</span>
                            <span className="text-snow/80 text-sm">Goud (1e)</span>
                        </div>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={goldBonus === 0 ? '' : goldBonus}
                            onChange={(e) => handleChange('speedBonusGold', e.target.value)}
                            onBlur={(e) => !e.target.value && handleChange('speedBonusGold', '0')}
                            placeholder="0"
                            className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-center"
                        />
                    </div>

                    {/* Silver */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🥈</span>
                            <span className="text-snow/80 text-sm">Zilver (2e)</span>
                        </div>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={silverBonus === 0 ? '' : silverBonus}
                            onChange={(e) => handleChange('speedBonusSilver', e.target.value)}
                            onBlur={(e) => !e.target.value && handleChange('speedBonusSilver', '0')}
                            placeholder="0"
                            className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-center"
                        />
                    </div>

                    {/* Bronze */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🥉</span>
                            <span className="text-snow/80 text-sm">Brons (3e)</span>
                        </div>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={bronzeBonus === 0 ? '' : bronzeBonus}
                            onChange={(e) => handleChange('speedBonusBronze', e.target.value)}
                            onBlur={(e) => !e.target.value && handleChange('speedBonusBronze', '0')}
                            placeholder="0"
                            className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-center"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default SpeedBonusSettings;
