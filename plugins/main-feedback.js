let handler = async (m, { conn, text, usedPrefix, command }) => {
    
    let cmd = command.toLowerCase();

    // Inizializza l'utente nel database se non esiste
    global.db.data.users = global.db.data.users || {};
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};
    let user = global.db.data.users[m.sender];

    // ==========================================
    // 1. COMANDO INFOFEEDBACK
    // ==========================================
    if (cmd === 'infofeedback') {
        if (user.lastFeedback) {
            // Se ha inviato un feedback in passato
            let infoMsg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 📝 \`𝐈𝐋 𝐓𝐔𝐎 𝐅𝐄𝐄𝐃𝐁𝐀𝐂𝐊\` ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

👤 \`Utente:\` @${m.sender.split('@')[0]}

Ecco l'ultima segnalazione che hai inviato ai Creatori:
_"${user.lastFeedback}"_

_I creatori leggeranno presto il tuo messaggio._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();
            return await conn.sendMessage(m.chat, { text: infoMsg, mentions: [m.sender] }, { quoted: m });
        } else {
            // Se non ha mai inviato un feedback
            let helpMsg = `
『 ℹ️ 』 \`𝐈𝐍𝐅𝐎 𝐅𝐄𝐄𝐃𝐁𝐀𝐂𝐊\`
Non hai ancora inviato nessuna segnalazione.

Il comando *${usedPrefix}feedback* (o .report, .segnala) serve per inviare un messaggio diretto ai Creatori del bot. Puoi usarlo per:
➤ Segnalare un utente molesto.
➤ Segnalare un bug o un errore del bot.
➤ Richiedere nuove funzioni.

💡 *Come si usa:*\n_${usedPrefix}feedback Ciao boss, il comando menu è lento._`.trim();
            return m.reply(helpMsg);
        }
    }

    // ==========================================
    // 2. COMANDO FEEDBACK/REPORT PRINCIPALE
    // ==========================================
    // Se non scrive niente dopo il comando
    if (!text) {
        return m.reply(`『 📣 』 \`𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐃𝐈 𝐑𝐄𝐏𝐎𝐑𝐓\`\n\nUsa questo comando per inviare un feedback o segnalare un problema.\n\n💡 *Esempio:*\n➤ _${usedPrefix + command} Ciao creatore, il comando sticker è bloccato._\n➤ _${usedPrefix + command} L'utente X sta spammando link._\n\n➤ _Usa ${usedPrefix}infofeedback per leggere la tua ultima segnalazione._`);
    }

    // Salva l'ultimo feedback inviato dall'utente nel Database
    user.lastFeedback = text;

    // Reazione di caricamento
    await conn.sendMessage(m.chat, { react: { text: '📨', key: m.key } });

    // Estrae i numeri degli Owner
    let owners = global.owner.map(o => o[0] + '@s.whatsapp.net');
    
    // Dati del Primo Owner (TU) per la scheda contatto
    let primaryNumber = global.owner[0][0];
    let primaryName = global.owner[0][1] || '👑 GIUSE | Owner';
    
    let groupName = m.isGroup ? await conn.getName(m.chat) : 'Chat Privata';

    // 1. MESSAGGIO PUBBLICO NEL GRUPPO
    let msgPublic = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 📣 \`𝐅𝐄𝐄𝐃𝐁𝐀𝐂𝐊 / 𝐑𝐄𝐏𝐎𝐑𝐓\` ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

👤 \`Mittente:\` @${m.sender.split('@')[0]}
📍 \`Origine:\` ${groupName}

📝 \`Messaggio:\`
"${text}"

👑 \`Notifica Owner:\`
${owners.map(jid => `➤ @${jid.split('@')[0]}`).join('\n')}
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    // Invia il messaggio di testo
    let sentMsg = await conn.sendMessage(m.chat, {
        text: msgPublic,
        mentions: [m.sender, ...owners],
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363233544482011@newsletter',
                newsletterName: "🛡️ 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐒𝐮𝐩𝐩𝐨𝐫𝐭",
                serverMessageId: 100
            }
        }
    }, { quoted: m });

    // 2. CREAZIONE E INVIO DELLA SCHEDA CONTATTO (VCard)
    const vcard = 'BEGIN:VCARD\n' +
                  'VERSION:3.0\n' +
                  `FN:${primaryName}\n` +
                  'ORG:Legam OS System;\n' +
                  'TITLE:Creatore Supremo\n' +
                  `item1.TEL;waid=${primaryNumber}:+${primaryNumber}\n` +
                  'item1.X-ABLabel:📱 Cellulare\n' +
                  'END:VCARD';

    // Invia la scheda contatto citando il messaggio di report appena mandato
    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: primaryName,
            contacts: [{ vcard }]
        }
    }, { quoted: sentMsg });

    // Conferma finale (Nessun invio in DM, 100% Anti-Ban)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
};

handler.help = ['feedback', 'infofeedback', 'report', 'segnala'];
handler.tags = ['main'];
// Ora rileva anche .infofeedback
handler.command = /^(feedback|report|segnala|bug|infofeedback)$/i;

export default handler;


