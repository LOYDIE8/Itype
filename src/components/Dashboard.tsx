import { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Award, Zap, Flame, Clock, BarChart4, Filter, ShieldCheck, Loader2 } from 'lucide-react';
import { Session, Badge } from '../types/electron';
import VisualKeyboard from './VisualKeyboard';

// List of all achievements in the game
const BADGES_LIST = [
  { id: 'first_steps', name: 'First Steps', desc: 'Completed the initial placement test.', icon: '👣' },
  { id: 'speed_demon_1', name: 'Speed Demon I', desc: 'Type 40+ WPM in any session.', icon: '⚡' },
  { id: 'speed_demon_2', name: 'Speed Demon II', desc: 'Type 60+ WPM in any session.', icon: '🚀' },
  { id: 'speed_demon_3', name: 'Speed Demon III', desc: 'Type 80+ WPM in any session.', icon: '🔥' },
  { id: 'speed_demon_4', name: 'Speed Demon IV', desc: 'Type 100+ WPM in any session!', icon: '👑' },
  { id: 'speed_demon_5', name: 'Godspeed', desc: 'Type 120+ WPM in any session!', icon: '⚡' },
  { id: 'sniper', name: 'Sniper', desc: 'Finished a lesson with 100% accuracy (min 80 chars).', icon: '🎯' },
  { id: 'flawless_99', name: 'Sharpshooter', desc: 'Finished a session with 99%+ accuracy (min 150 chars).', icon: '🏹' },
  { id: 'marathoner', name: 'Marathoner', desc: 'Completed a session longer than 5 minutes.', icon: '🏃' },
  { id: 'consistency_3', name: '3-Day Streak', desc: 'Practiced typing 3 days in a row.', icon: '🌱' },
  { id: 'consistency_7', name: '7-Day Streak', desc: 'Practiced typing 7 days in a row.', icon: '🌳' },
  { id: 'consistency_14', name: 'Fortnight Legend', desc: 'Practiced typing 14 days in a row.', icon: '🔥' },
  { id: 'sessions_10', name: 'Warm Up', desc: 'Completed 10 typing sessions.', icon: '🥊' },
  { id: 'sessions_50', name: 'Dedicated Typist', desc: 'Completed 50 typing sessions.', icon: '🏆' },
  { id: 'sessions_100', name: 'Centurion', desc: 'Completed 100 typing sessions!', icon: '🎖️' },
  { id: 'custom_creator', name: 'Word Architect', desc: 'Completed a custom text or random word drill.', icon: '✍️' },
  { id: 'essay_scholar', name: 'Literary Scholar', desc: 'Completed a practice session on a predefined essay.', icon: '📜' },
  { id: 'night_owl', name: 'Night Owl', desc: 'Completed a practice session between 10 PM and 5 AM.', icon: '🦉' }
];

