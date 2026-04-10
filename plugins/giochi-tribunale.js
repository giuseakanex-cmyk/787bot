// ⚖️ IL TRIBUNALE DI LEGAM OS ⚖️
let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!m.isGroup) return;

    let chat = global.db.data.chats[m.chat] || {};
    global.db.data.users = global.db.data.users || {};

    // Inizializza l'oggetto tribunale se non esiste
    chat.tribunale = chat.tribunale || { attivo: false };

    // ==========================================
    // 1. APERTURA DEL PROCESSO (.denuncia)
    // ==========================================
    if (command === 'denuncia') {
        if (chat.tribunale.attivo) return m.reply(`『 ⚖️ 』 \`PROCESSO IN CORSO\`\nC'è già un'udienza aperta. Aspetta il verdetto!`);
        
        let imputato = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null;
        if (!imputato) return m.reply(`『 ⚠️ 』 Devi taggare l'imputato.\nEsempio: *${usedPrefix}denuncia @utente Ha rubato un meme*`);
        if (imputato === conn.user.jid) return m.reply(`『 🤖 』 Non puoi denunciare la Corte Suprema (Il Bot)!`);
        if (imputato === m.sender) return m.reply(`『 🤡 』 Non puoi autodenunciarti!`);

        let motivo = args.slice(1).join(' ') || "Crimini contro il gruppo";

        // Configura il processo
        chat.tribunale = {
            attivo: true,
            imputato: imputato,
            accusatore: m.sender,
            motivo: motivo,
            votiColpevole: [],
            votiInnocente: [],
            scadenza: Date.now() + 120000 // 2 Minuti di udienza
        };

        let msg = `
🏛️ *IL TRIBUNALE È APERTO* 🏛️
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

👨‍⚖️ \`Accusatore:\` @${m.sender.split('@')[0]}
🚨 \`Imputato:\` @${imputato.split('@')[0]}
📜 \`Capo d'Accusa:\` _${motivo}_

La giuria popolare è chiamata a votare.
Hai *2 MINUTI* per decidere il destino dell'imputato.

➤ Scrivi *.colpevole* per condannarlo.
➤ Scrivi *.innocente* per assolverlo.

_Se giudicato colpevole, pagherà una multa in €._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        await conn.sendMessage(m.chat, { text: msg, mentions: [m.sender, imputato] });

        // Timer di chiusura del processo
        setTimeout(async () => {
            let t = global.db.data.chats[m.chat].tribunale;
            if (!t.attivo) return; // Se è già stato chiuso per qualche motivo

            let totC = t.votiColpevole.length;
            let totI = t.votiInnocente.length;
            
            t.attivo = false; // Chiude il tribunale

            let verdettoMsg = `🏛️ *VERDETTO DELLA GIURIA* 🏛️\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n`;
            verdettoMsg += `🔴 Colpevole: ${totC} voti\n🟢 Innocente: ${totI} voti\n\n`;

            if (totC > totI) {
                // CONDANNATO: Multa da 50€ a 500€
                let multa = Math.floor(Math.random() * 450) + 50;
                let user = global.db.data.users[t.imputato] || { euro: 0 };
                user.euro = Math.max(0, user.euro - multa); // Toglie i soldi senza farlo andare in negativo

                verdettoMsg += `⚖️ \`GIUDIZIO:\` *COLPEVOLE*\nL'imputato @${t.imputato.split('@')[0]} è stato condannato e condannato a pagare una multa di *${multa}€*! 📉`;
            } else if (totI > totC) {
                // ASSOLTO
                verdettoMsg += `⚖️ \`GIUDIZIO:\` *INNOCENTE*\nL'imputato @${t.imputato.split('@')[0]} è stato assolto da tutte le accuse! 🎉`;
            } else {
                // PARITÀ
                verdettoMsg += `⚖️ \`GIUDIZIO:\` *PROCESSO NULLO*\nLa giuria non ha raggiunto una maggioranza. Il caso è archiviato. 🤷‍♂️`;
            }

            await conn.sendMessage(m.chat, { text: verdettoMsg, mentions: [t.imputato] });

        }, 120000); // 120.000 ms = 2 minuti

        return;
    }

    // ==========================================
    // 2. SISTEMA DI VOTO (.colpevole / .innocente)
    // ==========================================
    if (command === 'colpevole' || command === 'innocente') {
        if (!chat.tribunale.attivo) return m.reply(`『 ⚖️ 』 Nessun processo in corso al momento.`);
        if (m.sender === chat.tribunale.imputato) return m.reply(`『 🤫 』 L'imputato non può votare al proprio processo!`);
        
        let t = chat.tribunale;

        // Controlla se ha già votato
        if (t.votiColpevole.includes(m.sender) || t.votiInnocente.includes(m.sender)) {
            return m.reply(`『 🚫 』 Hai già espresso il tuo voto per questa udienza.`);
        }

        if (command === 'colpevole') {
            t.votiColpevole.push(m.sender);
            m.reply(`『 🔴 』 Voto registrato: *COLPEVOLE*`);
        } else {
            t.votiInnocente.push(m.sender);
            m.reply(`『 🟢 』 Voto registrato: *INNOCENTE*`);
        }
    }
};

handler.help = ['denuncia @tag', 'colpevole', 'innocente'];
handler.tags = ['giochi'];
handler.command = /^(denuncia|colpevole|innocente)$/i;
handler.group = true;

export default handler;

