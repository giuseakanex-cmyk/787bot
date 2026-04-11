import './config.js';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import fs from 'fs';
import chalk from 'chalk';
import pino from 'pino';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import NodeCache from 'node-cache';

const { useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = await import('@realvare/baileys');

protoType();
serialize();

global.authFile = 'session';
global.db = new Low(new JSONFile('database.json'));
await global.db.read().catch(() => {});
global.db.data = { users: {}, chats: {}, settings: {}, ...(global.db.data || {}) };

const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const { version } = await fetchLatestBaileysVersion();

const conn = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    browser: ['Ubuntu', 'Chrome', '110.0.5481.178'],
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    msgRetryCounterCache: new NodeCache(),
});

global.conn = conn;

if (!conn.authState.creds.registered) {
    console.clear();
    const question = (t) => {
        process.stdout.write(t);
        return new Promise((resolve) => process.stdin.once('data', (data) => resolve(data.toString().trim())));
    };
    const num = await question(chalk.red.bold('\n787 BOT ➤ Inserisci numero (es. 39347...) : '));
    setTimeout(async () => {
        let code = await conn.requestPairingCode(num.replace(/\D/g, ''));
        console.log(chalk.white.bgRed('\n CODICE: ') + ' ' + chalk.bold.red(code?.match(/.{1,4}/g)?.join("-") || code));
    }, 3000);
}

conn.ev.on('creds.update', saveCreds);
conn.ev.on('connection.update', (up) => {
    const { connection, lastDisconnect } = up;
    if (connection === 'open') console.log(chalk.green.bold('\n[787 BOT ONLINE]'));
    if (connection === 'close') process.exit(0);
});

// Caricamento Handler e Plugins
const handler = await import('./handler.js');
conn.handler = handler.handler.bind(conn);
conn.ev.on('messages.upsert', conn.handler);

const pluginFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), 'plugins');
global.plugins = {};
fs.readdirSync(pluginFolder).forEach(async (file) => {
    if (file.endsWith('.js')) {
        try {
            const module = await import(`./plugins/${file}`);
            global.plugins[file] = module.default || module;
        } catch (e) {}
    }
});

console.log(chalk.red('787 Core Pronto.'));
