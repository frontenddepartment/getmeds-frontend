import React, { useEffect, useRef, useState } from 'react';
import { injectHTML } from '../lib/injectHTML';
import { useImageMapper } from '../lib/useSanity';

const trackTitles: Record<number, string> = {
  1: 'Midnight Rainstorm',
  2: 'Pacific Wavefront',
  3: 'Pristine Nature Stream',
};

export default function Meditations() {
  const { getImage } = useImageMapper('meditations');
  // Audio state
  const [isGlobalAudioPlaying, setIsGlobalAudioPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState(1);

  // Breathing trainer state
  const [isTrainerRunning, setIsTrainerRunning] = useState(false);
  const [trainerCycle, setTrainerCycle] = useState<'in' | 'hold' | 'out'>('in');
  const [trainerSecondsLeft, setTrainerSecondsLeft] = useState(4);
  const [defaultBoxSecs, setDefaultBoxSecs] = useState(4);
  const [mockAudioSecs, setMockAudioSecs] = useState(324);

  // Phone carousel (mobile only)
  const [activePhone, setActivePhone] = useState(1);
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhone(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Web Audio API refs (mutable, not state)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientOscsRef = useRef<OscillatorNode[]>([]);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const mainGainRef = useRef<GainNode | null>(null);

  // Closure-safe refs mirroring state
  const isPlayingRef = useRef(false);
  const activeTrackRef = useRef(1);
  const isTrainerRunningRef = useRef(false);
  const trainerCycleRef = useRef<'in' | 'hold' | 'out'>('in');
  const trainerSecondsLeftRef = useRef(4);
  const defaultBoxSecsRef = useRef(4);

  // Interval refs
  const trainerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveIntervalRefs = useRef<ReturnType<typeof setInterval>[]>([]);
  const oscGainIntervalRefs = useRef<ReturnType<typeof setInterval>[]>([]);

  useEffect(() => {
    const navContainer = document.getElementById('navbar-container');
    if (navContainer && navContainer.innerHTML.trim() === '') {
      fetch('/components/navbar.html', { cache: 'no-store' })
        .then(r => r.text())
        .then(html => { injectHTML(navContainer, html); });
    }
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer && footerContainer.innerHTML.trim() === '') {
      fetch('/components/footer.html', { cache: 'no-store' })
        .then(r => r.text())
        .then(html => { injectHTML(footerContainer, html); });
    }

    // Mock audio timer — mirrors original setInterval
    const mockAudioId = setInterval(() => {
      if (!isPlayingRef.current) return;
      setMockAudioSecs(s => {
        const next = s + 1;
        return next >= 720 ? 0 : next;
      });
    }, 1000);

    return () => {
      clearInterval(mockAudioId);
      if (trainerIntervalRef.current) clearInterval(trainerIntervalRef.current);
      waveIntervalRefs.current.forEach(id => clearInterval(id));
      oscGainIntervalRefs.current.forEach(id => clearInterval(id));
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => { });
    };
  }, []);

  const initAudioCtx = () => {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    audioCtxRef.current = new AC();
    mainGainRef.current = audioCtxRef.current.createGain();
    mainGainRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
    mainGainRef.current.connect(audioCtxRef.current.destination);
  };

  const stopAmbientSynth = () => {
    const ctx = audioCtxRef.current;
    const gain = mainGainRef.current;
    if (gain && ctx) {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    }
    waveIntervalRefs.current.forEach(id => clearInterval(id));
    waveIntervalRefs.current = [];
    oscGainIntervalRefs.current.forEach(id => clearInterval(id));
    oscGainIntervalRefs.current = [];

    setTimeout(() => {
      if (isPlayingRef.current) return;
      ambientOscsRef.current.forEach(o => { try { o.stop(); } catch (e) { } });
      ambientOscsRef.current = [];
      if (noiseNodeRef.current) {
        try { noiseNodeRef.current.stop(); } catch (e) { }
        noiseNodeRef.current = null;
      }
    }, 850);
  };

  const startAmbientSynth = () => {
    if (!audioCtxRef.current) initAudioCtx();
    const ctx = audioCtxRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    stopAmbientSynth();

    mainGainRef.current!.gain.cancelScheduledValues(ctx.currentTime);
    mainGainRef.current!.gain.setValueAtTime(0, ctx.currentTime);
    mainGainRef.current!.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 1.5);

    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    noiseNodeRef.current = ctx.createBufferSource();
    noiseNodeRef.current.buffer = noiseBuffer;
    noiseNodeRef.current.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const noiseGain = ctx.createGain();

    const track = activeTrackRef.current;
    if (track === 1) {
      filter.frequency.value = 450;
      noiseGain.gain.value = 0.25;
    } else if (track === 2) {
      filter.frequency.setValueAtTime(250, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(800, ctx.currentTime + 3);
      noiseGain.gain.setValueAtTime(0.1, ctx.currentTime);
      noiseGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 3);
      let isSwell = true;
      const waveId = setInterval(() => {
        if (!isPlayingRef.current || activeTrackRef.current !== 2) return;
        if (isSwell) {
          filter.frequency.linearRampToValueAtTime(250, ctx.currentTime + 3);
          noiseGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 3);
        } else {
          filter.frequency.linearRampToValueAtTime(800, ctx.currentTime + 3);
          noiseGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 3);
        }
        isSwell = !isSwell;
      }, 3000);
      waveIntervalRefs.current.push(waveId);
    } else {
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 4;
      noiseGain.gain.value = 0.15;
    }

    noiseNodeRef.current.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(mainGainRef.current!);
    noiseNodeRef.current.start();

    const freqs = [174.61, 220.00, 261.63, 349.23];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.08 / freqs.length;
      oscGain.gain.setValueAtTime(oscGain.gain.value, ctx.currentTime);
      const id = setInterval(() => {
        if (!isPlayingRef.current) return;
        oscGain.gain.linearRampToValueAtTime(
          0.04 / freqs.length + Math.random() * (0.08 / freqs.length),
          ctx.currentTime + 2
        );
      }, 2000);
      oscGainIntervalRefs.current.push(id);
      osc.connect(oscGain);
      oscGain.connect(mainGainRef.current!);
      osc.start();
      ambientOscsRef.current.push(osc);
    });
  };

  const selectAmbientTrack = (trackId: number) => {
    setActiveTrack(trackId);
    activeTrackRef.current = trackId;
    if (isPlayingRef.current) {
      stopAmbientSynth();
      setTimeout(() => startAmbientSynth(), 900);
    }
  };

  const toggleGlobalAudio = () => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsGlobalAudioPlaying(false);
      stopAmbientSynth();
    } else {
      isPlayingRef.current = true;
      setIsGlobalAudioPlaying(true);
      startAmbientSynth();
    }
  };

  const runTrainerTick = () => {
    trainerIntervalRef.current = setInterval(() => {
      if (!isTrainerRunningRef.current) return;
      trainerSecondsLeftRef.current--;
      setTrainerSecondsLeft(trainerSecondsLeftRef.current);

      if (trainerSecondsLeftRef.current <= 0) {
        let nextCycle: 'in' | 'hold' | 'out';
        if (trainerCycleRef.current === 'in') nextCycle = 'hold';
        else if (trainerCycleRef.current === 'hold') nextCycle = 'out';
        else nextCycle = 'in';

        trainerCycleRef.current = nextCycle;
        trainerSecondsLeftRef.current = defaultBoxSecsRef.current;
        setTrainerCycle(nextCycle);
        setTrainerSecondsLeft(trainerSecondsLeftRef.current);
      }
    }, 1000);
  };

  const toggleTrainerSession = () => {
    if (isTrainerRunningRef.current) {
      isTrainerRunningRef.current = false;
      setIsTrainerRunning(false);
      if (trainerIntervalRef.current) clearInterval(trainerIntervalRef.current);
    } else {
      isTrainerRunningRef.current = true;
      setIsTrainerRunning(true);
      runTrainerTick();
    }
  };

  const resetTrainerSession = () => {
    isTrainerRunningRef.current = false;
    setIsTrainerRunning(false);
    if (trainerIntervalRef.current) clearInterval(trainerIntervalRef.current);
    trainerCycleRef.current = 'in';
    trainerSecondsLeftRef.current = defaultBoxSecsRef.current;
    setTrainerCycle('in');
    setTrainerSecondsLeft(defaultBoxSecsRef.current);
  };

  const changeBreathingCycle = (val: string) => {
    const secs = parseInt(val);
    defaultBoxSecsRef.current = secs;
    setDefaultBoxSecs(secs);
    resetTrainerSession();
  };

  // Derived values for mock phone UI
  const mockAudioMins = Math.floor(mockAudioSecs / 60);
  const mockAudioSecsPart = mockAudioSecs % 60;
  const mockAudioTimeStr = `${mockAudioMins.toString().padStart(2, '0')}:${mockAudioSecsPart.toString().padStart(2, '0')}`;
  const mockAudioProgressPct = (mockAudioSecs / 720) * 100;
  const trainerBreathLabel = trainerCycle === 'in' ? 'Breathe In' : trainerCycle === 'hold' ? 'Hold Breath' : 'Breathe Out';
  const trainerRingStyle = isTrainerRunning
    ? (trainerCycle === 'out' ? 'scale(0.9)' : 'scale(1.15)')
    : 'scale(0.9)';

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }} className="bg-white text-gray-800 antialiased">

      {/* Navbar */}
      <div id="navbar-container" className="sticky top-0 z-[50]" />

      {/* HERO SECTION */}
      <section className="w-full mx-auto px-3 sm:px-4 md:px-6 mt-3 md:mt-4 mb-6 max-w-[1600px] relative pb-0 md:pb-2">
        <div className="w-full relative">

          {/* Blue Banner Container */}
          <div className="w-full bg-gradient-to-r from-[#61A644] to-[#1D9FDA] rounded-[1.5rem] pt-20 pb-56 px-6 text-center relative overflow-hidden shadow-sm border border-[#1D9FDA]/50 min-h-[450px] md:min-h-[500px]">
            {/* Left Side 3-Layer Glass Effect */}
            <div className="absolute top-16 left-[-2rem] w-32 md:w-40 h-[600px] bg-white/10 backdrop-blur-md rounded-[15px] pointer-events-none" />
            <div className="absolute top-32 left-[3rem] md:left-[5rem] w-32 md:w-40 h-[500px] bg-white/10 backdrop-blur-md rounded-[15px] pointer-events-none" />
            <div className="absolute top-48 left-[8rem] md:left-[12rem] w-32 md:w-40 h-[400px] bg-white/10 backdrop-blur-md rounded-[15px] pointer-events-none" />

            {/* Right Side 3-Layer Glass Effect */}
            <div className="absolute top-16 right-[-2rem] w-32 md:w-40 h-[600px] bg-white/10 backdrop-blur-md rounded-[15px] pointer-events-none" />
            <div className="absolute top-32 right-[3rem] md:right-[5rem] w-32 md:w-40 h-[500px] bg-white/10 backdrop-blur-md rounded-[15px] pointer-events-none" />
            <div className="absolute top-48 right-[8rem] md:right-[12rem] w-32 md:w-40 h-[400px] bg-white/10 backdrop-blur-md rounded-[15px] pointer-events-none" />

            <h1 className="text-3xl md:text-5xl font-semibold text-white mb-6 relative z-10 tracking-tight mt-4">
              Getmeds Meditation App
            </h1>
            <p className="text-white/80 text-[13px] md:text-sm max-w-2xl mx-auto mb-10 relative z-10 leading-relaxed font-medium">
              Nurture your mind, body, and soul. Discover clinical mindfulness, guided breathing exercises, and
              soothing ambient soundscapes designed to support your holistic wellness journey.
            </p>
          </div>

          {/* Phone Mockups — Desktop: 3-col grid | Mobile: auto-sliding carousel */}

          {/* DESKTOP ONLY (md+): unchanged 3-col layout */}
          <div className="hidden md:grid max-w-[700px] mx-auto grid-cols-3 gap-4 relative z-20 md:-mt-48 px-4 lg:px-0 pb-2 items-center">
            <div className="relative w-full max-w-[190px] mx-auto h-[380px] bg-slate-900 rounded-[30px] p-1.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] border-2 border-slate-700/80 overflow-hidden flex flex-col items-center z-10 transition-transform duration-500 hover:scale-[1.02] transform md:translate-y-2">
              <div className="w-full h-full bg-white rounded-[20px] overflow-hidden relative shadow-inner">
                <img src={getImage('assets/categories.png', 'assets/categories.png')} alt="App Screen Left" className="w-full h-[calc(100%-1.25rem)] mt-5 object-contain" />
                <div className="w-20 h-3.5 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-1.5 z-20" />
              </div>
            </div>
            <div className="relative w-full max-w-[225px] mx-auto h-[450px] bg-slate-900 rounded-[35px] p-1.5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border-2 border-slate-700/80 overflow-hidden flex flex-col items-center z-20 transition-transform duration-500 hover:scale-[1.02] transform md:-translate-y-6">
              <div className="w-full h-full bg-white rounded-[25px] overflow-hidden relative shadow-inner">
                <img src={getImage('assets/workbook.png', 'assets/workbook.png')} alt="App Screen Center" className="w-full h-[calc(100%-1.5rem)] mt-6 object-contain" />
                <div className="w-24 h-4 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-1.5 z-20" />
              </div>
            </div>
            <div className="relative w-full max-w-[190px] mx-auto h-[380px] bg-slate-900 rounded-[30px] p-1.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] border-2 border-slate-700/80 overflow-hidden flex flex-col items-center z-10 transition-transform duration-500 hover:scale-[1.02] transform md:translate-y-2">
              <div className="w-full h-full bg-white rounded-[20px] overflow-hidden relative shadow-inner">
                <img src={getImage('assets/profile.png', 'assets/profile.png')} alt="App Screen Right" className="w-full h-[calc(100%-1.25rem)] mt-5 object-contain" />
                <div className="w-20 h-3.5 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-1.5 z-20" />
              </div>
            </div>
          </div>

          {/* MOBILE ONLY (<md): auto-sliding carousel with peek effect */}
          <div className="md:hidden relative z-20 -mt-32 pb-6 overflow-x-hidden pt-4">
            {/* Track */}
            <div
              className="flex items-center transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(calc(${15 - activePhone * 70}vw))` }}
            >
              {[
                { img: 'assets/categories.png', alt: 'App Screen Left' },
                { img: 'assets/workbook.png', alt: 'App Screen Center' },
                { img: 'assets/profile.png', alt: 'App Screen Right' },
              ].map((phone, i) => {
                const isActive = i === activePhone;
                return (
                  <div
                    key={i}
                    onClick={() => setActivePhone(i)}
                    className="shrink-0 flex items-center justify-center cursor-pointer"
                    style={{ width: '70vw', height: '380px', padding: '0 5vw' }}
                  >
                    <div
                      className="bg-slate-900 border-2 border-slate-700/80 overflow-hidden flex flex-col items-center transition-all duration-700"
                      style={{
                        width: isActive ? '180px' : '130px',
                        height: isActive ? '360px' : '260px',
                        borderRadius: isActive ? '32px' : '24px',
                        boxShadow: isActive
                          ? '0 30px 60px -15px rgba(0,0,0,0.6)'
                          : '0 10px 30px -10px rgba(0,0,0,0.25)',
                        opacity: isActive ? 1 : 0.55,
                        transform: isActive ? 'translateY(-12px)' : 'translateY(0)',
                        padding: '6px',
                      }}
                    >
                      <div className="w-full h-full bg-white overflow-hidden relative shadow-inner" style={{ borderRadius: isActive ? '26px' : '18px' }}>
                        <img src={getImage(phone.img, phone.img)} alt={phone.alt} className="w-full h-[calc(100%-1.25rem)] mt-5 object-contain" />
                        <div className="bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-1.5 z-20" style={{ width: isActive ? '72px' : '52px', height: isActive ? '14px' : '10px' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {[0, 1, 2].map(i => (
                <button
                  key={i}
                  onClick={() => setActivePhone(i)}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === activePhone ? '20px' : '8px',
                    height: '8px',
                    background: i === activePhone ? '#ffffff' : 'rgba(255,255,255,0.4)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg className="absolute top-1/2 -translate-y-1/2 left-[5%] w-[600px] h-[600px] text-slate-300" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="400" cy="400" r="350" fill="currentColor" opacity="0.05" />
            <circle cx="400" cy="400" r="250" fill="currentColor" opacity="0.1" />
            <circle cx="400" cy="400" r="150" fill="currentColor" opacity="0.15" />
          </svg>
          <div className="absolute top-20 right-20 w-32 h-32 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* App Store Badges */}
        <div className="relative z-20 flex justify-center items-center gap-4 mb-16 md:-mt-4">
          <a href="#" className="h-[42px] hover:scale-105 transition-transform duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.1)] rounded-[10px] overflow-hidden bg-black">
            <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" className="h-full" />
          </a>
          <a href="#" className="h-[60px] -ml-2 hover:scale-105 transition-transform duration-300 drop-shadow-xl relative top-[1px]">
            <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" className="h-full object-contain" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Content */}
          <div className="max-w-xl md:ml-12 lg:ml-24">
            <h2 className="text-2xl md:text-[1.75rem] font-bold text-slate-900 mb-6 leading-snug">
              Mindfulness, Measured.
            </h2>
            <p className="text-slate-500 text-[15px] leading-relaxed max-w-md">
              Meet the meditation app designed to bring clarity to your chaos. By blending intuitive guided
              meditations with comprehensive wellness tracking, it seamlessly adapts to your unique daily
              routine—helping you visualize your progress as you cultivate inner peace.
            </p>
          </div>

          {/* Right Phone Mockup Panel */}
          <div className="flex justify-center lg:justify-end md:pr-12 lg:pr-24 mt-12 lg:mt-0">
            <div className="bg-[#f2f4f6] rounded-[40px] px-8 flex flex-col items-center max-w-[420px] relative w-full h-[360px] overflow-hidden">
              <div className="relative w-full max-w-[240px] mx-auto h-[480px] bg-slate-900 rounded-[38px] p-2 shadow-2xl z-10 border border-slate-700/50 transform translate-y-[80px]">
                <div className="w-full h-full bg-white rounded-[30px] overflow-hidden relative shadow-inner">
                  <div className="w-20 h-4 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-2 z-20" />
                  <img src={getImage('assets/scheduling.png', 'assets/scheduling.png')} alt="App Screen" className="w-full h-full object-cover pt-6" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/90 to-transparent z-40 pointer-events-none" />
              <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center text-center px-8 pointer-events-none">
                <p className="text-slate-600 text-[14px] leading-relaxed font-medium">
                  <strong className="text-slate-900">Smart Scheduling</strong> Set due dates, recurring
                  sessions, and get automated calm reminders to stay grounded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg className="absolute top-1/2 -translate-y-1/2 right-[5%] w-[600px] h-[600px] text-slate-300 transform scale-x-[-1]" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="400" cy="400" r="350" fill="currentColor" opacity="0.05" />
            <circle cx="400" cy="400" r="250" fill="currentColor" opacity="0.1" />
            <circle cx="400" cy="400" r="150" fill="currentColor" opacity="0.15" />
          </svg>
          <div className="absolute top-20 left-20 w-32 h-32 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-benefits" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-benefits)" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Phone Mockup Panel */}
          <div className="flex justify-center lg:justify-start md:pl-12 lg:pl-24 order-2 lg:order-1 mt-12 lg:mt-0">
            <div className="bg-[#f2f4f6] rounded-[40px] px-8 flex flex-col items-center max-w-[420px] relative w-full h-[360px] overflow-hidden">
              <div className="relative w-full max-w-[240px] mx-auto h-[480px] bg-slate-900 rounded-[38px] p-2 shadow-2xl z-10 border border-slate-700/50 transform translate-y-[80px]">
                <div className="w-full h-full bg-white rounded-[30px] overflow-hidden relative shadow-inner">
                  <div className="w-20 h-4 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-2 z-20" />
                  <img src={getImage('assets/benefits.png', 'assets/benefits.png')} alt="App Screen" className="w-full h-full object-cover pt-6" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/90 to-transparent z-40 pointer-events-none" />
              <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center text-center px-8 pointer-events-none">
                <p className="text-slate-600 text-[14px] leading-relaxed font-medium">
                  <strong className="text-slate-900">Custom Benefits</strong> Gain mental clarity, reduce stress,
                  and achieve total inner peace.
                </p>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="max-w-xl md:ml-12 lg:ml-24 order-1 lg:order-2">
            <h2 className="text-2xl md:text-[1.75rem] font-bold text-slate-900 mb-6 leading-snug">
              The Benefits
            </h2>
            <p className="text-slate-500 text-[15px] leading-relaxed max-w-md">
              The Getmeds Meditation App is designed to seamlessly integrate into your daily routine, offering
              deep mental restoration through our custom-designed programs. By prioritizing long-term growth, the
              app helps you build lasting habits of mindfulness that naturally improve your focus throughout the
              day. To complement your practice, it also provides tranquil soundscapes entirely tailored to your
              unique lifestyle, ensuring your journey toward inner peace feels effortless and personal.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section
        className="w-full pt-24 pb-16 px-4 sm:px-6 lg:px-8 mt-10"
        style={{ background: 'linear-gradient(to bottom, #1D9FDA 75%, #ffffff 75%)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

            {/* Left: Title, Description, Button */}
            <div className="text-white px-4 lg:pl-12">
              <h2 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight">Features</h2>
              <p className="text-white/75 text-[15px] leading-relaxed max-w-md mb-10">
                Discover a comprehensive suite of tools designed to support your mental well-being. From guided
                sessions to advanced analytics, our features work together seamlessly to help you build a
                calmer, more mindful daily routine.
              </p>
              <a
                href="#explore-features"
                className="inline-block border-2 border-white text-white font-semibold text-[14px] px-8 py-3 rounded-lg hover:bg-white hover:text-[#2b50d8] transition-all duration-200"
              >
                More Features
              </a>
            </div>

            {/* Right: 2x3 Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 lg:px-0">

              {/* Card 1: Mindfulness */}
              <div className="group bg-white rounded-[20px] p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_18px_35px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer border border-slate-100/80">
                <div className="w-10 h-10 rounded-xl bg-[#3b5bdb] flex items-center justify-center mb-3.5 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300 ease-out">
                  <i className="fa-solid fa-brain text-white text-[15px]" />
                </div>
                <h4 className="text-[12.5px] font-semibold text-slate-800 mb-1.5">Mindfulness</h4>
                <p className="text-slate-400 text-[10.5px] leading-relaxed">Explore guided meditations designed to reduce stress and cultivate presence.</p>
              </div>

              {/* Card 2: Breathing */}
              <div className="group bg-white rounded-[20px] p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_18px_35px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer border border-slate-100/80">
                <div className="w-10 h-10 rounded-xl bg-[#0ca678] flex items-center justify-center mb-3.5 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300 ease-out">
                  <i className="fa-solid fa-wind text-white text-[15px]" />
                </div>
                <h4 className="text-[12.5px] font-semibold text-slate-800 mb-1.5">Breathing</h4>
                <p className="text-slate-400 text-[10.5px] leading-relaxed">Master simple breathing techniques to instantly calm your nervous system.</p>
              </div>

              {/* Card 3: Sleep Sounds */}
              <div className="group bg-white rounded-[20px] p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_18px_35px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer border border-slate-100/80">
                <div className="w-10 h-10 rounded-xl bg-[#e67700] flex items-center justify-center mb-3.5 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300 ease-out">
                  <i className="fa-solid fa-moon text-white text-[15px]" />
                </div>
                <h4 className="text-[12.5px] font-semibold text-slate-800 mb-1.5">Sleep Sounds</h4>
                <p className="text-slate-400 text-[10.5px] leading-relaxed">Drift into deep rest with our curated, tranquil audio library.</p>
              </div>

              {/* Card 4: Daily Goals */}
              <div className="group bg-white rounded-[20px] p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_18px_35px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer border border-slate-100/80">
                <div className="w-10 h-10 rounded-xl bg-[#37b24d] flex items-center justify-center mb-3.5 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300 ease-out">
                  <i className="fa-solid fa-bullseye text-white text-[15px]" />
                </div>
                <h4 className="text-[12.5px] font-semibold text-slate-800 mb-1.5">Daily Goals</h4>
                <p className="text-slate-400 text-[10.5px] leading-relaxed">Build lasting wellness habits with easily achievable daily mindful milestones.</p>
              </div>

              {/* Card 5: Progress Tracking */}
              <div className="group bg-white rounded-[20px] p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_18px_35px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer border border-slate-100/80">
                <div className="w-10 h-10 rounded-xl bg-[#ae3ec9] flex items-center justify-center mb-3.5 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300 ease-out">
                  <i className="fa-solid fa-chart-line text-white text-[15px]" />
                </div>
                <h4 className="text-[12.5px] font-semibold text-slate-800 mb-1.5">Progress Tracking</h4>
                <p className="text-slate-400 text-[10.5px] leading-relaxed">Visualize your mental health growth with detailed, personal data insights.</p>
              </div>

              {/* Card 6: Wellness Events */}
              <div className="group bg-white rounded-[20px] p-5 shadow-[0_10px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_18px_35px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer border border-slate-100/80">
                <div className="w-10 h-10 rounded-xl bg-[#c92a2a] flex items-center justify-center mb-3.5 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300 ease-out">
                  <i className="fa-solid fa-calendar-days text-white text-[15px]" />
                </div>
                <h4 className="text-[12.5px] font-semibold text-slate-800 mb-1.5">Wellness Events</h4>
                <p className="text-slate-400 text-[10.5px] leading-relaxed">Join live community sessions and expert-led mindfulness workshops globally.</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* DOWNLOAD APP SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 relative overflow-hidden -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

          {/* Left Content & Buttons */}
          <div className="max-w-xl md:ml-12 lg:ml-24">
            <h2 className="text-3xl md:text-4xl lg:text-5xl whitespace-nowrap font-semibold text-slate-900 leading-tight tracking-tight mt-6 mb-6">
              Download Our App
            </h2>
            <p className="text-slate-500 text-[15px] leading-relaxed max-w-md mb-8">
              Nurture your mind, body, and soul. Discover clinical mindfulness, guided breathing exercises, and
              soothing ambient soundscapes designed to support your holistic wellness journey.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="h-[42px] hover:scale-105 transition-transform duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.1)] rounded-[10px] overflow-hidden bg-black">
                <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" className="h-full" />
              </a>
              <a href="#" className="h-[60px] -ml-2 hover:scale-105 transition-transform duration-300 drop-shadow-xl relative top-[1px]">
                <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" className="h-full object-contain" />
              </a>
            </div>
          </div>

          {/* Right Phone Mockup & Background */}
          <div className="flex justify-center lg:justify-end md:pr-12 lg:pr-24 mt-12 lg:mt-0 relative min-h-[460px] items-center">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="absolute w-[360px] h-[360px] bg-sky-500/10 rounded-full animate-[pulse_6s_ease-in-out_infinite]" />
              <div className="absolute w-[240px] h-[240px] bg-emerald-500/15 rounded-full translate-x-8 translate-y-8 animate-[pulse_8s_ease-in-out_infinite]" />
            </div>
            <div className="relative w-full max-w-[225px] h-[450px] mx-auto bg-slate-900 rounded-[35px] p-1.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] z-10 border border-slate-700/50 transform hover:scale-[1.03] transition-transform duration-300 overflow-hidden flex flex-col items-center">
              <div className="w-full h-full bg-white rounded-[25px] overflow-hidden relative shadow-inner">
                <div className="w-24 h-4 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-1.5 z-20" />
                <img src={getImage('assets/home.png', 'assets/home.png')} alt="App Screen" className="w-full h-[calc(100%-1.5rem)] mt-6 object-contain" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <div id="footer-container" />

    </div>
  );
}
