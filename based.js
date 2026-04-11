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

const { 
    useMultiFileAuthState, 
    makeCacheableSignalKeyStore, 
    Browsers, 
    jidNormalizedUser, 
    makeInMemoryStore,
    fetchLatestBaileysVersion // Per evitare errori di versione obsoleta
} = await import('@realvare/baileys');

const { chain } = lodash;

protoType();
serialize();

// --- CONFIGURAZIONE CORE ---
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
await global.loadDatabase();

// --- SISTEMA DI AUTENTICAZIONE ---
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
    console.log(chalk.cyan.bold('\n━━━ 787 SYSTEM: SETUP ━━━'));
    console.log(chalk.white(' [1] ➡ QR CODE\n [2] ➡ PAIRING CODE'));
    opzione = await question(chalk.green.bold('\nSeleziona ➤ '));
}

// --- INIZIALIZZAZIONE SOCKET ---
const logger = pino({ level: 'silent' });
const msgRetryCounterCache = new NodeCache();
const { version } = await fetchLatestBaileysVersion(); // Prende l'ultima versione WA

const connectionOptions = {
    version,
    logger,
    // Firma Chrome/Ubuntu: la più stabile per il pairing code
    browser: ["Ubuntu", "Chrome", "110.0.5481.178"], 
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: opzione === '1',
    markOnlineOnConnect: true,
    generateHighQualityThumbnail: true,
    msgRetryCounterCache,
    defaultQueryTimeoutMs: undefined,
};

global.conn = makeWASocket(connectionOptions);
global.store = makeInMemoryStore({ logger });
global.store.bind(global.conn.ev);

// --- LOGICA PAIRING CODE ---
if (opzione === '2' && !conn.authState.creds.registered) {
    let num = phoneNumber ? phoneNumber.replace(/[^0-9]/g, '') : '';
    if (!num) {
        console.log(chalk.yellow('\n[!] Esempio corretto: 393471234567'));
        num = await question(chalk.bgCyan.black(' Inserisci il numero ') + ' ➤ ');
        num = num.replace(/\D/g, '');
    }
    
    setTimeout(async () => {
        try {
            let code = await conn.requestPairingCode(num);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(chalk.black.bgGreen('\n 🔑 CODICE DI ACCESSO: ') + ' ' + chalk.white.bold(code) + '\n');
        } catch (error) {
            console.log(chalk.red('\n[!] Errore generazione codice. Riprova tra poco.'));
        }
    }, 3000);
}

// --- GESTORE CONNESSIONE ---
async function connectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr && opzione === '1') {
        console.log(chalk.yellow('\n[!] QR Code pronto per la scansione.'));
    }

    if (connection === 'open') {
        console.clear();
        console.log(chalk.cyan.bold(`
  ______   ______   ______ 
 /      \\ /      \\ /      \\
 ------  |------  |------  |
/      / /      / /      / 
-------  -------  -------  
  [ 787 SYSTEM ONLINE ]`));
        console.log(chalk.green('\n➡ Link stabilito. Il bot è operativo.\n'));
    }

    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        console.log(chalk.red(`\n↩ CONNESSIONE CHIUSA: Codice ${reason}`));
        
        // Se la sessione è invalidata (401, 403, 405) puliamo tutto
        if ([401, 403, 405].includes(reason)) {
            console.log(chalk.yellow('➡ Sessione scaduta/corrotta. Eseguo pulizia...'));
            if (existsSync(`./${global.authFile}`)) {
                rmSync(`./${global.authFile}`, { recursive: true, force: true });
            }
            console.log(chalk.green('➡ Cartella session eliminata. Riavvia con: node based.js'));
            process.exit(1);
        } else {
            console.log(chalk.gray('➡ Tentativo di riavvio automatico...'));
            process.exit(0);
        }
    }
}

conn.ev.on('connection.update', connectionUpdate);
conn.ev.on('creds.update', saveCreds);

// --- HANDLER MESSAGGI ---
let handler = await import('./handler.js');
conn.handler = handler.handler.bind(global.conn);
conn.ev.on('messages.upsert', conn.handler);

// --- AUTO-PULIZIA CACHE ---
setInterval(() => {
    const tmpDir = './temp';
    if (existsSync(tmpDir)) {
        const files = readdirSync(tmpDir);
        files.forEach(f => {
            try { unlinkSync(join(tmpDir, f)); } catch (e) {}
        });
    }
}, 1000 * 60 * 30); // Ogni 30 min

console.log(chalk.gray(`➡ 787 Core caricato. In attesa di segnale...`));
