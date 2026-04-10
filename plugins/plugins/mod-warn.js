
import fetch from 'node-fetch'

const getThumb = async () =>
  Buffer.from(await (await fetch('https://qu.ax/fmHdc.png')).arrayBuffer())

let handler = async (m, { conn, text, command, isOwner, isAdmin }) => {
  // ================= UTENTE =================
  let who
  if (m.isGroup)
    who = m.mentionedJid?.[0] ?? m.quoted?.sender ?? null
  else who = m.chat

  if (!who) return m.reply('『 ⚠️ 』 Taggami o rispondi a un messaggio per ammonire qualcuno.')

  // ================= PERMESSI =================
  const senderDB = global.db.data.users[m.sender] || {}

  // Permetti l'uso solo a Owner, Admin o utenti Premium
  if (!isOwner && !isAdmin && !senderDB.premium) {
    return m.reply('⛔ *Questo comando è riservato ai MOD / PREMIUM*')
  }

  // Inizializza l'utente nel database se non esiste
  if (!global.db.data.users[who]) {
    global.db.data.users[who] = { warn: 0 }
  }

  let user = global.db.data.users[who]

  // Mock message per la miniatura elegante
  const prova = {
    key: { participants: '0@s.whatsapp.net', fromMe: false, id: 'Halo' },
    message: {
      locationMessage: {
        name: '𝐀𝐭𝐭𝐞𝐧𝐳𝐢𝐨𝐧𝐞',
        jpegThumbnail: await getThumb(),
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    participant: '0@s.whatsapp.net'
  }

  // ================= WARN VIP =================
  if (command === 'warnvip') {
    user.warn = (user.warn || 0) + 1

    // Messaggio di avvertimento
    await conn.reply(
      m.chat,
      `╭──────────────────────╮\n│  ⚠️  *𝐖𝐀𝐑𝐍 𝐕𝐈𝐏 𝐀𝐂𝐓𝐈𝐕𝐀𝐓𝐄𝐃* │\n╰──────────────────────╯\n\n` +
      `👤 *Utente:* @${who.split('@')[0]}\n` +
      `📝 *Ammonizioni:* ${user.warn}/3\n` +
      `🛡️ *Azione:* Ammonito da un Prescelto\n\n` +
      `_Se raggiungi 3 warn verrai eliminato._`,
      prova,
      { mentions: [who] }
    )

    // Kick automatico al 3° warn
    if (user.warn >= 3) {
      await conn.reply(
        m.chat,
        `🚫 @${who.split('@')[0]} ha raggiunto *3 WARN*\n❌ *ESECUZIONE IN CORSO...*`,
        prova,
        { mentions: [who] }
      )

      await conn.groupParticipantsUpdate(m.chat, [who], 'remove')

      // Reset warn dopo il kick per evitare loop se rientra
      user.warn = 0
    }
  }

  // ================= UNWARN VIP =================
  if (command === 'unwarnvip') {
    user.warn = 0
    await conn.reply(
      m.chat,
      `✅ @${who.split('@')[0]} è stato graziato.\n` +
      `📝 *Warn resettati:* ${user.warn}`,
      prova,
      { mentions: [who] }
    )
  }
}

handler.help = ['warnvip', 'unwarnvip']
handler.tags = ['admin']
handler.command = ['warnvip', 'unwarnvip']
handler.group = true
handler.botAdmin = true

export default handler


