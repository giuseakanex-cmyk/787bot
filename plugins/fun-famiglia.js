
// ==========================================
// LEGAM OS - VISUALIZZATORE ALBERO GENEALOGICO
// ==========================================

const legamHeader = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 🌳 𝐀𝐋𝐁𝐄𝐑𝐎 𝐆𝐄𝐍𝐄𝐀𝐋𝐎𝐆𝐈𝐂𝐎 🌳 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
const legamFooter = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

let handler = async (m, { conn, text }) => {
    if (!m.isGroup) return;

    let db = global.db.data.users;
    const getNum = (jid) => (jid || '').split('@')[0].split(':')[0];

    // Se tagga qualcuno, vede la famiglia del taggato, altrimenti la propria
    let targetUser = m.sender;
    if (m.mentionedJid && m.mentionedJid[0]) {
        targetUser = m.mentionedJid[0];
    } else if (m.quoted && m.quoted.sender) {
        targetUser = m.quoted.sender;
    }

    if (!db[targetUser]) {
        return m.reply("『 ❌ 』 Utente non registrato nel database.");
    }

    // Assicuriamoci che i dati esistano
    let partner = db[targetUser].partner || null;
    let genitori = db[targetUser].genitori || [];
    let figli = db[targetUser].figli || [];

    let mentionsArr = [targetUser];

    // Costruzione stringa Partner
    let partnerStr = "Nessuno 💔";
    if (partner) {
        partnerStr = `@${getNum(partner)} 💍`;
        mentionsArr.push(partner);
    }

    // Costruzione stringa Genitori
    let genitoriStr = "Nessuno. È orfano. 🍂";
    if (genitori.length > 0) {
        genitoriStr = genitori.map(g => {
            mentionsArr.push(g);
            return `@${getNum(g)}`;
        }).join(' & ');
    }

    // Costruzione stringa Figli
    let figliStr = "Nessun erede. 🏜️";
    if (figli.length > 0) {
        figliStr = "\n" + figli.map(f => {
            mentionsArr.push(f);
            return `· 👶🏻 @${getNum(f)}`;
        }).join('\n');
    }

    let msg = `${legamHeader}\n\n`;
    msg += `👤 𝐃𝐢𝐧𝐚𝐬𝐭𝐢𝐚 𝐝𝐢: @${getNum(targetUser)}\n\n`;
    
    msg += `『 💍 』 𝐏𝐚𝐫𝐭𝐧𝐞𝐫:\n➤ ${partnerStr}\n\n`;
    msg += `『 👴🏼 』 𝐆𝐞𝐧𝐢𝐭𝐨𝐫𝐢:\n➤ ${genitoriStr}\n\n`;
    msg += `『 🍼 』 𝐅𝐢𝐠𝐥𝐢: ${figliStr}\n\n`;
    
    msg += `${legamFooter}`;

    await conn.sendMessage(m.chat, { 
        text: msg, 
        mentions: [...new Set(mentionsArr)], // Rimuove eventuali doppioni
        contextInfo: {
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: { 
                newsletterJid: '120363428220415117@newsletter', 
                serverMessageId: 100, 
                newsletterName: "✨ 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐅𝐚𝐦𝐢𝐥𝐲 ✨" 
            }
        }
    }, { quoted: m });
};

handler.help = ['famiglia [@tag]'];
handler.tags = ['giochi'];
handler.command = /^(famiglia|albero|dinastia)$/i;
handler.group = true;

export default handler;


