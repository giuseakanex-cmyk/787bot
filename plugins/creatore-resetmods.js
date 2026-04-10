let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('『 ⚠️ 』 \`Questo comando funziona solo nei gruppi.\`');

    // Reazione di caricamento
    await conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } });

    const users = global.db.data.users || {};
    let removedCount = 0;

    // Scansiona tutti gli utenti per trovare i Moderatori di questo gruppo
    for (let jid in users) {
        let user = users[jid];
        // Se è un Moderatore (Premium) in questo specifico gruppo...
        if (user && user.premium === true && user.premiumGroup === m.chat) {
            // ...Gli rimuove i poteri
            user.premium = false;
            user.premiumGroup = '';
            removedCount++;
        }
    }

    // Se non c'erano moderatori
    if (removedCount === 0) {
        return m.reply('『 🛑 』 \`Nessun membro dello Staff / Prescelto rilevato in questo gruppo da rimuovere.\`');
    }

    // Messaggio di successo in stile Legam OS
    let caption = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 𝐋 𝐄 𝐆 𝐀 𝐌  𝐒 𝐓 𝐀 𝐅 𝐅 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🗑️ 』 𝐑 𝐄 𝐒 𝐄 𝐓  𝐂 𝐎 𝐌 𝐏 𝐋 𝐄 𝐓 𝐀 𝐓 𝐎
➤ Rimossi con successo *${removedCount}* moderatori.
➤ Tutti i poteri di Staff sono stati revocati.

👑 𝐎𝐖𝐍𝐄𝐑 ➤ 𝐆𝐈𝐔𝐒𝚵
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    // Invia con l'estetica Premium del Legam OS
    await conn.sendMessage(m.chat, {
        text: caption,
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363233544482011@newsletter',
                newsletterName: "🛡️ 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐑𝐞𝐬𝐞𝐭",
                serverMessageId: 100
            }
        }
    }, { quoted: m });
};

handler.help = ['resetmod'];
handler.tags = ['owner'];
// Puoi usare .resetmod o .clearstaff
handler.command = /^(resetmod|clearstaff)$/i;
handler.group = true;
// 🔥 SOLO L'OWNER PUÒ USARE QUESTO COMANDO 🔥
handler.owner = true; 

export default handler;


