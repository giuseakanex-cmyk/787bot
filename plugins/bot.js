/*⌬ ━━━─── 𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  - CORE MODULE ───━━━ ⌬*/

import path from 'path'
import { promises as fs } from 'fs'

/*⌬ ━━━─── HANDLER SYSTEM ───━━━ ⌬*/

var handler = m => m
handler.all = async function (m) {
  
/*⌬ ━━━─── GLOBAL DATA ───━━━ ⌬*/

  global.nome = conn.getName(m.sender)
  global.readMore = String.fromCharCode(8206).repeat(4001)
  global.authsticker = global.nome
  global.packsticker = global.nomepack

/*⌬ ━━━─── MEDIA SELECTOR ───━━━ ⌬*/

  let numStk = Math.floor(Math.random() * 6) + 1

  global.foto = [
    path.join(process.cwd(), 'media', 'sticker', `${numStk}.webp`),
    path.join(process.cwd(), 'media', 'menu', 'menu.jpg')
  ].getRandom()

/*⌬ ━━━─── SYSTEM ESTILO (ORDER MESSAGE) ───━━━ ⌬*/

 let zwag = await fs.readFile(global.foto)
  global.estilo = {
    key: {
      fromMe: true,
      participant: `0@s.whatsapp.net`,
    },
    message: {
      orderMessage: {
        itemCount: 787, // Identificativo Sistema
        status: 0,
        surface: 1,
        message: global.nomepack,
        orderTitle: '787 SYSTEM: SECURE CONNECTION',
        thumbnail: zwag,
        sellerJid: '0@s.whatsapp.net'
      }
    }
  }

/*⌬ ━━━─── AUTH CONTACT FAKE ───━━━ ⌬*/

global.fkontak = {
  key: {
    participant: "0@s.whatsapp.net",
    remoteJid: "status@broadcast",
    fromMe: false,
    id: "787-SYS-AUTH"
  },
  message: {
    contactMessage: {
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:787;System;;;\nFN:𝟕𝟖𝟕 𝐒𝐘𝐒𝐓𝐄𝐌\nitem1.TEL;waid=0:0\nitem1.X-ABLabel:HOST\nEND:VCARD`
    }
  },
  participant: "0@s.whatsapp.net"
}

/*⌬ ━━━─── NETWORK CHANNELS ───━━━ ⌬*/

  let canale = await getRandomChannel()
  global.canaleRD = canale

  global.fake = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: canale.id,
        newsletterName: canale.name,
        serverMessageId: 1
      }
    },
    quoted: m
  }

  global.rcanal = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: canale.id,
        serverMessageId: 1,
        newsletterName: canale.name
      },
      externalAdReply: {
        title: '𝟕𝟖𝟕 𝐒𝐘𝐒𝐓𝐄𝐌 : 𝐎𝐏𝐄𝐑𝐀𝐓𝐈𝐎𝐍𝐀𝐋',
        body: 'Security & Performance Core',
        thumbnail: zwag,
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }
  }
}

/*⌬ ━━━─── LOG DATABASE: CHANNELS ───━━━ ⌬*/

global.IdCanale = ['120363418582531215@newsletter'] 
global.NomeCanale = [
  '⌬ ━━━─── 𝟕𝟖𝟕 𝐒𝐘𝐒𝐓𝐄𝐌 ───━━━ ⌬',
  '⌬ ❯ 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘 𝐂𝐎𝐍𝐓𝐑𝐎𝐋',
  '⌬ ❯ 𝐍𝐄𝐓𝐖𝐎𝐑𝐊 𝐌𝐎𝐍𝐈𝐓𝐎𝐑',
  '⌬ ❯ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐎𝐕𝐄𝐑𝐑𝐈𝐃𝐄',
  '⌬ ❯ 𝐀𝐔𝐓𝐎𝐌𝐀𝐓𝐄𝐃 𝐂𝐎𝐑𝐄',
  '⌬ ❯ 𝟕𝟖𝟕 𝐇𝐎𝐒𝐓 𝐍𝐎𝐃𝐄',
  '⌬ ❯ 𝐃𝐀𝐓𝐀 𝐄𝐍𝐂𝐑𝐘𝐏𝐓𝐈𝐎𝐍',
  '⌬ ❯ 𝐏𝐑𝐎𝐓𝐎𝐂𝐎𝐋 𝟕𝟖𝟕',
  '⌬ ❯ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐔𝐏𝐓𝐈𝐌𝐄: 𝐎𝐍',
  '⌬ ❯ 𝟕𝟖𝟕 𝐒𝐄𝐂𝐔𝐑𝐄 𝐋𝐈𝐍𝐊',
]

/*⌬ ━━━─── UTILITY CORE ───━━━ ⌬*/

Array.prototype.getRandom = function () {
  return this[Math.floor(Math.random() * this.length)]
}

async function getRandomChannel() {
  if (!Array.isArray(global.IdCanale) || !Array.isArray(global.NomeCanale) || global.IdCanale.length === 0 || global.NomeCanale.length === 0) {
    return {
      id: '120363418582531215@newsletter',
      name: '⌬ ━━━─── 𝟕𝟖𝟕 𝐒𝐘𝐒𝐓𝐄𝐌 ───━━━ ⌬'
    }
  }
  let id = global.IdCanale.getRandom()
  let name = global.NomeCanale.getRandom()
  return { id, name }
}

export default handler
