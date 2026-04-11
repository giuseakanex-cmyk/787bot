process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import fs, { existsSync, rmSync, readdirSync, unlinkSync } from 'fs';
import chalk from 'chalk';
import pino from 'pino';
import lodash from 'lodash';
import NodeCache from 'node-cache';
import { makeWASocket, protoType, serialize } from './lib/simple.js';

const { 
    useMultiFileAuthState, 
    makeCacheableSignalKeyStore, 
    jidNormalizedUser, 
    makeInMemoryStore,
    fetchLatestBaileysVersion 
} = await import('@realvare/baileys');

protoType();
serialize();

// --- CONFIG ---
global.authFile = 'session';
const logger = pino({ level: 'silent' });
const msgRetryCounterCache = new NodeCache();

// --- PULIZIA INIZIALE ---
if (process.argv.includes('--reset')) {
    if (existsSync(global.authFile)) rmSync(global.authFile, { recursive: true, force: true });
    console.log(chalk.red('SISTEMA RESETTATO.'));
}

// --- CORE ---
const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const { version } = await fetchLatestBaileysVersion();

const connectionOptions = {
    version,
    logger,
    // Identità Chrome su Linux (la più accettata dai server WA)
    browser: ["Ubuntu", "Chrome", "110.0.5481.178"], 
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: false,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
};

global.conn = makeWASocket(connectionOptions);

// --- LOGICA PAIRING CODE (FORZATA) ---
if (!conn.authState.creds.registered) {
    console.clear();
    console.log(chalk.cyan.bold('━━━ 787 SYSTEM AUTH ━━━'));
    
    const question = (t) => {
        process.stdout.write(t);
        return new Promise((resolve) => process.stdin.once('data', (data) => resolve(data.toString().trim())));
    };

    let phoneNumber = await question(chalk.white('\nInserisci il numero (es. 39347...) ➤ '));
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    if (phoneNumber) {
        setTimeout(async () => {
            try {
                let code = await conn.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(chalk.black.bgGreen('\n 🔑 CODICE PAIRING: ') + ' ' + chalk.white.bold(code) + ' \n');
                console.log(chalk.gray('Inseriscilo ora sul tuo telefono...'));
            } catch (e) {
                console.log(chalk.red('\n[!] Errore: WhatsApp ha rifiutato la richiesta. Aspetta 24h.'));
            }
        }, 3000);
    }
}

// --- GESTORE CONNESSIONE ---
conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
        console.clear();
        console.log(chalk.green.bold('━━━ 787 SYSTEM ONLINE ━━━\n'));
        console.log(chalk.white('Bot connesso come: ') + chalk.green(conn.user.id.split(':')[0]));
    }

    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        console.log(chalk.red(`\n↩ CONNESSIONE CHIUSA: ${reason}`));
        
        if (reason === 401) {
            console.log(chalk.yellow('Sessione corrotta. Digita: rm -rf session e riprova.'));
            process.exit(1);
        }
        process.exit(0);
    }
});

conn.ev.on('creds.update', saveCreds);

// --- HANDLER ---
let handler = await import('./handler.js');
conn.handler = handler.handler.bind(global.conn);
conn.ev.on('messages.upsert', conn.handler);

console.log(chalk.gray('787 Core caricato.'));
