import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

function TeamPopups({ songId }) {
    const [recentAnswers, setRecentAnswers] = useState([]);

    useEffect(() => {
        if (!songId) return;

        const answersRef = ref(db, `answers/${songId}`);

        const unsubscribe = onValue(answersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const answers = Object.entries(data).map(([teamName, answer]) => ({
                    teamName,
                    ...answer,
                }));

                // Sort by submission time, most recent first
                answers.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));

                // Only show teams that submitted recently (within last 10 seconds for popup)
                const now = Date.now();
                const recent = answers.filter(a =>
                    a.submittedAt && (now - a.submittedAt) < 10000
                );

                setRecentAnswers(recent);
            }
        });

        return () => unsubscribe();
    }, [songId]);

    return (
        <div className="fixed top-24 left-6 z-40 space-y-3">
            <AnimatePresence mode="popLayout">
                {recentAnswers.map((answer, index) => (
                    <motion.div
                        key={answer.teamName}
                        initial={{ opacity: 0, x: -100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -50, scale: 0.8 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                            delay: index * 0.1
                        }}
                        className="glass rounded-xl p-3 pr-4 flex items-center gap-3 border border-christmas-green/50"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                        >
                            <CheckCircle className="text-christmas-green" size={24} />
                        </motion.div>
                        <div>
                            <p className="text-white font-medium">{answer.teamName}</p>
                            <p className="text-snow/60 text-xs">heeft geantwoord!</p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

export default TeamPopups;
