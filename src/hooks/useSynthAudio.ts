import { useCallback, useRef } from 'react';

export function useSynthAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize or resume the AudioContext on first interaction
  const initCtx = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  /**
   * Play a satisfying click sound based on selected profile and volume
   */
  const playClick = useCallback((
    enabled: boolean,
    volume: number = 0.5,
    profile: 'clicky' | 'soft' | 'vintage' = 'clicky'
  ) => {
    if (!enabled) return;
    try {
      initCtx();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const now = ctx.currentTime;

      if (profile === 'clicky') {
        // High switch leaf tick contact
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1600, now);
        osc1.frequency.exponentialRampToValueAtTime(600, now + 0.006);
        gain1.gain.setValueAtTime(0.06 * volume, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.006);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.006);

        // Mid bottom-out keycap sound
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(800, now + 0.002);
        osc2.frequency.exponentialRampToValueAtTime(150, now + 0.015);
        gain2.gain.setValueAtTime(0.04 * volume, now + 0.002);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.002);
        osc2.stop(now + 0.015);
      } else if (profile === 'soft') {
        // Soft Bubble Pop click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.025);
        gain.gain.setValueAtTime(0.08 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.025);
      } else {
        // Vintage Typewriter strike (Metallic hammer tap)
        const oscTick = ctx.createOscillator();
        const gainTick = ctx.createGain();
        oscTick.type = 'sine';
        oscTick.frequency.setValueAtTime(3200, now);
        oscTick.frequency.exponentialRampToValueAtTime(900, now + 0.008);
        gainTick.gain.setValueAtTime(0.05 * volume, now);
        gainTick.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);
        oscTick.connect(gainTick);
        gainTick.connect(ctx.destination);
        oscTick.start(now);
        oscTick.stop(now + 0.008);

        // Lower body steel cylinder resonance
        const oscBody = ctx.createOscillator();
        const gainBody = ctx.createGain();
        oscBody.type = 'triangle';
        oscBody.frequency.setValueAtTime(900, now);
        oscBody.frequency.exponentialRampToValueAtTime(50, now + 0.03);
        gainBody.gain.setValueAtTime(0.08 * volume, now);
        gainBody.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
        oscBody.connect(gainBody);
        gainBody.connect(ctx.destination);
        oscBody.start(now);
        oscBody.stop(now + 0.03);
      }
    } catch (e) {
      console.warn("Audio click playback failed:", e);
    }
  }, []);

  /**
   * Play a buzzy typing error alert sound
   */
  const playError = useCallback((enabled: boolean, volume: number = 0.5) => {
    if (!enabled) return;
    try {
      initCtx();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.12 * volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn("Audio error playback failed:", e);
    }
  }, []);

  return { playClick, playError };
}
