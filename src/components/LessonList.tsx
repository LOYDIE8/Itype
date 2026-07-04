import { useState } from 'react';
import { Play, CheckCircle2, Lock, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { lessonsData, LessonChapter, LessonStep } from '../utils/lessonsData';
import { Session } from '../types/electron';

interface LessonListProps {
  sessions: Session[];
  onSelectStep: (step: LessonStep, chapter: LessonChapter) => void;
  onStartPlacementTest: () => void;
}

export default function LessonList({ sessions, onSelectStep, onStartPlacementTest }: LessonListProps) {
  const [selectedChapter, setSelectedChapter] = useState<LessonChapter | null>(null);

  // Compile a set of successfully completed lesson steps IDs (passing: WPM >= 10 and Accuracy >= 80, Chapter Test: WPM >= 15 and Accuracy >= 90)
  const completedStepIds = new Set(
    sessions
      .filter(s => s.session_type === 'lesson')
      .map(s => {
        // Parse step ID from source_name. e.g. "Lesson 1-1: ..." or similar
        const match = s.source_name.match(/Lesson ([0-9\-]+)/);
        const stepId = match ? match[1] : '';
        if (!stepId) return { id: '', pass: false };

        const isTest = stepId.endsWith('-5');
        const pass = isTest
          ? (s.wpm >= 15 && s.accuracy >= 90)
          : (s.wpm >= 10 && s.accuracy >= 80);

        return { id: stepId, pass };
      })
      .filter(x => x.id !== '' && x.pass)
      .map(x => x.id)
  );

  // Helper: check if a chapter's final test (step X-5 / X-4 depending on count) is completed
  const isChapterCompleted = (chapterId: number): boolean => {
    const chapter = lessonsData.find(c => c.id === chapterId);
    if (!chapter) return false;
    const finalStep = chapter.steps[chapter.steps.length - 1];
    return completedStepIds.has(finalStep.id);
  };

  // Determine if a chapter is unlocked (Chapter 1 is always unlocked, Chapter C is unlocked if Chapter C-1 is completed)
  const isChapterUnlocked = (chapterId: number): boolean => {
    if (chapterId === 1) return true;
    return isChapterCompleted(chapterId - 1);
  };

  // Get high-score for completed step drills
  const getHighScore = (stepId: string) => {
    const matchSessions = sessions.filter(s => {
      const match = s.source_name.match(/Lesson ([0-9\-]+)/);
      return match && match[1] === stepId;
    });
    if (matchSessions.length === 0) return null;
    const maxWpm = Math.max(...matchSessions.map(s => s.wpm));
    const maxAcc = Math.max(...matchSessions.map(s => s.accuracy));
    return { wpm: Math.round(maxWpm), accuracy: Math.round(maxAcc) };
  };

  const getStepStatus = (chapter: LessonChapter, step: LessonStep, stepIdx: number) => {
    const isCompleted = completedStepIds.has(step.id);
    if (isCompleted) return 'completed';

    // Unlocked if it is the first step of an unlocked chapter
    if (stepIdx === 0) {
      return isChapterUnlocked(chapter.id) ? 'unlocked' : 'locked';
    }

    // Unlocked if the previous step in this chapter is completed
    const prevStep = chapter.steps[stepIdx - 1];
    if (completedStepIds.has(prevStep.id)) return 'unlocked';

    return 'locked';
  };

  const getCompletedStepsCount = (chapter: LessonChapter): number => {
    return chapter.steps.filter(s => completedStepIds.has(s.id)).length;
  };

  // ----------------------------------------------------
  // VIEW: TIMELINE STEPPER (Single Chapter Open)
  // ----------------------------------------------------
  if (selectedChapter) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in text-[#2E2C29] dark:text-[#D1D2D3]">
        {/* Back button */}
        <button
          onClick={() => setSelectedChapter(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 mb-6 rounded-lg border border-[#EBE7DF] dark:border-[#3F4245] bg-[#FFFFFF] dark:bg-[#2C2E30] text-xs font-semibold hover:bg-opacity-80 transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Chapters
        </button>

        <div className="mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-app)]">
            Course Progression
          </span>
          <h1 className="text-2xl font-light tracking-wide mt-1 mb-1">{selectedChapter.title}</h1>
          <p className="text-sm opacity-60">{selectedChapter.description}</p>
        </div>

        {/* Stepper timeline */}
        <div className="relative pl-6 border-l border-dashed border-[#EBE7DF] dark:border-[#3F4245] ml-4.5 space-y-8 py-2">
          {selectedChapter.steps.map((step, idx) => {
            const status = getStepStatus(selectedChapter, step, idx);
            const highScore = getHighScore(step.id);

            // Step type label mapping
            const typeLabels = {
              keys: 'Key Drill',
              combinations: 'Rhythm Drill',
              words: 'Word Drill',
              sentences: 'Sentence Drill',
              paragraph_test: 'Chapter Test'
            };

            return (
              <div key={step.id} className="relative group">
                {/* Timeline node icon indicator */}
                <div className="absolute -left-11 top-1.5 w-9 h-9 rounded-full flex items-center justify-center border z-10 transition-all">
                  {status === 'completed' ? (
                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-sm">
                      <CheckCircle2 className="w-5 h-5 fill-current bg-transparent" />
                    </div>
                  ) : status === 'unlocked' ? (
                    <div className="w-9 h-9 rounded-full bg-[var(--accent-app)] border-transparent flex items-center justify-center text-white shadow-md animate-pulse">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#FFFFFF] dark:bg-[#2C2E30] border-[#EBE7DF] dark:border-[#3F4245] flex items-center justify-center text-[#2E2C29]/40 dark:text-[#D1D2D3]/40 shadow-sm">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Step card details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#FFFFFF] dark:bg-[#2C2E30] border border-[#EBE7DF] dark:border-[#3F4245] rounded-xl hover:shadow-sm transition-all">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--accent-app)] bg-[var(--accent-app)]/10 px-1.5 py-0.5 rounded">
                        {typeLabels[step.type]}
                      </span>
                      <h3 className="text-sm font-semibold tracking-wide">
                        {step.title}
                      </h3>
                    </div>
                    
                    <p className="text-xs opacity-60 leading-relaxed">
                      {step.description}
                    </p>

                    {step.keys.length > 0 && (
                      <div className="flex gap-1 pt-1">
                        {step.keys.map((k) => (
                          <span
                            key={k}
                            className="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#FAF9F6] dark:bg-[#323437] border border-[#EBE7DF] dark:border-[#3F4245] uppercase font-bold"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions & High Score column */}
                  <div className="mt-4 sm:mt-0 flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 border-[#EBE7DF] dark:border-[#3F4245] pt-3.5 sm:pt-0 shrink-0">
                    {highScore && (
                      <div className="text-left sm:text-right text-xs">
                        <p className="font-bold text-emerald-500">{highScore.wpm} WPM</p>
                        <p className="opacity-40">{highScore.accuracy}% Acc</p>
                      </div>
                    )}
                    
                    <button
                      onClick={() => onSelectStep(step, selectedChapter)}
                      className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                        status === 'completed'
                          ? 'border border-[#EBE7DF] dark:border-[#3F4245] hover:bg-[var(--accent-app)]/10 hover:text-[var(--accent-app)]'
                          : status === 'unlocked'
                          ? 'bg-[var(--accent-app)] text-white hover:opacity-90'
                          : 'border border-[#EBE7DF] dark:border-[#3F4245] opacity-65 hover:bg-[var(--accent-app)]/10 hover:text-[var(--accent-app)]'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      {status === 'completed' ? 'Practice Again' : status === 'locked' ? 'Skip & Start' : 'Start'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: CHAPTERS HUB (Main Menu course overview)
  // ----------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in text-[#2E2C29] dark:text-[#D1D2D3]">
      
      {/* Placement Test Banner */}
      <div className="mb-10 bg-gradient-to-r from-[var(--accent-app)]/10 to-[#FAF9F6] dark:to-[#2C2E30] border border-[var(--accent-app)]/20 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-[var(--accent-app)]" />
            <h2 className="text-base font-semibold tracking-wide">Not sure of your typing level?</h2>
          </div>
          <p className="text-xs opacity-75 leading-relaxed">
            Take a 60-second placement test to estimate your typing speed and let Itype recommend your starting lesson level.
          </p>
        </div>
        <button
          onClick={onStartPlacementTest}
          className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg bg-[var(--accent-app)] text-white font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm shrink-0"
        >
          Take Placement Test
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-wide mb-1">Learning Academy</h1>
        <p className="text-sm opacity-60 font-medium">Structured multi-stage chapters based on TypingMaster's core curriculum loop.</p>
      </div>

      {/* Chapters list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lessonsData.map((chapter) => {
          const unlocked = isChapterUnlocked(chapter.id);
          const completedCount = getCompletedStepsCount(chapter);
          const progressPercent = (completedCount / chapter.steps.length) * 100;
          const completed = isChapterCompleted(chapter.id);

          return (
            <div
              key={chapter.id}
              className={`p-6 bg-[#FFFFFF] dark:bg-[#2C2E30] border rounded-xl flex flex-col justify-between min-h-[220px] transition-all relative ${
                unlocked 
                  ? 'border-[#EBE7DF] dark:border-[#3F4245] shadow-sm' 
                  : 'border-[#EBE7DF]/50 dark:border-[#3F4245]/50 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--accent-app)]">
                    Chapter {chapter.id}
                  </span>
                  {completed ? (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Completed
                    </span>
                  ) : !unlocked ? (
                    <Lock className="w-4.5 h-4.5 opacity-40 text-[#2E2C29] dark:text-[#D1D2D3]" />
                  ) : null}
                </div>
                <h3 className="text-base font-semibold tracking-wide">{chapter.title.split(': ')[1]}</h3>
                <p className="text-xs opacity-60 leading-relaxed">{chapter.description}</p>
              </div>

              {/* Progress and Actions */}
              <div className="mt-6 space-y-4 border-t border-[#EBE7DF] dark:border-[#3F4245] pt-4">
                {unlocked && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] opacity-50 font-semibold">
                      <span>Progression Progress</span>
                      <span>{completedCount} / {chapter.steps.length} Steps</span>
                    </div>
                    {/* Visual progress bar */}
                    <div className="w-full bg-[#FAF9F6] dark:bg-[#323437] h-1.5 rounded-full overflow-hidden border border-[#EBE7DF] dark:border-[#3F4245]">
                      <div
                        className="bg-[var(--accent-app)] h-full transition-all duration-350"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedChapter(chapter)}
                  className={`w-full flex items-center justify-center gap-1.5 p-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    unlocked
                      ? 'bg-[var(--accent-app)] text-white hover:opacity-90 shadow-sm'
                      : 'border border-[#EBE7DF] dark:border-[#3F4245] text-xs opacity-75 hover:bg-[var(--accent-app)]/10 hover:text-[var(--accent-app)]'
                  }`}
                >
                  {unlocked ? (
                    <>
                      Open Course
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Skip & Unlock
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
