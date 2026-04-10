// Inizializza la memoria per le trappole
global.ruffiniState = global.ruffiniState || {};

let handler = async (m, { conn, usedPrefix, command }) => {
    
    // 1. Controlla se hai taggato qualcuno
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);
    
    if (!who) {
        return m.reply(`『 ⚠️ 』 \`Devi taggare la vittima!\`\nEsempio: *${usedPrefix}${command} @utente*`);
    }

    if (who === conn.user.jid) {
        return m.reply(`『 😅 』 \`Non posso dirlo a me stesso!\``);
    }

    // 2. Prepara il primo messaggio (senza emoji e a forma di domanda)
    let nomeVittima = who.split('@')[0];
    let msg1 = `@${nomeVittima} a te ti puzzano i piedi?`;

    // Invia il messaggio e salva l'ID del messaggio
    let sentMsg = await conn.sendMessage(m.chat, {
        text: msg1,
        mentions: [who]
    }, { quoted: m });

    // 3. IMPOSTA LA TRAPPOLA IN MEMORIA
    global.ruffiniState[m.chat] = {
        target: who,           // Chi deve rispondere
        msgId: sentMsg.key.id, // L'ID del messaggio a cui deve rispondere
        active: true
    };

    // 4. Timer di sicurezza: disarma la trappola dopo 5 minuti se non risponde
    setTimeout(() => {
        if (global.ruffiniState[m.chat] && global.ruffiniState[m.chat].msgId === sentMsg.key.id) {
            delete global.ruffiniState[m.chat];
        }
    }, 300000); // 300.000 ms = 5 minuti
};

// =========================================================
// IL CECCHINO IN BACKGROUND (Intercetta la risposta)
// =========================================================
handler.before = async function (m, { conn }) {
    // Se non c'è nessuna trappola attiva in questa chat, ignora
    if (!m.chat || !global.ruffiniState[m.chat]) return true;

    let state = global.ruffiniState[m.chat];

    // Se chi scrive è la vittima E sta rispondendo al messaggio esatto del bot...
    if (state.active && m.sender === state.target && m.quoted && m.quoted.id === state.msgId) {
        
        // ...SCATTA LA BATTUTA! (Senza emoji)
        let punchline = `He bella hosa he hai detto!`;

        // Piccolo ritardo per farlo sembrare umano (1 secondo)
        await new Promise(resolve => setTimeout(resolve, 1000));

        await conn.sendMessage(m.chat, {
            text: punchline,
            mentions: [m.sender]
        }, { quoted: m });

        // Disarma la trappola dopo aver colpito
        delete global.ruffiniState[m.chat];
    }

    return true; // Fa continuare a funzionare gli altri comandi del bot
};

handler.help = ['paoloruffini @tag'];
handler.tags = ['fun'];
handler.command = /^(paoloruffini|ruffini)$/i;

export default handler;


