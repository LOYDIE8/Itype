import React, { useState, useEffect } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { Profile } from '../types/electron';

interface ProfileSelectorProps {
  onSelectProfile: (profile: Profile) => void;
}

export default function ProfileSelector({ onSelectProfile }: ProfileSelectorProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProfileName, setNewProfileName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setIsLoading(true);
      const list = await window.api.getProfiles();
      setProfiles(list);
    } catch (err) {
      console.error("Failed to load profiles", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newProfileName.trim();
    if (!name) return;

    try {
      setError('');
      setIsCreating(true);
      const newProfile = await window.api.createProfile(name);
      onSelectProfile(newProfile);
    } catch (err: any) {
      setError(err.message || "Failed to create profile. The name might be taken.");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFFFFF] dark:bg-[#09090B] text-[#09090B] dark:text-[#FAFAFA] font-sans">
        <div className="flex items-center gap-2 mb-3">
          <span className="status-dot"></span>
          <span className="text-xs font-medium text-neutral-500">Initializing Database...</span>
        </div>
        <Loader2 className="w-5 h-5 animate-spin opacity-80" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#FFFFFF] dark:bg-[#09090B] text-[#09090B] dark:text-[#FAFAFA] select-none font-sans">
      <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#121215] border border-[#E5E5E5] dark:border-[#27272A] p-8 text-left relative shadow-sm rounded-xl">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#27272A] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="status-dot"></span>
            <span className="text-xs font-semibold text-neutral-500 font-sans">v2.4 System Ready</span>
          </div>
          <span className="text-xs font-sans opacity-50 font-medium">User Profiles</span>
        </div>

        {/* App Title Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-light tracking-tight mb-1 font-mono">
            I<span className="font-bold underline decoration-1 underline-offset-4">TYPE</span>
          </h1>
          <p className="text-xs text-neutral-500 font-sans tracking-wide">
            Touch Typing Practice & Learning Engine
          </p>
        </div>

        {profiles.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider font-sans">
                Select Profile
              </span>
              <span className="text-xs opacity-50 font-sans">
                {profiles.length} profile{profiles.length > 1 ? 's' : ''} saved
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 font-sans">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => onSelectProfile(profile)}
                  className="flex items-center justify-between w-full p-3.5 border border-[#E5E5E5] dark:border-[#27272A] bg-transparent hover:bg-[#09090B] hover:text-[#FFFFFF] dark:hover:bg-[#FAFAFA] dark:hover:text-[#09090B] transition-all cursor-pointer group rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border border-[#E5E5E5] dark:border-[#27272A] flex items-center justify-center text-xs font-bold rounded-md group-hover:border-transparent bg-[#FAFAFA] dark:bg-[#18181B]">
                      {profile.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-semibold text-xs tracking-wide">
                      {profile.name}
                    </span>
                  </div>
                  <span className="text-xs font-medium opacity-50 group-hover:opacity-100">
                    Continue →
                  </span>
                </button>
              ))}
            </div>

            <div className="border-t border-[#E5E5E5] dark:border-[#27272A] pt-6 font-sans">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="new-name" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Create New Profile
                  </label>
                  <input
                    id="new-name"
                    type="text"
                    placeholder="Enter profile name..."
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    maxLength={15}
                    className="w-full p-3 border border-[#E5E5E5] dark:border-[#27272A] bg-transparent text-xs font-sans tracking-wide transition-all focus:border-[#09090B] dark:focus:border-[#FAFAFA] rounded-md"
                  />
                </div>
                {error && <p className="text-xs text-red-500 font-sans text-left tracking-wide">{error}</p>}
                <button
                  type="submit"
                  disabled={!newProfileName.trim() || isCreating}
                  className="flex items-center justify-center gap-2 w-full p-3 border border-[#09090B] dark:border-[#FAFAFA] bg-[#09090B] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#09090B] hover:opacity-90 text-xs font-semibold font-sans tracking-wide transition-all cursor-pointer rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create Profile
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="font-sans">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-4 text-left">
              Create Your Profile
            </span>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="first-name" className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Profile Name
                </label>
                <input
                  id="first-name"
                  type="text"
                  placeholder="e.g. TypeMaster"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  maxLength={15}
                  className="w-full p-3 border border-[#E5E5E5] dark:border-[#27272A] bg-transparent text-xs font-sans tracking-wide transition-all focus:border-[#09090B] dark:focus:border-[#FAFAFA] rounded-md"
                />
              </div>
              {error && <p className="text-xs text-red-500 font-sans text-left tracking-wide">{error}</p>}
              <button
                type="submit"
                disabled={!newProfileName.trim() || isCreating}
                className="flex items-center justify-center gap-2 w-full p-3.5 border border-[#09090B] dark:border-[#FAFAFA] bg-[#09090B] dark:bg-[#FAFAFA] text-[#FFFFFF] dark:text-[#09090B] hover:opacity-90 text-xs font-semibold font-sans tracking-wide transition-all cursor-pointer rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Profile & Start
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Footer System Tag */}
        <div className="mt-8 pt-4 border-t border-[#E5E5E5] dark:border-[#27272A] flex justify-between text-xs font-sans opacity-50">
          <span>Storage: Local SQLite</span>
          <span>Status: Active</span>
        </div>
      </div>
    </div>
  );
}

