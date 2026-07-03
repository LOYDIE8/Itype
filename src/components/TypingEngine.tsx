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
  const { playClick, playError } = useSynthAudio();

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

  // Timer interval
  useEffect(() => {
    if (isActive && !isFinished && !showPreLessonModal) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const next = prev + 1;
          if (durationLimit && next >= durationLimit) {
            handleFinish(next);
            return durationLimit;
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
  }, [isActive, isFinished, showPreLessonModal]);

  // Record second-by-second history coordinates for speed curves
  useEffect(() => {
    if (!isActive || isFinished || elapsedTime === 0) return;

    const correctChars = typedText.length - errorIndices.size;
    const currentWpm = Math.round(correctChars > 0 ? (correctChars / 5) / (elapsedTime / 60) : 0);
    const currentAcc = Math.round(typedText.length > 0 ? (correctChars / typedText.length) * 100 : 100);

    setSessionHistory(prev => [
      ...prev,
      { second: elapsedTime, wpm: currentWpm, accuracy: currentAcc }
    ]);
  }, [elapsedTime, isActive, isFinished]);

  // Keydown capture listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || showPreLessonModal) return;

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
          playError(settings.sound, settings.soundVolume);
        }
      } else {
        const isCorrect = inputChar === expectedChar;
        setTypedText(prev => prev + inputChar);
        setCurrentIndex(prev => prev + 1);

        if (isCorrect) {
          playClick(settings.sound, settings.soundVolume, settings.soundProfile);
        } else {
          logError(expectedChar);
          playError(settings.sound, settings.soundVolume);
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
  }, [currentIndex, isFinished, isActive, startTime, elapsedTime, targetText, settings, showPreLessonModal]);

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
    if (accuracy === 100 && targetText.length >= 80) listToUnlock.push('sniper');
    if (duration >= 300) listToUnlock.push('marathoner');

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

  // Render word-wrapped highlights (Monkeytype style: keeps words whole, wraps entire word blocks)
  const renderWords = () => {
    const words: { letters: { char: string; index: number }[] }[] = [];
    let currentWord: { char: string; index: number }[] = [];
    
    for (let i = 0; i < targetText.length; i++) {
      const char = targetText[i];
      currentWord.push({ char, index: i });
      // Break on spaces or newlines (include character in the word box so space behaves naturally)
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
          let charClass = "text-[#2E2C29]/25 dark:text-[#ECE8E1]/25"; // Untyped (Very faint)
          let isCaret = index === currentIndex;
          let displayChar = char === '\n' ? '↵\n' : char === ' ' ? '\u00A0' : char;

          if (index < currentIndex) {
            const isError = errorIndices.has(index);
            if (isError) {
              charClass = "text-red-500 border-b-2 border-red-500/80 font-medium px-0.5 rounded-sm";
            } else {
              charClass = "text-[#2E2C29] dark:text-[#ECE8E1] opacity-90"; // Typed correct
            }
          }

          return (
            <span
              key={index}
              ref={isCaret ? activeCharRef : null}
              className={`relative inline-block transition-colors select-none font-mono ${charClass} ${
                isCaret ? 'text-[#2E2C29] dark:text-[#ECE8E1]' : ''
              }`}
            >
              {displayChar}
              {/* Vertical gliding blinking caret */}
              {isCaret && (
                <span className="absolute left-0 top-[10%] bottom-[10%] w-[2.5px] bg-[var(--accent-app)] animate-pulse" />
              )}
            </span>
          );
        })}
      </span>
    ));
  };  // Results Screen View
  if (isFinished) {
    const finalWpm = calculateNetWpm(typedText.length, errorIndices.size, elapsedTime);
    const finalAccuracy = calculateAccuracy(typedText.length - errorIndices.size, typedText.length);
    const totalErrors = Object.values(problemKeys).reduce((a, b) => a + b, 0);

    const isChapterTest = sourceName.toLowerCase().includes('chapter') && sourceName.toLowerCase().includes('test');
    const hasPassed = finalWpm >= 15 && finalAccuracy >= 90;
    const showNextButton = onNextLesson && (!isChapterTest || hasPassed);

    return (
      <div className="max-w-xl mx-auto py-10 px-4 animate-fade-in text-[#2E2C29] dark:text-[#ECE8E1]">
        <div className="bg-[#FFFDFB] dark:bg-[#201E1C] border border-[#E6E1D8] dark:border-[#2F2D2A] rounded-xl p-8 text-center shadow-sm">
          <Award className="w-12 h-12 text-[var(--accent-app)] mx-auto mb-3" />
          <h2 className="text-xl font-light tracking-wide mb-1">Session Complete!</h2>
          <p className="text-xs opacity-50 mb-6">{sourceName}</p>

          {isChapterTest && (
            <div className={`mb-6 p-4 rounded-xl text-left border ${
              hasPassed 
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-600 border-red-500/20'
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-1">
                {hasPassed ? '🎉 Chapter Test Passed!' : '⚠️ Passing Criteria Not Met'}
              </h4>
              <p className="text-xs leading-relaxed opacity-85">
                {hasPassed 
                  ? `Congratulations! You cleared the assessment with ${finalWpm} WPM and ${finalAccuracy}% Accuracy, unlocking the next Chapter.` 
                  : `You achieved ${finalWpm} WPM and ${finalAccuracy}% Accuracy. A minimum of 15 WPM and 90% Accuracy is required to unlock the next chapter.`}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-[#FAF7F2] dark:bg-[#181715] border border-[#E6E1D8] dark:border-[#2F2D2A]">
              <p className="text-2xl font-light text-[var(--accent-app)]">{finalWpm} <span className="text-xs opacity-50 font-normal">WPM</span></p>
              <p className="text-[10px] uppercase font-bold tracking-wider opacity-40 mt-1">Typing Speed</p>
            </div>
            <div className="p-4 rounded-lg bg-[#FAF7F2] dark:bg-[#181715] border border-[#E6E1D8] dark:border-[#2F2D2A]">
              <p className="text-2xl font-light text-emerald-500">{finalAccuracy}%</p>
              <p className="text-[10px] uppercase font-bold tracking-wider opacity-40 mt-1">Accuracy</p>
            </div>
            <div className="p-4 rounded-lg bg-[#FAF7F2] dark:bg-[#181715] border border-[#E6E1D8] dark:border-[#2F2D2A]">
              <p className="text-2xl font-light">{totalErrors}</p>
              <p className="text-[10px] uppercase font-bold tracking-wider opacity-40 mt-1">Error Count</p>
            </div>
            <div className="p-4 rounded-lg bg-[#FAF7F2] dark:bg-[#181715] border border-[#E6E1D8] dark:border-[#2F2D2A]">
              <p className="text-2xl font-light">{formatDuration(elapsedTime)}</p>
              <p className="text-[10px] uppercase font-bold tracking-wider opacity-40 mt-1">Time Elapsed</p>
            </div>
          </div>

          {/* Dynamic Session Speed Curve */}
          {sessionHistory.length > 1 && (
            <div className="mb-8 p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#181715] border border-[#E6E1D8] dark:border-[#2F2D2A] text-left font-sans">
              <h4 className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-3.5">Speed Curve (WPM / Accuracy)</h4>
              <div className="h-40 w-full font-sans">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessionHistory}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="second" tick={{ fontSize: 9 }} label={{ value: 'Seconds', position: 'insideBottom', offset: -5, fontSize: 8 }} opacity={0.4} />
                    <YAxis yAxisId="left" tick={{ fontSize: 9 }} label={{ value: 'WPM', angle: -90, position: 'insideLeft', fontSize: 8 }} opacity={0.4} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} label={{ value: 'Acc %', angle: 90, position: 'insideRight', fontSize: 8 }} opacity={0.4} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card-app)',
                        borderColor: 'var(--border-app)',
                        borderRadius: '6px',
                        fontSize: '9px',
                        color: 'var(--text-app)'
                      }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="wpm" name="Speed (WPM)" stroke="var(--accent-app)" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="accuracy" name="Accuracy (%)" stroke="#10b981" strokeWidth={1} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {Object.keys(problemKeys).length > 0 && (
            <div className="mb-8 text-left">
              <h4 className="text-xs font-semibold uppercase tracking-wider opacity-50 mb-2.5">Problem Keys</h4>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(problemKeys)
                  .sort((a, b) => b[1] - a[1])
                  .map(([key, count]) => (
                    <span
                      key={key}
                      className="px-2 py-1 rounded text-xs bg-red-500/10 text-red-500 font-mono border border-red-500/15"
                    >
                      {key === '\n' ? 'enter' : key} ({count})
                    </span>
                  ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-lg border border-[#E6E1D8] dark:border-[#2F2D2A] text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-[#181715] transition-all cursor-pointer"
            >
              Back to Menu
            </button>
            <button
              onClick={resetSession}
              className="px-4 py-2.5 rounded-lg border border-[#E6E1D8] dark:border-[#2F2D2A] text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-[#181715] transition-all cursor-pointer"
            >
              Practice Again
            </button>
            {showNextButton && (
              <button
                onClick={onNextLesson}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[var(--accent-app)] text-white font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm"
              >
                Next Lesson
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showPreLessonModal) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 animate-fade-in text-[#2E2C29] dark:text-[#ECE8E1]">
        <div className="bg-[#FFFDFB] dark:bg-[#201E1C] border border-[#E6E1D8] dark:border-[#2F2D2A] rounded-xl p-8 shadow-sm space-y-6">
          
          <div className="flex items-center gap-3 border-b border-[#E6E1D8] dark:border-[#2F2D2A] pb-4">
            <div className="p-2.5 bg-[#FAF7F2] dark:bg-[#181715] rounded-lg text-[var(--accent-app)] border border-[#E6E1D8] dark:border-[#2F2D2A]">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--accent-app)]">
                Pre-Practice Tutorial
              </span>
              <h2 className="text-base font-semibold tracking-wide mt-0.5">{sourceName}</h2>
            </div>
          </div>

          <div className="space-y-4 text-xs leading-relaxed">
            {sessionType === 'lesson' ? (
              <>
                <p>
                  This practice drill targets specific keys to build spatial awareness and muscle memory. Take your time to locate each key without looking down.
                </p>
                {exerciseKeys.length > 0 && (
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold block mb-1 text-[var(--accent-app)]">Target Keys for this Drill:</span>
                      <div className="flex gap-1.5">
                        {exerciseKeys.map(k => (
                          <span key={k} className="px-2 py-0.5 rounded font-mono font-bold bg-[#FAF7F2] dark:bg-[#181715] border border-[#E6E1D8] dark:border-[#2F2D2A] uppercase">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* Color coded mapping reminder overlay */}
                    <div className="border border-[#E6E1D8] dark:border-[#2F2D2A] rounded-xl p-3 bg-[#FAF7F2] dark:bg-[#181715] space-y-2.5">
                      <span className="font-semibold block text-[10px] uppercase tracking-wider opacity-60">Visual Finger Placement Map:</span>
                      <VisualKeyboard
                        layoutName={settings.layout}
                        highlightKeys={exerciseKeys}
                        colorCoded={true}
                        size="compact"
                      />
                    </div>
                  </div>
                )}
              </>
            ) : sessionType === 'placement' ? (
              <div className="space-y-3">
                <p>
                  You are starting the **Placement Assessment**. This test runs for exactly **60 seconds** on a neutral paragraph.
                </p>
                <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#181715] border border-[#E6E1D8] dark:border-[#2F2D2A]">
                  <h4 className="font-semibold text-xs text-[var(--accent-app)] mb-1">Testing Rules:</h4>
                  <ul className="list-disc pl-5 space-y-1 opacity-75">
                    <li>Maintain a steady rhythm over speed.</li>
                    <li>Keep your eyes strictly on the screen.</li>
                    <li>When the timer runs out, the test will automatically save and recommend your typing course level.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p>
                  You are starting a **Custom Text Practice Session** using your own text snippet.
                </p>
                <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#181715] border border-[#E6E1D8] dark:border-[#2F2D2A]">
                  <h4 className="font-semibold text-xs text-[var(--accent-app)] mb-1.5">Session Overview:</h4>
                  <p className="opacity-80">Text Title: <strong>{sourceName}</strong></p>
                  <p className="opacity-80 mt-1">Length: <strong>{targetText.split(/\s+/).length} words</strong></p>
                  <p className="opacity-80 mt-1">Rules: <strong>{settings.strictMode ? "Strict Mode (fix errors)" : "Free Mode"}</strong></p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end border-t border-[#E6E1D8] dark:border-[#2F2D2A] pt-5">
            <button
              onClick={onCancel}
              className="px-4.5 py-2.5 rounded-lg border border-[#E6E1D8] dark:border-[#2F2D2A] text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-[#181715] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={startSession}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[var(--accent-app)] text-white font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Typing Drill
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Active Typing Interface (Monkeytype Distraction-Free Layout)
  const progressRatio = currentIndex / targetText.length;
  const currentHighlightChar = targetText[currentIndex] || '';

  const totalWords = targetText.split(/\s+/).filter(w => w.length > 0).length;
  const typedWordsCount = typedText.trim() === '' ? 0 : typedText.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 flex flex-col gap-4 animate-fade-in text-[#2E2C29] dark:text-[#D1D2D3]">
      
      {/* Minimalist Dashboard Header (Monkeytype Style: Ultra Clean & Distraction-Free) */}
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-50 border-b border-[#EBE7DF] dark:border-[#3F4245] pb-2 mb-2 select-none">
        <div className="flex items-center gap-3">
          <span className="text-[var(--accent-app)]">{sourceName}</span>
          <span className="opacity-45">|</span>
          <span>{settings.strictMode ? "Strict" : "Free"}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 font-mono text-[var(--accent-app)] font-bold">
            {durationLimit ? (
              <span>Time: {durationLimit - elapsedTime}s</span>
            ) : (
              <span>Time: {elapsedTime}s</span>
            )}
            <span className="opacity-45">|</span>
            <span>Progress: {typedWordsCount} / {totalWords} words</span>
          </div>
          
          <button
            onClick={onCancel}
            className="p-1 rounded-md hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer opacity-70 hover:opacity-100"
            title="Exit Test"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Typing Frame (Monkeytype style: no card, no border, floating text) */}
      <div className="relative py-4">
        {/* Text Container */}
        <div
          ref={containerRef}
          className={`${
            containerHeight === 'compact' ? 'h-28' : containerHeight === 'large' ? 'h-80' : 'h-48'
          } overflow-y-auto select-none p-2 focus:border-transparent ${fontSizes[settings.fontSize]}`}
        >
          <div className="whitespace-pre-wrap select-none">
            {renderWords()}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E6E1D8]/45 dark:bg-[#2F2D2A]/45 h-1 rounded-full overflow-hidden">
        <div
          className="bg-[var(--accent-app)] h-full transition-all duration-150"
          style={{ width: `${progressRatio * 100}%` }}
        />
      </div>

      {/* Visual Keyboard Overlay */}
      <div className="mt-2">
        <VisualKeyboard
          layoutName={settings.layout}
          highlightKey={currentHighlightChar}
          showFingers={settings.keyboardSize !== 'compact'}
          size={settings.keyboardSize}
          colorCoded={settings.keyboardColorCoded}
        />
      </div>
    </div>
  );
}
