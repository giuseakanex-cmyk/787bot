
let handler = async (m, { conn, usedPrefix, isOwner, isAdmin }) => {
    // Controllo permessi (Owner, Admin o Premium)
    const user = global.db.data.users[m.sender] || {}
    if (!isOwner && !isAdmin && !user.premium) {
        return m.reply('⛔ *Accesso negato. Solo i membri Staff/VIP possono vedere questo menu.*')
    }

    // Estrae il numero per il tag
    let modNumber = m.sender.split('@')[0];

    // Testo del menu con i comandi aggiornati
    let txt = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 💎 𝐏𝐀𝐍𝐍𝐄𝐋𝐋𝐎 𝐏𝐑𝐄𝐒𝐂𝐄𝐋𝐓𝐈 💎 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 👤 』 𝐀𝐮𝐭𝐨𝐫𝐢𝐭𝐚': @${modNumber}
『 ⚙️ 』 𝐀𝐜𝐜𝐞𝐬𝐬𝐨: _𝐋𝐞𝐠𝐚𝐦 𝐕𝐈𝐏_

╭── 🛠️ 𝐀𝐑𝐒𝐄𝐍𝐀𝐋𝐄 𝐕𝐈𝐏 ──⬣
│ 📢 ➭ *${usedPrefix}totag*
│ _Richiama l'attenzione_
│
│ 📡 ➭ *${usedPrefix}pingv*
│ _Latenza server VIP_
│
│ 🗑️ ➭ *${usedPrefix}delv*
│ _Elimina messaggio_
│
│ ☢️ ➭ *${usedPrefix}nukegp*
│ _Simulazione distruzione_
│
│ ⚠️ ➭ *${usedPrefix}warnvip*
│ _Ammonizione VIP_
│
│ ✅ ➭ *${usedPrefix}unwarnvip*
│ _Grazia utente_
│
│ 💎 ➭ *${usedPrefix}viplist*
│ _Lista dei Prescelti_
╰───────────────⬣

👑 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐄𝐥𝐢𝐭𝐞 𝐯𝟎.𝟐
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    await conn.sendMessage(m.chat, {
        text: txt,
        mentions: [m.sender],
        contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363259442839354@newsletter',
                serverMessageId: 100,
                newsletterName: `💎 𝐄𝐥𝐢𝐭𝐞 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒`
            }
        }
    }, { quoted: m });
}

handler.help = ['menuvip']
handler.tags = ['menu']
handler.command = /^(menuvip)$/i // Rimosso alias alternativo

handler.premium = true 
handler.group = true

export default handler