// Vocabulary dictionary mapped to individual letters for AI review generation
const COMMON_WORDS_BY_LETTER: Record<string, string[]> = {
  a: ['about', 'after', 'again', 'against', 'all', 'also', 'always', 'and', 'another', 'any', 'around', 'ask', 'away'],
  b: ['back', 'be', 'because', 'become', 'before', 'begin', 'behind', 'being', 'between', 'big', 'both', 'business', 'but', 'by'],
  c: ['call', 'can', 'case', 'child', 'city', 'close', 'come', 'company', 'could', 'country', 'course'],
  d: ['day', 'did', 'differ', 'do', 'does', 'dog', 'done', 'door', 'down', 'during'],
  e: ['each', 'early', 'east', 'easy', 'end', 'even', 'ever', 'every', 'eye'],
  f: ['face', 'fact', 'family', 'far', 'father', 'feel', 'few', 'find', 'first', 'five', 'follow', 'food', 'for', 'form', 'found', 'from'],
  g: ['game', 'gave', 'general', 'get', 'give', 'glass', 'go', 'god', 'gold', 'good', 'got', 'great', 'green', 'ground', 'group', 'grow'],
  h: ['had', 'half', 'hand', 'happen', 'happy', 'hard', 'has', 'have', 'he', 'head', 'hear', 'help', 'her', 'here', 'high', 'him', 'his', 'hold', 'home', 'hope', 'hour', 'house', 'how'],
  i: ['idea', 'if', 'important', 'in', 'inside', 'interest', 'into', 'is', 'it', 'its'],
  j: ['job', 'join', 'just', 'judge', 'journey', 'jacket', 'joy', 'jump'],
  k: ['keep', 'key', 'kid', 'kind', 'king', 'knew', 'know', 'knowledge'],
  l: ['land', 'large', 'last', 'late', 'later', 'laugh', 'law', 'lay', 'lead', 'learn', 'least', 'leave', 'left', 'less', 'let', 'letter', 'life', 'light', 'like', 'line', 'list', 'little', 'live', 'long', 'look', 'lost', 'love', 'low'],
  m: ['made', 'main', 'make', 'man', 'many', 'mark', 'matter', 'may', 'me', 'mean', 'measure', 'meet', 'member', 'men', 'might', 'mind', 'minute', 'miss', 'mock', 'money', 'month', 'more', 'morning', 'most', 'mother', 'mountain', 'move', 'much', 'music', 'must', 'my'],
  n: ['name', 'nation', 'near', 'need', 'never', 'new', 'next', 'night', 'no', 'non', 'nor', 'not', 'nothing', 'notice', 'now', 'number'],
  o: ['of', 'off', 'often', 'old', 'on', 'once', 'one', 'only', 'open', 'or', 'order', 'other', 'our', 'out', 'over', 'own'],
  p: ['page', 'paper', 'part', 'party', 'pass', 'past', 'pay', 'people', 'perform', 'period', 'person', 'picture', 'place', 'plan', 'play', 'please', 'point', 'port', 'position', 'possible', 'power', 'practice', 'prepare', 'present', 'press', 'pretty', 'problem', 'process', 'produce', 'product', 'program', 'provide', 'public', 'pull', 'push', 'put'],
  q: ['quart', 'quick', 'quickly', 'quiet', 'quite', 'question', 'queen', 'quote'],
  r: ['rain', 'raise', 'ran', 'rate', 'rather', 'reach', 'read', 'ready', 'real', 'reason', 'receive', 'record', 'red', 'relationship', 'remain', 'remember', 'remove', 'report', 'represent', 'require', 'research', 'result', 'return', 'rhythm', 'rich', 'ride', 'right', 'ring', 'rise', 'road', 'rock', 'roll', 'room', 'root', 'round', 'row', 'rule', 'run'],
  s: ['sad', 'safe', 'said', 'sail', 'same', 'sand', 'sat', 'save', 'saw', 'say', 'scene', 'school', 'science', 'score', 'sea', 'search', 'season', 'second', 'secret', 'section', 'see', 'seed', 'seek', 'seem', 'seen', 'self', 'sell', 'send', 'sense', 'sent', 'sentence', 'separate', 'serve', 'service', 'set', 'seven', 'several', 'shall', 'shape', 'share', 'sharp', 'she', 'sheet', 'shelf', 'shell', 'shine', 'ship', 'shirt', 'shoe', 'shoot', 'shop', 'shore', 'short', 'shot', 'should', 'shoulder', 'shout', 'show', 'shrink', 'shut', 'side', 'sight', 'sign', 'signal', 'silent', 'silly', 'silver', 'similar', 'simple', 'since', 'sing', 'single', 'sink', 'sister', 'sit', 'site', 'six', 'size', 'skill', 'skin', 'skirt', 'sky', 'sleep', 'slip', 'slow', 'slowly', 'small', 'smart', 'smell', 'smoke', 'smooth', 'snow', 'so', 'soap', 'social', 'soft', 'softly', 'soil', 'sold', 'soldier', 'sole', 'solid', 'solve', 'some', 'someone', 'something', 'sometime', 'son', 'song', 'soon', 'sore', 'sorrow', 'sort', 'sound', 'source', 'south', 'space', 'speak', 'special', 'speed', 'spell', 'spend', 'spent', 'spin', 'spirit', 'spite', 'split', 'spoken', 'sport', 'spot', 'spread', 'spring', 'square', 'stable', 'staff', 'stage', 'stair', 'stamp', 'stand', 'standard', 'star', 'stare', 'start', 'state', 'station', 'stay', 'steady', 'steam', 'steel', 'steep', 'steer', 'step', 'stick', 'stiff', 'still', 'sting', 'stir', 'stock', 'stone', 'stood', 'stop', 'store', 'storm', 'story', 'stove', 'straight', 'strain', 'strange', 'strap', 'stream', 'street', 'strength', 'stretch', 'strict', 'strike', 'string', 'strip', 'stroke', 'strong', 'strongly', 'struck', 'structure', 'struggle', 'student', 'studio', 'study', 'stuff', 'stumble', 'style', 'subject', 'substance', 'succeed', 'success', 'such', 'sudden', 'suddenly', 'suffer', 'sugar', 'suggest', 'suit', 'summer', 'sun', 'sunday', 'super', 'supper', 'supply', 'support', 'suppose', 'sure', 'surely', 'surface', 'surprise', 'surround', 'survey', 'suspect', 'sweep', 'sweet', 'swell', 'swept', 'swift', 'swim', 'swing', 'switch', 'sword', 'swore', 'sworn', 'symbol', 'system'],
  t: ['table', 'tail', 'take', 'talk', 'tall', 'tap', 'target', 'task', 'taste', 'taught', 'tax', 'tea', 'teach', 'team', 'tear', 'teeth', 'tell', 'temper', 'ten', 'tend', 'tent', 'term', 'test', 'than', 'thank', 'that', 'the', 'their', 'them', 'themselves', 'then', 'there', 'therefore', 'these', 'they', 'thick', 'thin', 'thing', 'think', 'third', 'this', 'those', 'though', 'thought', 'thousand', 'thread', 'threat', 'three', 'threw', 'throat', 'throne', 'through', 'throw', 'thrown', 'thrust', 'thumb', 'thunder', 'thursday', 'thus', 'ticket', 'tide', 'tie', 'tight', 'tile', 'till', 'timber', 'time', 'tin', 'tiny', 'tip', 'tire', 'tired', 'title', 'to', 'tobacco', 'today', 'toe', 'together', 'told', 'tomorrow', 'ton', 'tone', 'tongue', 'tonight', 'too', 'took', 'tool', 'tooth', 'top', 'topic', 'tore', 'torn', 'toss', 'total', 'touch', 'toward', 'tower', 'town', 'toy', 'trace', 'track', 'trade', 'traffic', 'trail', 'train', 'transfer', 'translate', 'trap', 'travel', 'treasure', 'treat', 'treatment', 'tree', 'tremble', 'trend', 'trial', 'triangle', 'tribe', 'trick', 'tried', 'trigger', 'trim', 'trip', 'triumph', 'troop', 'trouble', 'trowel', 'truck', 'true', 'truly', 'turned', 'turtle', 'twelve', 'twenty', 'twice', 'twin', 'twist', 'two', 'type', 'typical'],
  u: ['under', 'understand', 'unit', 'until', 'up', 'upon', 'us', 'use', 'usual'],
  v: ['value', 'various', 'very', 'voice', 'visit', 'valley', 'village', 'volume', 'view'],
  w: ['walk', 'want', 'warm', 'was', 'watch', 'water', 'way', 'we', 'week', 'well', 'went', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whole', 'why', 'wide', 'will', 'with', 'within', 'without', 'word', 'work', 'world', 'would', 'write', 'wrong'],
  x: ['xylophone', 'extra', 'exact', 'excited', 'index', 'matrix', 'box', 'tax', 'axes'],
  y: ['year', 'yellow', 'yes', 'yesterday', 'yet', 'you', 'young', 'your'],
  z: ['zero', 'zone', 'zoo', 'zipper', 'zebra', 'bronze', 'gaze', 'amaze', 'hazard']
};

interface DashboardProps {
  profileId: number;
  onStartCustomReview?: (text: string, title: string) => void;
}

export default function Dashboard({ profileId, onStartCustomReview }: DashboardProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'lesson' | 'custom'>('all');

  useEffect(() => {
    loadData();
  }, [profileId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const sessionList = await window.api.getSessions(profileId);
      let badgeList = await window.api.getBadges(profileId);
      
      setSessions(sessionList);

      // Auto unlock streak & session count badges
      const streak = calculateStreak(sessionList);
      const sessionCount = sessionList.length;
      const badgesToUnlock: string[] = [];

      if (streak >= 3) badgesToUnlock.push('consistency_3');
      if (streak >= 7) badgesToUnlock.push('consistency_7');
      if (streak >= 14) badgesToUnlock.push('consistency_14');
      if (sessionCount >= 10) badgesToUnlock.push('sessions_10');
      if (sessionCount >= 50) badgesToUnlock.push('sessions_50');
      if (sessionCount >= 100) badgesToUnlock.push('sessions_100');

      for (const badgeId of badgesToUnlock) {
        if (!badgeList.some(b => b.badge_id === badgeId)) {
          await window.api.unlockBadge(profileId, badgeId);
        }
      }

      badgeList = await window.api.getBadges(profileId);
      setBadges(badgeList);
    } catch (err) {
      console.error("Failed to load dashboard statistics", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Streak calculation in React
  const calculateStreak = (list: Session[]): number => {
    if (list.length === 0) return 0;
    
    const dates = Array.from(new Set(list.map(s => {
      const d = new Date(s.date!);
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }))).sort((a, b) => b.localeCompare(a));
    
    if (dates.length === 0) return 0;
    
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    const formatDate = (d: Date) => {
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    };
    
    const todayStr = formatDate(today);
    const yesterdayStr = formatDate(yesterday);
    
    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      return 0;
    }
    
    let streak = 0;
    let current = new Date(dates[0]);
    
    for (let i = 0; i < dates.length; i++) {
      const expected = formatDate(current);
      if (dates[i] === expected) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  // Filtered statistics values
  const stats = useMemo(() => {
    const filtered = sessions.filter(s => {
      if (filterType === 'all') return true;
      return s.session_type === filterType;
    });

    if (filtered.length === 0) {
      return {
        totalSessions: 0,
        avgWpm: 0,
        bestWpm: 0,
        avgAccuracy: 0,
        totalDuration: 0,
        streak: calculateStreak(sessions), // Streak is always based on absolute activity
        heatmap: {},
        chartData: []
      };
    }

    let totalWpm = 0;
    let totalAccuracy = 0;
    let totalDuration = 0;
    const heatmap: Record<string, number> = {};

    filtered.forEach(s => {
      totalWpm += s.wpm;
      totalAccuracy += s.accuracy;
      totalDuration += s.duration;

      // Compile key error map
      Object.entries(s.problem_keys).forEach(([key, count]) => {
        const lowerKey = key.toLowerCase();
        heatmap[lowerKey] = (heatmap[lowerKey] || 0) + count;
      });
    });

    // Chart trend coordinates (limited to last 15 sessions to prevent layout clutter)
    const chartData = filtered
      .slice(-15)
      .map((s, idx) => ({
        index: idx + 1,
        date: new Date(s.date!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        wpm: Math.round(s.wpm),
        accuracy: Math.round(s.accuracy),
        title: s.source_name
      }));

    const bestWpm = Math.round(Math.max(...filtered.map(s => s.wpm)));

    return {
      totalSessions: filtered.length,
      avgWpm: Math.round(totalWpm / filtered.length),
      bestWpm,
      avgAccuracy: Math.round(totalAccuracy / filtered.length),
      totalDuration,
      streak: calculateStreak(sessions),
      heatmap,
      chartData
    };
  }, [sessions, filterType]);

  const activeBadgesSet = useMemo(() => {
    return new Set(badges.map(b => b.badge_id));
  }, [badges]);

  // Format seconds to text hours and minutes
  const formatDurationText = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px] text-[#09090B] dark:text-[#FAFAFA] font-mono">
        <Loader2 className="w-6 h-6 animate-spin opacity-50" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 animate-fade-in text-[#09090B] dark:text-[#FAFAFA] font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-[#E5E5E5] dark:border-[#27272A] pb-4 font-sans">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="status-dot"></span>
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Analytics</span>
          </div>
          <h1 className="text-2xl font-light tracking-tight font-sans">Performance Telemetry</h1>
          <p className="text-xs opacity-60 font-sans mt-0.5">Track your typing WPM milestones, accuracy curves, and achievements.</p>
        </div>

        <div className="flex items-center gap-1 border border-[#E5E5E5] dark:border-[#27272A] p-0.5 rounded-md font-sans">
          <Filter className="w-3.5 h-3.5 opacity-50 ml-2 mr-1" />
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#09090B] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#09090B]'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            All Sessions
          </button>
          <button
            onClick={() => setFilterType('lesson')}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-all cursor-pointer ${
              filterType === 'lesson'
                ? 'bg-[#09090B] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#09090B]'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            Lessons
          </button>
          <button
            onClick={() => setFilterType('custom')}
            className={`px-3 py-1 text-xs font-medium rounded-sm transition-all cursor-pointer ${
              filterType === 'custom'
                ? 'bg-[#09090B] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#09090B]'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            Custom Drills
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 opacity-50 font-sans">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-xs mt-2 font-sans text-neutral-500">Loading Telemetry Data...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="border border-[#E5E5E5] dark:border-[#27272A] p-12 text-center bg-transparent rounded-xl font-sans">
          <BarChart4 className="w-8 h-8 opacity-30 mx-auto mb-2" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">No Session History</h3>
          <p className="text-xs opacity-50 max-w-sm mx-auto mt-1 font-sans leading-relaxed">
            Complete your first typing lesson or placement assessment to record speed curves and heatmaps.
          </p>
        </div>
      ) : (
        <div className="space-y-6 font-sans">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="border border-[#E5E5E5] dark:border-[#27272A] p-4 bg-transparent rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Average Speed</span>
                <Zap className="w-4 h-4 opacity-50" />
              </div>
              <p className="text-2xl font-bold font-mono">{stats.avgWpm} <span className="text-xs opacity-50 font-normal">WPM</span></p>
              <div className="text-xs opacity-60 mt-2 border-t border-[#E5E5E5] dark:border-[#27272A] pt-1.5 flex justify-between font-mono">
                <span>Best: {stats.bestWpm} WPM</span>
              </div>
            </div>

            <div className="border border-[#E5E5E5] dark:border-[#27272A] p-4 bg-transparent rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Accuracy</span>
                <ShieldCheck className="w-4 h-4 opacity-50" />
              </div>
              <p className="text-2xl font-bold font-mono">{stats.avgAccuracy}%</p>
              <div className="text-xs opacity-60 mt-2 border-t border-[#E5E5E5] dark:border-[#27272A] pt-1.5 font-sans">Precision Ratio</div>
            </div>

            <div className="border border-[#E5E5E5] dark:border-[#27272A] p-4 bg-transparent rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Daily Streak</span>
                <Flame className="w-4 h-4 text-amber-500 opacity-80" />
              </div>
              <p className="text-2xl font-bold font-mono">{stats.streak} <span className="text-xs opacity-50 font-normal">Days</span></p>
              <div className="text-xs opacity-60 mt-2 border-t border-[#E5E5E5] dark:border-[#27272A] pt-1.5 font-sans">Consecutive Days</div>
            </div>

            <div className="border border-[#E5E5E5] dark:border-[#27272A] p-4 bg-transparent rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Time Logged</span>
                <Clock className="w-4 h-4 opacity-50" />
              </div>
              <p className="text-2xl font-bold font-mono">{formatDurationText(stats.totalDuration)}</p>
              <div className="text-xs opacity-60 mt-2 border-t border-[#E5E5E5] dark:border-[#27272A] pt-1.5 font-sans">{stats.totalSessions} Sessions</div>
            </div>
          </div>

          {stats.chartData.length > 0 && (
            <div className="border border-[#E5E5E5] dark:border-[#27272A] p-5 bg-transparent rounded-xl font-sans">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-4">
                Speed & Accuracy Progression
              </span>
              
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" opacity={0.2} />
                    <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={10} tickLine={false} domain={[0, 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090B', border: '1px solid #27272A', color: '#FFF', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="wpm" name="Speed (WPM)" stroke="#09090B" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="accuracy" name="Accuracy (%)" stroke="#10B981" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {(() => {
            const weakestKeys = Object.entries(stats.heatmap)
              .filter(([key]) => key !== 'space' && key !== 'enter')
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([key]) => key);

            if (weakestKeys.length > 0 && onStartCustomReview) {
              return (
                <div className="border border-[#E5E5E5] dark:border-[#27272A] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAFAFA] dark:bg-[#121215] rounded-xl font-sans">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] border border-[#E5E5E5] dark:border-[#27272A] px-2 py-0.5 font-semibold uppercase tracking-wider rounded-md bg-[#FFFFFF] dark:bg-[#18181B]">
                        Typing Coach
                      </span>
                      <h3 className="text-xs font-semibold">Weak Keys Practice Recommendation</h3>
                    </div>
                    <p className="text-xs opacity-70 max-w-xl font-sans leading-relaxed">
                      Frequent errors detected on: <span className="font-bold uppercase font-mono">{weakestKeys.join(', ')}</span>. Execute targeted drill containing vocabulary focusing on these characters.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const generatedWords: string[] = [];
                      for (let i = 0; i < 30; i++) {
                        const randomKey = weakestKeys[Math.floor(Math.random() * weakestKeys.length)];
                        const wordPool = COMMON_WORDS_BY_LETTER[randomKey] || ['the', 'quick', 'brown', 'fox'];
                        const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];
                        generatedWords.push(randomWord);
                      }
                      const generatedText = generatedWords.join(' ');
                      onStartCustomReview(generatedText, `Weak Keys: ${weakestKeys.join(' ').toUpperCase()}`);
                    }}
                    className="px-4 py-2 border border-[#09090B] dark:border-[#FAFAFA] bg-[#09090B] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#09090B] font-semibold text-xs rounded-md hover:opacity-90 transition-all cursor-pointer shrink-0"
                  >
                    Generate Recovery Drill
                  </button>
                </div>
              );
            }
            return null;
          })()}

          <div className="space-y-3 font-sans">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Weak Keys Heatmap</span>
            </div>
            <VisualKeyboard
              layoutName="qwerty"
              heatmap={stats.heatmap}
            />
          </div>

          <div className="border border-[#E5E5E5] dark:border-[#27272A] p-6 font-sans bg-transparent rounded-xl">
            <h3 className="text-xs font-semibold uppercase tracking-wider border-b border-[#E5E5E5] dark:border-[#27272A] pb-3 mb-6 flex items-center gap-2">
              <Award className="w-4 h-4 opacity-80 text-amber-500" />
              Achievements Unlocked
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {BADGES_LIST.map((b) => {
                const isUnlocked = activeBadgesSet.has(b.id);

                return (
                  <div
                    key={b.id}
                    className={`flex gap-3 p-3.5 border transition-all rounded-lg ${
                      isUnlocked
                        ? 'border-[#09090B] dark:border-[#FAFAFA] bg-transparent'
                        : 'border-[#E5E5E5]/50 dark:border-[#27272A]/50 opacity-40 grayscale'
                    }`}
                  >
                    <div className="text-xl h-8 w-8 flex items-center justify-center border border-[#E5E5E5] dark:border-[#27272A] shrink-0 font-sans rounded-md">
                      {b.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold">
                        {b.name}
                      </h4>
                      <p className="text-[11px] opacity-60 mt-0.5 font-sans leading-relaxed">{b.desc}</p>
                      {isUnlocked && (
                        <span className="inline-block mt-1 text-[9px] font-semibold uppercase tracking-wider text-emerald-500 border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.2 rounded-md">
                          Unlocked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
