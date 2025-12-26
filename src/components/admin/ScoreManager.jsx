import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trophy, Trash2, Edit2, UserPlus, RotateCcw, Check, X } from 'lucide-react';
import { useGame } from '../../context/GameContext';

function ScoreManager() {
    const { gameState, updateScore, addTeam, removeTeam, renameTeam, toggleTurtleMode, resetScores } = useGame();
    const teams = gameState.teams || [];

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [showAddTeam, setShowAddTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');

    // Sort teams by score
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

    const handleStartEdit = (team) => {
        setEditingId(team.id);
        setEditName(team.name);
    };

    const handleSaveEdit = async () => {
        if (editName.trim() && editingId) {
            await renameTeam(editingId, editName.trim());
        }
        setEditingId(null);
        setEditName('');
    };

    const handleAddTeam = async () => {
        if (newTeamName.trim()) {
            await addTeam(newTeamName.trim());
            setNewTeamName('');
            setShowAddTeam(false);
        }
    };

    const handleRemoveTeam = async (teamId, teamName) => {
        // Using window.confirm with a small delay to avoid event issues
        setTimeout(async () => {
            if (window.confirm(`Team "${teamName}" verwijderen?`)) {
                await removeTeam(teamId);
            }
        }, 10);
    };

    const handleResetScores = async () => {
        if (confirm('Alle scores op 0 zetten?')) {
            await resetScores();
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <Trophy size={16} className="text-christmas-gold" />
                    Teams & Scores
                </h3>
                <div className="flex gap-1">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleResetScores}
                        className="p-1.5 bg-gray-700 rounded-lg hover:bg-gray-600 text-gray-400 hover:text-white"
                        title="Reset scores"
                    >
                        <RotateCcw size={14} />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowAddTeam(true)}
                        className="p-1.5 bg-christmas-green rounded-lg hover:bg-green-600 text-white"
                        title="Team toevoegen"
                    >
                        <UserPlus size={14} />
                    </motion.button>
                </div>
            </div>

            {/* Add Team Form */}
            <AnimatePresence>
                {showAddTeam && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-800 rounded-xl p-3 flex gap-2"
                    >
                        <input
                            type="text"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
                            placeholder="Teamnaam..."
                            className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-christmas-gold"
                            autoFocus
                        />
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleAddTeam}
                            className="p-2 bg-christmas-green rounded-lg text-white"
                        >
                            <Check size={16} />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { setShowAddTeam(false); setNewTeamName(''); }}
                            className="p-2 bg-gray-700 rounded-lg text-gray-400"
                        >
                            <X size={16} />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Teams List */}
            {sortedTeams.map((team, index) => (
                <motion.div
                    key={team.id}
                    layout
                    className="bg-gray-800 rounded-xl p-3"
                >
                    {editingId === team.id ? (
                        // Edit mode
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                                className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-christmas-gold"
                                autoFocus
                            />
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleSaveEdit}
                                className="p-2 bg-christmas-green rounded-lg text-white"
                            >
                                <Check size={16} />
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setEditingId(null)}
                                className="p-2 bg-gray-700 rounded-lg text-gray-400"
                            >
                                <X size={16} />
                            </motion.button>
                        </div>
                    ) : (
                        // Display mode - stacked layout for mobile
                        <div className="space-y-2">
                            {/* Team name row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {index === 0 && team.score > 0 && (
                                        <span className="text-sm flex-shrink-0">👑</span>
                                    )}
                                    <span className="text-white font-medium truncate">{team.name}</span>
                                    {team.turtleMode && (
                                        <span className="text-sm flex-shrink-0">🐢</span>
                                    )}
                                </div>
                                {/* Action buttons - compact */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleStartEdit(team)}
                                        className="p-1.5 text-gray-500 hover:text-white"
                                        title="Naam bewerken"
                                    >
                                        <Edit2 size={14} />
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => toggleTurtleMode(team.id)}
                                        className={`p-1 text-sm rounded ${team.turtleMode ? 'text-green-400 bg-green-400/20' : 'text-gray-500 hover:text-green-400'}`}
                                        title={team.turtleMode ? "Schildpad uit" : "Schildpad aan"}
                                    >
                                        🐢
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleRemoveTeam(team.id, team.name)}
                                        className="p-1.5 text-gray-500 hover:text-red-400"
                                        title="Verwijderen"
                                    >
                                        <Trash2 size={14} />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Score controls row */}
                            <div className="flex items-center justify-center gap-3">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateScore(team.id, -1)}
                                    className="w-10 h-10 flex items-center justify-center bg-christmas-red rounded-lg text-white hover:bg-red-600 active:bg-red-700"
                                >
                                    <Minus size={20} />
                                </motion.button>

                                <motion.span
                                    key={team.score}
                                    initial={{ scale: 1.3 }}
                                    animate={{ scale: 1 }}
                                    className="w-14 text-center text-2xl font-bold text-christmas-gold"
                                >
                                    {team.score}
                                </motion.span>

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateScore(team.id, 1)}
                                    className="w-10 h-10 flex items-center justify-center bg-christmas-green rounded-lg text-white hover:bg-green-600 active:bg-green-700"
                                >
                                    <Plus size={20} />
                                </motion.button>
                            </div>
                        </div>
                    )}
                </motion.div>
            ))}

            {teams.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                    Geen teams. Voeg een team toe!
                </div>
            )}
        </div>
    );
}

export default ScoreManager;
