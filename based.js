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

global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (!global.db.READ) {
                    clearInterval(interval);
                    resolve(global.db.data);
                }
            }, 1000);
        });
    }
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;
    global.db.data = {
        users: {},
        chats: {},
        settings: {},
        ...(global.db.data || {}),
    };
    global.db.chain = chain(global.db.data);
};
loadDatabase();

global.authFile = 'session';
const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const msgRetryCounterCache = new NodeCache();

const question = (t) => {
    process.stdout.write(t);
    return new Promise((resolve) => {
        process.stdin.once('data', (data) => {
            resolve(data.toString().trim());
        });
    });
};

let opzione;
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${global.authFile}/creds.json`)) {
    do {
        const red1 = chalk.hex('#FF0000');     // Red
        const red2 = chalk.hex('#C0392B');     // Strong Red
        const white = chalk.hex('#FFFFFF');    
        const grey = chalk.hex('#BDC3C7');

        const a = red1('╭━━━━━━━━━━━━━• 𝟕𝟖𝟕 𝐂𝐎𝐑𝐄 •━━━━━━━━━━━━━');
        const b = red1('╰━━━━━━━━━━━━━• 𝟕𝟖𝟕 𝐄𝐍𝐃 •━━━━━━━━━━━━━━━');
        const linea = red2('   ─────────◈────────◈─────────◈─────────');
        const sm = white.bold('   ⚡ SISTEMA DI AUTENTICAZIONE ⚡');

        const qr = red1(' ⌬') + ' ' + chalk.bold.white('MODALITÀ [1]: Sincronizzazione QR');
        const codice = red1(' ⌬') + ' ' + chalk.bold.white('MODALITÀ [2]: Link tramite Codice');

        const istruzioni = [
            red1(' ❯') + grey.italic(' Inizializzazione protocollo 787...'),
            red1(' ❯') + grey.italic(' Scegli un metodo per collegare il bot.'),
        ];
        const prompt = red1.bold('\n⌬ 787-auth ➤ ');

        opzione = await question(`\n${a}\n          ${sm}\n${linea}\n\n${qr}\n${codice}\n\n${linea}\n${istruzioni.join('\n')}\n\n${b}${prompt}`);
    } while (opzione !== '1' && opzione !== '2');
}

const logger = pino({ level: 'silent' });
global.store = makeInMemoryStore({ logger });

const makeDecodeJid = (jidCache) => {
    return (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) return jidNormalizedUser(jid);
        return jid;
    };
};

const { version } = await fetchLatestBaileysVersion();

const connectionOptions = {
    version,
    logger,
    // FIX: Usiamo Ubuntu/Chrome per evitare il blocco del pairing code
    browser: ['Ubuntu', 'Chrome', '110.0.5481.178'],
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    decodeJid: makeDecodeJid(new NodeCache()),
    printQRInTerminal: opzione === '1' || methodCodeQR,
    msgRetryCounterCache,
    retryRequestDelayMs: 500,
    maxMsgRetryCount: 5,
};

global.conn = makeWASocket(connectionOptions);
global.store.bind(global.conn.ev);

if (!fs.existsSync(`./${global.authFile}/creds.json`)) {
    if (opzione === '2' || methodCode) {
        opzione = '2';
        if (!conn.authState.creds.registered) {
            let addNumber;
            if (phoneNumber) {
                addNumber = phoneNumber.replace(/[^0-9]/g, '');
            } else {
                phoneNumber = await question(chalk.bgRed(chalk.white.bold(` Inserisci il numero WhatsApp (es. 39347...) \n ━━► `)));
                addNumber = phoneNumber.replace(/\D/g, '');
            }
            setTimeout(async () => {
                let codeBot = await conn.requestPairingCode(addNumber, '787BOT01');
                codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
                console.log(chalk.bold.white(chalk.bgRed(' 🔑 CODICE PAIRING: ')), chalk.bold.red(codeBot));
            }, 3000);
        }
    }
}

async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update;
    if (isNewLogin) conn.isInit = true;
    
    const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
    
    if (code && code !== DisconnectReason.loggedOut) {
        await global.reloadHandler(true).catch(console.error);
    }

    if (qr && (opzione === '1' || methodCodeQR)) {
        console.log(chalk.bold.red(`\n 🪐 SCANSIONA IL QR 787 - SCADE PRESTO 🪐`));
    }

    if (connection === 'open') {
        global.connectionMessagesPrinted = {};
        if (!global.isLogoPrinted) {
            console.log(chalk.red.bold(`
 ███████╗ █████╗ ███████╗    ██████╗  ██████╗ ████████╗
 ╚════██║██╔══██╗╚════██║    ██╔══██╗██╔═══██╗╚══██╔══╝
     ██╔╝╚██████║    ██╔╝     ██████╔╝██║   ██║   ██║   
    ██╔╝  ╚═══██║   ██╔╝      ██╔══██╗██║   ██║   ██║   
    ██║   █████╔╝   ██║       ██████╔╝╚██████╔╝   ██║   
    ╚═╝   ╚════╝    ╚═╝       ╚═════╝  ╚═════╝    ╚═╝   
            [ 787 CORE ONLINE - BY GIUSE ]
            `));
            global.isLogoPrinted = true;
        }
    }

    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        if (reason === DisconnectReason.loggedOut) {
            console.log(chalk.bold.red(`\n⚠️ DISCONNESSO. ELIMINA LA SESSIONE E RIAVVIA ⚠️`));
            if (fs.existsSync(global.authFile)) fs.rmSync(global.authFile, { recursive: true, force: true });
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

const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};
async function filesInit() {
    for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
        try {
            const file = global.__filename(join(pluginFolder, filename));
            const module = await import(file);
            global.plugins[filename] = module.default || module;
        } catch (e) { console.error(e); }
    }
}
filesInit().then(() => console.log(chalk.red('✦ 787 PLUGINS CARICATI ✦'))).catch(console.error);

const pluginWatcher = watch(pluginFolder, async (_ev, filename) => {
    if (pluginFilter(filename)) {
        const dir = global.__filename(join(pluginFolder, filename), true);
        try {
            const module = await import(`${global.__filename(dir)}?update=${Date.now()}`);
            global.plugins[filename] = module.default || module;
            console.log(chalk.red(`✅ PLUGIN AGGIORNATO: ${filename}`));
        } catch (e) { console.error(`⚠️ ERRORE PLUGIN: ${filename}`); }
    }
});

await global.reloadHandler();

// Pulizia cartella temp ogni ora
setInterval(() => {
    const tmp = './temp';
    if (existsSync(tmp)) {
        readdirSync(tmp).forEach(file => {
            try { unlinkSync(join(tmp, file)); } catch {}
        });
    }
}, 3600000);

const mainWatcher = watch(fileURLToPath(import.meta.url), () => {
  console.log(chalk.bgRed(chalk.white.bold(" 787 Core: 'based.js' AGGIORNATO ")));
});
