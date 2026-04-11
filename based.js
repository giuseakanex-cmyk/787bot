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

const DisconnectReason = {
    connectionClosed: 428,
    connectionLost: 408,
    connectionReplaced: 440,
    timedOut: 408,
    loggedOut: 401,
    badSession: 500,
    restartRequired: 515,
    multideviceMismatch: 411,
    forbidden: 403,
    unavailableService: 503
};
const { useMultiFileAuthState, makeCacheableSignalKeyStore, Browsers, jidNormalizedUser, makeInMemoryStore, fetchLatestBaileysVersion } = await import('@realvare/baileys');
const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
protoType();
serialize();

global.isLogoPrinted = false;
global.qrGenerated = false;
global.connectionMessagesPrinted = {};
let methodCodeQR = process.argv.includes("qr");
let methodCode = process.argv.includes("code");
let phoneNumber = global.botNumberCode;

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};

global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true));
};

global.__require = function require(dir = import.meta.url) {
    return createRequire(dir);
};

global.timestamp = { start: new Date };
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.db = new Low(new JSONFile('database.json'));
global.DATABASE = global.db;

global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;
    global.db.data = { users: {}, chats: {}, settings: {}, ...(global.db.data || {}) };
    global.db.chain = chain(global.db.data);
};
loadDatabase();

global.authFile = 'session';
const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const msgRetryCounterCache = new NodeCache();

const question = (t) => {
    process.stdout.write(t);
    return new Promise((resolve) => {
        process.stdin.once('data', (data) => resolve(data.toString().trim()));
    });
};

let opzione;
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${global.authFile}/creds.json`)) {
    do {
        console.clear();
        const red1 = chalk.hex('#FF0000');
        const white = chalk.hex('#FFFFFF');
        console.log(red1('╭━━━━━━━━━━━━━• 𝟕𝟖𝟕 𝐂𝐎𝐑𝐄 •━━━━━━━━━━━━━'));
        console.log(white('   ⚡ SISTEMA DI AUTENTICAZIONE ⚡'));
        console.log(red1('   1 ➤ QR CODE'));
        console.log(red1('   2 ➤ CODICE DI ABBINAMENTO'));
        console.log(red1('╰━━━━━━━━━━━━━• 𝟕𝟖𝟕 𝐄𝐍𝐃 •━━━━━━━━━━━━━━━'));
        opzione = await question(red1('\n⌬ 787-auth ➤ '));
    } while (opzione !== '1' && opzione !== '2');
}

const logger = pino({ level: 'silent' });
global.store = makeInMemoryStore({ logger });

const connectionOptions = {
    logger,
    browser: ["Ubuntu", "Chrome", "110.0.5481.178"], // Fix per pairing code
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: opzione === '1' || methodCodeQR,
    msgRetryCounterCache,
    connectTimeoutMs: 60000,
};

global.conn = makeWASocket(connectionOptions);
global.store.bind(global.conn.ev);

// --- LOGICA PAIRING (RIBASATA) ---
if (!fs.existsSync(`./${global.authFile}/creds.json`)) {
    if (opzione === '2' || methodCode) {
        if (!conn.authState.creds.registered) {
            let addNumber = phoneNumber ? phoneNumber.replace(/[^0-9]/g, '') : '';
            if (!addNumber) {
                let input = await question(chalk.bgRed.white(' Inserisci il numero (es. 39...) ') + ' ➤ ');
                addNumber = input.replace(/\D/g, '');
            }
            // Attesa stabilità socket per evitare errore 428
            setTimeout(async () => {
                try {
                    let codeBot = await conn.requestPairingCode(addNumber, '787BOT01');
                    codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
                    console.log(chalk.bold.white(chalk.bgRed('\n 📞 CODICE DI ABBINAMENTO: ')), chalk.bold.red(codeBot));
                } catch (e) {
                    console.log(chalk.red('\n[!] Errore connessione. Riprova tra poco.'));
                }
            }, 6000);
        }
    }
}

async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update;
    if (isNewLogin) conn.isInit = true;
    
    if (qr && (opzione === '1' || methodCodeQR)) {
        console.log(chalk.bold.red(`\n 🪐 SCANSIONA IL QR 787 🪐`));
    }

    if (connection === 'open') {
        console.clear();
        const red = chalk.hex('#FF0000');
        console.log(red.bold(`
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
        if (reason === DisconnectReason.loggedOut) {
            rmSync(global.authFile, { recursive: true, force: true });
            process.exit(1);
        } else {
            await global.reloadHandler(true).catch(console.error);
        }
    }
}

let handler = await import('./handler.js');
global.reloadHandler = async function (restatConn) {
    try {
        const Handler = await import(`./handler.js?update=${Date.now()}`);
        if (Object.keys(Handler || {}).length) handler = Handler;
    } catch (e) { console.error(e); }
    if (restatConn) {
        try { global.conn.ws.close(); } catch { }
        conn.ev.removeAllListeners();
        global.conn = makeWASocket(connectionOptions);
        global.store.bind(global.conn.ev);
    }
    conn.handler = handler.handler.bind(global.conn);
    conn.connectionUpdate = connectionUpdate.bind(global.conn);
    conn.credsUpdate = saveCreds;
    conn.ev.on('messages.upsert', conn.handler);
    conn.ev.on('connection.update', conn.connectionUpdate);
    conn.ev.on('creds.update', conn.credsUpdate);
    return true;
};

const pluginFolder = join(__dirname, './plugins');
global.plugins = {};
async function filesInit() {
    for (const filename of readdirSync(pluginFolder)) {
        if (filename.endsWith('.js')) {
            try {
                const file = global.__filename(join(pluginFolder, filename));
                const module = await import(file);
                global.plugins[filename] = module.default || module;
            } catch (e) { delete global.plugins[filename]; }
        }
    }
}
filesInit().then(() => console.log(chalk.red('787 Plugins carichi.')));

await global.reloadHandler();

setInterval(async () => {
    if (existsSync('./temp')) {
        readdirSync('./temp').forEach(file => {
            try { unlinkSync(join('./temp', file)); } catch {}
        });
    }
}, 3600000);

watch(fileURLToPath(import.meta.url), () => {
  console.log(chalk.bgRed(" 787 Core Aggiornato "));
});
