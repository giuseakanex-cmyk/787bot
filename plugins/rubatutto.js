// COMANDO ADMIN: PROSCIUGAMENTO CONTO VIP
function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num);
}

let handler = async (m, { conn, text, usedPrefix, command }) => {

    // 1. Identifica la vittima (Taggata o citata)
    let who;
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    else who = m.chat;

    if (!who) return m.reply(`『 🎯 』 \`Tagga o rispondi al messaggio dell'utente che vuoi derubare.\`\n\nEsempio: *${usedPrefix + command} @utente*`);
    if (who === m.sender) return m.reply(`『 😅 』 \`Non puoi derubare te stesso!\``);
    if (who === conn.user.jid) return m.reply(`『 🤖 』 \`Il banco non si tocca!\``);

    // 2. Controllo Database
    global.db.data.users = global.db.data.users || {};
    let users = global.db.data.users;

    if (!users[who]) return m.reply(`『 👻 』 \`Questo utente è un fantasma, non esiste nel database.\``);

    let bottino = users[who].euro || 0;

    // 3. Controllo se è già povero
    if (bottino <= 0) {
        return m.reply(`『 💸 』 \`Impossibile derubare @${who.split('@')[0]}.\nQuesto poveraccio ha letteralmente 0$ nel conto.\``, null, { mentions: [who] });
    }

    // ==========================================
    // 😈 ESECUZIONE DEL FURTO DI STATO
    // ==========================================
    
    // Azzera il conto della vittima
    users[who].euro = 0;
    
    // Trasferisce il bottino al creatore (Tu)
    users[m.sender].euro = (users[m.sender].euro || 0) + bottino;

    // ==========================================
    // 🎭 MESSAGGIO GRAFICO
    // ==========================================
    let txtFurto = `
*FURTO AVVENUTO CON SUCCESSO* ✔
Il conto di @${who.split('@')[0]} è stato *completamente prosciugato* per ordine dell'Owner.

💰 *Bottino sequestrato:* ${formatNumber(bottino)} $
📉 *Nuovo saldo vittima:* 0 $
I fondi sono stati trasferiti nel tuo caveau.
`.trim();

    let contextFurto = {
        mentionedJid: [who, m.sender],
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter', 
            serverMessageId: 100,
            newsletterName: `🏴‍☠️ Bank of Legam`
        }
    };

    // Manda il messaggio trionfale in chat
    await conn.sendMessage(m.chat, { text: txtFurto, contextInfo: contextFurto }, { quoted: m });
}

handler.help = ['rubatutto <@user>']
handler.tags = ['owner']
handler.command = /^(rubatutto|svuota|drain|pignora)$/i

// LA REGOLA D'ORO: SOLO L'OWNER PUÒ USARLO
handler.owner = true 
handler.group = true

export default handler

