
let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!m.isGroup) return m.reply('『 ⚠️ 』 `Questo comando funziona solo nei gruppi.`');

    // Reazione di caricamento
    await conn.sendMessage(m.chat, { react: { text: '💎', key: m.key } });

    const users = global.db.data.users || {};

    // Cerca gli utenti che sono segnati come "Premium" nel database per questo specifico gruppo
    const vips = Object.entries(users)
        .filter(([jid, user]) => user && user.premium === true && user.premiumGroup === m.chat)
        .map(([jid]) => jid);

    if (vips.length === 0) {
        return m.reply('『 🛑 』 `Nessun Membro VIP / Prescelto rilevato in questo gruppo.`');
    }

    // Se l'admin inserisce un messaggio, lo formatta in modo elegante
    let customMsg = text ? `\n『 📣 』 𝐂 𝐎 𝐌 𝐔 𝐍 𝐈 𝐂 𝐀 𝐙 𝐈 𝐎 𝐍 𝐄\n➤ ${text}\n` : '';

    let caption = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
·  𝐋 𝐄 𝐆 𝐀 𝐌  𝐕 𝐈 𝐏  ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
${customMsg}
『 💎 』 𝐈  𝐏 𝐑 𝐄 𝐒 𝐂 𝐄 𝐋 𝐓 𝐈
· 𝐕𝐈𝐏 𝐀𝐭𝐭𝐢𝐯𝐢 ➻ ${vips.length}

`.trim() + '\n\n';

    // Aggiunge la lista dei VIP in colonna
    vips.forEach((jid, i) => {
        caption += `➤ ${i + 1}. @${jid.split('@')[0]}\n`;
    });

    caption += `\n👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

    // Invia con l'estetica Premium del Legam OS
    await conn.sendMessage(m.chat, {
        text: caption.trim(),
        mentions: vips,
        contextInfo: {
            mentionedJid: vips,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363233544482011@newsletter',
                newsletterName: "💎 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐕𝐈𝐏 𝐒𝐭𝐚𝐟𝐟",
                serverMessageId: 100
            }
        }
    }, { quoted: m });
};

handler.help = ['viplist (messaggio)', 'staffvip'];
handler.tags = ['gruppo'];
// Comandi aggiornati a .viplist e .staffvip
handler.command = /^(viplist|staffvip)$/i;
handler.group = true;
handler.admin = true;

export default handler;


