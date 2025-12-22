import { useEffect, useRef, useState } from 'react';

function AudioVisualizer({ isPlaying, audioRef }) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const analyzerRef = useRef(null);
    const audioContextRef = useRef(null);
    const sourceRef = useRef(null);
    const [isSetup, setIsSetup] = useState(false);

    useEffect(() => {
        if (!audioRef?.current || isSetup) return;

        const setupAudio = () => {
            if (audioContextRef.current) return;

            try {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                analyzerRef.current = audioContextRef.current.createAnalyser();
                analyzerRef.current.fftSize = 256;

                sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
                sourceRef.current.connect(analyzerRef.current);
                analyzerRef.current.connect(audioContextRef.current.destination);

                setIsSetup(true);
            } catch (error) {
                console.error('Failed to setup audio context:', error);
            }
        };

        audioRef.current.addEventListener('play', setupAudio, { once: true });

        return () => {
            audioRef.current?.removeEventListener('play', setupAudio);
        };
    }, [audioRef, isSetup]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const bufferLength = analyzerRef.current?.frequencyBinCount || 128;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;

            if (analyzerRef.current && isPlaying) {
                analyzerRef.current.getByteFrequencyData(dataArray);
            }

            // Clear canvas
            ctx.fillStyle = 'rgba(26, 26, 46, 0.3)';
            ctx.fillRect(0, 0, width, height);

            const barCount = 64;
            const barWidth = width / barCount;
            const gap = 2;

            for (let i = 0; i < barCount; i++) {
                const dataIndex = Math.floor(i * bufferLength / barCount);
                let barHeight;

                if (isPlaying && analyzerRef.current) {
                    barHeight = (dataArray[dataIndex] / 255) * height * 0.8;
                } else {
                    // Idle animation
                    barHeight = (Math.sin(Date.now() / 500 + i * 0.2) + 1) * 0.5 * height * 0.3;
                }

                // Christmas gradient
                const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
                gradient.addColorStop(0, '#f59e0b'); // Gold
                gradient.addColorStop(0.5, '#b91c1c'); // Red
                gradient.addColorStop(1, '#166534'); // Green

                ctx.fillStyle = gradient;
                ctx.fillRect(
                    i * barWidth + gap / 2,
                    height - barHeight,
                    barWidth - gap,
                    barHeight
                );

                // Add glow effect
                ctx.shadowColor = '#f59e0b';
                ctx.shadowBlur = 10;
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying]);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={200}
            className="w-full h-32 md:h-48 rounded-2xl"
        />
    );
}

export default AudioVisualizer;
