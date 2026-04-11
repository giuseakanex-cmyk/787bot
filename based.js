process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, rmSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import pino from 'pino';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import NodeCache from 'node-cache';

const { useMultiFileAuthState, makeCacheableSignalKeyStore, jidNormalizedUser, makeInMemoryStore, fetchLatestBaileysVersion } = await import('@realvare/baileys');
const { chain } = lodash;

protoType();
serialize();

// --- CONFIGURAZIONE CORE ---
global.authFile = 'session';
const logger = pino({ level: 'silent' });
const msgRetryCounterCache = new NodeCache();

// --- UTILS PER PATH ---
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true));
};
const __dirname = global.__dirname(import.meta.url);

// --- DATABASE ---
global.db = new Low(new JSONFile('database.json'));
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) return;
    await global.db.read().catch(() => {});
    global.db.data = { users: {}, chats: {}, settings: {}, ...(global.db.data || {}) };
    global.db.chain = chain(global.db.data);
};
await global.loadDatabase();

// --- AUTH SYSTEM ---
const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const question = (t) => {
    process.stdout.write(t);
    return new Promise((resolve) => process.stdin.once('data', (data) => resolve(data.toString().trim())));
};

let opzione;
if (!fs.existsSync(`./${global.authFile}/creds.json`)) {
    console.clear();
    console.log(chalk.red.bold('\n━━━ 787 SYSTEM: SETUP ━━━'));
    console.log(chalk.white(' [1] ➡ QR CODE\n [2] ➡ PAIRING CODE'));
    opzione = await question(chalk.red.bold('\nSeleziona ➤ '));
}

// --- CONNESSIONE ---
const { version } = await fetchLatestBaileysVersion();

const connectionOptions = {
    version,
    logger,
    browser: ["Ubuntu", "Chrome", "110.0.5481.178"], 
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: opzione === '1',
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
};

global.conn = makeWASocket(connectionOptions);
global.store = makeInMemoryStore({ logger });
global.store.bind(global.conn.ev);

// --- LOGICA PAIRING CODE (FIXED) ---
if (opzione === '2' && !conn.authState.creds.registered) {
    let num = await question(chalk.bgRed.white('\n Inserisci il numero (es. 39347...) ') + ' ➤ ');
    num = num.replace(/\D/g, '');

    console.log(chalk.yellow('\n[!] Stabilizzazione connessione... attendi 6 secondi.'));
    
    setTimeout(async () => {
        try {
            // Forza il socket a essere pronto
            if (conn.ws.readyState !== 1) await conn.connect();
            
            let code = await conn.requestPairingCode(num, '787BOT01');
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(chalk.white.bgRed('\n 🔑 CODICE PAIRING: ') + ' ' + chalk.bold.red(code) + ' \n');
        } catch (e) {
            console.log(chalk.red('\n[!] Errore critico. Riprova tra 30 secondi pulendo la sessione.'));
        }
    }, 6000); 
}

// --- GESTORE EVENTI ---
conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
        console.clear();
        console.log(chalk.red.bold(`
 ███████╗ █████╗ ███████╗
 ╚════██║██╔══██╗╚════██║
     ██╔╝╚██████║    ██╔╝ 
    ██╔╝  ╚═══██║   ██╔╝  
    ██║   █████╔╝   ██║   
    ╚═╝   ╚════╝    ╚═╝   
 [ 787 SYSTEM ONLINE ]`));
    }
    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        if (reason === 401) {
            rmSync(global.authFile, { recursive: true, force: true });
            process.exit(1);
        }
        process.exit(0);
    }
});

conn.ev.on('creds.update', saveCreds);

// --- CARICAMENTO HANDLER & PLUGINS ---
let handler = await import('./handler.js');
conn.handler = handler.handler.bind(global.conn);
conn.ev.on('messages.upsert', conn.handler);

const pluginFolder = join(__dirname, './plugins');
global.plugins = {};
async function loadPlugins() {
    const files = readdirSync(pluginFolder);
    for (const file of files) {
        if (file.endsWith('.js')) {
            try {
                const module = await import(`./plugins/${file}?update=${Date.now()}`);
                global.plugins[file] = module.default || module;
            } catch (e) {
                console.error(chalk.red(`Errore caricamento plugin ${file}:`), e.message);
            }
        }
    }
}
loadPlugins().then(() => console.log(chalk.gray('➡ Plugin 787 pronti.')));

// --- PULIZIA TEMP ---
setInterval(() => {
    if (existsSync('./temp')) {
        readdirSync('./temp').forEach(f => {
            try { unlinkSync(join('./temp', f)); } catch(e) {}
        });
    }
}, 1000 * 60 * 60);
