import { useState, useEffect } from 'react';
import { FileText, Link, Trash2, Play, Loader2, Info, Upload, Layers, RefreshCw } from 'lucide-react';
import { CustomText } from '../types/electron';
import { LessonStep } from '../utils/lessonsData';
import { essaysData, EssayItem } from '../utils/essaysData';

const COMMON_WORD_POOL = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 
  'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 
  'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 
  'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
];

const GENERATOR_WORDS_BY_LETTER: Record<string, string[]> = {
  a: ['about', 'after', 'again', 'all', 'also', 'always', 'and', 'another', 'any', 'ask', 'away'],
  b: ['back', 'be', 'because', 'become', 'before', 'begin', 'behind', 'between', 'big', 'both', 'but', 'by'],
  c: ['call', 'can', 'case', 'child', 'city', 'close', 'come', 'company', 'could', 'country', 'course'],
  d: ['day', 'did', 'do', 'does', 'dog', 'done', 'door', 'down', 'during'],
  e: ['each', 'early', 'east', 'easy', 'end', 'even', 'ever', 'every', 'eye'],
  f: ['face', 'fact', 'family', 'far', 'father', 'feel', 'few', 'find', 'first', 'five', 'follow', 'food', 'for'],
  g: ['game', 'gave', 'get', 'give', 'glass', 'go', 'god', 'gold', 'good', 'got', 'great', 'green', 'ground'],
  h: ['had', 'half', 'hand', 'happen', 'happy', 'hard', 'has', 'have', 'he', 'head', 'hear', 'help', 'her', 'here'],
  i: ['idea', 'if', 'important', 'in', 'inside', 'interest', 'into', 'is', 'it', 'its'],
  j: ['job', 'join', 'just', 'judge', 'journey', 'jacket', 'joy', 'jump'],
  k: ['keep', 'key', 'kid', 'kind', 'king', 'knew', 'know', 'knowledge'],
  l: ['land', 'large', 'last', 'late', 'later', 'laugh', 'law', 'lay', 'lead', 'learn', 'least', 'leave', 'left'],
  m: ['made', 'main', 'make', 'man', 'many', 'mark', 'matter', 'may', 'me', 'mean', 'measure', 'meet', 'member'],
  n: ['name', 'nation', 'near', 'need', 'never', 'new', 'next', 'night', 'no', 'not', 'nothing', 'notice', 'now'],
  o: ['of', 'off', 'often', 'old', 'on', 'once', 'one', 'only', 'open', 'or', 'order', 'other', 'our', 'out'],
  p: ['page', 'paper', 'part', 'party', 'pass', 'past', 'pay', 'people', 'perform', 'period', 'person', 'picture'],
  q: ['quart', 'quick', 'quickly', 'quiet', 'quite', 'question', 'queen', 'quote'],
  r: ['rain', 'raise', 'ran', 'rate', 'rather', 'reach', 'read', 'ready', 'real', 'reason', 'receive', 'record'],
  s: ['sad', 'safe', 'said', 'same', 'sand', 'sat', 'save', 'saw', 'say', 'scene', 'school', 'science', 'score'],
  t: ['table', 'tail', 'take', 'talk', 'tall', 'tap', 'target', 'task', 'taste', 'taught', 'tax', 'tea', 'teach'],
  u: ['under', 'understand', 'unit', 'until', 'up', 'upon', 'us', 'use', 'usual'],
  v: ['value', 'various', 'very', 'voice', 'visit', 'valley', 'village', 'volume', 'view'],
  w: ['walk', 'want', 'warm', 'was', 'watch', 'water', 'way', 'we', 'week', 'well', 'went', 'were', 'what'],
  x: ['xylophone', 'extra', 'exact', 'excited', 'index', 'matrix', 'box', 'tax', 'axes'],
  y: ['year', 'yellow', 'yes', 'yesterday', 'yet', 'you', 'young', 'your'],
  z: ['zero', 'zone', 'zoo', 'zipper', 'zebra', 'bronze', 'gaze', 'amaze', 'hazard']
};

