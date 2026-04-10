
// ==========================================
// LEGAM OS - DAILY REPORT VIP (ESTETICA PURA)
// ==========================================

const legamHeader = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
const legamFooter = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n. . ✦  .  ⁺  .  ✦  . .`;

function formattaData() {
    const mesi = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
    let oggi = new Date();
    return `${oggi.getDate()} ${mesi[oggi.getMonth()]} ${oggi.getFullYear()}`;
}

let handler = async (m, { conn }) => {
    let chatId = m.chat;
    let dati = global.db.data.chats[chatId]?.statsGiornaliere;

    // Se non c'è nulla registrato
    if (!dati || dati.totali === 0) {
        let emptyMsg = `${legamHeader}\n· 📊 𝐃𝐀𝐈𝐋𝐘 𝐑𝐄𝐏𝐎𝐑𝐓 📊 ·\n${legamHeader}\n\n『 📅 』 𝐃𝐚𝐭𝐚: ${formattaData()}\n\n· _Nessuna statistica registrata oggi._\n\n${legamFooter}`;
        return m.reply(emptyMsg);
    }

    let classifica = Object.entries(dati.utenti)
        .sort(([, a], [, b]) => b.conteggio - a.conteggio)
        .slice(0, 5);

    let numUtenti = Object.keys(dati.utenti).length;
    let numMedia = dati.media || 0;

    let report = `${legamHeader}\n· 📊 𝐃𝐀𝐈𝐋𝐘 𝐑𝐄𝐏𝐎𝐑𝐓 📊 ·\n${legamHeader}\n\n`;
    report += `『 📅 』 𝐃𝐚𝐭𝐚: ${formattaData()}\n\n`;

    report += `『 📈 』 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐂𝐇𝐄\n`;
    report += `· 💬 Messaggi: ${dati.totali}\n`;
    report += `· 👥 Utenti Attivi: ${numUtenti}\n`;
    report += `· 📸 Media & Sticker: ${numMedia}\n\n`;

    report += `『 🏆 』 𝐓𝐎𝐏 𝐔𝐒𝐄𝐑𝐒\n\n`;

    const medaglie = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    let mentions = [];

    classifica.forEach(([jid, u], i) => {
        mentions.push(jid);
        report += `${medaglie[i]} @${jid.split('@')[0]}\n`;
        report += `· 💬 ${u.conteggio} messaggi\n\n`;
    });

    report += `${legamFooter}`;

    await conn.sendMessage(chatId, { text: report, mentions: mentions }, { quoted: m });
};

// ==========================================
// ⚙️ MOTORE BACKGROUND: REGISTRAZIONE MESSAGGI E MEDIA
// ==========================================
handler.before = async function (m) {
    if (!m.chat || m.isBaileys || !m.isGroup) return; 

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    if (!global.db.data.chats[m.chat].statsGiornaliere) {
        global.db.data.chats[m.chat].statsGiornaliere = { totali: 0, media: 0, utenti: {}, data: new Date().toLocaleDateString('it-IT') };
    }

    let stats = global.db.data.chats[m.chat].statsGiornaliere;
    let oggi = new Date().toLocaleDateString('it-IT');

    // Se cambia giorno, resetta la cache per prepararsi a mezzanotte
    if (stats.data !== oggi) {
        stats.data = oggi;
        stats.totali = 0;
        stats.media = 0;
        stats.utenti = {};
    }

    stats.totali += 1;

    // Controllo se il messaggio è un media (Foto, Video, Sticker, Audio, Documento)
    let isMedia = m.mtype === 'imageMessage' || m.mtype === 'videoMessage' || m.mtype === 'stickerMessage' || m.mtype === 'audioMessage' || m.mtype === 'documentMessage';
    if (isMedia) {
        stats.media = (stats.media || 0) + 1;
    }

    let nome = m.pushName || 'Utente';
    if (!stats.utenti[m.sender]) {
        stats.utenti[m.sender] = { nome: nome, conteggio: 0 };
    }
    stats.utenti[m.sender].conteggio += 1;
};

// ==========================================
// 🕛 AUTOMAZIONE MEZZANOTTE CON PREMI VIP
// ==========================================
let isResetting = false; 
setInterval(async () => {
    let ora = new Date().getHours();
    let minuti = new Date().getMinutes();

    // Scatta a Mezzanotte in punto
    if (ora === 0 && minuti === 0 && !isResetting) {
        isResetting = true; 
        let chats = global.db.data.chats;

        for (let gid in chats) {
            let dati = chats[gid]?.statsGiornaliere;
            if (!dati || dati.totali === 0) continue;

            let classifica = Object.entries(dati.utenti)
                .sort(([, a], [, b]) => b.conteggio - a.conteggio)
                .slice(0, 3); // Prende solo il Podio per i premi

            if (classifica.length === 0) continue;

            let numUtenti = Object.keys(dati.utenti).length;
            let numMedia = dati.media || 0;

            let reportFinal = `${legamHeader}\n· 🌙 𝐌𝐈𝐃𝐍𝐈𝐆𝐇𝐓 𝐑𝐄𝐏𝐎𝐑𝐓 🌙 ·\n${legamHeader}\n\n`;
            reportFinal += `『 📅 』 𝐃𝐚𝐭𝐚: ${formattaData()}\n\n`;

            reportFinal += `『 📈 』 𝐑𝐄𝐒𝐎𝐂𝐎𝐍𝐓𝐎 𝐅𝐈𝐍𝐀𝐋𝐄\n`;
            reportFinal += `· 💬 Messaggi: ${dati.totali}\n`;
            reportFinal += `· 👥 Utenti Attivi: ${numUtenti}\n`;
            reportFinal += `· 📸 Media & Sticker: ${numMedia}\n\n`;

            reportFinal += `『 🏆 』 𝐏𝐎𝐃𝐈𝐎 𝐄 𝐏𝐑𝐄𝐌𝐈\n\n`;

            const medaglie = ['🥇', '🥈', '🥉'];
            const premi = [2000, 1000, 500]; // Premi in Euro aumentati per Legam OS
            let mentions = [];

            classifica.forEach(([jid, u], i) => {
                let premio = premi[i];
                mentions.push(jid);

                // Assegna i soldi nel database principale (euro)
                if (!global.db.data.users[jid]) global.db.data.users[jid] = { euro: 0 };
                global.db.data.users[jid].euro = (global.db.data.users[jid].euro || 0) + premio;

                reportFinal += `${medaglie[i]} @${jid.split('@')[0]}\n`;
                reportFinal += `· 💬 ${u.conteggio} messaggi\n`;
                reportFinal += `· 💰 Vinto: +${premio}€\n\n`;
            });

            reportFinal += `_Statistiche azzerate. Nuova gara iniziata!_\n\n`;
            reportFinal += `${legamFooter}`;

            try {
                if (global.conn) {
                    await global.conn.sendMessage(gid, { 
                        text: reportFinal, 
                        mentions: mentions 
                    });
                }
            } catch (e) {
                console.error(`Errore invio a ${gid}:`, e);
            }

            // Azzera le statistiche per il nuovo giorno
            chats[gid].statsGiornaliere = { 
                totali: 0, 
                media: 0,
                utenti: {}, 
                data: new Date().toLocaleDateString('it-IT') 
            };
        }
    } else if (minuti !== 0) {
        isResetting = false; 
    }
}, 30000); // Controlla ogni 30 secondi

handler.help = ['resoconto'];
handler.tags = ['strumenti'];
// Si attiva con .resoconto o .daily
handler.command = /^(resoconto|daily)$/i;
handler.group = true;

export default handler;



