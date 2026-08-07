import { useState, useEffect } from 'react';
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

  // Space key navigation listener to proceed through chapters and steps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (selectedChapter) {
          // Find first active/unlocked step
          const activeStep = selectedChapter.steps.find((step, idx) => {
            const status = getStepStatus(selectedChapter, step, idx);
            return status === 'unlocked' || status === 'completed';
          }) || selectedChapter.steps[0];

          if (activeStep) {
            onSelectStep(activeStep, selectedChapter);
          }
        } else {
          // Open first unlocked chapter
          const firstUnlocked = lessonsData.find(c => isChapterUnlocked(c.id)) || lessonsData[0];
          if (firstUnlocked) {
            setSelectedChapter(firstUnlocked);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedChapter, completedStepIds]);

  // ----------------------------------------------------
  // VIEW: TIMELINE STEPPER (Single Chapter Open)
  // ----------------------------------------------------
  if (selectedChapter) {
    return (
      <div className="max-w-3xl mx-auto py-6 px-4 animate-fade-in text-[#09090B] dark:text-[#FAFAFA] font-sans">
        {/* Back button */}
        <button
          onClick={() => setSelectedChapter(null)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 mb-6 border border-[#E5E5E5] dark:border-[#27272A] bg-transparent text-xs font-semibold hover:bg-[#09090B] hover:text-[#FFFFFF] dark:hover:bg-[#FAFAFA] dark:hover:text-[#09090B] transition-all cursor-pointer rounded-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Lessons
        </button>

        <div className="mb-8 border-b border-[#E5E5E5] dark:border-[#27272A] pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="status-dot"></span>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Chapter {selectedChapter.id} • Step Progression
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight mt-1 mb-1">{selectedChapter.title}</h1>
          <p className="text-xs opacity-60 font-sans">{selectedChapter.description}</p>
        </div>

        {/* Stepper timeline */}
        <div className="relative pl-6 border-l border-dashed border-[#E5E5E5] dark:border-[#27272A] ml-4.5 space-y-6 py-2">
          {selectedChapter.steps.map((step, idx) => {
            const status = getStepStatus(selectedChapter, step, idx);
            const highScore = getHighScore(step.id);

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
                <div className="absolute -left-10.5 top-2.5 w-8 h-8 flex items-center justify-center border z-10 transition-all rounded-full bg-[#FFFFFF] dark:bg-[#09090B]">
                  {status === 'completed' ? (
                    <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500 rounded-full flex items-center justify-center text-emerald-500">
                      <CheckCircle2 className="w-4 h-4 fill-current bg-transparent" />
                    </div>
                  ) : status === 'unlocked' ? (
                    <div className="w-8 h-8 bg-[#09090B] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#09090B] rounded-full flex items-center justify-center font-bold">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-transparent border border-[#E5E5E5] dark:border-[#27272A] rounded-full flex items-center justify-center opacity-40">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Step card details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[#E5E5E5] dark:border-[#27272A] bg-transparent hover:border-[#09090B] dark:hover:border-[#FAFAFA] transition-all rounded-lg">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold uppercase tracking-wider border border-[#E5E5E5] dark:border-[#27272A] px-2 py-0.5 rounded-md bg-[#FAFAFA] dark:bg-[#18181B]">
                        {typeLabels[step.type]}
                      </span>
                      <h3 className="text-xs font-semibold">
                        {step.title}
                      </h3>
                    </div>
                    
                    <p className="text-xs opacity-60 font-sans leading-relaxed">
                      {step.description}
                    </p>

                    {step.keys.length > 0 && (
                      <div className="flex gap-1 pt-1 font-mono">
                        {step.keys.map((k) => (
                          <span
                            key={k}
                            className="inline-block px-1.5 py-0.5 border border-[#E5E5E5] dark:border-[#27272A] text-[10px] uppercase font-bold rounded-sm"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions & High Score column */}
                  <div className="mt-4 sm:mt-0 flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 border-[#E5E5E5] dark:border-[#27272A] pt-3 sm:pt-0 shrink-0 font-sans">
                    {highScore && (
                      <div className="text-left sm:text-right text-xs">
                        <p className="font-bold text-emerald-500 font-mono">{highScore.wpm} WPM</p>
                        <p className="opacity-40">{highScore.accuracy}% Acc</p>
                      </div>
                    )}
                    
                    <button
                      onClick={() => onSelectStep(step, selectedChapter)}
                      className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-semibold tracking-wide transition-all cursor-pointer rounded-md ${
                        status === 'completed'
                          ? 'border-[#E5E5E5] dark:border-[#27272A] hover:bg-[#09090B] hover:text-[#FFFFFF] dark:hover:bg-[#FAFAFA] dark:hover:text-[#09090B]'
                          : status === 'unlocked'
                          ? 'border-[#09090B] dark:border-[#FAFAFA] bg-[#09090B] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#09090B] hover:opacity-90'
                          : 'border-[#E5E5E5] dark:border-[#27272A] opacity-60 hover:opacity-100 hover:border-[#09090B] dark:hover:border-[#FAFAFA]'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      {status === 'completed' ? 'Practice Again' : status === 'locked' ? 'Skip & Practice' : 'Start Practice'}
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
    <div className="max-w-4xl mx-auto py-6 px-4 animate-fade-in text-[#09090B] dark:text-[#FAFAFA] font-sans">
      
      {/* Placement Test Banner */}
      <div className="mb-8 border border-[#E5E5E5] dark:border-[#27272A] p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#FAFAFA] dark:bg-[#121215] rounded-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">Diagnostic Typing Assessment</h2>
          </div>
          <p className="text-xs opacity-60 leading-relaxed font-sans">
            Take a 60-second typing test to measure your speed and get a personalized starting chapter recommendation.
          </p>
        </div>
        <button
          onClick={onStartPlacementTest}
          className="flex items-center gap-1.5 px-4 py-2 border border-[#09090B] dark:border-[#FAFAFA] bg-[#09090B] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#09090B] font-semibold text-xs rounded-md hover:opacity-90 transition-all cursor-pointer shrink-0"
        >
          Start Evaluation
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-8 border-b border-[#E5E5E5] dark:border-[#27272A] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="status-dot"></span>
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Curriculum</span>
        </div>
        <h1 className="text-2xl font-light tracking-tight font-sans">Structured Typing Chapters</h1>
        <p className="text-xs opacity-60 font-sans mt-0.5">Sequential 5-step training paths across all keyboard character regions.</p>
      </div>

      {/* Chapters list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
        {lessonsData.map((chapter) => {
          const unlocked = isChapterUnlocked(chapter.id);
          const completedCount = getCompletedStepsCount(chapter);
          const progressPercent = (completedCount / chapter.steps.length) * 100;
          const completed = isChapterCompleted(chapter.id);

          return (
            <div
              key={chapter.id}
              className={`p-5 border flex flex-col justify-between min-h-[210px] transition-all bg-transparent rounded-xl ${
                unlocked 
                  ? 'border-[#E5E5E5] dark:border-[#27272A] hover:border-[#09090B] dark:hover:border-[#FAFAFA]' 
                  : 'border-[#E5E5E5]/40 dark:border-[#27272A]/40 opacity-50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Chapter 0{chapter.id}
                  </span>
                  {completed ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      ✓ Passed
                    </span>
                  ) : !unlocked ? (
                    <Lock className="w-3.5 h-3.5 opacity-40" />
                  ) : null}
                </div>
                <h3 className="text-sm font-semibold">{chapter.title.split(': ')[1]}</h3>
                <p className="text-xs opacity-60 leading-relaxed font-sans">{chapter.description}</p>
              </div>

              {/* Progress and Actions */}
              <div className="mt-6 space-y-4 border-t border-[#E5E5E5] dark:border-[#27272A] pt-4">
                {unlocked && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] opacity-60 font-medium">
                      <span>Progression</span>
                      <span>{completedCount} / {chapter.steps.length} Steps</span>
                    </div>
                    {/* Visual progress bar */}
                    <div className="w-full bg-[#E5E5E5] dark:bg-[#27272A] h-1 rounded-full overflow-hidden">
                      <div
                        className="bg-[#09090B] dark:bg-[#FAFAFA] h-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setSelectedChapter(chapter)}
                  className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-3 border text-xs font-semibold tracking-wide transition-all cursor-pointer rounded-md ${
                    unlocked
                      ? 'border-[#09090B] dark:border-[#FAFAFA] bg-[#09090B] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#09090B] hover:opacity-90'
                      : 'border-[#E5E5E5] dark:border-[#27272A] opacity-75 hover:opacity-100 hover:border-[#09090B] dark:hover:border-[#FAFAFA]'
                  }`}
                >
                  {unlocked ? (
                    <>
                      Open Chapter
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Unlock Chapter
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
