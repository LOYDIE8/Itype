import { useState, useEffect } from 'react';
import { BookOpen, BarChart4, Settings, LogOut, Moon, Sun, ArrowRight, Award, HelpCircle, RefreshCw, Upload } from 'lucide-react';
import { Profile, Session } from './types/electron';
import { LessonStep, lessonsData } from './utils/lessonsData';
import ProfileSelector from './components/ProfileSelector';
import LessonList from './components/LessonList';
import TypingEngine from './components/TypingEngine';
import CustomTextPanel from './components/CustomTextPanel';
import Dashboard from './components/Dashboard';
import SettingsPanel from './components/SettingsPanel';
import TutorialGuide from './components/TutorialGuide';

// Placement Test content (neutral paragraph of ~100 words)
const PLACEMENT_TEST_TEXT = "The standard typing test is designed to measure speed and accuracy. In this test, you should focus on touch typing without looking down at your hands. Placing your fingers correctly on the home row keys is the foundation of high-speed typing. Speed comes naturally as you build muscle memory. Keep your wrists slightly elevated and maintain a steady rhythm as you press each key. Practice daily to see improvements in your words per minute. Consistent habits make touch typing feel natural and effortless, freeing your mind to focus on creating and communicating.";

export default function App() {
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [activeView, setActiveView] = useState<'tutorial' | 'lessons' | 'essays' | 'generator' | 'custom' | 'stats' | 'settings'>('tutorial');
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // Typing session states
  const [activeStep, setActiveStep] = useState<LessonStep | null>(null);
  const [activeSessionType, setActiveSessionType] = useState<'placement' | 'lesson' | 'custom' | null>(null);
  
  // Placement recommendation modal states
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [placementResults, setPlacementResults] = useState<{ wpm: number; accuracy: number; level: string } | null>(null);

  // Initialize and load sessions when a profile is selected
  useEffect(() => {
    if (activeProfile) {
      // Sync theme on load
      const root = document.documentElement;
      if (activeProfile.settings.theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Sync color accent theme class on load
      root.classList.remove('accent-terracotta', 'accent-forest', 'accent-oasis', 'accent-sand');
      const activeAccent = activeProfile.settings.accentColor || 'terracotta';
      root.classList.add(`accent-${activeAccent}`);

      // Sync global app font size class on load
      root.classList.remove('size-app-small', 'size-app-medium', 'size-app-large');
      const activeSize = activeProfile.settings.appFontSize || 'medium';
      root.classList.add(`size-app-${activeSize}`);

      // Sync global app font family class on load
      root.classList.remove('font-app-sans', 'font-app-serif', 'font-app-mono');
      const activeFont = activeProfile.settings.appFontType || 'sans';
      root.classList.add(`font-app-${activeFont}`);

      loadSessions(activeProfile.id);
    }
  }, [activeProfile]);

  const loadSessions = async (profileId: number) => {
    try {
      const list = await window.api.getSessions(profileId);
      setSessions(list);
    } catch (err) {
      console.error("Failed to load session history", err);
    }
  };

  const handleSelectProfile = (profile: Profile) => {
    setActiveProfile(profile);
    setActiveView('lessons');
    setActiveStep(null);
    setActiveSessionType(null);
  };

  const handleSwitchProfile = () => {
    setActiveProfile(null);
    setActiveStep(null);
    setActiveSessionType(null);
    // Clear theme on exit
    document.documentElement.classList.remove('dark');
  };

  // Toggle theme from quick navbar button
  const handleToggleTheme = async () => {
    if (!activeProfile) return;
    const nextTheme: 'light' | 'dark' = activeProfile.settings.theme === 'light' ? 'dark' : 'light';
    const nextSettings = {
      ...activeProfile.settings,
      theme: nextTheme
    };
    try {
      await window.api.updateProfileSettings(activeProfile.id, nextSettings);
      setActiveProfile({
        ...activeProfile,
        settings: nextSettings
      });
    } catch (err) {
      console.warn("Theme toggle failed", err);
    }
  };

  // Start placement test
  const handleStartPlacementTest = () => {
    const step: LessonStep = {
      id: "placement",
      title: "Placement Assessment",
      type: "paragraph_test",
      keys: ["Full Keyboard"],
      text: PLACEMENT_TEST_TEXT,
      description: "60-second touch typing assessment."
    };
    setActiveStep(step);
    setActiveSessionType('placement');
  };

  // Callback on session completion
  const handleCompleteSession = async (
    wpm: number,
    accuracy: number,
    _errorCount: number,
    _duration: number,
    _problemKeys: Record<string, number>
  ) => {
    if (!activeProfile) return;
    
    // Reload sessions to refresh stats/unlocks immediately
    await loadSessions(activeProfile.id);

    // If it was a placement test, pop up the recommendation level modal
    if (activeSessionType === 'placement') {
      let level = 'Beginner';
      if (wpm >= 25 && wpm <= 50) level = 'Intermediate';
      else if (wpm > 50) level = 'Advanced';

      setPlacementResults({ wpm, accuracy, level });
      setShowPlacementModal(true);
    }
  };

  const handleCancelSession = () => {
    setActiveStep(null);
    setActiveSessionType(null);
  };

  // Flatten steps for progression routing
  const flatSteps = lessonsData.flatMap(g => g.steps);
  const activeStepIndex = activeStep ? flatSteps.findIndex(s => s.id === activeStep.id) : -1;
  const hasNextLesson = activeSessionType === 'lesson' && activeStepIndex !== -1 && activeStepIndex < flatSteps.length - 1;

  const handleNextLesson = () => {
    if (hasNextLesson) {
      const nextStep = flatSteps[activeStepIndex + 1];
      setActiveStep(nextStep);
      setActiveSessionType('lesson');
    }
  };

  if (!activeProfile) {
    return <ProfileSelector onSelectProfile={handleSelectProfile} />;
  }

  // Active Typing Mode Screen (Distraction-Free Monkeytype Sizing)
  if (activeStep && activeSessionType) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#323437] flex flex-col justify-between py-6">
        <TypingEngine
          profile={activeProfile}
          targetText={activeStep.text}
          sourceName={
            activeSessionType === 'placement'
              ? 'Placement Assessment (60s)'
              : activeSessionType === 'lesson'
              ? `Lesson ${activeStep.id}: ${activeStep.title}`
              : activeStep.title
          }
          sessionType={activeSessionType}
          exerciseKeys={activeStep.keys}
          durationLimit={activeSessionType === 'placement' ? 60 : undefined}
          onCompleteSession={handleCompleteSession}
          onCancel={handleCancelSession}
          onNextLesson={hasNextLesson ? handleNextLesson : undefined}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FAF9F6] dark:bg-[#323437] text-[#2E2C29] dark:text-[#D1D2D3] transition-all">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#FFFFFF] dark:bg-[#2C2E30] border-r border-[#EBE7DF] dark:border-[#3F4245] flex flex-col justify-between p-6 select-none shrink-0 shadow-sm">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2">
            <h1 className="text-xl font-light tracking-wide">
              I<span className="font-semibold text-[var(--accent-app)]">type</span>
            </h1>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveView('tutorial')}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeView === 'tutorial'
                  ? 'bg-[var(--accent-app)]/10 text-[var(--accent-app)]'
                  : 'hover:bg-[#FAF9F6] dark:hover:bg-[#323437] opacity-70 hover:opacity-100'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              How to Type Guide
            </button>
            <button
              onClick={() => setActiveView('lessons')}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeView === 'lessons'
                  ? 'bg-[var(--accent-app)]/10 text-[var(--accent-app)]'
                  : 'hover:bg-[#FAF9F6] dark:hover:bg-[#323437] opacity-70 hover:opacity-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Learning Journey
            </button>
            <button
              onClick={() => setActiveView('essays')}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeView === 'essays'
                  ? 'bg-[var(--accent-app)]/10 text-[var(--accent-app)]'
                  : 'hover:bg-[#FAF9F6] dark:hover:bg-[#323437] opacity-70 hover:opacity-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Predefined Essays
            </button>
            <button
              onClick={() => setActiveView('generator')}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeView === 'generator'
                  ? 'bg-[var(--accent-app)]/10 text-[var(--accent-app)]'
                  : 'hover:bg-[#FAF9F6] dark:hover:bg-[#323437] opacity-70 hover:opacity-100'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Quick Practice
            </button>
            <button
              onClick={() => setActiveView('custom')}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeView === 'custom'
                  ? 'bg-[var(--accent-app)]/10 text-[var(--accent-app)]'
                  : 'hover:bg-[#FAF9F6] dark:hover:bg-[#323437] opacity-70 hover:opacity-100'
              }`}
            >
              <Upload className="w-4 h-4" />
              Custom Text Import
            </button>
            <button
              onClick={() => setActiveView('stats')}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeView === 'stats'
                  ? 'bg-[var(--accent-app)]/10 text-[var(--accent-app)]'
                  : 'hover:bg-[#FAF9F6] dark:hover:bg-[#323437] opacity-70 hover:opacity-100'
              }`}
            >
              <BarChart4 className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('settings')}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeView === 'settings'
                  ? 'bg-[var(--accent-app)]/10 text-[var(--accent-app)]'
                  : 'hover:bg-[#FAF9F6] dark:hover:bg-[#323437] opacity-70 hover:opacity-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </nav>
        </div>

        {/* Footer Account Card */}
        <div className="space-y-4 pt-4 border-t border-[#EBE7DF] dark:border-[#3F4245]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#FAF9F6] dark:bg-[#323437] border border-[#EBE7DF] dark:border-[#3F4245] flex items-center justify-center font-bold text-xs shrink-0">
                {activeProfile.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate leading-none">{activeProfile.name}</p>
                <p className="text-[9px] opacity-40 mt-1 uppercase font-bold tracking-wider leading-none">Local Profile</p>
              </div>
            </div>
            
            {/* Quick theme toggler */}
            <button
              onClick={handleToggleTheme}
              className="p-1.5 rounded hover:bg-[#FAF9F6] dark:hover:bg-[#323437] opacity-60 hover:opacity-100 transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {activeProfile.settings.theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-[var(--accent-app)]" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <button
            onClick={handleSwitchProfile}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Switch Profiles
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto px-8 py-4">
        {activeView === 'tutorial' && <TutorialGuide />}
        
        {activeView === 'lessons' && (
          <LessonList
            sessions={sessions}
            onSelectStep={(step) => {
              setActiveStep(step);
              setActiveSessionType('lesson');
            }}
            onStartPlacementTest={handleStartPlacementTest}
          />
        )}

        {activeView === 'essays' && (
          <CustomTextPanel
            profileId={activeProfile.id}
            viewMode="essays"
            onSelectExercise={(step) => {
              setActiveStep(step);
              setActiveSessionType('custom');
            }}
          />
        )}

        {activeView === 'generator' && (
          <CustomTextPanel
            profileId={activeProfile.id}
            viewMode="generator"
            onSelectExercise={(step) => {
              setActiveStep(step);
              setActiveSessionType('custom');
            }}
          />
        )}

        {activeView === 'custom' && (
          <CustomTextPanel
            profileId={activeProfile.id}
            viewMode="custom"
            onSelectExercise={(step) => {
              setActiveStep(step);
              setActiveSessionType('custom');
            }}
          />
        )}

        {activeView === 'stats' && (
          <Dashboard
            profileId={activeProfile.id}
            onStartCustomReview={(text, title) => {
              const step = {
                id: "custom-review",
                title: title,
                type: "words" as const,
                keys: ["Weak Keys"],
                text: text,
                description: `Focused review for keys: ${title.replace("Weak Keys: ", "")}`
              };
              setActiveStep(step);
              setActiveSessionType('custom');
            }}
          />
        )}

        {activeView === 'settings' && (
          <SettingsPanel
            profile={activeProfile}
            onUpdateProfile={setActiveProfile}
            onSwitchProfile={handleSwitchProfile}
          />
        )}
      </main>

      {/* Placement test level recommendation Modal */}
      {showPlacementModal && placementResults && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#2C2E30] border border-[#EBE7DF] dark:border-[#3F4245] rounded-xl p-8 shadow-lg text-center animate-fade-in text-[#2E2C29] dark:text-[#D1D2D3]">
            <Award className="w-12 h-12 text-[var(--accent-app)] mx-auto mb-3" />
            <h2 className="text-lg font-semibold tracking-wide">Assessment Completed!</h2>
            <p className="text-xs opacity-50 mb-6">Here are your starting stats:</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-[#FAF9F6] dark:bg-[#323437] border border-[#EBE7DF] dark:border-[#3F4245] rounded-lg">
                <p className="text-xl font-bold text-[var(--accent-app)]">{placementResults.wpm}</p>
                <p className="text-[9px] uppercase font-bold tracking-wider opacity-40">Speed WPM</p>
              </div>
              <div className="p-3 bg-[#FAF9F6] dark:bg-[#323437] border border-[#EBE7DF] dark:border-[#3F4245] rounded-lg">
                <p className="text-xl font-bold text-emerald-500">{placementResults.accuracy}%</p>
                <p className="text-[9px] uppercase font-bold tracking-wider opacity-40">Accuracy</p>
              </div>
            </div>

            <div className="bg-[var(--accent-app)]/10 border border-[var(--accent-app)]/20 rounded-lg p-4.5 mb-6 text-left">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--accent-app)] block mb-1">
                Level Recommendation
              </span>
              <p className="text-sm font-semibold">
                We recommend starting as: <span className="underline decoration-[var(--accent-app)] decoration-2">{placementResults.level}</span>
              </p>
              <p className="text-[10px] opacity-65 mt-1.5 leading-relaxed">
                {placementResults.level === 'Beginner' && "Focus on home row key drills (Chapter 1) to establish touch-typing foundations."}
                {placementResults.level === 'Intermediate' && "Practice bottom row and capitals (Chapters 2-3) to master full keyboard coverage."}
                {placementResults.level === 'Advanced' && "Challenge yourself with custom text blocks and symbol sets to optimize your speed."}
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowPlacementModal(false);
                  setActiveView('lessons');
                  setActiveStep(null);
                  setActiveSessionType(null);
                }}
                className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-lg bg-[var(--accent-app)] text-white font-semibold text-xs hover:opacity-95 transition-all cursor-pointer shadow-sm"
              >
                Go to Lessons
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
