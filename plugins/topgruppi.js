/**
 * 👑 LEGAM OS - CLASSIFICA GRUPPI ATTIVI 👑
 * Calcola i messaggi totali sfruttando l'Activity Tracker
 */

const f = (n) => new Intl.NumberFormat('it-IT').format(n);

let handler = async (m, { conn }) => {
    
    // Contesto per il finto canale (Scudo VIP Legam)
    const legamContext = {
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter', 
            serverMessageId: 100,
            newsletterName: `📊 LEGAM OS: Statistiche Globali`
        }
    };

    try {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        // Recuperiamo il database delle attività di gruppo
        let groupActivity = global.db.data.groupActivity || {};
        let leaderboard = [];

        // Scansione di tutti i gruppi nel database
        for (let jid in groupActivity) {
            // Controlliamo che sia un gruppo valido
            if (!jid.endsWith('@g.us')) continue; 

            let usersInGroup = groupActivity[jid] || {};
            let totalMessages = 0;

            // Sommiamo i messaggi di tutti gli utenti di quel gruppo
            for (let userJid in usersInGroup) {
                totalMessages += (usersInGroup[userJid].msgCount || 0);
            }

            // Se il gruppo ha almeno 1 messaggio, lo inseriamo in classifica
            if (totalMessages > 0) {
                // Cerchiamo il nome del gruppo (dalla cache veloce o chiedendolo a WhatsApp)
                let groupName = 'Gruppo Sconosciuto';
                let cachedGroup = global.groupCache ? global.groupCache.get(jid) : null;
                
                if (cachedGroup && cachedGroup.subject) {
                    groupName = cachedGroup.subject;
                } else {
                    try { groupName = await conn.getName(jid); } catch (e) {}
                }

                leaderboard.push({
                    jid: jid,
                    name: groupName,
                    total: totalMessages
                });
            }
        }

        // Se non ci sono dati, avvisiamo
        if (leaderboard.length === 0) {
            return m.reply("『 📉 』 \`Nessun dato registrato. I gruppi non hanno ancora inviato messaggi da quando il tracker è attivo.\`");
        }

        // Ordiniamo la classifica dal più grande al più piccolo (Ordine Decrescente)
        leaderboard.sort((a, b) => b.total - a.total);

        // Prendiamo solo i primi 10 gruppi
        let topCount = Math.min(10, leaderboard.length);
        
        let msg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🏆 𝐓 𝐎 𝐏  𝐆 𝐑 𝐔 𝐏 𝐏 𝐈 🏆 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

I gruppi più attivi del circuito
Legam OS in base ai messaggi:

`;

        // Generazione della Top 10
        for (let i = 0; i < topCount; i++) {
            let medaglia = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅';
            let nomeGruppo = leaderboard[i].name;
            let totaleMsgs = f(leaderboard[i].total); // Formattato es. 1.500
            
            msg += `${medaglia} *${nomeGruppo}*\n`;
            msg += `╰➤ 💬 ${totaleMsgs} Messaggi\n\n`;
        }

        msg += `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        // Invio finale con la grafica premium
        await conn.sendMessage(m.chat, { text: msg, contextInfo: legamContext }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '📊', key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`『 ❌ 』 \`Errore nel calcolo delle statistiche.\``);
    }
};

handler.help = ['topgruppi'];
handler.tags = ['info'];
handler.command = /^(topgruppi|classificagruppi)$/i;

// Puoi decidere chi può usarlo. Di default ho messo che possono usarlo tutti, 
// ma se vuoi che sia solo per te e i mod scommenta la riga sotto:
// handler.mods = true; 

export default handler;

