const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Profiles CRUD
  getProfiles: () => ipcRenderer.invoke('db:get-profiles'),
  createProfile: (name, settings) => ipcRenderer.invoke('db:create-profile', name, settings),
  updateProfileSettings: (id, settings) => ipcRenderer.invoke('db:update-profile-settings', id, settings),
  
  // Session History
  saveSession: (profileId, session) => ipcRenderer.invoke('db:save-session', profileId, session),
  getSessions: (profileId) => ipcRenderer.invoke('db:get-sessions', profileId),
  
  // Custom Texts (Reusable Decks)
  getCustomTexts: (profileId) => ipcRenderer.invoke('db:get-custom-texts', profileId),
  saveCustomText: (profileId, title, content) => ipcRenderer.invoke('db:save-custom-text', profileId, title, content),
  deleteCustomText: (profileId, textId) => ipcRenderer.invoke('db:delete-custom-text', profileId, textId),
  
  // Achievements / Badges
  getBadges: (profileId) => ipcRenderer.invoke('db:get-badges', profileId),
  unlockBadge: (profileId, badgeId) => ipcRenderer.invoke('db:unlock-badge', profileId, badgeId),
  resetProfileData: (profileId) => ipcRenderer.invoke('db:reset-profile-data', profileId),
  
  // Advanced Dashboard Statistics
  getStatsSummary: (profileId) => ipcRenderer.invoke('db:get-stats-summary', profileId),
  
  // File System Access (Upload .txt File)
  uploadTextFile: () => ipcRenderer.invoke('dialog:upload-text-file'),
  
  // URL Article Text Extractor
  extractUrlText: (url) => ipcRenderer.invoke('scraper:extract-url-text', url)
});
