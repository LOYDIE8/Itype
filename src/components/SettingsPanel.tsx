import { Volume2, VolumeX, Keyboard, RefreshCw, Type, Eye, ShieldAlert } from 'lucide-react';
import { Profile } from '../types/electron';

interface SettingsPanelProps {
  profile: Profile;
  onUpdateProfile: (profile: Profile) => void;
  onSwitchProfile: () => void;
}

export default function SettingsPanel({ profile, onUpdateProfile, onSwitchProfile }: SettingsPanelProps) {
  const { settings } = profile;

  const updateSetting = async (key: keyof typeof settings, value: any) => {
    const updatedSettings = {
      ...settings,
      [key]: value
    };

    try {
      await window.api.updateProfileSettings(profile.id, updatedSettings);
      
      // Update local state in parent App
      onUpdateProfile({
        ...profile,
        settings: updatedSettings
      });

      // Apply theme changes instantly if theme was updated
      if (key === 'theme') {
        const root = document.documentElement;
        if (value === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }

      // Apply accent changes instantly if accentColor was updated
      if (key === 'accentColor') {
        const root = document.documentElement;
        root.classList.remove('accent-terracotta', 'accent-forest', 'accent-oasis', 'accent-sand');
        root.classList.add(`accent-${value}`);
      }

      // Apply global font size changes instantly
      if (key === 'appFontSize') {
        const root = document.documentElement;
        root.classList.remove('size-app-small', 'size-app-medium', 'size-app-large');
        root.classList.add(`size-app-${value}`);
      }

      // Apply global font family changes instantly
      if (key === 'appFontType') {
        const root = document.documentElement;
        root.classList.remove('font-app-sans', 'font-app-serif', 'font-app-mono');
        root.classList.add(`font-app-${value}`);
      }
    } catch (err) {
      console.error("Failed to save settings", err);
    }
  };

  const handleResetData = async () => {
    const confirmReset = window.confirm(
      "Are you sure you want to reset all typing stats and badges? This action is permanent and cannot be undone."
    );
    if (!confirmReset) return;

    try {
      await window.api.resetProfileData(profile.id);
      alert("Performance statistics and badges have been cleared successfully.");
      
      // Reload parent states
      onUpdateProfile({
        ...profile
      });
    } catch (err) {
      console.error("Failed to reset profile statistics", err);
      alert("An error occurred while resetting data.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in text-[#2E2C29] dark:text-[#ECE8E1]">
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-wide mb-1">Settings</h1>
        <p className="text-sm opacity-60">Personalize your typing environment.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-[#FFFDFB] dark:bg-[#201E1C] border border-[#E6E1D8] dark:border-[#2F2D2A] rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] dark:bg-[#181715] border border-[#E6E1D8] dark:border-[#2F2D2A] flex items-center justify-center font-medium">
              {profile.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">{profile.name}</p>
              <p className="text-xs opacity-50">Local profile created on {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <button
            onClick={onSwitchProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E1D8] dark:border-[#2F2D2A] text-xs font-semibold hover:bg-[#FAF7F2] dark:hover:bg-[#181715] transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Switch Profile
          </button>
        </div>

        {/* Configurations list */}
        <div className="bg-[#FFFDFB] dark:bg-[#201E1C] border border-[#E6E1D8] dark:border-[#2F2D2A] rounded-xl shadow-sm divide-y divide-[#E6E1D8] dark:divide-[#2F2D2A]">
          
          {/* Theme setting */}
          <div className="flex items-center justify-between p-5">
            <div className="flex gap-3">
              <Eye className="w-5 h-5 opacity-70 mt-0.5 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />
              <div>
                <label className="text-sm font-medium tracking-wide block">Interface Theme</label>
                <span className="text-xs opacity-50 block">Switch between light cream and warm charcoal dark mode.</span>
              </div>
            </div>
            <select
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value)}
              className="p-2 text-xs rounded-lg border border-[#E6E1D8] dark:border-[#2F2D2A] bg-transparent text-[#2E2C29] dark:text-[#ECE8E1] cursor-pointer"
            >
              <option value="light" className="bg-[#FAF7F2] dark:bg-[#181715] text-[#2E2C29] dark:text-[#ECE8E1]">Light Cream</option>
              <option value="dark" className="bg-[#FAF7F2] dark:bg-[#181715] text-[#2E2C29] dark:text-[#ECE8E1]">Warm Charcoal</option>
            </select>
          </div>

          {/* Accent Color Theme selection */}
          <div className="flex items-center justify-between p-5">
            <div className="flex gap-3">
              <Eye className="w-5 h-5 opacity-70 mt-0.5 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />
              <div>
                <label className="text-sm font-medium tracking-wide block">Color Accent Theme</label>
                <span className="text-xs opacity-50 block">Select a curated earth-tone accent for buttons and focus elements.</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {[
                { name: 'terracotta', hex: '#D96B43', label: 'Orange' },
                { name: 'forest', hex: '#4F795B', label: 'Green' },
                { name: 'oasis', hex: '#3C7A89', label: 'Teal' },
                { name: 'sand', hex: '#C49F5D', label: 'Gold' }
              ].map((color) => {
                const isActive = (settings.accentColor || 'terracotta') === color.name;
                return (
                  <button
                    key={color.name}
                    onClick={() => updateSetting('accentColor', color.name)}
                    className={`w-6 h-6 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                      isActive 
                        ? 'border-[#2E2C29] dark:border-[#ECE8E1] scale-110 shadow-sm' 
                        : 'border-[#E6E1D8] dark:border-[#2F2D2A] hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.label}
                  >
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Global App Font Size */}
          <div className="flex items-center justify-between p-5">
            <div className="flex gap-3">
              <Eye className="w-5 h-5 opacity-70 mt-0.5 text-[var(--accent-app)]" />
              <div>
                <label className="text-sm font-medium tracking-wide block">Application Font Size</label>
                <span className="text-xs opacity-50 block">Scale the size of menus, sidebars, and text globally.</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              {(['small', 'medium', 'large'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => updateSetting('appFontSize', sz)}
                  className={`px-3 py-1.5 text-xs font-semibold capitalize rounded-lg border transition-all cursor-pointer ${
                    (settings.appFontSize || 'medium') === sz
                      ? 'bg-[var(--accent-app)]/15 text-[var(--accent-app)] border-[var(--accent-app)]'
                      : 'border-[#E6E1D8] dark:border-[#2F2D2A] opacity-60'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Global App Font Type */}
          <div className="flex items-center justify-between p-5">
            <div className="flex gap-3">
              <Eye className="w-5 h-5 opacity-70 mt-0.5 text-[var(--accent-app)]" />
              <div>
                <label className="text-sm font-medium tracking-wide block">Application Font Family</label>
                <span className="text-xs opacity-50 block">Choose the display typography family used across the app.</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              {[
                { name: 'sans', label: 'Sans-Serif' },
                { name: 'serif', label: 'Serif' },
                { name: 'mono', label: 'Monospace' }
              ].map((font) => (
                <button
                  key={font.name}
                  onClick={() => updateSetting('appFontType', font.name)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    (settings.appFontType || 'sans') === font.name
                      ? 'bg-[var(--accent-app)]/15 text-[var(--accent-app)] border-[var(--accent-app)]'
                      : 'border-[#E6E1D8] dark:border-[#2F2D2A] opacity-60'
                  }`}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          {/* Typing Engine Mode */}
          <div className="flex items-center justify-between p-5">
            <div className="flex gap-3">
              <ShieldAlert className="w-5 h-5 opacity-70 mt-0.5 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />
              <div>
                <label className="text-sm font-medium tracking-wide block">Typing Rules</label>
                <span className="text-xs opacity-50 block">Strict Mode forces you to correct mistakes before proceeding.</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateSetting('strictMode', true)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  settings.strictMode
                    ? 'bg-[var(--accent-app)]/15 text-[var(--accent-app)] border-[var(--accent-app)]'
                    : 'border-[#E6E1D8] dark:border-[#2F2D2A] opacity-60'
                }`}
              >
                Strict
              </button>
              <button
                onClick={() => updateSetting('strictMode', false)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  !settings.strictMode
                    ? 'bg-[var(--accent-app)]/15 text-[var(--accent-app)] border-[var(--accent-app)]'
                    : 'border-[#E6E1D8] dark:border-[#2F2D2A] opacity-60'
                }`}
              >
                Free Form
              </button>
            </div>
          </div>

          {/* Keyboard Layout */}
          <div className="flex items-center justify-between p-5">
            <div className="flex gap-3">
              <Keyboard className="w-5 h-5 opacity-70 mt-0.5 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />
              <div>
                <label className="text-sm font-medium tracking-wide block">Virtual Keyboard Layout</label>
                <span className="text-xs opacity-50 block">Changes the keyboard overlay layout mapped below typing lines.</span>
              </div>
            </div>
            <select
              value={settings.layout}
              onChange={(e) => updateSetting('layout', e.target.value)}
              className="p-2 text-xs rounded-lg border border-[#E6E1D8] dark:border-[#2F2D2A] bg-transparent text-[#2E2C29] dark:text-[#ECE8E1] cursor-pointer"
            >
              <option value="qwerty" className="bg-[#FAF7F2] dark:bg-[#181715] text-[#2E2C29] dark:text-[#ECE8E1]">QWERTY</option>
              <option value="dvorak" className="bg-[#FAF7F2] dark:bg-[#181715] text-[#2E2C29] dark:text-[#ECE8E1]">Dvorak</option>
              <option value="colemak" className="bg-[#FAF7F2] dark:bg-[#181715] text-[#2E2C29] dark:text-[#ECE8E1]">Colemak</option>
            </select>
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between p-5">
            <div className="flex gap-3">
              {settings.sound ? (
                <Volume2 className="w-5 h-5 opacity-70 mt-0.5 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />
              ) : (
                <VolumeX className="w-5 h-5 opacity-70 mt-0.5 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />
              )}
              <div>
                <label className="text-sm font-medium tracking-wide block">Sound Effects</label>
                <span className="text-xs opacity-50 block">Synthesizer audio clicks on typing and short buzz on errors.</span>
              </div>
            </div>
            <button
              onClick={() => updateSetting('sound', !settings.sound)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                settings.sound
                  ? 'bg-[var(--accent-app)] text-white border-[var(--accent-app)]'
                  : 'border-[#E6E1D8] dark:border-[#2F2D2A] opacity-60'
              }`}
            >
              {settings.sound ? "Enabled" : "Disabled"}
            </button>
          </div>

          {/* Sound Profile & Volume */}
          {settings.sound && (
            <>
              {/* Keyboard Sound Profile */}
              <div className="flex items-center justify-between p-5">
                <div className="flex gap-3">
                  <Volume2 className="w-5 h-5 opacity-70 mt-0.5 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />
                  <div>
                    <label className="text-sm font-medium tracking-wide block">Keyboard Sound Profile</label>
                    <span className="text-xs opacity-50 block">Select the click acoustics when typing keys.</span>
                  </div>
                </div>
                <select
                  value={settings.soundProfile || 'clicky'}
                  onChange={(e) => updateSetting('soundProfile', e.target.value)}
                  className="p-2 text-xs rounded-lg border border-[#E6E1D8] dark:border-[#2F2D2A] bg-transparent text-[#2E2C29] dark:text-[#ECE8E1] cursor-pointer"
                >
                  <option value="clicky" className="bg-[#FAF7F2] dark:bg-[#181715] text-[#2E2C29] dark:text-[#ECE8E1]">Clicky (Mechanical)</option>
                  <option value="soft" className="bg-[#FAF7F2] dark:bg-[#181715] text-[#2E2C29] dark:text-[#ECE8E1]">Soft (Bubble Pop)</option>
                  <option value="vintage" className="bg-[#FAF7F2] dark:bg-[#181715] text-[#2E2C29] dark:text-[#ECE8E1]">Vintage (Typewriter)</option>
                </select>
              </div>

              {/* Sound Volume Slider */}
              <div className="flex items-center justify-between p-5">
                <div className="flex gap-3">
                  <Volume2 className="w-5 h-5 opacity-70 mt-0.5 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />
                  <div>
                    <label className="text-sm font-medium tracking-wide block">Typing Sound Volume</label>
                    <span className="text-xs opacity-50 block">Adjust the loudness of click audio effects.</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-40">
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={settings.soundVolume !== undefined ? settings.soundVolume : 0.5}
                    onChange={(e) => updateSetting('soundVolume', parseFloat(e.target.value))}
                    className="w-full accent-[var(--accent-app)] cursor-pointer h-1 bg-[#E6E1D8] dark:bg-[#2F2D2A] rounded-lg appearance-none"
                  />
                  <span className="text-xs font-mono w-8 text-right font-semibold">
                    {Math.round((settings.soundVolume !== undefined ? settings.soundVolume : 0.5) * 100)}%
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Font Size */}
          <div className="flex items-center justify-between p-5">
            <div className="flex gap-3">
              <Type className="w-5 h-5 opacity-70 mt-0.5 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />
              <div>
                <label className="text-sm font-medium tracking-wide block">Typing Font Size</label>
                <span className="text-xs opacity-50 block">Change scale of reading text lines for better accessibility.</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updateSetting('fontSize', size)}
                  className={`px-3 py-1.5 text-xs font-semibold capitalize rounded-lg border transition-all cursor-pointer ${
                    settings.fontSize === size
                      ? 'bg-[var(--accent-app)]/15 text-[var(--accent-app)] border-[var(--accent-app)]'
                      : 'border-[#E6E1D8] dark:border-[#2F2D2A] opacity-60'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard Size */}
          <div className="flex items-center justify-between p-5">
            <div className="flex gap-3">
              <Keyboard className="w-5 h-5 opacity-70 mt-0.5 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />
              <div>
                <label className="text-sm font-medium tracking-wide block">Keyboard Size</label>
                <span className="text-xs opacity-50 block">Shrink keyboard dimensions and hide hand indicators for a clean view.</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              {(['standard', 'compact'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => updateSetting('keyboardSize', sz)}
                  className={`px-3 py-1.5 text-xs font-semibold capitalize rounded-lg border transition-all cursor-pointer ${
                    (settings.keyboardSize || 'standard') === sz
                      ? 'bg-[var(--accent-app)]/15 text-[var(--accent-app)] border-[var(--accent-app)]'
                      : 'border-[#E6E1D8] dark:border-[#2F2D2A] opacity-60'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard Color-Coding */}
          <div className="flex items-center justify-between p-5">
            <div className="flex gap-3">
              <RefreshCw className="w-5 h-5 opacity-70 mt-0.5 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />
              <div>
                <label className="text-sm font-medium tracking-wide block">Finger Color-Coding</label>
                <span className="text-xs opacity-50 block">Highlight keys by standard finger mapping for touch-typing.</span>
              </div>
            </div>
            <button
              onClick={() => updateSetting('keyboardColorCoded', !settings.keyboardColorCoded)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                settings.keyboardColorCoded
                  ? 'bg-[var(--accent-app)] text-white border-[var(--accent-app)]'
                  : 'border-[#E6E1D8] dark:border-[#2F2D2A] opacity-60'
              }`}
            >
              {settings.keyboardColorCoded ? "Enabled" : "Disabled"}
            </button>
          </div>

          {/* Typing Area Height */}
          <div className="flex items-center justify-between p-5">
            <div className="flex gap-3">
              <Eye className="w-5 h-5 opacity-70 mt-0.5 text-[var(--accent-app)] dark:text-[var(--accent-app)]" />
              <div>
                <label className="text-sm font-medium tracking-wide block">Typing Area Height</label>
                <span className="text-xs opacity-50 block">Set default height size for the active text container.</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              {(['compact', 'standard', 'large'] as const).map((h) => (
                <button
                  key={h}
                  onClick={() => updateSetting('containerHeight', h)}
                  className={`px-3 py-1.5 text-xs font-semibold capitalize rounded-lg border transition-all cursor-pointer ${
                    (settings.containerHeight || 'standard') === h
                      ? 'bg-[var(--accent-app)]/15 text-[var(--accent-app)] border-[var(--accent-app)]'
                      : 'border-[#E6E1D8] dark:border-[#2F2D2A] opacity-60'
                  }`}
                >
                  {h === 'compact' ? 'Small' : h === 'standard' ? 'Medium' : 'Large'}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Performance Data */}
          <div className="flex items-center justify-between p-5">
            <div className="flex gap-3">
              <RefreshCw className="w-5 h-5 opacity-70 mt-0.5 text-red-500" />
              <div>
                <label className="text-sm font-medium tracking-wide block text-red-500">Reset Performance Data</label>
                <span className="text-xs opacity-50 block">Wipe all practice sessions, accuracy histories, and badges.</span>
              </div>
            </div>
            <button
              onClick={handleResetData}
              className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all"
            >
              Reset Data
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
