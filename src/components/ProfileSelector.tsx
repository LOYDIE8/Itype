import React, { useState, useEffect } from 'react';
import { UserPlus, User, Loader2 } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark">
        <Loader2 className="w-8 h-8 animate-spin text-accent-light dark:text-accent-dark mb-4" />
        <p className="text-sm font-medium tracking-wide opacity-75">Loading profiles...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-[#FAF7F2] dark:bg-[#181715] text-[#2E2C29] dark:text-[#ECE8E1]">
      <div className="w-full max-w-md bg-[#FFFDFB] dark:bg-[#201E1C] rounded-xl shadow-sm border border-[#E6E1D8] dark:border-[#2F2D2A] p-8 text-center transition-all">
        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-wide mb-2 text-[#2E2C29] dark:text-[#ECE8E1]">
            Type<span className="font-semibold text-[var(--accent-app)] dark:text-[var(--accent-app)]">Flow</span>
          </h1>
          <p className="text-sm text-[#2E2C29]/60 dark:text-[#ECE8E1]/60">
            A quiet space to master touch typing.
          </p>
        </div>

        {profiles.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-lg font-medium tracking-wide text-left opacity-80 mb-2">Select Profile</h2>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => onSelectProfile(profile)}
                  className="flex items-center justify-between w-full p-4 rounded-lg bg-[#FAF7F2] dark:bg-[#181715] hover:bg-[#FAF7F2]/50 dark:hover:bg-[#181715]/50 border border-[#E6E1D8] dark:border-[#2F2D2A] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#E6E1D8] dark:bg-[#2F2D2A] flex items-center justify-center text-[#2E2C29] dark:text-[#ECE8E1]">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm group-hover:text-[var(--accent-app)] dark:group-hover:text-[var(--accent-app)] transition-colors">
                      {profile.name}
                    </span>
                  </div>
                  <span className="text-xs opacity-40">Select</span>
                </button>
              ))}
            </div>

            <div className="border-t border-[#E6E1D8] dark:border-[#2F2D2A] pt-6">
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="new-name" className="text-xs font-semibold uppercase tracking-wider opacity-60">
                    Create New Profile
                  </label>
                  <input
                    id="new-name"
                    type="text"
                    placeholder="Enter name..."
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    maxLength={15}
                    className="w-full p-3 rounded-lg border border-[#E6E1D8] dark:border-[#2F2D2A] bg-transparent text-sm transition-all focus:border-[var(--accent-app)] dark:focus:border-[var(--accent-app)]"
                  />
                </div>
                {error && <p className="text-xs text-red-500 text-left mt-1 font-medium">{error}</p>}
                <button
                  type="submit"
                  disabled={!newProfileName.trim() || isCreating}
                  className="flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-[var(--accent-app)] dark:bg-[var(--accent-app)] text-white hover:bg-[var(--accent-app)]/90 dark:hover:bg-[var(--accent-app)]/90 text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create and Start
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-medium tracking-wide mb-4 opacity-80">Welcome! Create your profile</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="first-name" className="text-xs font-semibold uppercase tracking-wider opacity-60">
                  Profile Name
                </label>
                <input
                  id="first-name"
                  type="text"
                  placeholder="e.g. TypeMaster"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  maxLength={15}
                  className="w-full p-3 rounded-lg border border-[#E6E1D8] dark:border-[#2F2D2A] bg-transparent text-sm transition-all focus:border-[var(--accent-app)] dark:focus:border-[var(--accent-app)]"
                />
              </div>
              {error && <p className="text-xs text-red-500 text-left mt-1 font-medium">{error}</p>}
              <button
                type="submit"
                disabled={!newProfileName.trim() || isCreating}
                className="flex items-center justify-center gap-2 w-full p-3.5 rounded-lg bg-[var(--accent-app)] dark:bg-[var(--accent-app)] text-white hover:bg-[var(--accent-app)]/90 dark:hover:bg-[var(--accent-app)]/90 text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Get Started
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
