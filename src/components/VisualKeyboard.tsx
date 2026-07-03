// Typing layouts configuration
const LAYOUTS = {
  qwerty: [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
    ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
    ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
    ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "Shift"],
    ["Space"]
  ],
  dvorak: [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "[", "]", "Backspace"],
    ["Tab", "'", ",", ".", "p", "y", "f", "g", "c", "r", "l", "/", "=", "\\"],
    ["Caps", "a", "o", "e", "u", "i", "d", "h", "t", "n", "s", "-", "Enter"],
    ["Shift", ";", "q", "j", "k", "x", "b", "m", "w", "v", "z", "Shift"],
    ["Space"]
  ],
  colemak: [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
    ["Tab", "q", "w", "f", "p", "g", "j", "l", "u", "y", ";", "[", "]", "\\"],
    ["Backsp", "a", "r", "s", "t", "d", "h", "n", "e", "i", "o", "'", "Enter"],
    ["Shift", "z", "x", "c", "v", "b", "k", "m", ",", ".", "/", "Shift"],
    ["Space"]
  ]
};

// Map keys to fingers (L = Left Hand, R = Right Hand; 1 = Pinky, 2 = Ring, 3 = Middle, 4 = Index, 5 = Thumb)
const FINGER_MAP: Record<string, string> = {
  "q": "L1", "a": "L1", "z": "L1", "1": "L1", "`": "L1",
  "w": "L2", "s": "L2", "x": "L2", "2": "L2",
  "e": "L3", "d": "L3", "c": "L3", "3": "L3",
  "r": "L4", "f": "L4", "v": "L4", "4": "L4", "t": "L4", "g": "L4", "b": "L4", "5": "L4",
  "y": "R4", "h": "R4", "n": "R4", "6": "R4", "u": "R4", "j": "R4", "m": "R4", "7": "R4",
  "i": "R3", "k": "R3", ",": "R3", "8": "R3",
  "o": "R2", "l": "R2", ".": "R2", "9": "R2",
  "p": "R1", ";": "R1", "/": "R1", "0": "R1", "-": "R1", "=": "R1", "[": "R1", "]": "R1", "\\": "R1", "'": "R1",
  "space": "L5",
  "backspace": "R1", "enter": "R1", "shift": "L1", "tab": "L1", "caps": "L1"
};

function normalizeKey(key: string): string {
  if (key === " ") return "space";
  if (key === "Space") return "space";
  if (key === "Enter") return "enter";
  if (key === "Backspace" || key === "Backsp") return "backspace";
  if (key === "Shift") return "shift";
  if (key === "Tab") return "tab";
  if (key === "Caps") return "caps";
  return key.toLowerCase();
}

interface VisualKeyboardProps {
  layoutName?: 'qwerty' | 'dvorak' | 'colemak';
  highlightKey?: string;
  highlightKeys?: string[]; // Highlight multiple keys at once (e.g. for pre-lesson drills)
  heatmap?: Record<string, number>;
  showFingers?: boolean;
  size?: 'compact' | 'standard';
  colorCoded?: boolean;
}

