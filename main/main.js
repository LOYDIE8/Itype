const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const dbHelper = require('./database');

let mainWindow = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 780,
    minWidth: 950,
    minHeight: 680,
    show: false,
    backgroundColor: '#FAF7F2', // Set background color matching our light-mode cream
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Hide the default browser-like menu bar for a clean, app-like minimal aesthetic
  mainWindow.setMenuBarVisibility(false);

  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in dev mode
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

// ----------------------------------------------------
// IPC Event Handlers
// ----------------------------------------------------

// 1. Profiles Handlers
ipcMain.handle('db:get-profiles', async () => {
  try {
    const profiles = dbHelper.query("SELECT * FROM profiles ORDER BY name ASC");
    return profiles.map(p => ({
      ...p,
      settings: JSON.parse(p.settings)
    }));
  } catch (err) {
    console.error("IPC get-profiles error:", err);
    return [];
  }
});

ipcMain.handle('db:create-profile', async (event, name, settings) => {
  try {
    const defaultSettings = settings || {
      theme: 'light',
      layout: 'qwerty',
      sound: true,
      strictMode: true,
      fontSize: 'medium'
    };
    const profileId = dbHelper.run(
      "INSERT INTO profiles (name, settings) VALUES (?, ?)",
      [name, JSON.stringify(defaultSettings)]
    );
    return { id: profileId, name, settings: defaultSettings };
  } catch (err) {
    console.error("IPC create-profile error:", err);
    throw err;
  }
});

ipcMain.handle('db:update-profile-settings', async (event, id, settings) => {
  try {
    dbHelper.run(
      "UPDATE profiles SET settings = ? WHERE id = ?",
      [JSON.stringify(settings), id]
    );
    return true;
  } catch (err) {
    console.error("IPC update-profile-settings error:", err);
    throw err;
  }
});

