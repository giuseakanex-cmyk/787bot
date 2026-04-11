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
import { format } from 'util';
import pino from 'pino';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import NodeCache from 'node-cache';

const { useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, jidNormalizedUser, makeInMemoryStore } = await import('@realvare/baileys');
const { chain } = lodash;
const PORT = process.env.PORT || 3000;

protoType();
serialize();

global.isLogoPrinted = false;
global.qrGenerated = false;
let methodCodeQR = process.argv.includes("qr");
let methodCode = process.argv.includes("code");
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
loadDatabase();

// --- AUTH SYSTEM 787 ---
const { state, saveCreds } = await useMultiFileAuthState('session');
const question = (t) => {
    process.stdout.write(t);
    return new Promise((resolve) => {
        process.stdin.once('data', (data) => resolve(data.toString().trim()));
    });
};

if (!methodCodeQR && !methodCode && !fs.existsSync(`./session/creds.json`)) {
    console.clear();
    let opzione;
    do {
        const head = chalk.white.bold('━━━ 787 SYSTEM AUTH ━━━');
        const line = chalk.gray('───────────────────────');
        const menu = `
${head}
${line}
 1 ➡ Sincronizzazione via QR
 2 ➡ Link via Pairing Code
${line}
 ↪ Seleziona protocollo di accesso.
 
 ${chalk.white.bold('787-terminal')} ➡ `;

        opzione = await question(menu);

        if (opzione === '1') methodCodeQR = true;
        else if (opzione === '2') methodCode = true;
        else console.log(chalk.red('\n➡ ERRORE: Inserire 1 o 2.'));
        
    } while (opzione !== '1' && opzione !== '2');
}

// --- CONFIGURAZIONE CONNESSIONE ---
const logger = pino({ level: 'silent' });
global.store = makeInMemoryStore({ logger });

const connectionOptions = {
    logger,
    browser: Browsers.macOS('Safari'),
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: methodCodeQR,
    markOnlineOnConnect: true,
    generateHighQualityThumbnail: true
};

global.conn = makeWASocket(connectionOptions);
global.store.bind(global.conn.ev);

// --- PAIRING CODE LOGIC ---
if (methodCode && !conn.authState.creds.registered) {
    let num = phoneNumber ? phoneNumber.replace(/[^0-9]/g, '') : '';
    if (!num) {
        num = await question(`\n➡ INSERIRE NUMERO (Esempio: 39347...)\n${chalk.white.bold('787-terminal')} ➡ `);
        num = num.replace(/\D/g, '');
    }
    setTimeout(async () => {
        let code = await conn.requestPairingCode(num, '787BOT01');
        code = code?.match(/.{1,4}/g)?.join("-") || code;
        console.log(chalk.black.bgWhite('\n 787 PAIRING CODE ') + ' ' + chalk.white.bold(code) + '\n');
    }, 3000);
}

// --- GESTORE CONNESSIONE ---
async function connectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr && methodCodeQR && !global.qrGenerated) {
        console.log(chalk.white.bold('\n➡ PROTOCOLLO QR ATTIVO\n↪ Scansiona per stabilire il link.'));
        global.qrGenerated = true;
    }

    if (connection === 'open') {
        console.clear();
        const logo = [
            `  ______   ______   ______ `,
            ` /      \\ /      \\ /      \\`,
            ` ------  |------  |------  |`,
            `/      / /      / /      / `,
            `-------  -------  -------  `,
            `  [ 787 SYSTEM ONLINE ]    `
        ];
        logo.forEach(l => console.log(chalk.white.bold(l)));
        console.log(chalk.gray(`\n➡ Sessione: Stabilita\n➡ Stato: Pronto\n`));
    }

    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        console.log(chalk.gray(`\n↩ CONNESSIONE INTERROTTA: Protocollo ${reason}`));
        process.exit();
    }
}

// --- PULIZIA AUTOMATICA ---
setInterval(async () => {
    if (!existsSync('./temp')) return;
    const files = readdirSync('./temp');
    if (files.length > 0) {
        files.forEach(f => unlinkSync(join('./temp', f)));
        console.log(chalk.gray(`➡ [SISTEMA] Cache multimediale svuotata.`));
    }
}, 1000 * 60 * 60);

// --- INIZIALIZZAZIONE ---
conn.ev.on('connection.update', connectionUpdate);
conn.ev.on('creds.update', saveCreds);

// --- CARICAMENTO HANDLER ---
let handler = await import('./handler.js');
conn.handler = handler.handler.bind(global.conn);
conn.ev.on('messages.upsert', conn.handler);

console.log(chalk.gray(`➡ Inizializzazione 787 Core in corso...`));
