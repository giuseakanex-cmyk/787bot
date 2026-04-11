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

const { useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, jidNormalizedUser, makeInMemoryStore } = await import('@realvare/baileys');
const { chain } = lodash;

protoType();
serialize();

// --- CONFIGURAZIONE NOMI ---
global.authFile = 'session'; 
let phoneNumber = global.botNumberCode;

// --- UTILS ---
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
    await global.db.read().catch(console.error);
    global.db.data = { users: {}, chats: {}, settings: {}, ...(global.db.data || {}) };
};
await loadDatabase();

// --- AUTH SYSTEM ---
const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const question = (t) => {
    process.stdout.write(t);
    return new Promise((resolve) => {
        process.stdin.once('data', (data) => resolve(data.toString().trim()));
    });
};

let opzione;
if (!fs.existsSync(`./${global.authFile}/creds.json`)) {
    console.clear();
    console.log(chalk.cyan.bold('\n━━━ 787 SYSTEM: SETUP INIZIALE ━━━'));
    console.log(chalk.white(' 1 ➡ QR CODE\n 2 ➡ PAIRING CODE'));
    opzione = await question(chalk.green.bold('\nSeleziona 1 o 2 ➤ '));
}

// --- CONNESSIONE ---
const logger = pino({ level: 'silent' });
const msgRetryCounterCache = new NodeCache();

const connectionOptions = {
    logger,
    // FIX: Usiamo Ubuntu/Chrome per evitare il blocco "Impossibile collegare"
    browser: ['Ubuntu', 'Chrome', '110.0.5481.178'], 
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: opzione === '1',
    markOnlineOnConnect: true,
    msgRetryCounterCache
};

global.conn = makeWASocket(connectionOptions);
global.store = makeInMemoryStore({ logger });
global.store.bind(global.conn.ev);

// --- PAIRING CODE LOGIC ---
if (opzione === '2' && !conn.authState.creds.registered) {
    let num = phoneNumber ? phoneNumber.replace(/[^0-9]/g, '') : '';
    if (!num) {
        num = await question(chalk.bgCyan.black('\n Inserisci il numero (es. 39347...) ') + ' ➤ ');
        num = num.replace(/\D/g, '');
    }
    setTimeout(async () => {
        let code = await conn.requestPairingCode(num, '787BOT01');
        code = code?.match(/.{1,4}/g)?.join("-") || code;
        console.log(chalk.black.bgGreen('\n 🔑 CODICE PAIRING: ') + ' ' + chalk.white.bold(code) + '\n');
    }, 3000);
}

// --- GESTORE EVENTI ---
async function connectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr && opzione === '1') {
        console.log(chalk.yellow('\n[!] Scansiona il QR Code qui sopra.'));
    }

    if (connection === 'open') {
        console.clear();
        console.log(chalk.cyan.bold('\n━━━ 787 SYSTEM ONLINE ━━━'));
        console.log(chalk.green('➡ Connessione stabilita con successo.\n'));
    }

    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        console.log(chalk.red(`\n↩ CONNESSIONE CHIUSA: Protocollo ${reason}`));
        
        // Protocollo Auto-Reset per Errore 401 (Unauthorized)
        if (reason === 401 || reason === 405) {
            console.log(chalk.yellow('➡ Sessione corrotta. Reset cartella session in corso...'));
            rmSync(`./${global.authFile}`, { recursive: true, force: true });
            process.exit(1);
        } else {
            // Per altri errori, prova a riavviare il processo
            process.exit(0);
        }
    }
}

conn.ev.on('connection.update', connectionUpdate);
conn.ev.on('creds.update', saveCreds);

// --- CARICAMENTO HANDLER ---
let handler = await import('./handler.js');
conn.handler = handler.handler.bind(global.conn);
conn.ev.on('messages.upsert', conn.handler);

// --- PULIZIA TEMP ---
setInterval(() => {
    if (existsSync('./temp')) {
        const files = readdirSync('./temp');
        files.forEach(f => unlinkSync(join('./temp', f)));
    }
}, 1000 * 60 * 60);

console.log(chalk.gray(`➡ 787 Core inizializzato.`));
