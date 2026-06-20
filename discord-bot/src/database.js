const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'bot.db');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS guild_config (
    guild_id TEXT PRIMARY KEY,
    log_channel TEXT,
    mod_channel TEXT,
    boost_channel TEXT,
    boost_message TEXT DEFAULT 'Thank you {mention_user} for boosting the server! 🚀',
    boost_color TEXT DEFAULT '#FF73FA',
    boost_footer TEXT DEFAULT 'Thanks for the boost!',
    boost_image TEXT,
    boost_thumbnail TEXT,
    afk_voice_channel TEXT,
    anti_spam INTEGER DEFAULT 1,
    anti_link INTEGER DEFAULT 0,
    anti_mention_spam INTEGER DEFAULT 1,
    mention_threshold INTEGER DEFAULT 5,
    spam_threshold INTEGER DEFAULT 5,
    spam_interval INTEGER DEFAULT 5000,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_spam (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    message_count INTEGER DEFAULT 0,
    last_message_time INTEGER DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  );
`);

const GuildConfig = {
  get(guildId) {
    let config = db.prepare('SELECT * FROM guild_config WHERE guild_id = ?').get(guildId);
    if (!config) {
      db.prepare('INSERT INTO guild_config (guild_id) VALUES (?)').run(guildId);
      config = db.prepare('SELECT * FROM guild_config WHERE guild_id = ?').get(guildId);
    }
    return config;
  },

  set(guildId, key, value) {
    GuildConfig.get(guildId);
    db.prepare(`UPDATE guild_config SET ${key} = ?, updated_at = datetime('now') WHERE guild_id = ?`).run(value, guildId);
  },

  setMultiple(guildId, data) {
    GuildConfig.get(guildId);
    const keys = Object.keys(data).map(k => `${k} = ?`).join(', ');
    const values = Object.values(data);
    db.prepare(`UPDATE guild_config SET ${keys}, updated_at = datetime('now') WHERE guild_id = ?`).run(...values, guildId);
  }
};

const Warnings = {
  add(guildId, userId, moderatorId, reason) {
    return db.prepare('INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)').run(guildId, userId, moderatorId, reason);
  },

  get(guildId, userId) {
    return db.prepare('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC').all(guildId, userId);
  },

  count(guildId, userId) {
    return db.prepare('SELECT COUNT(*) as count FROM warnings WHERE guild_id = ? AND user_id = ?').get(guildId, userId).count;
  },

  remove(id) {
    return db.prepare('DELETE FROM warnings WHERE id = ?').run(id);
  },

  clear(guildId, userId) {
    return db.prepare('DELETE FROM warnings WHERE guild_id = ? AND user_id = ?').run(guildId, userId);
  }
};

const SpamTracker = {
  get(guildId, userId) {
    return db.prepare('SELECT * FROM user_spam WHERE guild_id = ? AND user_id = ?').get(guildId, userId);
  },

  update(guildId, userId, count, time) {
    db.prepare(`
      INSERT INTO user_spam (guild_id, user_id, message_count, last_message_time)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(guild_id, user_id) DO UPDATE SET message_count = ?, last_message_time = ?
    `).run(guildId, userId, count, time, count, time);
  },

  reset(guildId, userId) {
    db.prepare('DELETE FROM user_spam WHERE guild_id = ? AND user_id = ?').run(guildId, userId);
  }
};

module.exports = { db, GuildConfig, Warnings, SpamTracker };
