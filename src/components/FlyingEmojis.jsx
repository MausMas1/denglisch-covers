import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { ref, onChildAdded, remove, query, orderByChild, startAt } from 'firebase/database';

function FlyingEmojis() {
    const [emojis, setEmojis] = useState([]);

    useEffect(() => {
        // Only listen for new reactions (from now)
        const startTime = Date.now();
        const reactionsRef = ref(db, 'emojiReactions');

        const unsubscribe = onChildAdded(reactionsRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.timestamp > startTime - 1000) {
                const id = snapshot.key;

                // Pick random side: left (5-20%) or right (80-95%)
                const isLeft = Math.random() > 0.5;
                const xPosition = isLeft
                    ? 5 + Math.random() * 15  // 5-20% from left
                    : 80 + Math.random() * 15; // 80-95% from left

                const newEmoji = {
                    id,
                    emoji: data.emoji,
                    team: data.team,
                    x: xPosition,
                    rotation: -30 + Math.random() * 60, // Random rotation
                    duration: 3 + Math.random() * 2, // 3-5 seconds fall time
                };

                setEmojis(prev => [...prev, newEmoji]);

                // Remove from state after animation
                setTimeout(() => {
                    setEmojis(prev => prev.filter(e => e.id !== id));
                    // Clean up from Firebase
                    remove(ref(db, `emojiReactions/${id}`));
                }, newEmoji.duration * 1000);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
            <AnimatePresence>
                {emojis.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={{
                            top: '-80px',
                            left: `${item.x}%`,
                            rotate: item.rotation,
                            scale: 0.5,
                            opacity: 0
                        }}
                        animate={{
                            top: '110%',
                            rotate: item.rotation + 360,
                            scale: 1,
                            opacity: 1
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: item.duration,
                            ease: 'linear'
                        }}
                        className="absolute text-6xl md:text-7xl drop-shadow-lg"
                        style={{
                            textShadow: '0 4px 12px rgba(0,0,0,0.4)',
                            filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
                        }}
                    >
                        {item.emoji}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

export default FlyingEmojis;