export default function VisualKeyboard({
  layoutName = 'qwerty',
  highlightKey = '',
  highlightKeys = [],
  heatmap = {},
  showFingers = false,
  size = 'standard',
  colorCoded = false
}: VisualKeyboardProps) {
  const layout = LAYOUTS[layoutName] || LAYOUTS.qwerty;
  const normalizedHighlight = normalizeKey(highlightKey);
  const normalizedHighlightKeys = highlightKeys.map(normalizeKey);

  const activeFinger = normalizedHighlight ? FINGER_MAP[normalizedHighlight] : null;
  const maxErrors = Object.keys(heatmap).length > 0 ? Math.max(...Object.values(heatmap)) : 0;
  const isCompact = size === 'compact';

  // Get background color style for keys
  const getKeyColorStyle = (keyText: string) => {
    const keyNormal = normalizeKey(keyText);

    // 1. Highlight state (Active character or target keys list) takes absolute precedence
    const isHighlighted = normalizedHighlight === keyNormal || normalizedHighlightKeys.includes(keyNormal);
    if (isHighlighted && !maxErrors) {
      return { backgroundColor: 'var(--accent-app)', color: '#FFFFFF', borderColor: 'transparent' };
    }

    // 2. Heatmap state
    if (maxErrors > 0) {
      const errorCount = heatmap[keyNormal] || 0;
      if (errorCount > 0) {
        const ratio = errorCount / maxErrors;
        let bg = 'var(--accent-app)';
        if (ratio <= 0.25) bg = 'rgba(217, 107, 67, 0.4)';
        else if (ratio <= 0.5) bg = 'rgba(217, 107, 67, 0.6)';
        else if (ratio <= 0.75) bg = 'rgba(217, 107, 67, 0.8)';
        return { backgroundColor: bg, color: '#FFFFFF', borderColor: 'transparent' };
      }
    }

    // 3. Color-Coded keys (by finger mapping)
    if (colorCoded) {
      const finger = FINGER_MAP[keyNormal];
      if (finger) {
        let fingerBg = 'var(--key-bg)';
        if (finger.endsWith('1')) fingerBg = 'var(--finger-pinky)';
        else if (finger.endsWith('2')) fingerBg = 'var(--finger-ring)';
        else if (finger.endsWith('3')) fingerBg = 'var(--finger-middle)';
        else if (finger.endsWith('4')) fingerBg = 'var(--finger-index)';
        else if (finger.endsWith('5')) fingerBg = 'var(--finger-thumb)';

        return { backgroundColor: fingerBg, borderColor: 'var(--key-border)' };
      }
      
      // Default to utility key background if it is a general key without mapping
      return { backgroundColor: 'var(--finger-utility)', borderColor: 'var(--key-border)' };
    }

    // 4. Default Key background
    return { backgroundColor: 'var(--key-bg)', borderColor: 'var(--key-border)' };
  };

  const getKeyDimensions = (keyText: string) => {
    const isSpace = keyText === "Space";
    const isBackspace = keyText === "Backspace" || keyText === "Backsp";
    const isTab = keyText === "Tab";
    const isCaps = keyText === "Caps";
    const isEnter = keyText === "Enter";
    const isShift = keyText === "Shift";

    if (isCompact) {
      // Compact sizing classes
      let width = "w-8 sm:w-9";
      if (isSpace) width = "w-[50%] h-8 sm:h-9";
      else if (isBackspace) width = "w-12 sm:w-14";
      else if (isTab) width = "w-10";
      else if (isCaps) width = "w-12";
      else if (isEnter) width = "w-14";
      else if (isShift) width = "w-14 sm:w-16";
      
      return { width, height: "h-8 sm:h-9", text: "text-[9px]" };
    } else {
      // Standard sizing classes
      let width = "w-10 sm:w-11";
      if (isSpace) width = "w-[60%] h-10 sm:h-11";
      else if (isBackspace) width = "w-16 sm:w-20";
      else if (isTab) width = "w-14";
      else if (isCaps) width = "w-16";
      else if (isEnter) width = "w-20";
      else if (isShift) width = "w-20 sm:w-24";
      
      return { width, height: "h-10 sm:h-11", text: "text-xs" };
    }
  };

  const renderHandIndicator = () => {
    // Only display hands guide in standard size and if showFingers is true
    if (isCompact || !showFingers || !activeFinger) return null;

    const leftFingers = ["L1", "L2", "L3", "L4"];
    const rightFingers = ["R4", "R3", "R2", "R1"];
    const isSpace = activeFinger === "L5" || activeFinger === "R5";

    return (
      <div className="flex items-center justify-center gap-12 mt-6 animate-fade-in opacity-80">
        <div className="flex flex-col items-center">
          <div className="flex items-end gap-1.5 h-10 mb-1">
            {leftFingers.map((f) => (
              <div
                key={f}
                className={`w-3.5 rounded-t-full transition-all duration-150 ${
                  activeFinger === f 
                    ? "bg-[var(--accent-app)] dark:bg-[var(--accent-app)] h-9" 
                    : "bg-[#E6E1D8] dark:bg-[#2F2D2A] h-6"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-40">Left Hand</span>
        </div>

        <div className="flex flex-col items-center">
          <div
            className={`w-20 h-3 rounded-full transition-all duration-150 mb-2 ${
              isSpace ? "bg-[var(--accent-app)] dark:bg-[var(--accent-app)]" : "bg-[#E6E1D8] dark:bg-[#2F2D2A]"
            }`}
          />
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-40">Thumbs</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-end gap-1.5 h-10 mb-1">
            {rightFingers.map((f) => (
              <div
                key={f}
                className={`w-3.5 rounded-t-full transition-all duration-150 ${
                  activeFinger === f 
                    ? "bg-[var(--accent-app)] dark:bg-[var(--accent-app)] h-9" 
                    : "bg-[#E6E1D8] dark:bg-[#2F2D2A] h-6"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-40">Right Hand</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full mx-auto p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1B1A18] border border-[#E6E1D8] dark:border-[#2F2D2A] select-none shadow-sm transition-all ${isCompact ? 'max-w-2xl' : 'max-w-3xl'}`}>
      <div className="flex flex-col gap-1.5">
        {layout.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1.5 w-full">
            {row.map((keyText, kIdx) => {
              const isSpace = keyText === "Space";
              const { width, height, text } = getKeyDimensions(keyText);
              const customStyle = getKeyColorStyle(keyText);

              return (
                <div
                  key={kIdx}
                  style={customStyle}
                  className={`border flex items-center justify-center font-medium font-sans select-none rounded-lg transition-all duration-150 capitalize shadow-sm ${width} ${height} ${text}`}
                >
                  {isSpace ? "" : keyText}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {renderHandIndicator()}
    </div>
  );
}