// 2. Sessions Handlers
ipcMain.handle('db:save-session', async (event, profileId, session) => {
  try {
    const { wpm, accuracy, error_count, duration, session_type, source_name, problem_keys } = session;
    const sessionId = dbHelper.run(
      `INSERT INTO sessions 
       (profile_id, wpm, accuracy, error_count, duration, session_type, source_name, problem_keys) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [profileId, wpm, accuracy, error_count, duration, session_type, source_name, JSON.stringify(problem_keys)]
    );
    return sessionId;
  } catch (err) {
    console.error("IPC save-session error:", err);
    throw err;
  }
});

ipcMain.handle('db:get-sessions', async (event, profileId) => {
  try {
    const sessions = dbHelper.query(
      "SELECT * FROM sessions WHERE profile_id = ? ORDER BY date DESC",
      [profileId]
    );
    return sessions.map(s => ({
      ...s,
      problem_keys: JSON.parse(s.problem_keys)
    }));
  } catch (err) {
    console.error("IPC get-sessions error:", err);
    return [];
  }
});

// 3. Custom Texts (Reusable Decks) Handlers
ipcMain.handle('db:get-custom-texts', async (event, profileId) => {
  try {
    return dbHelper.query(
      "SELECT * FROM custom_texts WHERE profile_id = ? ORDER BY created_at DESC",
      [profileId]
    );
  } catch (err) {
    console.error("IPC get-custom-texts error:", err);
    return [];
  }
});

ipcMain.handle('db:save-custom-text', async (event, profileId, title, content) => {
  try {
    const textId = dbHelper.run(
      "INSERT INTO custom_texts (profile_id, title, content) VALUES (?, ?, ?)",
      [profileId, title, content]
    );
    return { id: textId, profile_id: profileId, title, content };
  } catch (err) {
    console.error("IPC save-custom-text error:", err);
    throw err;
  }
});

ipcMain.handle('db:delete-custom-text', async (event, profileId, textId) => {
  try {
    dbHelper.run(
      "DELETE FROM custom_texts WHERE id = ? AND profile_id = ?",
      [textId, profileId]
    );
    return true;
  } catch (err) {
    console.error("IPC delete-custom-text error:", err);
    throw err;
  }
});

// 4. Badges / Achievements Handlers
ipcMain.handle('db:get-badges', async (event, profileId) => {
  try {
    return dbHelper.query(
      "SELECT badge_id, unlocked_at FROM badges WHERE profile_id = ?",
      [profileId]
    );
  } catch (err) {
    console.error("IPC get-badges error:", err);
    return [];
  }
});

ipcMain.handle('db:unlock-badge', async (event, profileId, badgeId) => {
  try {
    dbHelper.run(
      "INSERT OR IGNORE INTO badges (profile_id, badge_id) VALUES (?, ?)",
      [profileId, badgeId]
    );
    return true;
  } catch (err) {
    console.error("IPC unlock-badge error:", err);
    throw err;
  }
});

ipcMain.handle('db:reset-profile-data', async (event, profileId) => {
  try {
    dbHelper.run("DELETE FROM sessions WHERE profile_id = ?", [profileId]);
    dbHelper.run("DELETE FROM badges WHERE profile_id = ?", [profileId]);
    return true;
  } catch (err) {
    console.error("IPC reset-profile-data error:", err);
    throw err;
  }
});

// 5. Statistics Processing Handler
ipcMain.handle('db:get-stats-summary', async (event, profileId) => {
  try {
    const sessions = dbHelper.query(
      "SELECT * FROM sessions WHERE profile_id = ? ORDER BY date ASC",
      [profileId]
    );
    
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        avgWpm: 0,
        avgAccuracy: 0,
        totalDuration: 0,
        streak: 0,
        heatmap: {},
        wpmTrend: []
      };
    }

    let totalWpm = 0;
    let totalAccuracy = 0;
    let totalDuration = 0;
    const heatmap = {};
    const wpmTrend = [];

    sessions.forEach(s => {
      totalWpm += s.wpm;
      totalAccuracy += s.accuracy;
      totalDuration += s.duration;

      // Populate trend line
      wpmTrend.push({
        date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        wpm: Math.round(s.wpm),
        accuracy: Math.round(s.accuracy),
        type: s.session_type
      });

      // Populate error heatmap
      try {
        const errors = JSON.parse(s.problem_keys);
        Object.entries(errors).forEach(([key, count]) => {
          const lowerKey = key.toLowerCase();
          heatmap[lowerKey] = (heatmap[lowerKey] || 0) + count;
        });
      } catch (e) {
        // Safe skip
      }
    });

    const streak = calculateStreak(sessions);

    return {
      totalSessions: sessions.length,
      avgWpm: Math.round(totalWpm / sessions.length),
      avgAccuracy: Math.round(totalAccuracy / sessions.length),
      totalDuration,
      streak,
      heatmap,
      wpmTrend
    };
  } catch (err) {
    console.error("IPC get-stats-summary error:", err);
    throw err;
  }
});

// Helper: Calculate streak in days
function calculateStreak(sessions) {
  if (sessions.length === 0) return 0;
  
  // Format all sessions to YYYY-MM-DD
  const dates = Array.from(new Set(sessions.map(s => {
    const d = new Date(s.date);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }))).sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)
  
  if (dates.length === 0) return 0;
  
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  
  const formatDateStr = (d) => {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  
  const todayStr = formatDateStr(today);
  const yesterdayStr = formatDateStr(yesterday);
  
  // If user hasn't typed today or yesterday, streak is broken (0)
  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
    return 0;
  }
  
  let streak = 0;
  let current = new Date(dates[0]);
  
  for (let i = 0; i < dates.length; i++) {
    const expected = formatDateStr(current);
    if (dates[i] === expected) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

// 6. File dialog to upload text file
ipcMain.handle('dialog:upload-text-file', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Text Files', extensions: ['txt'] }]
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      const content = fs.readFileSync(filePath, 'utf-8');
      const title = path.basename(filePath, '.txt');
      return { title, content };
    }
    return null;
  } catch (err) {
    console.error("IPC upload-text-file error:", err);
    throw err;
  }
});

// 7. Scrape content from a URL
ipcMain.handle('scraper:extract-url-text', async (event, url) => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch webpage (Status ${response.status})`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Clean document tree of clutter
    $('script, style, nav, footer, header, noscript, iframe, link, .ads, #nav, #footer, #header').remove();
    
    let text = "";
    // Target main article bodies if they exist
    const articleSelectors = ['article', 'main', '.post-content', '.entry-content', '.article-body', '#content'];
    for (const selector of articleSelectors) {
      const el = $(selector);
      if (el.length > 0) {
        text = el.text();
        break;
      }
    }
    
    if (!text || text.trim().length < 200) {
      text = $('body').text();
    }
    
    // Clean spaces & structure
    let cleaned = text
      .replace(/\r?\n/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[“”]/g, '"') // Normalize smart double quotes
      .replace(/[‘’]/g, "'") // Normalize smart single quotes
      .trim();
      
    // Truncate if article is excessively long for typing practice
    if (cleaned.length > 2500) {
      cleaned = cleaned.substring(0, 2500) + "...";
    }
    
    const pageTitle = $('title').text() || 'Web Article';
    const cleanTitle = pageTitle.split('-')[0].split('|')[0].trim();
    
    return { title: cleanTitle, content: cleaned };
  } catch (err) {
    console.error("IPC extract-url-text error:", err);
    throw new Error(err.message || "Failed to scrape webpage");
  }
});

// App events
app.whenReady().then(async () => {
  await dbHelper.initDatabase(app.getPath('userData'));
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
