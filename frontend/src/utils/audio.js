export const playSound = (type = 'success') => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        
        if (type === 'success') {
            // First "Ting"
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(1200, ctx.currentTime);
            
            gain1.gain.setValueAtTime(0, ctx.currentTime);
            gain1.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
            gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.15);

            // Second "Ting"
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1600, ctx.currentTime + 0.15);
            
            gain2.gain.setValueAtTime(0, ctx.currentTime + 0.15);
            gain2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.17);
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            
            osc2.start(ctx.currentTime + 0.15);
            osc2.stop(ctx.currentTime + 0.3);
            
        } else if (type === 'error') {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            // A lower double-buzz
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.setValueAtTime(100, ctx.currentTime + 0.15);
            
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
            gainNode.gain.setValueAtTime(0.01, ctx.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
        }
    } catch (err) {
        console.error('Audio playback failed', err);
    }
};