interface CustomTextPanelProps {
  profileId: number;
  viewMode?: 'essays' | 'generator' | 'custom';
  onSelectExercise: (exercise: LessonStep, type: 'custom') => void;
}

export default function CustomTextPanel({ profileId, viewMode = 'custom', onSelectExercise }: CustomTextPanelProps) {
  const [customTexts, setCustomTexts] = useState<CustomText[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'essays' | 'custom' | 'saved' | 'random'>('essays');
  
  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Practice session configuration states
  const [chunkSize, setChunkSize] = useState<number>(100); // 50 | 100 | 200 | 0 (full)
  const [stripFormatting, setStripFormatting] = useState<boolean>(true);
  const [saveToDeck, setSaveToDeck] = useState<boolean>(true);

  // Random Words Generator states
  const [randomType, setRandomType] = useState<'words' | 'time'>('words');
  const [randomWordCount, setRandomWordCount] = useState<number>(25);
  const [randomTimeLimit, setRandomTimeLimit] = useState<number>(30);
  const [addPunctuation, setAddPunctuation] = useState<boolean>(false);
  const [addNumbers, setAddNumbers] = useState<boolean>(false);

  // Focus keys state
  const [focusKeys, setFocusKeys] = useState('');

  useEffect(() => {
    loadCustomTexts();
  }, [profileId]);

  const loadCustomTexts = async () => {
    try {
      setIsLoading(true);
      const list = await window.api.getCustomTexts(profileId);
      setCustomTexts(list);
    } catch (err) {
      console.error("Failed to load custom texts", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format/clean up text
  const cleanText = (rawText: string): string => {
    let text = rawText;
    if (stripFormatting) {
      // 1. Normalize smart double and single quotes
      text = text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
      // 2. Remove emojis and odd symbols, keep standard alphanumeric & punctuation
      text = text.replace(/[^\x00-\x7F]/g, ""); // Keep only ASCII
      // 3. Replace multiple spaces and newlines with a single space
      text = text.replace(/\s+/g, ' ');
    }
    return text.trim();
  };

  // Helper to chunk text to specified word counts
  const getChunkedText = (text: string): string => {
    if (chunkSize === 0) return text;
    const words = text.split(/\s+/);
    if (words.length <= chunkSize) return text;
    return words.slice(0, chunkSize).join(' ');
  };

  // Handle direct file upload via native dialog bridge
  const handleFileUpload = async () => {
    try {
      setError('');
      const fileData = await window.api.uploadTextFile();
      if (fileData) {
        setTitle(fileData.title);
        setContent(fileData.content);
      }
    } catch (err: any) {
      setError("Failed to load text file: " + err.message);
    }
  };

  // Handle web article scraper bridge
  const handleUrlScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    try {
      setError('');
      setIsScraping(true);
      const result = await window.api.extractUrlText(url.trim());
      setTitle(result.title);
      setContent(result.content);
      setUrl('');
    } catch (err: any) {
      setError(err.message || "Failed to scrape text from URL. Make sure you are connected to the internet.");
    } finally {
      setIsScraping(false);
    }
  };

  // Handle starting a typing session (Import Custom Tab)
  const handleStartPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeContent = content.trim();
    const activeTitle = title.trim();

    // If focusKeys is provided, we override normal paste content
    const parsedKeys = focusKeys.trim().toLowerCase().replace(/[^a-z]/g, '').split('');
    
    if (parsedKeys.length > 0) {
      try {
        setError('');
        const matchingWords: string[] = [];
        parsedKeys.forEach(char => {
          const wordPool = GENERATOR_WORDS_BY_LETTER[char] || [];
          matchingWords.push(...wordPool);
        });

        if (matchingWords.length === 0) {
          throw new Error("No vocabulary found for selected focus keys. Please enter different letters.");
        }

        const drillWords: string[] = [];
        for (let i = 0; i < 30; i++) {
          const randomIndex = Math.floor(Math.random() * matchingWords.length);
          drillWords.push(matchingWords[randomIndex]);
        }

        const generatedText = drillWords.join(' ');
        const step: LessonStep = {
          id: "custom-focus",
          title: activeTitle || `Focus: ${parsedKeys.join(', ').toUpperCase()}`,
          type: "words",
          keys: parsedKeys.map(k => k.toUpperCase()),
          text: generatedText,
          description: `Focused review drill for keys: ${parsedKeys.join(', ').toUpperCase()}`
        };

        onSelectExercise(step, 'custom');
        setFocusKeys('');
        return;
      } catch (err: any) {
        setError(err.message);
        return;
      }
    }

    if (!activeContent) {
      setError("Please paste, upload, scrape some text, or specify focus keys first.");
      return;
    }

    try {
      setError('');
      const processedText = cleanText(activeContent);
      const sessionText = getChunkedText(processedText);

      if (saveToDeck) {
        setIsSaving(true);
        // Save to SQLite
        const saved = await window.api.saveCustomText(profileId, activeTitle || "Pasted Custom Text", processedText);
        setCustomTexts(prev => [saved, ...prev]);
      }

      // Generate virtual step configuration
      const step: LessonStep = {
        id: "custom",
        title: activeTitle || "Pasted Custom Text",
        type: "words",
        keys: ["Custom"],
        text: sessionText,
        description: `Custom typing session. Length: ${sessionText.split(/\s+/).length} words.`
      };

      // Trigger start in typing engine
      onSelectExercise(step, 'custom');
      
      // Clear form
      setTitle('');
      setContent('');
    } catch (err: any) {
      setError("Failed to start session: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartRandomGenerator = () => {
    try {
      setError('');
      const totalWordsToGenerate = randomType === 'words' ? randomWordCount : 80;
      const generatedWords: string[] = [];

      for (let i = 0; i < totalWordsToGenerate; i++) {
        if (addNumbers && Math.random() < 0.15) {
          const randomNum = Math.floor(Math.random() * 1000);
          generatedWords.push(String(randomNum));
        } else {
          const randomIndex = Math.floor(Math.random() * COMMON_WORD_POOL.length);
          let word = COMMON_WORD_POOL[randomIndex];

          if (addPunctuation) {
            if (i === 0 || (i > 0 && Math.random() < 0.15)) {
              word = word.charAt(0).toUpperCase() + word.slice(1);
            }
            if (i > 0 && Math.random() < 0.1 && i < totalWordsToGenerate - 1) {
              word += ',';
            } else if (i > 0 && Math.random() < 0.12) {
              word += '.';
            }
          }
          generatedWords.push(word);
        }
      }

      const generatedText = cleanText(generatedWords.join(' '));

      const step: LessonStep = {
        id: "custom-random",
        title: randomType === 'words' ? `Random: ${randomWordCount} Words` : `Random: ${randomTimeLimit}s Test`,
        type: "words",
        keys: ["Random"],
        text: generatedText,
        description: randomType === 'words' 
          ? `Random words sprint drill.`
          : `Speed trial for ${randomTimeLimit} seconds.`
      };

      onSelectExercise({
        ...step,
        durationLimit: randomType === 'time' ? randomTimeLimit : undefined
      } as any, 'custom');
    } catch (err: any) {
      setError("Failed to generate random session: " + err.message);
    }
  };

  // Practice a predefined essay
  const handleStartEssay = (essay: EssayItem) => {
    const processedText = cleanText(essay.text);
    const sessionText = getChunkedText(processedText);

    const step: LessonStep = {
      id: essay.id,
      title: essay.title,
      type: "words",
      keys: [essay.category],
      text: sessionText,
      description: `${essay.description} Length: ${sessionText.split(/\s+/).length} words.`
    };

    onSelectExercise(step, 'custom');
  };

  // Practice a saved deck text
  const handleStartSavedDeck = (deck: CustomText) => {
    const processedText = cleanText(deck.content);
    const sessionText = getChunkedText(processedText);

    const step: LessonStep = {
      id: "custom",
      title: deck.title,
      type: "words",
      keys: ["Saved"],
      text: sessionText,
      description: `Saved custom text. Length: ${sessionText.split(/\s+/).length} words.`
    };

    onSelectExercise(step, 'custom');
  };

  // Delete saved deck
  const handleDeleteDeck = async (id: number) => {
    try {
      await window.api.deleteCustomText(profileId, id);
      setCustomTexts(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error("Failed to delete custom text", err);
    }
  };

  // Synchronize activeTab with viewMode prop on mount/change
  useEffect(() => {
    if (viewMode === 'essays') {
      setActiveTab('essays');
    } else if (viewMode === 'generator') {
      setActiveTab('random');
    } else {
      setActiveTab('custom');
    }
  }, [viewMode]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in text-[#2E2C29] dark:text-[#D1D2D3]">
      <div className="mb-6">
        <h1 className="text-2xl font-light tracking-wide mb-1">
          {viewMode === 'essays' 
            ? 'Predefined Essays' 
            : viewMode === 'generator' 
            ? 'Quick Practice Generator' 
            : 'Custom Text Import'}
        </h1>
        <p className="text-sm opacity-60">
          {viewMode === 'essays'
            ? 'Practice touch-typing using structured essays, classic literature, and code syntax snippets.'
            : viewMode === 'generator'
            ? 'Build speed consistency with custom time limits, words limits, punctuation, and digit row tests.'
            : 'Upload files, scrape web article texts, or generate custom drills focusing on specific characters.'}
        </p>
      </div>

      {/* Tabs navigation - displayed only in Custom Text mode to toggle between Import and Saved Decks */}
      {viewMode === 'custom' && (
        <div className="flex gap-6 border-b border-[#EBE7DF] dark:border-[#3F4245] pb-2 mb-6">
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2 px-1 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'custom' 
                ? 'border-[var(--accent-app)] text-[var(--accent-app)]' 
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Import Custom Text
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-2 px-1 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'saved' 
                ? 'border-[var(--accent-app)] text-[var(--accent-app)]' 
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Saved Decks ({customTexts.length})
          </button>
        </div>
      )}

      {/* Error alert banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-3.5 text-xs mb-5 flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB VIEW: PREDEFINED ESSAYS
          ---------------------------------------------------- */}
      {activeTab === 'essays' && (
        <div className="space-y-6">
          {/* Settings block for length sizing */}
          <div className="bg-[#FFFFFF] dark:bg-[#2C2E30] border border-[#EBE7DF] dark:border-[#3F4245] rounded-xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-app)]">Practice Length Sizing</h4>
              <p className="text-[11px] opacity-60 mt-0.5">Truncate the essays to fit your targeted typing sprint limit.</p>
            </div>
            <div className="flex gap-1 bg-[#FAF9F6] dark:bg-[#323437] p-0.5 rounded-lg border border-[#EBE7DF] dark:border-[#3F4245]">
              {([
                { label: '50 words', val: 50 },
                { label: '100 words', val: 100 },
                { label: 'Full text', val: 0 }
              ]).map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setChunkSize(opt.val)}
                  className={`px-3 py-1.5 text-[10px] font-semibold rounded capitalize transition-all cursor-pointer ${
                    chunkSize === opt.val 
                      ? 'bg-[var(--accent-app)] text-white shadow-sm' 
                      : 'hover:bg-opacity-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid listing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {essaysData.map((essay) => (
              <div 
                key={essay.id}
                className="bg-[#FFFFFF] dark:bg-[#2C2E30] border border-[#EBE7DF] dark:border-[#3F4245] rounded-xl p-6 flex flex-col justify-between hover:shadow-sm transition-all min-h-[190px]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--accent-app)] bg-[var(--accent-app)]/10 px-1.5 py-0.5 rounded">
                      {essay.category}
                    </span>
                    <span className={`text-[9px] font-semibold capitalize px-1.5 py-0.5 rounded ${
                      essay.difficulty === 'easy' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : essay.difficulty === 'medium'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {essay.difficulty}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold tracking-wide">{essay.title}</h3>
                  <p className="text-xs opacity-60 leading-relaxed">{essay.description}</p>
                </div>

                <div className="flex items-center justify-between border-t border-[#EBE7DF] dark:border-[#3F4245] pt-4 mt-5">
                  <span className="text-[10px] opacity-40 font-semibold uppercase tracking-wider">
                    {essay.text.split(/\s+/).length} Words total
                  </span>
                  <button
                    onClick={() => handleStartEssay(essay)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent-app)] text-white font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start Essay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB VIEW: IMPORT CUSTOM TEXT
          ---------------------------------------------------- */}
      {activeTab === 'custom' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Input Creator forms */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#FFFFFF] dark:bg-[#2C2E30] border border-[#EBE7DF] dark:border-[#3F4245] rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-semibold tracking-wide border-b border-[#EBE7DF] dark:border-[#3F4245] pb-2.5 mb-4">
                Import and Parse Custom Text
              </h2>

              {/* Scrape / Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  onClick={handleFileUpload}
                  className="flex items-center justify-center gap-2 p-3 text-xs font-semibold rounded-lg border border-[#EBE7DF] dark:border-[#3F4245] bg-transparent hover:bg-[#FAF9F6] dark:hover:bg-[#323437] transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[var(--accent-app)]" />
                  Upload Text File (.txt)
                </button>

                <form onSubmit={handleUrlScrape} className="relative flex gap-2">
                  <input
                    type="url"
                    placeholder="Paste URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full pl-8 pr-16 py-2.5 rounded-lg border border-[#EBE7DF] dark:border-[#3F4245] bg-transparent text-xs text-ellipsis focus:outline-none"
                  />
                  <Link className="absolute left-2.5 top-3 w-3.5 h-3.5 opacity-55 text-[var(--accent-app)]" />
                  <button
                    type="submit"
                    disabled={!url.trim() || isScraping}
                    className="absolute right-1.5 top-1.5 px-2.5 py-1 rounded bg-[var(--accent-app)] text-white text-[10px] font-semibold hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isScraping ? <Loader2 className="w-3 h-3 animate-spin" /> : "Scrape"}
                  </button>
                </form>
              </div>

              {/* Input forms */}
              <form onSubmit={handleStartPractice} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Focus Keys Drill (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. f, j, k (Generates drill focused strictly on these letters)"
                    value={focusKeys}
                    onChange={(e) => setFocusKeys(e.target.value)}
                    className="w-full p-3 rounded-lg border border-[#EBE7DF] dark:border-[#3F4245] bg-transparent text-xs focus:outline-none focus:border-[var(--accent-app)] mb-1"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. JavaScript Fetch Code, Song Lyrics..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={40}
                    className="w-full p-3 rounded-lg border border-[#EBE7DF] dark:border-[#3F4245] bg-transparent text-xs focus:outline-none focus:border-[var(--accent-app)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Practice Text</label>
                  <textarea
                    placeholder="Paste your text or code snippet here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="w-full p-4 rounded-lg border border-[#EBE7DF] dark:border-[#3F4245] bg-transparent text-xs font-sans focus:outline-none focus:border-[var(--accent-app)]"
                  />
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={isSaving || !content.trim()}
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-[var(--accent-app)] text-white font-semibold text-xs hover:opacity-95 transition-all cursor-pointer shadow-sm disabled:opacity-55"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving to Deck...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Start Custom Practice
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Settings panel card */}
          <div className="space-y-6">
            <div className="bg-[#FFFFFF] dark:bg-[#2C2E30] border border-[#EBE7DF] dark:border-[#3F4245] rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-app)] border-b border-[#EBE7DF] dark:border-[#3F4245] pb-2">
                Import Settings
              </h3>

              {/* Length */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Session Length</span>
                <select
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  className="w-full p-2 text-xs rounded-lg border border-[#EBE7DF] dark:border-[#3F4245] bg-transparent text-[#2E2C29] dark:text-[#D1D2D3]"
                >
                  <option value={50} className="bg-[#FAF9F6] dark:bg-[#323437]">Short (50 words)</option>
                  <option value={100} className="bg-[#FAF9F6] dark:bg-[#323437]">Standard (100 words)</option>
                  <option value={200} className="bg-[#FAF9F6] dark:bg-[#323437]">Long (200 words)</option>
                  <option value={0} className="bg-[#FAF9F6] dark:bg-[#323437]">Full Text (infinite)</option>
                </select>
              </div>

              {/* Formatting checkbox */}
              <label className="flex items-start gap-2.5 p-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={stripFormatting}
                  onChange={(e) => setStripFormatting(e.target.checked)}
                  className="mt-0.5 accent-[var(--accent-app)]"
                />
                <div>
                  <span className="text-xs font-semibold block leading-none">Strip Complex Formatting</span>
                  <span className="text-[10px] opacity-50 block mt-0.5">Normalize smart quotes, clean odd symbols, and format whitespace.</span>
                </div>
              </label>

              {/* Save deck check */}
              <label className="flex items-start gap-2.5 p-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveToDeck}
                  onChange={(e) => setSaveToDeck(e.target.checked)}
                  className="mt-0.5 accent-[var(--accent-app)]"
                />
                <div>
                  <span className="text-xs font-semibold block leading-none">Save to Saved Decks</span>
                  <span className="text-[10px] opacity-50 block mt-0.5">Keep this text inside your local SQL database for future repeats.</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB VIEW: SAVED CUSTOM DECKS
          ---------------------------------------------------- */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 opacity-50">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-app)]" />
              <p className="text-xs mt-2">Loading saved decks...</p>
            </div>
          ) : customTexts.length === 0 ? (
            <div className="bg-[#FFFFFF] dark:bg-[#2C2E30] border border-[#EBE7DF] dark:border-[#3F4245] rounded-xl p-12 text-center shadow-sm">
              <FileText className="w-10 h-10 opacity-30 mx-auto mb-2 text-[var(--accent-app)]" />
              <h3 className="text-sm font-semibold tracking-wide">No Saved Decks Yet</h3>
              <p className="text-xs opacity-50 max-w-sm mx-auto mt-1">
                You haven't saved any custom texts yet. Use the **Import Custom Text** tab to upload file snippets and build your deck list.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customTexts.map((deck) => (
                <div 
                  key={deck.id}
                  className="bg-[#FFFFFF] dark:bg-[#2C2E30] border border-[#EBE7DF] dark:border-[#3F4245] rounded-xl p-5 flex flex-col justify-between hover:shadow-sm transition-all min-h-[150px]"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="text-sm font-semibold tracking-wide truncate max-w-[85%]">{deck.title}</h3>
                      <button
                        onClick={() => handleDeleteDeck(deck.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Delete Deck"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs opacity-50 font-mono truncate">{deck.content}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#EBE7DF] dark:border-[#3F4245] pt-4 mt-4">
                    <span className="text-[10px] opacity-40 font-semibold">
                      {deck.content.split(/\s+/).length} Words total
                    </span>
                    <button
                      onClick={() => handleStartSavedDeck(deck)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#EBE7DF] dark:border-[#3F4245] text-xs font-semibold hover:bg-[var(--accent-app)]/10 hover:text-[var(--accent-app)] transition-all cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Practice Deck
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------
          TAB VIEW: MONKEYTYPE RANDOM WORDS
          ---------------------------------------------------- */}
      {activeTab === 'random' && (
        <div className="max-w-2xl mx-auto bg-[#FFFFFF] dark:bg-[#2C2E30] border border-[#EBE7DF] dark:border-[#3F4245] rounded-xl p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-base font-semibold tracking-wide flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 text-[var(--accent-app)]" />
              Quick Practice Generator
            </h2>
            <p className="text-xs opacity-60">Create endless randomized word flows to test your speed and pacing consistency.</p>
          </div>

          {/* Type selector */}
          <div className="grid grid-cols-2 gap-3 bg-[#FAF9F6] dark:bg-[#323437] p-1 rounded-lg border border-[#EBE7DF] dark:border-[#3F4245]">
            <button
              onClick={() => setRandomType('words')}
              className={`py-2 text-xs font-semibold rounded transition-all cursor-pointer ${
                randomType === 'words' 
                  ? 'bg-[var(--accent-app)] text-white shadow-sm' 
                  : 'opacity-65 hover:opacity-100'
              }`}
            >
              Words Limit Mode
            </button>
            <button
              onClick={() => setRandomType('time')}
              className={`py-2 text-xs font-semibold rounded transition-all cursor-pointer ${
                randomType === 'time' 
                  ? 'bg-[var(--accent-app)] text-white shadow-sm' 
                  : 'opacity-65 hover:opacity-100'
              }`}
            >
              Time Trial Mode
            </button>
          </div>

          {/* Modes parameters */}
          {randomType === 'words' ? (
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Word Count Sizing</label>
              <div className="flex gap-1.5">
                {([10, 25, 50, 100]).map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => setRandomWordCount(cnt)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      randomWordCount === cnt 
                        ? 'bg-[var(--accent-app)]/15 text-[var(--accent-app)] border-[var(--accent-app)]' 
                        : 'border-[#EBE7DF] dark:border-[#3F4245] opacity-60 hover:opacity-100'
                    }`}
                  >
                    {cnt} Words
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Stopwatch Time Limit</label>
              <div className="flex gap-1.5">
                {([15, 30, 60]).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setRandomTimeLimit(sec)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      randomTimeLimit === sec 
                        ? 'bg-[var(--accent-app)]/15 text-[var(--accent-app)] border-[var(--accent-app)]' 
                        : 'border-[#EBE7DF] dark:border-[#3F4245] opacity-60 hover:opacity-100'
                    }`}
                  >
                    {sec} Seconds
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty Toggles */}
          <div className="grid grid-cols-2 gap-4 border-t border-[#EBE7DF] dark:border-[#3F4245] pt-5 text-left">
            <label className="flex items-start gap-2.5 p-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={addPunctuation}
                onChange={(e) => setAddPunctuation(e.target.checked)}
                className="mt-0.5 accent-[var(--accent-app)] animate-pulse"
              />
              <div>
                <span className="text-xs font-semibold block">Add Punctuation</span>
                <span className="text-[10px] opacity-50 block mt-0.5">Inject commas, periods, and uppercase sentence letters.</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={addNumbers}
                onChange={(e) => setAddNumbers(e.target.checked)}
                className="mt-0.5 accent-[var(--accent-app)] animate-pulse"
              />
              <div>
                <span className="text-xs font-semibold block">Add Numbers</span>
                <span className="text-[10px] opacity-50 block mt-0.5">Inject random digits to test number-row placement typing.</span>
              </div>
            </label>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={handleStartRandomGenerator}
              className="flex items-center justify-center gap-1.5 px-8 py-3 rounded-lg bg-[var(--accent-app)] text-white font-bold text-xs hover:opacity-95 transition-all cursor-pointer shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              Generate & Start Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
