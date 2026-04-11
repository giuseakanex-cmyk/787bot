import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import chalk from 'chalk'
import fs from 'fs'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

// ━━━ 787 SYSTEM: PROTOCOLS ━━━
global.prefisso = '.!' 

// ━━━ 787 SYSTEM: ACCESS CONTROL (UNTOUCHED) ━━━
global.sam = ['393200511388']
global.owner = [
  ['393291944932', 'giuse5', true],
  ['393508496779', 'linda', true],
  ['393780450454', 'giuse2', true],
  ['393291944932', 'giusee', true],
  ['393200511388', 'giusep', true],
]
global.mods = ['393291944932', '393780450454']
global.prems = ['393291944932', '393780450454']

// ━━━ 787 SYSTEM: CORE INFO ━━━
global.nomepack = 'giuse 787'
global.nomebot = '787 BOT'
global.wm = '787 SYSTEM'
global.autore = 'giuse'
global.dev = 'giuse'
global.testobot = '787 CORE'
global.versione = pkg.version
global.errore = '➡ [!] ERRORE DI SISTEMA. Usa .segnala per inoltrare il log.'

// ━━━ 787 SYSTEM: NETWORK LINKS ━━━
global.repobot = 'https://github.com/giuseakanex-cmyk/legambot'
global.gruppo = 'https://chat.whatsapp.com/bysamakavare'
global.canale = 'https://whatsapp.com/channel/0029VbB41Sa1Hsq1JhsC1Z1z'
global.insta = 'https://www.instagram.com/tessere____'

// ━━━ 787 SYSTEM: API KEYS ━━━
global.APIKeys = {
    spotifyclientid: 'varebot',
    spotifysecret: 'varebot',
    browserless: 'varebot',
    tmdb: 'varebot',
    ocrspace: 'jjjsheu',
    assemblyai: 'varebot',
    google: 'varebot',
    googleCX: 'varebot',
    genius: 'varebot',
    removebg: 'varebot',
    openrouter: 'varebot',
    sightengine_user: 'varebot',
    sightengine_secret: 'varebot',
    lastfm: '36f859a1fc4121e7f0e931806507d5f9',
}

// ━━━ 787 SYSTEM: ECONOMY ━━━
global.multiplier = 1

// ━━━ 787 SYSTEM: INTERFACE GRAPHICS ━━━
global.logoLegam = 'https://i.ibb.co/gMDMVjJn/IMG-1824.png'

global.rcanal = {
    contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363259442839354@newsletter",
            newsletterName: "787 SYSTEM CORE",
            serverMessageId: 100
        },
        externalAdReply: {
            showAdAttribution: true,
            title: "7 8 7   S Y S T E M",
            body: "↪ Terminal ID: Giuse",
            mediaType: 1,
            renderLargerThumbnail: false,
            thumbnailUrl: global.logoLegam,
            sourceUrl: global.insta 
        }
    }
}

global.fake = global.rcanal;

// ━━━ 787 SYSTEM: RELOAD HANDLER ━━━
let filePath = fileURLToPath(import.meta.url)
let fileUrl = pathToFileURL(filePath).href

const reloadConfig = async () => {
  console.log(chalk.white.bold("➡ [SISTEMA] 'config.js' aggiornato correttamente."))
  try {
    await import(`${fileUrl}?update=${Date.now()}`)
  } catch (e) {
    console.error('➡ [ERRORE] Fallimento nel reload critico:', e)
  }
}

watchFile(filePath, reloadConfig)

export default {}
