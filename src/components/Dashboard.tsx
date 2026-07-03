import { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Award, Zap, Flame, Clock, BarChart4, Filter, Info, ShieldCheck, Loader2 } from 'lucide-react';
import { Session, Badge } from '../types/electron';
import VisualKeyboard from './VisualKeyboard';

// List of all achievements in the game
const BADGES_LIST = [
  { id: 'first_steps', name: 'First Steps', desc: 'Completed the initial placement test.', icon: '👣' },
  { id: 'speed_demon_1', name: 'Speed Demon I', desc: 'Type 40+ WPM in any session.', icon: '⚡' },
  { id: 'speed_demon_2', name: 'Speed Demon II', desc: 'Type 60+ WPM in any session.', icon: '🚀' },
  { id: 'speed_demon_3', name: 'Speed Demon III', desc: 'Type 80+ WPM in any session.', icon: '🔥' },
  { id: 'speed_demon_4', name: 'Speed Demon IV', desc: 'Type 100+ WPM in any session!', icon: '👑' },
  { id: 'sniper', name: 'Sniper', desc: 'Finished a lesson with 100% accuracy (min 80 chars).', icon: '🎯' },
  { id: 'marathoner', name: 'Marathoner', desc: 'Completed a session longer than 5 minutes.', icon: '🏃' },
  { id: 'consistency_3', name: '3-Day Streak', desc: 'Practiced typing 3 days in a row.', icon: '🌱' },
  { id: 'consistency_7', name: '7-Day Streak', desc: 'Practiced typing 7 days in a row.', icon: '🌳' }
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
  s: ['sad', 'safe', 'said', 'sail', 'same', 'sand', 'sat', 'save', 'saw', 'say', 'scene', 'school', 'science', 'score', 'sea', 'search', 'season', 'second', 'secret', 'section', 'see', 'seed', 'seek', 'seem', 'seen', 'self', 'sell', 'send', 'sense', 'sent', 'sentence', 'separate', 'serve', 'service', 'set', 'seven', 'several', 'shall', 'shape', 'share', 'sharp', 'she', 'sheet', 'shelf', 'shell', 'shine', 'ship', 'shirt', 'shoe', 'shoot', 'shop', 'shore', 'short', 'shot', 'should', 'shoulder', 'shout', 'show', 'shrink', 'shut', 'side', 'sight', 'sign', 'signal', 'silent', 'silly', 'silver', 'similar', 'simple', 'since', 'sing', 'single', 'sink', 'sister', 'sit', 'site', 'six', 'size', 'skill', 'skin', 'skirt', 'sky', 'sleep', 'slip', 'slow', 'slowly', 'small', 'smart', 'smell', 'smile', 'smoke', 'smooth', 'snow', 'so', 'soap', 'social', 'soft', 'softly', 'soil', 'sold', 'soldier', 'sole', 'solid', 'solve', 'some', 'someone', 'something', 'sometime', 'son', 'song', 'soon', 'sore', 'sorrow', 'sort', 'sound', 'source', 'south', 'space', 'speak', 'special', 'speed', 'spell', 'spend', 'spent', 'spin', 'spirit', 'spite', 'split', 'spoken', 'sport', 'spot', 'spread', 'spring', 'square', 'stable', 'staff', 'stage', 'stair', 'stamp', 'stand', 'standard', 'star', 'stare', 'start', 'state', 'station', 'stay', 'steady', 'steam', 'steel', 'steep', 'steer', 'step', 'stick', 'stiff', 'still', 'sting', 'stir', 'stock', 'stone', 'stood', 'stop', 'store', 'storm', 'story', 'stove', 'straight', 'strain', 'strange', 'strap', 'stream', 'street', 'strength', 'stretch', 'strict', 'strike', 'string', 'strip', 'stroke', 'strong', 'strongly', 'struck', 'structure', 'struggle', 'student', 'studio', 'study', 'stuff', 'stumble', 'style', 'subject', 'substance', 'succeed', 'success', 'such', 'sudden', 'suddenly', 'suffer', 'sugar', 'suggest', 'suit', 'summer', 'sun', 'sunday', 'super', 'supper', 'supply', 'support', 'suppose', 'sure', 'surely', 'surface', 'surprise', 'surround', 'survey', 'suspect', 'sweep', 'sweet', 'swell', 'swept', 'swift', 'swim', 'swing', 'switch', 'sword', 'swore', 'sworn', 'symbol', 'system'],
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
      const badgeList = await window.api.getBadges(profileId);
      
      setSessions(sessionList);
      setBadges(badgeList);

      // Check if current streak qualifies for streak badges, and auto-unlock them
      const streak = calculateStreak(sessionList);
      if (streak >= 3) {
        const hasBadge = badgeList.some(b => b.badge_id === 'consistency_3');
        if (!hasBadge) {
          await window.api.unlockBadge(profileId, 'consistency_3');
          // Reload badges
          const updatedBadges = await window.api.getBadges(profileId);
          setBadges(updatedBadges);
        }
      }
      if (streak >= 7) {
        const hasBadge = badgeList.some(b => b.badge_id === 'consistency_7');
        if (!hasBadge) {
          await window.api.unlockBadge(profileId, 'consistency_7');
          // Reload badges
          const updatedBadges = await window.api.getBadges(profileId);
          setBadges(updatedBadges);
        }
      }
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

    return {
      totalSessions: filtered.length,
      avgWpm: Math.round(totalWpm / filtered.length),
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
      <div className="flex items-center justify-center h-[400px] text-[#2E2C29] dark:text-[#ECE8E1]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-app)] dark:text-[var(--accent-app)] opacity-50" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in text-[#2E2C29] dark:text-[#ECE8E1]">
      
      {/* Page header and Filter controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-wide mb-1">Performance Dashboard</h1>
          <p className="text-sm opacity-60">Visualize WPM trends and review problem keys heatmap.</p>
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF7F2] dark:bg-[#1B1A18] border border-[#E6E1D8] dark:border-[#2F2D2A] rounded-xl self-start sm:self-auto shadow-inner">
          <Filter className="w-3.5 h-3.5 opacity-55 mx-2 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />
          {(['all', 'lesson', 'custom'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-[#FFFDFB] dark:bg-[#201E1C] border border-[#E6E1D8] dark:border-[#2F2D2A] text-[var(--accent-app)] dark:text-[var(--accent-app)] shadow-sm'
                  : 'border-transparent opacity-60'
              }`}
            >
              {type === 'all' ? 'All Sessions' : type === 'lesson' ? 'Lessons' : 'Custom'}
            </button>
          ))}
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFDFB] dark:bg-[#201E1C] border border-[#E6E1D8] dark:border-[#2F2D2A] rounded-xl shadow-sm p-8 max-w-lg mx-auto">
          <BarChart4 className="w-12 h-12 text-[var(--accent-app)] dark:text-[var(--accent-app)] mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-semibold tracking-wide mb-1">No Practice History Yet</h3>
          <p className="text-xs opacity-60 mb-6">Complete your placement test or select a home row lesson to generate typing stats.</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Summary counters grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Speed card */}
            <div className="bg-[#FFFDFB] dark:bg-[#201E1C] border border-[#E6E1D8] dark:border-[#2F2D2A] rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-40">Avg Speed</span>
                <Zap className="w-4 h-4 text-[var(--accent-app)]" />
              </div>
              <p className="text-3xl font-light tracking-wide">{stats.avgWpm} <span className="text-xs opacity-50 font-normal">WPM</span></p>
              <p className="text-[10px] opacity-45 mt-1 border-t border-[#E6E1D8] dark:border-[#2F2D2A] pt-1.5 flex justify-between">
                <span>Net WPM formula</span>
                <span className="font-semibold text-[var(--accent-app)]">Best: {Math.round(sessions.length > 0 ? Math.max(...sessions.map(s => s.wpm)) : 0)} WPM</span>
              </p>
            </div>

            {/* Accuracy card */}
            <div className="bg-[#FFFDFB] dark:bg-[#201E1C] border border-[#E6E1D8] dark:border-[#2F2D2A] rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-40">Accuracy</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-light tracking-wide text-emerald-500">{stats.avgAccuracy}%</p>
              <p className="text-[10px] opacity-45 mt-1 border-t border-[#E6E1D8] dark:border-[#2F2D2A] pt-1.5">Goal is 95%+</p>
            </div>

            {/* Streak card */}
            <div className="bg-[#FFFDFB] dark:bg-[#201E1C] border border-[#E6E1D8] dark:border-[#2F2D2A] rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-40">Daily Streak</span>
                <Flame className={`w-4 h-4 ${stats.streak > 0 ? 'text-[var(--accent-app)] dark:text-[var(--accent-app)]' : 'opacity-30'}`} />
              </div>
              <p className="text-3xl font-light tracking-wide">{stats.streak} <span className="text-xs opacity-50 font-normal">Days</span></p>
              <p className="text-[10px] opacity-45 mt-1 border-t border-[#E6E1D8] dark:border-[#2F2D2A] pt-1.5">
                {stats.streak > 0 ? "Keep it burning!" : "Break the chain?"}
              </p>
            </div>

            {/* Total time card */}
            <div className="bg-[#FFFDFB] dark:bg-[#201E1C] border border-[#E6E1D8] dark:border-[#2F2D2A] rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-40">Total Time</span>
                <Clock className="w-4 h-4 opacity-50" />
              </div>
              <p className="text-3xl font-light tracking-wide">{formatDurationText(stats.totalDuration)}</p>
              <p className="text-[10px] opacity-45 mt-1 border-t border-[#E6E1D8] dark:border-[#2F2D2A] pt-1.5">{stats.totalSessions} total runs</p>
            </div>
          </div>

          {/* Chart block */}
          {stats.chartData.length > 0 && (
            <div className="bg-[#FFFDFB] dark:bg-[#201E1C] border border-[#E6E1D8] dark:border-[#2F2D2A] rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold tracking-wide border-b border-[#E6E1D8] dark:border-[#2F2D2A] pb-3 mb-6">
                WPM Speed & Accuracy Progression
              </h3>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} opacity={0.5} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} label={{ value: 'WPM', angle: -90, position: 'insideLeft', fontSize: 10 }} opacity={0.5} />
                    <YAxis yAxisId="right" orientation="right" domain={[50, 100]} tick={{ fontSize: 10 }} label={{ value: 'Accuracy %', angle: 90, position: 'insideRight', fontSize: 10 }} opacity={0.5} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card-app)',
                        borderColor: 'var(--border-app)',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: 'var(--text-app)'
                      }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="wpm" name="Speed (WPM)" stroke="var(--accent-app)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="accuracy" name="Accuracy (%)" stroke="#10b981" strokeWidth={1.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* AI Typing Coach Insights Panel */}
          {(() => {
            const weakestKeys = Object.entries(stats.heatmap)
              .filter(([key]) => key !== 'space' && key !== 'enter')
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([key]) => key);

            if (weakestKeys.length > 0 && onStartCustomReview) {
              return (
                <div className="bg-[#FFFDFB] dark:bg-[#201E1C] border border-[#E6E1D8] dark:border-[#2F2D2A] rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-[var(--accent-app)]/10 text-[var(--accent-app)] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">AI Typing Coach</span>
                      <h3 className="text-sm font-semibold tracking-wide">Weak Keys Practice Insights</h3>
                    </div>
                    <p className="text-xs opacity-75 max-w-xl">
                      Your performance heatmap indicates frequent errors on: <span className="font-mono font-bold text-[var(--accent-app)] uppercase">{weakestKeys.join(', ')}</span>. Practice a customized drill containing words focusing heavily on these characters.
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
                    className="px-4 py-2.5 rounded-lg bg-[var(--accent-app)] text-white text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-sm shrink-0 whitespace-nowrap self-start md:self-auto"
                  >
                    Start Focused Practice
                  </button>
                </div>
              );
            }
            return null;
          })()}

          {/* Error Heatmap keyboard overlay */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-wide">Problem Keys Heatmap</h3>
              <div className="group relative cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                <Info className="w-3.5 h-3.5" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 w-48 p-2 rounded bg-[#FFFDFB] dark:bg-[#201E1C] border border-[#E6E1D8] dark:border-[#2F2D2A] text-[9px] leading-relaxed hidden group-hover:block shadow-sm z-30">
                  Keys are shaded based on error frequency. Deeper orange/terracotta keys indicate keys where you make the most errors.
                </span>
              </div>
            </div>
            <VisualKeyboard
              layoutName="qwerty"
              heatmap={stats.heatmap}
            />
          </div>

          {/* Achievements Cabinet */}
          <div className="bg-[#FFFDFB] dark:bg-[#201E1C] border border-[#E6E1D8] dark:border-[#2F2D2A] rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold tracking-wide border-b border-[#E6E1D8] dark:border-[#2F2D2A] pb-3 mb-6 flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />
              Achievements Cabinet
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {BADGES_LIST.map((b) => {
                const isUnlocked = activeBadgesSet.has(b.id);

                return (
                  <div
                    key={b.id}
                    className={`flex gap-3.5 p-4 rounded-xl border transition-all ${
                      isUnlocked
                        ? 'bg-[#FAF7F2] dark:bg-[#181715] border-[var(--accent-app)]/30'
                        : 'border-[#E6E1D8] dark:border-[#2F2D2A] opacity-40 grayscale'
                    }`}
                  >
                    <div className="text-2xl h-10 w-10 flex items-center justify-center rounded-full bg-[#FFFDFB] dark:bg-[#201E1C] shadow-sm shrink-0 border border-[#E6E1D8] dark:border-[#2F2D2A]">
                      {b.icon}
                    </div>
                    <div>
                      <h4 className={`text-xs font-semibold tracking-wide ${isUnlocked ? 'text-[var(--accent-app)] dark:text-[var(--accent-app)]' : ''}`}>
                        {b.name}
                      </h4>
                      <p className="text-[10px] opacity-65 mt-0.5 leading-relaxed">{b.desc}</p>
                      {isUnlocked && (
                        <span className="inline-block mt-2 text-[8px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-1 rounded">
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
