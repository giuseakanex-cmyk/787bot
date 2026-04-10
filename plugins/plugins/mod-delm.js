
const handler = async (m, { conn, usedPrefix, command, isOwner, isAdmin }) => {

  const user = global.db.data.users[m.sender] || {}

  // 🔐 CONTROLLO PERMESSI (MOD / PREMIUM / OWNER)
  if (!isOwner && !isAdmin && !user.premium) {
    return m.reply('⛔ *Questo comando è riservato ai MOD / PREMIUM*')
  }

  // Verifica se è stato citato un messaggio
  if (!m.quoted) return m.reply(`『 💡 』 Rispondi a un messaggio con *${usedPrefix + command}* per eliminarlo.`)

  try {
    let key = {}

    // Recupero della chiave del messaggio citato (gestione vari casi del framework)
    try {
      key.remoteJid = m.quoted?.fakeObj?.key?.remoteJid || m.quoted?.chat || m.chat
      key.fromMe = m.quoted?.fromMe ?? m.quoted?.fakeObj?.key?.fromMe
      key.id = m.quoted?.id ?? m.quoted?.fakeObj?.key?.id
      key.participant = m.quoted?.sender || m.quoted?.fakeObj?.participant
    } catch (e) {
      console.error('Errore recupero key:', e)
    }

    // 1. Elimina il messaggio citato
    await conn.sendMessage(m.chat, { delete: key })

    // 2. Elimina il comando inviato dall'utente per pulizia
    await conn.sendMessage(m.chat, { delete: m.key })

  } catch (e) {
    console.error('Errore durante eliminazione:', e)

    // Fallback di emergenza
    if (m.quoted) {
      await conn.sendMessage(m.chat, { 
        delete: {
          remoteJid: m.chat,
          fromMe: m.quoted.fromMe,
          id: m.quoted.id,
          participant: m.quoted.sender
        }
      }).catch(() => {})
    }
    await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})
  }
}

handler.help = ['delv']
handler.tags = ['group']
handler.command = /^delv$/i
handler.group = true
handler.botAdmin = true

export default handler


