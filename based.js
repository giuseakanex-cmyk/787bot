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

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '');
global.timestamp = { start: new Date };
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[' + (opts['prefix'] || '*/!#$%+£¢€¥^°=¶∆×÷π√✓©®&.\\-.@').replace(/[|\\{}()[\]^$+*.\-\^]/g, '\\$&') + ']');
global.db = new Low(new JSONFile('database.json'));
global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (!global.db.READ) {
                    clearInterval(interval);
                    resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
                }
            }, 1 * 1000);
            setTimeout(() => {
                clearInterval(interval);
                global.db.READ = null;
                reject(new Error('loadDatabase timeout'));
            }, 15000);
        }).catch((e) => {
            console.error('[ERRORE] loadDatabase:', e.message);
            return global.loadDatabase();
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

global.creds = 'creds.json';
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
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${authFile}/creds.json`)) {
    do {
        const cyan1 = chalk.hex('#00BFFF');
        const cyan2 = chalk.hex('#00CED1');
        const cyan3 = chalk.hex('#20B2AA');
        const green = chalk.hex('#2ECC71');
        const softText = chalk.hex('#ECF0F1');

        const a = cyan1('╭━━━━━━━━━━━━━• 𝟕𝟖𝟕 𝐂𝐎𝐑𝐄 •━━━━━━━━━━━━━');
        const b = cyan1('╰━━━━━━━━━━━━━• 𝟕𝟖𝟕 𝐄𝐍𝐃 •━━━━━━━━━━━━━━━');
        const linea = cyan2('   ─────────◈────────◈─────────◈─────────');
        const sm = cyan3.bold('   ⚡ SISTEMA DI AUTENTICAZIONE ⚡');

        const qr = cyan3(' ⌬') + ' ' + chalk.bold.white('MODALITÀ [1]: Sincronizzazione QR');
        const codice = cyan3(' ⌬') + ' ' + chalk.bold.white('MODALITÀ [2]: Link tramite Codice');

        const istruzioni = [
            cyan3(' ❯') + softText.italic(' Inizializzazione protocollo di accesso...'),
            cyan3(' ❯') + softText.italic(' Scegli un\'opzione per stabilire il link.'),
            softText.italic(''),
            cyan1.italic('                787bot by giuse'),
        ];
        const prompt = green.bold('\n⌬ 787-auth ➤ ');

        opzione = await question(`\n
${a}

          ${sm}
${linea}

${qr}
${codice}

${linea}
${istruzioni.join('\n')}

${b}
${prompt}`);
    } while ((opzione !== '1' && opzione !== '2') || fs.existsSync(`./${authFile}/creds.json`));
}

const groupMetadataCache = new NodeCache({ stdTTL: 300, useClones: false });
global.groupCache = groupMetadataCache;
const logger = pino({ level: 'silent' });
global.jidCache = new NodeCache({ stdTTL: 600, useClones: false });
global.store = makeInMemoryStore({ logger });

const { version } = await fetchLatestBaileysVersion();

const connectionOptions = {
    version,
    logger: logger,
    // FIX 1: Usiamo Chrome per Linux, Safari macOS viene spesso bloccato per il pairing push
    browser: ["Ubuntu", "Chrome", "110.0.5481.178"], 
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: opzione === '1' || methodCodeQR,
    msgRetryCounterCache,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
};

global.conn = makeWASocket(connectionOptions);
global.store.bind(global.conn.ev);

if (!fs.existsSync(`./${authFile}/creds.json`)) {
    if (opzione === '2' || methodCode) {
        opzione = '2';
        if (!conn.authState.creds.registered) {
            let addNumber;
            if (phoneNumber) {
                addNumber = phoneNumber.replace(/[^0-9]/g, '');
            } else {
                phoneNumber = await question(chalk.bgBlack(chalk.bold.hex('#00CED1')(`Inserisci il numero di WhatsApp.\n${chalk.bold.hex('#2ECC71')("Esempio: 393471234567")}\n${chalk.bold.hex('#00BFFF')('━━► ')}`)));
                addNumber = phoneNumber.replace(/\D/g, '');
            }
            // FIX 2: Ritardo di 10 secondi. Se chiedi il codice appena il socket si apre, WhatsApp lo ignora.
            console.log(chalk.yellow('\n[!] Stabilizzazione link... la notifica arriverà tra 10 secondi.'));
            setTimeout(async () => {
                try {
                    let codeBot = await conn.requestPairingCode(addNumber, '787BOT01');
                    codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
                    console.log(chalk.bold.white(chalk.bgRed(' 📞 CODICE DI ABBINAMENTO: ')), chalk.bold.red(codeBot));
                } catch (e) {
                    console.error(chalk.red('\n[!] Errore: Prova a riavviare con Hotspot o cambia IP.'));
                }
            }, 10000);
        }
    }
}

// ... (Resto del codice: connectionUpdate, reloadHandler, ecc. rimangono invariati come nel tuo originale)
async function connectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update;
    if (qr && (opzione === '1' || methodCodeQR)) console.log(chalk.bold.yellow(`\n 🪐 SCANSIONA IL QR 🪐`));
    if (connection === 'open') {
        console.clear();
        console.log(chalk.red.bold('\n━━━ 787 BOT ONLINE ━━━\n'));
    }
    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        if (reason !== DisconnectReason.loggedOut) {
            await global.reloadHandler(true).catch(console.error);
        } else {
            rmSync(global.authFile, { recursive: true, force: true });
            process.exit(1);
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
    conn.ev.on('messages.upsert', conn.handler);
    conn.ev.on('connection.update', connectionUpdate.bind(global.conn));
    conn.ev.on('creds.update', saveCreds);
    return true;
};

const pluginFolder = join(__dirname, './plugins');
global.plugins = {};
async function filesInit() {
    for (const filename of readdirSync(pluginFolder)) {
        if (filename.endsWith('.js')) {
            try {
                const module = await import(join(pluginFolder, filename));
                global.plugins[filename] = module.default || module;
            } catch (e) { console.error(e); }
        }
    }
}
filesInit().then(() => console.log(chalk.red('787 Plugins carichi.')));
await global.reloadHandler();
