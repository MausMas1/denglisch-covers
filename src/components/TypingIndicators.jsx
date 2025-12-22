import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

function TypingIndicators({ songId }) {
    const [typingTeams, setTypingTeams] = useState([]);

    useEffect(() => {
        if (!songId) return;

        const typingRef = ref(db, `typing/${songId}`);
        const unsubscribe = onValue(typingRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Filter out stale typing indicators (older than 5 seconds)
                const now = Date.now();
                const activeTeams = Object.entries(data)
                    .filter(([_, value]) => value.typing && (now - value.timestamp) < 5000)
                    .map(([teamName]) => teamName);
                setTypingTeams(activeTeams);
            } else {
                setTypingTeams([]);
            }
        });

        return () => unsubscribe();
    }, [songId]);

    if (typingTeams.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-20"
        >
            <div className="glass px-6 py-3 rounded-full border border-christmas-gold/30 shadow-xl">
                <div className="flex items-center gap-2">
                    {/* Typing animation dots */}
                    <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                                className="w-2 h-2 bg-christmas-gold rounded-full"
                            />
                        ))}
                    </div>
                    <span className="text-snow text-sm">
                        {typingTeams.length === 1 ? (
                            <><span className="text-christmas-gold font-bold">{typingTeams[0]}</span> is aan het typen...</>
                        ) : typingTeams.length <= 3 ? (
                            <><span className="text-christmas-gold font-bold">{typingTeams.join(', ')}</span> zijn aan het typen...</>
                        ) : (
                            <><span className="text-christmas-gold font-bold">{typingTeams.length} teams</span> zijn aan het typen...</>
                        )}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

export default TypingIndicators;
