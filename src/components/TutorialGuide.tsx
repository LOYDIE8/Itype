// Itype v1.1.0 Final Release Build
import { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Key, CheckCircle, Flame } from 'lucide-react';

interface TutorialSlide {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  playgroundText?: string; // Optional mini-drill text
}

export default function TutorialGuide() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [drillInput, setDrillInput] = useState('');
  const [drillSuccess, setDrillSuccess] = useState(false);

  const slides: TutorialSlide[] = [
    {
      title: "Welcome to Touch Typing",
      subtitle: "The art of typing without looking at the keyboard.",
      icon: <BookOpen className="w-10 h-10 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />,
      content: (
        <div className="space-y-4 text-sm leading-relaxed opacity-90">
          <p>
            Touch typing is the ability to use muscle memory to find keys fast, instead of using your eyes to search for each letter. 
          </p>
          <p>
            By training your fingers to return to a standard "home base," your brain learns the relative distance to every other key. 
          </p>
          <div className="bg-[#FAF7F2] dark:bg-[#181715] border border-[#E6E1D8] dark:border-[#2F2D2A] rounded-xl p-4 mt-2">
            <h4 className="font-semibold text-xs uppercase tracking-wider mb-2 text-[var(--accent-app)] dark:text-[var(--accent-app)]">Why learn this?</h4>
            <ul className="list-disc pl-5 space-y-1.5 text-xs opacity-75">
              <li><strong>Double your speed:</strong> Average touch typists hit 50-80 WPM easily.</li>
              <li><strong>Reduce strain:</strong> Less looking up and down reduces neck and eye fatigue.</li>
              <li><strong>Free your focus:</strong> Concentrate on the thoughts you are writing, not the keys you are pressing.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "The Home Row Position",
      subtitle: "Where your fingers rest and return.",
      icon: <Key className="w-10 h-10 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />,
      content: (
        <div className="space-y-4 text-sm leading-relaxed opacity-90">
          <p>
            The **Home Row** is the center row of keys. Your fingers rest here in a curved, relaxed posture:
          </p>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="bg-[#FAF7F2] dark:bg-[#181715] p-3 rounded-lg border border-[#E6E1D8] dark:border-[#2F2D2A] text-xs">
              <span className="font-bold block mb-1 text-[var(--accent-app)] dark:text-[var(--accent-app)]">Left Hand Fingers</span>
              <p>Pinky on <strong>A</strong>, Ring on <strong>S</strong>,<br />Middle on <strong>D</strong>, Index on <strong>F</strong></p>
            </div>
            <div className="bg-[#FAF7F2] dark:bg-[#181715] p-3 rounded-lg border border-[#E6E1D8] dark:border-[#2F2D2A] text-xs">
              <span className="font-bold block mb-1 text-[var(--accent-app)] dark:text-[var(--accent-app)]">Right Hand Fingers</span>
              <p>Index on <strong>J</strong>, Middle on <strong>K</strong>,<br />Ring on <strong>L</strong>, Pinky on <strong>;</strong></p>
            </div>
          </div>
          <p className="text-xs opacity-75">
            <strong>The Tactile Anchor:</strong> Look at your keyboard and feel keys <strong>F</strong> and <strong>J</strong>. They have small raised ridges or bumps. Place your index fingers on them. You can find home base in the dark just by feeling for these bumps!
          </p>
        </div>
      ),
      playgroundText: "asdfjkl;"
    },
    {
      title: "Color-Coded Finger Mapping",
      subtitle: "Every finger has its own keys.",
      icon: <CheckCircle className="w-10 h-10 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />,
      content: (
        <div className="space-y-4 text-sm leading-relaxed opacity-90">
          <p>
            To prevent fingers from crossing over and causing errors, each finger is assigned a specific diagonal set of keys:
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--finger-pinky)] border border-[#E6E1D8] dark:border-[#2F2D2A] shrink-0" />
              <span><strong>Pinkies (Red):</strong> Press A, Q, Z, 1, P, semicolon, slash, and outer utility keys (Shift, Enter, Backspace).</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--finger-ring)] border border-[#E6E1D8] dark:border-[#2F2D2A] shrink-0" />
              <span><strong>Ring Fingers (Cream):</strong> Reach W, S, X, 2, O, L, and period.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--finger-middle)] border border-[#E6E1D8] dark:border-[#2F2D2A] shrink-0" />
              <span><strong>Middle Fingers (Green):</strong> Reach E, D, C, 3, I, K, and comma.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--finger-index)] border border-[#E6E1D8] dark:border-[#2F2D2A] shrink-0" />
              <span><strong>Index Fingers (Blue):</strong> Reach F, G, R, T, V, B, 4, 5 (Left index) & J, H, U, Y, N, M, 6, 7 (Right index).</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--finger-thumb)] border border-[#E6E1D8] dark:border-[#2F2D2A] shrink-0" />
              <span><strong>Thumbs (White):</strong> Exclusively responsible for the <strong>Spacebar</strong>.</span>
            </div>
          </div>
          <p className="text-xs opacity-75">
            Our virtual keyboard uses these colors! Keep this map in mind during practice sessions.
          </p>
        </div>
      ),
      playgroundText: "fjdksla;"
    },
    {
      title: "Rhythm & Ergonomics",
      subtitle: "Focus on accuracy and steady pace first.",
      icon: <Flame className="w-10 h-10 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />,
      content: (
        <div className="space-y-4 text-sm leading-relaxed opacity-90">
          <p>
            Rhythm is the secret to high-speed typing. Typing in jerky, rapid bursts followed by pauses leads to spelling errors. 
          </p>
          <div className="bg-[#FAF7F2] dark:bg-[#181715] border border-[#E6E1D8] dark:border-[#2F2D2A] rounded-xl p-4">
            <h4 className="font-semibold text-xs uppercase tracking-wider mb-2 text-[var(--accent-app)] dark:text-[var(--accent-app)]">Golden Rules of Practice</h4>
            <ul className="list-disc pl-5 space-y-1.5 text-xs opacity-75">
              <li><strong>Rhythm over Speed:</strong> Type with a steady beat (tick, tick, tick, tick). Speed is a byproduct of accuracy, not rushing.</li>
              <li><strong>Eyes on the Screen:</strong> Never look down. If you make a mistake, feel your way back to F and J bumps.</li>
              <li><strong>Wrist posture:</strong> Keep your wrists straight and hovering slightly above the desk, not resting flat or bent.</li>
            </ul>
          </div>
          <p className="text-xs opacity-75">
            Use the <strong>Strict Mode</strong> toggle in settings to build good habits—it prevents you from typing forward until you resolve mistakes, forcing you to develop accurate finger reaches!
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
      setDrillInput('');
      setDrillSuccess(false);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      setDrillInput('');
      setDrillSuccess(false);
    }
  };

  const handleDrillInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const target = slides[currentSlide].playgroundText || '';
    setDrillInput(value);
    
    if (value === target) {
      setDrillSuccess(true);
    } else {
      setDrillSuccess(false);
    }
  };

  const current = slides[currentSlide];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 animate-fade-in text-[#09090B] dark:text-[#FAFAFA] font-mono">
      <div className="border border-[#E5E5E5] dark:border-[#27272A] p-8 flex flex-col justify-between min-h-[460px] bg-transparent">
        
        {/* Slide header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 border-b border-[#E5E5E5] dark:border-[#27272A] pb-4">
            <div className="p-2.5 border border-[#E5E5E5] dark:border-[#27272A] bg-transparent shrink-0">
              {current.icon}
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                [ MANUAL // STEP 0{currentSlide + 1}_OF_0{slides.length} ]
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider mt-0.5">{current.title}</h2>
              <p className="text-xs opacity-50 mt-0.5 font-mono">{current.subtitle}</p>
            </div>
          </div>

          {/* Slide Main Content */}
          <div className="py-4">
            {current.content}
          </div>
        </div>

        {/* Playground Practice Drill (if configured) */}
        {current.playgroundText && (
          <div className="border-t border-[#E5E5E5] dark:border-[#27272A] pt-5 mt-4 space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                [ FINGER_PLACEMENT_TEST_DRILL ]
              </span>
              {drillSuccess && (
                <span className="text-xs text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  ✓ CORRECT
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 border border-[#E5E5E5] dark:border-[#27272A] p-3.5 bg-transparent">
              <div className="w-1/2">
                <span className="text-[9px] uppercase font-bold tracking-widest opacity-50 block">TARGET_KEYS:</span>
                <p className="font-mono text-sm font-bold tracking-widest mt-1">
                  {current.playgroundText}
                </p>
              </div>
              <div className="w-1/2 relative">
                <span className="text-[9px] uppercase font-bold tracking-widest opacity-50 block">TYPE_STREAM:</span>
                <input
                  type="text"
                  placeholder="Practice keys..."
                  value={drillInput}
                  onChange={handleDrillInput}
                  maxLength={current.playgroundText.length}
                  className={`w-full p-2 mt-1 border font-mono text-sm tracking-widest bg-transparent transition-all ${
                    drillSuccess 
                      ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' 
                      : drillInput.length > 0 && !current.playgroundText.startsWith(drillInput)
                      ? 'border-red-500 text-red-500 bg-red-500/10'
                      : 'border-[#E5E5E5] dark:border-[#27272A]'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between border-t border-[#E5E5E5] dark:border-[#27272A] pt-6 mt-6 font-mono">
          <button
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className="flex items-center gap-1.5 px-4 py-2 border border-[#E5E5E5] dark:border-[#27272A] text-xs font-bold uppercase tracking-widest hover:bg-[#09090B] hover:text-[#FFFFFF] dark:hover:bg-[#FAFAFA] dark:hover:text-[#09090B] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            PREVIOUS
          </button>

          {/* Dots tracker */}
          <div className="flex gap-1.5">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 transition-all ${
                  idx === currentSlide ? 'bg-[#09090B] dark:bg-[#FAFAFA]' : 'border border-[#E5E5E5] dark:border-[#27272A] opacity-40'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center gap-1.5 px-4 py-2 border border-[#09090B] dark:border-[#FAFAFA] bg-[#09090B] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#09090B] font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            NEXT
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
