// Itype v1.1.1 Final Release Build
import { Volume2, VolumeX, Keyboard, RefreshCw, Type, Eye, ShieldAlert, Moon } from 'lucide-react';
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
    <div className="max-w-2xl mx-auto py-6 px-4 animate-fade-in text-[#09090B] dark:text-[#FAFAFA] font-sans">
      <div className="mb-8 border-b border-[#E5E5E5] dark:border-[#27272A] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="status-dot"></span>
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Preferences</span>
        </div>
        <h1 className="text-2xl font-light tracking-tight font-sans">System Settings</h1>
        <p className="text-xs opacity-60 font-sans mt-0.5">Configure typing behavior, audio feedback, and visual options.</p>
      </div>

      <div className="space-y-6 font-sans">
        {/* Profile Card */}
        <div className="border border-[#E5E5E5] dark:border-[#27272A] p-5 flex items-center justify-between rounded-lg bg-[#FAFAFA] dark:bg-[#121215]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-[#E5E5E5] dark:border-[#27272A] flex items-center justify-center font-bold text-xs rounded-md bg-[#FFFFFF] dark:bg-[#18181B]">
              {profile.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold">{profile.name}</p>
              <p className="text-xs opacity-50">Operator #{profile.id} • Registered {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <button
            onClick={onSwitchProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E5E5] dark:border-[#27272A] text-xs font-medium rounded-md hover:bg-[#09090B] hover:text-[#FFFFFF] dark:hover:bg-[#FAFAFA] dark:hover:text-[#09090B] transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Switch Operator
          </button>
        </div>

        {/* Configurations list */}
        <div className="border border-[#E5E5E5] dark:border-[#27272A] divide-y divide-[#E5E5E5] dark:divide-[#27272A] rounded-lg bg-transparent overflow-hidden">
          
          {/* Theme setting */}
          <div className="flex items-center justify-between p-4">
            <div className="flex gap-3">
              <Eye className="w-4 h-4 opacity-60 mt-0.5" />
              <div>
                <label className="text-xs font-semibold block">Interface Theme</label>
                <span className="text-[11px] opacity-50 block">Switch between crisp light mode and dark mode.</span>
              </div>
            </div>
            <select
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value)}
              className="p-1.5 text-xs border border-[#E5E5E5] dark:border-[#27272A] bg-transparent font-sans rounded-md cursor-pointer"
            >
              <option value="light" className="bg-[#FFFFFF] dark:bg-[#09090B]">Light Mode</option>
              <option value="dark" className="bg-[#FFFFFF] dark:bg-[#09090B]">Dark Mode</option>
            </select>
          </div>

          {/* Dark Mode Background Tone */}
          {settings.theme === 'dark' && (
            <div className="flex items-center justify-between p-4 bg-[#FAFAFA]/50 dark:bg-[#18181B]/40">
              <div className="flex gap-3">
                <Moon className="w-4 h-4 opacity-60 mt-0.5" />
                <div>
                  <label className="text-xs font-semibold block">Dark Background Tone</label>
                  <span className="text-[11px] opacity-50 block">Adjust darkness intensity (pitch black to soft gray dusk).</span>
                </div>
              </div>
              <select
                value={settings.darkShade || 'obsidian'}
                onChange={(e) => updateSetting('darkShade', e.target.value)}
                className="p-1.5 text-xs border border-[#E5E5E5] dark:border-[#27272A] bg-transparent font-sans rounded-md cursor-pointer"
              >
                <option value="pitch" className="bg-[#FFFFFF] dark:bg-[#09090B]">Pitch Black (OLED)</option>
                <option value="obsidian" className="bg-[#FFFFFF] dark:bg-[#09090B]">Obsidian (Default)</option>
                <option value="charcoal" className="bg-[#FFFFFF] dark:bg-[#09090B]">Soft Charcoal</option>
                <option value="slate" className="bg-[#FFFFFF] dark:bg-[#09090B]">Deep Slate</option>
                <option value="dusk" className="bg-[#FFFFFF] dark:bg-[#09090B]">Muted Dusk (Softest)</option>
              </select>
            </div>
          )}

          {/* Typing Engine Mode */}
          <div className="flex items-center justify-between p-4">
            <div className="flex gap-3">
              <ShieldAlert className="w-4 h-4 opacity-60 mt-0.5" />
              <div>
                <label className="text-xs font-semibold block">Typing Rules</label>
                <span className="text-[11px] opacity-50 block">Strict Mode forces backspace correction before advancing caret.</span>
              </div>
            </div>
            <div className="flex gap-1 border border-[#E5E5E5] dark:border-[#27272A] p-0.5 rounded-md">
              <button
                onClick={() => updateSetting('strictMode', true)}
                className={`px-3 py-1 text-xs font-medium rounded-sm transition-all cursor-pointer ${
                  settings.strictMode
                    ? 'bg-[#09090B] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#09090B]'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                Strict
              </button>
              <button
                onClick={() => updateSetting('strictMode', false)}
                className={`px-3 py-1 text-xs font-medium rounded-sm transition-all cursor-pointer ${
                  !settings.strictMode
                    ? 'bg-[#09090B] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#09090B]'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                Free
              </button>
            </div>
          </div>

          {/* Keyboard Layout */}
          <div className="flex items-center justify-between p-4">
            <div className="flex gap-3">
              <Keyboard className="w-4 h-4 opacity-60 mt-0.5" />
              <div>
                <label className="text-xs font-semibold block">Keyboard Layout</label>
                <span className="text-[11px] opacity-50 block">Select key mapping standard.</span>
              </div>
            </div>
            <select
              value={settings.layout}
              onChange={(e) => updateSetting('layout', e.target.value)}
              className="p-1.5 text-xs border border-[#E5E5E5] dark:border-[#27272A] bg-transparent font-sans rounded-md cursor-pointer"
            >
              <option value="qwerty" className="bg-[#FFFFFF] dark:bg-[#09090B]">QWERTY</option>
              <option value="dvorak" className="bg-[#FFFFFF] dark:bg-[#09090B]">Dvorak</option>
              <option value="colemak" className="bg-[#FFFFFF] dark:bg-[#09090B]">Colemak</option>
            </select>
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between p-4">
            <div className="flex gap-3">
              {settings.sound ? (
                <Volume2 className="w-4 h-4 opacity-60 mt-0.5" />
              ) : (
                <VolumeX className="w-4 h-4 opacity-60 mt-0.5" />
              )}
              <div>
                <label className="text-xs font-semibold block">Keypress Click Audio</label>
                <span className="text-[11px] opacity-50 block">Synthesized mechanical switch audio on key down.</span>
              </div>
            </div>
            <button
              onClick={() => updateSetting('sound', !settings.sound)}
              className={`px-3 py-1 text-xs font-medium border rounded-md transition-all cursor-pointer ${
                settings.sound
                  ? 'border-[#09090B] dark:border-[#FAFAFA] bg-[#09090B] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#09090B]'
                  : 'border-[#E5E5E5] dark:border-[#27272A] opacity-60'
              }`}
            >
              {settings.sound ? "Enabled" : "Disabled"}
            </button>
          </div>

          {/* Sound Profile & Volume */}
          {settings.sound && (
            <>
              {/* Keyboard Sound Profile */}
              <div className="flex items-center justify-between p-4">
                <div className="flex gap-3">
                  <Volume2 className="w-4 h-4 opacity-60 mt-0.5" />
                  <div>
                    <label className="text-xs font-semibold block">Keyboard Sound Profile</label>
                    <span className="text-[11px] opacity-50 block">Tactile click acoustics type.</span>
                  </div>
                </div>
                <select
                  value={settings.soundProfile || 'clicky'}
                  onChange={(e) => updateSetting('soundProfile', e.target.value)}
                  className="p-1.5 text-xs border border-[#E5E5E5] dark:border-[#27272A] bg-transparent font-sans rounded-md cursor-pointer"
                >
                  <option value="clicky" className="bg-[#FFFFFF] dark:bg-[#09090B]">Mechanical Click</option>
                  <option value="aggressive" className="bg-[#FFFFFF] dark:bg-[#09090B]">Aggressive Clack</option>
                  <option value="soft" className="bg-[#FFFFFF] dark:bg-[#09090B]">Bubble Pop</option>
                  <option value="vintage" className="bg-[#FFFFFF] dark:bg-[#09090B]">Typewriter Bell</option>
                </select>
              </div>

              {/* Sound Volume Slider */}
              <div className="flex items-center justify-between p-4">
                <div className="flex gap-3">
                  <Volume2 className="w-4 h-4 opacity-60 mt-0.5" />
                  <div>
                    <label className="text-xs font-semibold block">Audio Volume</label>
                    <span className="text-[11px] opacity-50 block">Master gain volume level.</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-36 font-mono">
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={settings.soundVolume !== undefined ? settings.soundVolume : 0.5}
                    onChange={(e) => updateSetting('soundVolume', parseFloat(e.target.value))}
                    className="w-full accent-black dark:accent-white cursor-pointer h-1 bg-[#E5E5E5] dark:bg-[#27272A] appearance-none"
                  />
                  <span className="text-xs font-mono font-bold w-8 text-right">
                    {Math.round((settings.soundVolume !== undefined ? settings.soundVolume : 0.5) * 100)}%
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Misclick / Error Sound setting */}
          <div className="flex items-center justify-between p-4">
            <div className="flex gap-3">
              <Volume2 className="w-4 h-4 opacity-60 mt-0.5" />
              <div>
                <label className="text-xs font-semibold block">Misclick Alert Audio</label>
                <span className="text-[11px] opacity-50 block">Play alert audio feedback when mistyping a character.</span>
              </div>
            </div>
            <button
              onClick={() => updateSetting('errorSound', settings.errorSound === false ? true : false)}
              className={`px-3 py-1 text-xs font-medium border rounded-md transition-all cursor-pointer ${
                settings.errorSound !== false
                  ? 'border-[#09090B] dark:border-[#FAFAFA] bg-[#09090B] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#09090B]'
                  : 'border-[#E5E5E5] dark:border-[#27272A] opacity-60'
              }`}
            >
              {settings.errorSound !== false ? "Enabled" : "Disabled"}
            </button>
          </div>

          {/* Timer 10s Countdown Sound */}
          <div className="flex items-center justify-between p-4">
            <div className="flex gap-3">
              <Volume2 className="w-4 h-4 opacity-60 mt-0.5" />
              <div>
                <label className="text-xs font-semibold block">Timer Countdown Audio</label>
                <span className="text-[11px] opacity-50 block">Soft ticking audio for the final 10 seconds of time trials.</span>
              </div>
            </div>
            <button
              onClick={() => updateSetting('timerSound', settings.timerSound === false ? true : false)}
              className={`px-3 py-1 text-xs font-medium border rounded-md transition-all cursor-pointer ${
                settings.timerSound !== false
                  ? 'border-[#09090B] dark:border-[#FAFAFA] bg-[#09090B] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#09090B]'
                  : 'border-[#E5E5E5] dark:border-[#27272A] opacity-60'
              }`}
            >
              {settings.timerSound !== false ? "Enabled" : "Disabled"}
            </button>
          </div>

          {/* Session Complete Chime ("Big Ting!") */}
          <div className="flex items-center justify-between p-4">
            <div className="flex gap-3">
              <Volume2 className="w-4 h-4 opacity-60 mt-0.5" />
              <div>
                <label className="text-xs font-semibold block">Session Complete Chime ("Big Ting!")</label>
                <span className="text-[11px] opacity-50 block">Celebratory chime sequence upon completing a drill.</span>
              </div>
            </div>
            <button
              onClick={() => updateSetting('completionSound', settings.completionSound === false ? true : false)}
              className={`px-3 py-1 text-xs font-medium border rounded-md transition-all cursor-pointer ${
                settings.completionSound !== false
                  ? 'border-[#09090B] dark:border-[#FAFAFA] bg-[#09090B] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#09090B]'
                  : 'border-[#E5E5E5] dark:border-[#27272A] opacity-60'
              }`}
            >
              {settings.completionSound !== false ? "Enabled" : "Disabled"}
            </button>
          </div>

          {/* Font Size */}
          <div className="flex items-center justify-between p-4">
            <div className="flex gap-3">
              <Type className="w-4 h-4 opacity-60 mt-0.5" />
              <div>
                <label className="text-xs font-semibold block">Typing Font Size</label>
                <span className="text-[11px] opacity-50 block">Character font sizing inside active typing stream.</span>
              </div>
            </div>
            <div className="flex gap-1 border border-[#E5E5E5] dark:border-[#27272A] p-0.5 rounded-md">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updateSetting('fontSize', size)}
                  className={`px-3 py-1 text-xs font-medium capitalize rounded-sm transition-all cursor-pointer ${
                    settings.fontSize === size
                      ? 'bg-[#09090B] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#09090B]'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Virtual Keyboard Visibility Toggle */}
          <div className="flex items-center justify-between p-4">
            <div className="flex gap-3">
              <Keyboard className="w-4 h-4 opacity-60 mt-0.5" />
              <div>
                <label className="text-xs font-semibold block">Display Virtual Keyboard</label>
                <span className="text-[11px] opacity-50 block">Show or hide visual keycap overlay during practice.</span>
              </div>
            </div>
            <button
              onClick={() => updateSetting('showKeyboard', settings.showKeyboard === false ? true : false)}
              className={`px-3 py-1 text-xs font-medium border rounded-md transition-all cursor-pointer ${
                settings.showKeyboard !== false
                  ? 'border-[#09090B] dark:border-[#FAFAFA] bg-[#09090B] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#09090B]'
                  : 'border-[#E5E5E5] dark:border-[#27272A] opacity-60'
              }`}
            >
              {settings.showKeyboard !== false ? "Show" : "Hide"}
            </button>
          </div>

          {/* Keyboard Size */}
          <div className="flex items-center justify-between p-4">
            <div className="flex gap-3">
              <Keyboard className="w-4 h-4 opacity-60 mt-0.5" />
              <div>
                <label className="text-xs font-semibold block">Keyboard Dimensions</label>
                <span className="text-[11px] opacity-50 block">Standard keyboard view or compact view.</span>
              </div>
            </div>
            <div className="flex gap-1 border border-[#E5E5E5] dark:border-[#27272A] p-0.5 rounded-md">
              {(['standard', 'compact'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => updateSetting('keyboardSize', sz)}
                  className={`px-3 py-1 text-xs font-medium capitalize rounded-sm transition-all cursor-pointer ${
                    (settings.keyboardSize || 'standard') === sz
                      ? 'bg-[#09090B] text-[#FFFFFF] dark:bg-[#FAFAFA] dark:text-[#09090B]'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard Color-Coding */}
          <div className="flex items-center justify-between p-4">
            <div className="flex gap-3">
              <RefreshCw className="w-4 h-4 opacity-60 mt-0.5" />
              <div>
                <label className="text-xs font-semibold block">Finger Placement Mapping</label>
                <span className="text-[11px] opacity-50 block">Color-code key caps to finger responsibilities.</span>
              </div>
            </div>
            <button
              onClick={() => updateSetting('keyboardColorCoded', !settings.keyboardColorCoded)}
              className={`px-3 py-1 text-xs font-medium border rounded-md transition-all cursor-pointer ${
                settings.keyboardColorCoded
                  ? 'border-[#09090B] dark:border-[#FAFAFA] bg-[#09090B] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#09090B]'
                  : 'border-[#E5E5E5] dark:border-[#27272A] opacity-60'
              }`}
            >
              {settings.keyboardColorCoded ? "Enabled" : "Disabled"}
            </button>
          </div>

          {/* Reset Performance Data */}
          <div className="flex items-center justify-between p-4">
            <div className="flex gap-3">
              <RefreshCw className="w-4 h-4 text-red-500 opacity-80 mt-0.5" />
              <div>
                <label className="text-xs font-semibold block text-red-500">Clear Performance History</label>
                <span className="text-[11px] opacity-50 block">Permanently delete session history and badges.</span>
              </div>
            </div>
            <button
              onClick={handleResetData}
              className="px-3 py-1 text-xs font-semibold border border-red-500/40 text-red-500 hover:bg-red-500/10 transition-all cursor-pointer rounded-md"
            >
              Reset Data
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
