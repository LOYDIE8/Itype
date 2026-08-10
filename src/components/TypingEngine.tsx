// Itype v1.1.1 Final Release Build
import { useState, useEffect, useRef } from 'react';
import { Play, X, Award, ArrowRight, HelpCircle } from 'lucide-react';
import { useSynthAudio } from '../hooks/useSynthAudio';
import { calculateNetWpm, calculateAccuracy, formatDuration } from '../utils/typingMath';
import VisualKeyboard from './VisualKeyboard';
import { Profile } from '../types/electron';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface TypingEngineProps {
  profile: Profile;
  targetText: string;
  sourceName: string;
  sessionType: 'placement' | 'lesson' | 'custom';
  exerciseKeys?: string[]; // Target keys (for pre-practice reminders)
  durationLimit?: number; // In seconds (e.g. 60 for placement test)
  onCompleteSession: (wpm: number, accuracy: number, errorCount: number, duration: number, problemKeys: Record<string, number>) => void;
  onCancel: () => void;
  onNextLesson?: () => void; // Proceed to next drill callback
}

export default function TypingEngine({
  profile,
  targetText,
  sourceName,
  sessionType,
  exerciseKeys = [],
  durationLimit,
  onCompleteSession,
  onCancel,
  onNextLesson
}: TypingEngineProps) {
  const { settings } = profile;
  const { playClick, playError, playTimerTick, playSessionComplete } = useSynthAudio();

  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [errorIndices, setErrorIndices] = useState<Set<number>>(new Set());
  const [problemKeys, setProblemKeys] = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [showPreLessonModal, setShowPreLessonModal] = useState(true); // Pre-practice tutorial modal
  const [sessionHistory, setSessionHistory] = useState<{ second: number; wpm: number; accuracy: number }[]>([]);

  const containerHeight = settings.containerHeight || 'standard';

  const containerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isWindowFocused, setIsWindowFocused] = useState(true);

  // Monitor window focus for pause overlay
  useEffect(() => {
    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Reset typing engine states when active text shifts (e.g. next lesson selected)
  useEffect(() => {
    resetSession();
  }, [targetText, sourceName]);

  // Auto-scroll typing container to keep active row centered
  useEffect(() => {
    if (activeCharRef.current && containerRef.current) {
      const activeEl = activeCharRef.current;
      const container = containerRef.current;
      
      const elTop = activeEl.offsetTop;
      const elHeight = activeEl.offsetHeight;
      const containerHeight = container.offsetHeight;
      
      if (elTop > container.scrollTop + containerHeight / 2) {
        container.scrollTo({
          top: elTop - containerHeight / 2 + elHeight / 2,
          behavior: 'smooth'
        });
      } else if (elTop < container.scrollTop) {
        container.scrollTo({
          top: elTop - 20,
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex]);

  // Timer interval & Countdown Audio Tick for final 10s
  useEffect(() => {
    if (isActive && !isFinished && !showPreLessonModal && isWindowFocused) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const next = prev + 1;

          // Sound tick for final 10 seconds in timed trial
          if (durationLimit) {
            const remaining = durationLimit - next;
            if (remaining <= 10 && remaining >= 0) {
              playTimerTick(settings.sound && settings.timerSound !== false, settings.soundVolume, remaining <= 3);
            }

            if (next >= durationLimit) {
              handleFinish(next);
              return durationLimit;
            }
          }

          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isFinished, showPreLessonModal, isWindowFocused, durationLimit, settings]);

  // Record second-by-second history coordinates for speed curves
  useEffect(() => {
    if (!isActive || isFinished || elapsedTime === 0 || !isWindowFocused) return;

    const correctChars = typedText.length - errorIndices.size;
    const currentWpm = Math.round(correctChars > 0 ? (correctChars / 5) / (elapsedTime / 60) : 0);
    const currentAcc = Math.round(typedText.length > 0 ? (correctChars / typedText.length) * 100 : 100);

    setSessionHistory(prev => [
      ...prev,
      { second: elapsedTime, wpm: currentWpm, accuracy: currentAcc }
    ]);
  }, [elapsedTime, isActive, isFinished, isWindowFocused]);

  // Keydown capture listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Esc key or Tab+Enter to quick restart session
      if (e.key === 'Escape') {
        e.preventDefault();
        resetSession();
        return;
      }

      if (showPreLessonModal) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          startSession();
        }
        return;
      }

      if (isFinished) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (onNextLesson) {
            onNextLesson();
          } else {
            resetSession();
          }
        }
        return;
      }

      // Intercept key defaults for workspace commands
      if (e.key === ' ' || e.key === 'Backspace' || e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
      }

      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Start on first keystroke
      let currentStart = startTime;
      if (startTime === null) {
        currentStart = Date.now();
        setStartTime(currentStart);
        setIsActive(true);
      }

      const expectedChar = targetText[currentIndex];

      // Handle Backspace (Free Mode only)
      if (e.key === 'Backspace') {
        if (!settings.strictMode && currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
          setTypedText(prev => prev.slice(0, -1));
          
          setErrorIndices(prev => {
            const next = new Set(prev);
            next.delete(currentIndex - 1);
            return next;
          });
          playClick(settings.sound, settings.soundVolume, settings.soundProfile);
        }
        return;
      }

      if (e.key.length > 1 && e.key !== 'Enter') return;
      const inputChar = e.key === 'Enter' ? '\n' : e.key;

      if (settings.strictMode) {
        if (inputChar === expectedChar) {
          setTypedText(prev => prev + inputChar);
          setCurrentIndex(prev => prev + 1);
          playClick(settings.sound, settings.soundVolume, settings.soundProfile);

          if (currentIndex + 1 >= targetText.length) {
            handleFinish(elapsedTime);
          }
        } else {
          logError(expectedChar);
          playError(settings.sound && settings.errorSound !== false, settings.soundVolume);
        }
      } else {
        const isCorrect = inputChar === expectedChar;
        setTypedText(prev => prev + inputChar);
        setCurrentIndex(prev => prev + 1);

        if (isCorrect) {
          playClick(settings.sound, settings.soundVolume, settings.soundProfile);
        } else {
          logError(expectedChar);
          playError(settings.sound && settings.errorSound !== false, settings.soundVolume);
          setErrorIndices(prev => {
            const next = new Set(prev);
            next.add(currentIndex);
            return next;
          });
        }

        if (currentIndex + 1 >= targetText.length) {
          handleFinish(elapsedTime);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, isFinished, isActive, startTime, elapsedTime, targetText, settings, showPreLessonModal, onNextLesson]);

  const logError = (char: string) => {
    const name = char === ' ' ? 'space' : char === '\n' ? 'enter' : char;
    setProblemKeys(prev => ({
      ...prev,
      [name]: (prev[name] || 0) + 1
    }));
  };

  const startSession = () => {
    setShowPreLessonModal(false);
    setIsActive(true);
    setStartTime(Date.now());
  };

  const handleFinish = (finalTime: number) => {
    setIsFinished(true);
    setIsActive(false);
    
    // Play celebratory "Big Ting!" chime
    playSessionComplete(settings.sound && settings.completionSound !== false, settings.soundVolume);

    // High-precision millisecond stopwatch duration calculation
    const endTime = Date.now();
    const durationMs = startTime ? endTime - startTime : finalTime * 1000;
    const durationSeconds = Math.max(0.5, durationMs / 1000); // Prevent divide by zero
    
    const totalTyped = typedText.length || currentIndex;
    const uncorrectedErrors = errorIndices.size;
    const totalErrors = Object.values(problemKeys).reduce((a, b) => a + b, 0);
    
    const wpm = calculateNetWpm(totalTyped, uncorrectedErrors, durationSeconds);
    const accuracy = calculateAccuracy(totalTyped - uncorrectedErrors, totalTyped);

    window.api.saveSession(profile.id, {
      wpm,
      accuracy,
      error_count: totalErrors,
      duration: Math.round(durationSeconds),
      session_type: sessionType,
      source_name: sourceName,
      problem_keys: problemKeys
    });

    onCompleteSession(wpm, accuracy, totalErrors, Math.round(durationSeconds), problemKeys);
    checkAchievements(wpm, accuracy, Math.round(durationSeconds));
  };

  const checkAchievements = async (wpm: number, accuracy: number, duration: number) => {
    const listToUnlock = [];
    if (sessionType === 'placement') listToUnlock.push('first_steps');
    if (wpm >= 40) listToUnlock.push('speed_demon_1');
    if (wpm >= 60) listToUnlock.push('speed_demon_2');
    if (wpm >= 80) listToUnlock.push('speed_demon_3');
    if (wpm >= 100) listToUnlock.push('speed_demon_4');
    if (wpm >= 120) listToUnlock.push('speed_demon_5');
    if (accuracy === 100 && targetText.length >= 80) listToUnlock.push('sniper');
    if (accuracy >= 99 && targetText.length >= 150) listToUnlock.push('flawless_99');
    if (duration >= 300) listToUnlock.push('marathoner');
    if (sessionType === 'custom') listToUnlock.push('custom_creator');
    if (sourceName.toLowerCase().includes('essay') || sourceName.toLowerCase().includes('literature') || sourceName.toLowerCase().includes('passage')) {
      listToUnlock.push('essay_scholar');
    }

    const currentHour = new Date().getHours();
    if (currentHour >= 22 || currentHour < 5) {
      listToUnlock.push('night_owl');
    }

    for (const badgeId of listToUnlock) {
      await window.api.unlockBadge(profile.id, badgeId);
    }
  };

  const resetSession = () => {
    setTypedText('');
    setCurrentIndex(0);
    setStartTime(null);
    setElapsedTime(0);
    setErrorIndices(new Set());
    setProblemKeys({});
    setIsFinished(false);
    setIsActive(false);
    setShowPreLessonModal(true);
    setSessionHistory([]);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  };

  const fontSizes = {
    small: 'text-lg leading-relaxed',
    medium: 'text-2xl leading-loose tracking-wide',
    large: 'text-3xl leading-loose tracking-widest'
  };

  const totalWords = targetText.trim().split(/\s+/).length;
  const typedWordsCount = typedText.trim() ? typedText.trim().split(/\s+/).length : 0;
  const progressRatio = targetText.length > 0 ? Math.min(1, currentIndex / targetText.length) : 0;

  const currentHighlightChar = targetText[currentIndex] || '';

  // Render word-wrapped highlights
  const renderWords = () => {
    const words: { letters: { char: string; index: number }[] }[] = [];
    let currentWord: { char: string; index: number }[] = [];
    
    for (let i = 0; i < targetText.length; i++) {
      const char = targetText[i];
      currentWord.push({ char, index: i });
      if (char === ' ' || char === '\n') {
        words.push({ letters: currentWord });
        currentWord = [];
      }
    }
    if (currentWord.length > 0) {
      words.push({ letters: currentWord });
    }

    return words.map((word, wIdx) => (
      <span key={wIdx} className="inline-block whitespace-nowrap">
        {word.letters.map(({ char, index }) => {
          let charClass = "text-[#09090B]/20 dark:text-[#FAFAFA]/20"; // Untyped (Faint)
          let isCaret = index === currentIndex;
          let displayChar = char === '\n' ? '↵\n' : char === ' ' ? '\u00A0' : char;

          if (index < currentIndex) {
            const isError = errorIndices.has(index);
            if (isError) {
              charClass = "text-red-500 underline decoration-2 decoration-red-500 font-bold bg-red-500/10 px-0.5";
            } else {
              charClass = "text-[#09090B] dark:text-[#FAFAFA] font-medium"; // Typed correct
            }
          }

          return (
            <span
              key={index}
              ref={isCaret ? activeCharRef : null}
              className={`relative inline-block transition-colors select-none font-mono ${charClass} ${
                isCaret ? 'text-[#09090B] dark:text-[#FAFAFA] bg-black/5 dark:bg-white/10' : ''
              }`}
            >
              {displayChar}
              {isCaret && (
                <span className="absolute left-0 top-[10%] bottom-[10%] w-[2px] bg-[#09090B] dark:bg-[#FAFAFA] animate-pulse" />
              )}
            </span>
          );
        })}
      </span>
    ));
  };

  // Finished Session View - Results Summary Card
  if (isFinished) {
    const totalTyped = typedText.length;
    const uncorrectedErrors = errorIndices.size;
    const finalDurationSeconds = Math.max(1, elapsedTime);
    const finalWpm = calculateNetWpm(totalTyped, uncorrectedErrors, finalDurationSeconds);
    const finalAccuracy = calculateAccuracy(totalTyped - uncorrectedErrors, totalTyped);

    return (
      <div className="w-full max-w-2xl mx-auto py-6 px-4 animate-fade-in text-[#09090B] dark:text-[#FAFAFA] font-sans min-h-screen overflow-y-auto z-40 relative">
        <div className="bg-[#FFFFFF] dark:bg-[#121215] border border-[#E5E5E5] dark:border-[#27272A] rounded-lg p-6 sm:p-8 shadow-sm space-y-6 max-h-[85vh] overflow-y-auto">
          
          <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#27272A] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 border border-[#E5E5E5] dark:border-[#27272A] rounded-md bg-[#FAFAFA] dark:bg-[#18181B]">
                <Award className="w-5 h-5 opacity-80" />
              </div>
              <div>
                <span className="text-xs font-semibold text-neutral-500 block">Session Complete</span>
                <h2 className="text-base font-semibold tracking-tight">{sourceName}</h2>
              </div>
            </div>
            <span className="text-xs opacity-50 uppercase font-mono">
              {sessionType}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center py-2 font-mono">
            <div className="border border-[#E5E5E5] dark:border-[#27272A] p-4 rounded-lg bg-[#FAFAFA] dark:bg-[#18181B]">
              <span className="text-xs opacity-60 font-sans block">Typing Speed</span>
              <p className="text-3xl font-bold tracking-tight mt-1">{finalWpm}</p>
              <span className="text-[10px] opacity-40 font-sans">WPM</span>
            </div>
            <div className="border border-[#E5E5E5] dark:border-[#27272A] p-4 rounded-lg bg-[#FAFAFA] dark:bg-[#18181B]">
              <span className="text-xs opacity-60 font-sans block">Accuracy</span>
              <p className="text-3xl font-bold tracking-tight mt-1">{finalAccuracy}%</p>
              <span className="text-[10px] opacity-40 font-sans">Precision</span>
            </div>
            <div className="border border-[#E5E5E5] dark:border-[#27272A] p-4 rounded-lg bg-[#FAFAFA] dark:bg-[#18181B]">
              <span className="text-xs opacity-60 font-sans block">Duration</span>
              <p className="text-3xl font-bold tracking-tight mt-1">{formatDuration(finalDurationSeconds)}</p>
              <span className="text-[10px] opacity-40 font-sans">Elapsed</span>
            </div>
          </div>

          {/* Speed Progression Line Graph */}
          {sessionHistory.length > 2 && (
            <div className="border border-[#E5E5E5] dark:border-[#27272A] p-4 rounded-lg bg-transparent space-y-2">
              <span className="text-xs font-semibold opacity-70 block">Speed Progression</span>
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessionHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" opacity={0.2} />
                    <XAxis dataKey="second" stroke="#888888" fontSize={10} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={10} tickLine={false} domain={[0, 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090B', border: '1px solid #27272A', color: '#FFF', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="wpm" name="WPM" stroke="#09090B" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#10B981" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#E5E5E5] dark:border-[#27272A] pt-6 font-sans gap-3">
            <button
              onClick={resetSession}
              className="w-full sm:w-auto px-4 py-2 border border-[#E5E5E5] dark:border-[#27272A] text-xs font-medium rounded-md hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] transition-all cursor-pointer text-center"
            >
              Retry Session
            </button>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-[#E5E5E5] dark:border-[#27272A] text-xs font-medium rounded-md hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] transition-all cursor-pointer"
              >
                Exit to Menu
              </button>
              {onNextLesson ? (
                <button
                  onClick={onNextLesson}
                  className="flex items-center justify-center gap-1.5 px-5 py-2 border border-[#09090B] dark:border-[#FAFAFA] bg-[#09090B] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#09090B] font-semibold text-xs rounded-md hover:opacity-90 transition-all cursor-pointer"
                >
                  Proceed [Space]
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={resetSession}
                  className="flex items-center justify-center gap-1.5 px-5 py-2 border border-[#09090B] dark:border-[#FAFAFA] bg-[#09090B] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#09090B] font-semibold text-xs rounded-md hover:opacity-90 transition-all cursor-pointer"
                >
                  Proceed [Space]
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Pre-Lesson Modal View
  if (showPreLessonModal) {
    return (
      <div className="w-full max-w-2xl mx-auto py-6 px-4 animate-fade-in text-[#09090B] dark:text-[#FAFAFA] font-sans min-h-screen overflow-y-auto z-40 relative">
        <div className="bg-[#FFFFFF] dark:bg-[#121215] border border-[#E5E5E5] dark:border-[#27272A] p-6 sm:p-8 rounded-lg shadow-sm space-y-6 max-h-[85vh] overflow-y-auto">
          
          <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#27272A] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 border border-[#E5E5E5] dark:border-[#27272A] rounded-md bg-[#FAFAFA] dark:bg-[#18181B]">
                <HelpCircle className="w-5 h-5 opacity-80" />
              </div>
              <div>
                <span className="text-xs font-semibold text-neutral-500 block">Pre-Practice Overview</span>
                <h2 className="text-sm font-semibold mt-0.5">{sourceName}</h2>
              </div>
            </div>
            <span className="text-xs opacity-50 font-mono uppercase">
              Mode: {sessionType}
            </span>
          </div>

          <div className="space-y-4 text-xs leading-relaxed">
            {sessionType === 'lesson' ? (
              <>
                <p className="opacity-80">
                  This practice drill targets specific key combinations to build spatial awareness and muscle memory. Focus on rhythmic precision without looking down.
                </p>
                {exerciseKeys.length > 0 && (
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-xs opacity-70 block mb-1.5">Target Keys Set</span>
                      <div className="flex gap-1.5 font-mono">
                        {exerciseKeys.map(k => (
                          <span key={k} className="px-2.5 py-1 font-mono font-bold border border-[#09090B] dark:border-[#FAFAFA] bg-[#09090B] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#09090B] uppercase text-xs rounded-sm">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>

                    {settings.showKeyboard !== false && (
                      <div className="border border-[#E5E5E5] dark:border-[#27272A] p-4 bg-transparent space-y-2.5 rounded-lg">
                        <span className="font-semibold text-xs opacity-70 block">Finger Placement Map</span>
                        <VisualKeyboard
                          layoutName={settings.layout}
                          highlightKeys={exerciseKeys}
                          colorCoded={true}
                          size="compact"
                        />
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : sessionType === 'placement' ? (
              <div className="space-y-3">
                <p className="opacity-80">
                  Initializing 60-second diagnostic assessment test across standard prose text.
                </p>
                <div className="p-4 border border-[#E5E5E5] dark:border-[#27272A] bg-transparent space-y-1 text-xs rounded-lg">
                  <span className="font-semibold text-xs opacity-80 block mb-2">Practice Guidelines:</span>
                  <p>1. Maintain steady typing rhythm over raw speed.</p>
                  <p>2. Keep eyes anchored strictly on screen cursor.</p>
                  <p>3. Auto-calculates WPM & recommends course starting chapter at 60s.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="opacity-80">
                  Custom session loaded.
                </p>
                <div className="p-4 border border-[#E5E5E5] dark:border-[#27272A] bg-transparent space-y-1 text-xs rounded-lg font-sans">
                  <span className="font-semibold text-xs opacity-80 block mb-2">Session Overview:</span>
                  <p>Title: <strong>{sourceName}</strong></p>
                  <p>Length: <strong>{targetText.split(/\s+/).length} words</strong></p>
                  <p>Mode: <strong>{settings.strictMode ? "Strict (must fix errors)" : "Freeform"}</strong></p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end border-t border-[#E5E5E5] dark:border-[#27272A] pt-5">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-[#E5E5E5] dark:border-[#27272A] text-xs font-medium rounded-md hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={startSession}
              className="flex items-center gap-1.5 px-5 py-2 border border-[#09090B] dark:border-[#FAFAFA] bg-[#09090B] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#09090B] font-semibold text-xs rounded-md hover:opacity-90 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Practice [Space]
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 flex flex-col gap-4 animate-fade-in text-[#09090B] dark:text-[#FAFAFA] font-sans select-none relative">
      
      {/* Pause / Focus lost overlay */}
      {!isWindowFocused && (
        <div 
          onClick={() => window.focus()}
          className="absolute inset-0 bg-black/80 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center cursor-pointer rounded-lg font-sans"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="status-dot bg-red-500"></span>
            <span className="text-sm font-semibold text-white">Input Stream Paused</span>
          </div>
          <p className="text-xs text-neutral-400">Click anywhere or focus window to resume practice</p>
        </div>
      )}

      {/* Minimalist Status Header */}
      <div className="flex items-center justify-between text-xs font-medium border-b border-[#E5E5E5] dark:border-[#27272A] pb-3 mb-2 font-sans">
        <div className="flex items-center gap-3">
          <span className="status-dot"></span>
          <span className="opacity-90 font-semibold">{sourceName}</span>
          <span className="opacity-30">•</span>
          <span className="opacity-60">{settings.strictMode ? "Strict" : "Free"}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 font-mono opacity-90 text-xs">
            {durationLimit ? (
              <span>Time: {durationLimit - elapsedTime}s</span>
            ) : (
              <span>Time: {elapsedTime}s</span>
            )}
            <span className="opacity-30">•</span>
            <span>Words: {typedWordsCount}/{totalWords}</span>
          </div>
          
          <button
            onClick={onCancel}
            className="p-1 border border-[#E5E5E5] dark:border-[#27272A] rounded-md hover:bg-red-500 hover:text-white hover:border-transparent transition-all cursor-pointer opacity-70 hover:opacity-100"
            title="Exit [Esc]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Typing Container */}
      <div className="relative py-4">
        <div
          ref={containerRef}
          className={`${
            containerHeight === 'compact' ? 'h-28' : containerHeight === 'large' ? 'h-80' : 'h-48'
          } overflow-y-auto select-none p-2 border-none ${fontSizes[settings.fontSize]}`}
        >
          <div className="whitespace-pre-wrap select-none">
            {renderWords()}
          </div>
        </div>
      </div>

      {/* Progress Bar (Razor-thin monochrome line) */}
      <div className="w-full bg-[#E5E5E5] dark:bg-[#27272A] h-[2px] overflow-hidden">
        <div
          className="bg-[#09090B] dark:bg-[#FAFAFA] h-full transition-all duration-150"
          style={{ width: `${progressRatio * 100}%` }}
        />
      </div>

      {/* Visual Keyboard Overlay */}
      {settings.showKeyboard !== false && (
        <div className="mt-2">
          <VisualKeyboard
            layoutName={settings.layout}
            highlightKey={currentHighlightChar}
            showFingers={settings.keyboardSize !== 'compact'}
            size={settings.keyboardSize}
            colorCoded={settings.keyboardColorCoded}
          />
        </div>
      )}
    </div>
  );
}
