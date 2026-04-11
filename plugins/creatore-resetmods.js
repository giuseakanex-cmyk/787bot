let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('⌬ ❯ Operazione consentita solo all\'interno di un gruppo.');

    // Reazione di sistema
    await conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } });

    const users = global.db.data.users || {};
    let removedCount = 0;

    // Scansione database per revoca privilegi Premium/Staff
    for (let jid in users) {
        let user = users[jid];
        if (user && user.premium === true && user.premiumGroup === m.chat) {
            user.premium = false;
            user.premiumGroup = '';
            removedCount++;
        }
    }

    if (removedCount === 0) {
        return m.reply('⌬ ❯ Nessun account con privilegi elevati rilevato nel database di questo gruppo.');
    }

    // Messaggio di output 787 SYSTEM
    let caption = `
⌬ ━━━───  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄  𝐌  ───━━━ ⌬

⌬ ❯ 𝐒𝐓𝐀𝐅𝐅 𝐑𝐄𝐒𝐄𝐓 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄
${removedCount} account sono stati declassati con successo.

⌬ ❯ 𝐀𝐙𝐈𝐎𝐍𝐈 𝐄𝐒𝐄𝐆𝐔𝐈𝐓𝐄:
➡ Revoca globale dei permessi premium.
➡ Sincronizzazione database completata.
➡ Protocollo di sicurezza terminato.

⌬ ━━━───  𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘  𝐀𝐂𝐓𝐈𝐕𝐄  ───━━━ ⌬`.trim();

    await conn.sendMessage(m.chat, {
        text: caption,
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363233544482011@newsletter',
                newsletterName: "𝟕𝟖𝟕 𝐒𝐘𝐒𝐓𝐄𝐌: RESET LOG",
                serverMessageId: 100
            }
        }
    }, { quoted: m });
};

handler.help = ['resetmod'];
handler.tags = ['owner'];
handler.command = /^(resetmod|clearstaff)$/i;
handler.group = true;
handler.owner = true; 

export default handler;
