// Itype v1.1.1 Final Release Build
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
      return {
        backgroundColor: 'var(--text-app)',
        color: 'var(--bg-app)',
        borderColor: 'var(--text-app)',
        boxShadow: '0 0 14px rgba(0, 0, 0, 0.25)',
        transform: 'translateY(-1px) scale(1.05)',
        zIndex: 20
      };
    }

    // 2. Heatmap state
    if (maxErrors > 0) {
      const errorCount = heatmap[keyNormal] || 0;
      if (errorCount > 0) {
        const ratio = errorCount / maxErrors;
        let bg = 'rgba(239, 68, 68, 0.15)';
        let border = 'rgba(239, 68, 68, 0.3)';
        let text = '#EF4444';

        if (ratio > 0.6) {
          bg = '#EF4444';
          border = '#DC2626';
          text = '#FFFFFF';
        } else if (ratio > 0.3) {
          bg = 'rgba(239, 68, 68, 0.4)';
          border = '#EF4444';
          text = '#FFFFFF';
        }

        return {
          backgroundColor: bg,
          borderColor: border,
          color: text
        };
      }
    }

    // 3. Color-Coded keys (by finger mapping)
    if (colorCoded) {
      const finger = FINGER_MAP[keyNormal];
      if (finger) {
        let fingerBg = 'var(--key-bg)';
        let fingerBorder = 'var(--key-border)';
        
        if (finger.endsWith('1')) { fingerBg = 'rgba(244, 63, 94, 0.1)'; fingerBorder = 'rgba(244, 63, 94, 0.25)'; } // Pinky
        else if (finger.endsWith('2')) { fingerBg = 'rgba(245, 158, 11, 0.1)'; fingerBorder = 'rgba(245, 158, 11, 0.25)'; } // Ring
        else if (finger.endsWith('3')) { fingerBg = 'rgba(16, 185, 129, 0.1)'; fingerBorder = 'rgba(16, 185, 129, 0.25)'; } // Middle
        else if (finger.endsWith('4')) { fingerBg = 'rgba(59, 130, 246, 0.1)'; fingerBorder = 'rgba(59, 130, 246, 0.25)'; } // Index
        else if (finger.endsWith('5')) { fingerBg = 'rgba(107, 114, 128, 0.1)'; fingerBorder = 'rgba(107, 114, 128, 0.25)'; } // Thumb

        return { backgroundColor: fingerBg, borderColor: fingerBorder };
      }
    }

    // 4. Default Key background
    return {};
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
      let width = "w-7 sm:w-8.5";
      if (isSpace) width = "w-[48%] h-8 sm:h-9";
      else if (isBackspace) width = "w-11 sm:w-13";
      else if (isTab) width = "w-9";
      else if (isCaps) width = "w-11";
      else if (isEnter) width = "w-13";
      else if (isShift) width = "w-13 sm:w-15";
      
      return { width, height: "h-8 sm:h-9", text: "text-[9px]" };
    } else {
      // Standard sizing classes
      let width = "w-9 sm:w-11";
      if (isSpace) width = "w-[58%] h-10 sm:h-11";
      else if (isBackspace) width = "w-16 sm:w-20";
      else if (isTab) width = "w-13 sm:w-14";
      else if (isCaps) width = "w-15 sm:w-16";
      else if (isEnter) width = "w-18 sm:w-20";
      else if (isShift) width = "w-18 sm:w-22";
      
      return { width, height: "h-10 sm:h-11", text: "text-xs" };
    }
  };

  const renderHandIndicator = () => {
    if (isCompact || !showFingers || !activeFinger) return null;

    const leftFingers = ["L1", "L2", "L3", "L4"];
    const rightFingers = ["R4", "R3", "R2", "R1"];
    const isSpace = activeFinger === "L5" || activeFinger === "R5";

    return (
      <div className="flex items-center justify-center gap-10 mt-5 pt-4 border-t border-[#E5E5E5] dark:border-[#27272A] animate-fade-in opacity-85 font-mono">
        <div className="flex flex-col items-center">
          <div className="flex items-end gap-1.5 h-8 mb-1">
            {leftFingers.map((f) => (
              <div
                key={f}
                className={`w-3 rounded-t-sm transition-all duration-150 ${
                  activeFinger === f 
                    ? "bg-[#09090B] dark:bg-[#FAFAFA] h-8 shadow-xs" 
                    : "bg-[#E5E5E5] dark:bg-[#27272A] h-5 opacity-40"
                }`}
              />
            ))}
          </div>
          <span className="text-[9px] uppercase font-bold tracking-widest opacity-50">LEFT_HAND</span>
        </div>

        <div className="flex flex-col items-center">
          <div
            className={`w-16 h-2.5 rounded-sm transition-all duration-150 mb-1.5 ${
              isSpace ? "bg-[#09090B] dark:bg-[#FAFAFA] shadow-xs" : "bg-[#E5E5E5] dark:bg-[#27272A] opacity-40"
            }`}
          />
          <span className="text-[9px] uppercase font-bold tracking-widest opacity-50">THUMBS</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-end gap-1.5 h-8 mb-1">
            {rightFingers.map((f) => (
              <div
                key={f}
                className={`w-3 rounded-t-sm transition-all duration-150 ${
                  activeFinger === f 
                    ? "bg-[#09090B] dark:bg-[#FAFAFA] h-8 shadow-xs" 
                    : "bg-[#E5E5E5] dark:bg-[#27272A] h-5 opacity-40"
                }`}
              />
            ))}
          </div>
          <span className="text-[9px] uppercase font-bold tracking-widest opacity-50">RIGHT_HAND</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full mx-auto p-4 border border-[#E5E5E5] dark:border-[#27272A] bg-[#FFFFFF] dark:bg-[#121215] shadow-xs select-none transition-all font-mono rounded-lg ${isCompact ? 'max-w-2xl' : 'max-w-3xl'}`}>
      <div className="flex flex-col gap-1.5 font-mono">
        {layout.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1.5 w-full">
            {row.map((keyText, kIdx) => {
              const isSpace = keyText === "Space";
              const keyNormal = normalizeKey(keyText);
              const isHighlighted = normalizedHighlight === keyNormal || normalizedHighlightKeys.includes(keyNormal);
              const { width, height, text } = getKeyDimensions(keyText);
              const customStyle = getKeyColorStyle(keyText);

              return (
                <div
                  key={kIdx}
                  style={customStyle}
                  className={`border border-[#E5E5E5] dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#18181B] text-[#09090B] dark:text-[#FAFAFA] flex items-center justify-center font-bold font-mono select-none rounded-md transition-all duration-150 uppercase shadow-[0_1.5px_0_0_#E5E5E5] dark:shadow-[0_1.5px_0_0_#27272A] ${width} ${height} ${text} ${
                    isHighlighted ? 'ring-2 ring-[#09090B] dark:ring-[#FAFAFA]' : ''
                  }`}
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
