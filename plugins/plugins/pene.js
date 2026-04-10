let handler = async (m, { conn, usedPrefix, command }) => {
    
    // Scudo Estetico di Legam OS
    const legamContext = {
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter',
            serverMessageId: 100,
            newsletterName: `🍆 Legam OS Scanner`
        }
    };

    let cmd = command.toLowerCase();

    // ==========================================
    // 🏆 LA CLASSIFICA DEI TITANI (.classificapene)
    // ==========================================
    if (cmd === 'classificapene' || cmd === 'toppene') {
        
        // Cerca nel DB tutti gli utenti che hanno la statistica "pene"
        let users = Object.entries(global.db.data.users)
            .filter(([jid, data]) => data && data.pene)
            .map(([jid, data]) => ({ jid, size: data.pene }))
            .sort((a, b) => b.size - a.size) // Dal più lungo al più corto
            .slice(0, 10); // Prende solo la Top 10

        if (users.length === 0) {
            return m.reply("『 😅 』 `Nessuno si è ancora scansionato! Usa .pene per iniziare.`");
        }

        let testoclassifica = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🏆 𝐓𝐎𝐏 𝟏𝟎 𝐓𝐈𝐓𝐀𝐍𝐈 🏆 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n`;

        let medaglie = ['🥇', '🥈', '🥉', '🏅', '🏅', '🏅', '🏅', '🏅', '🏅', '🏅'];
        let menzioni = [];

        users.forEach((u, i) => {
            menzioni.push(u.jid);
            // Assegna l'emoji in base alla lunghezza
            let catIcon = u.size > 60 ? '🐉' : (u.size > 20 ? '📏' : '🔬');
            testoclassifica += `${medaglie[i]} @${u.jid.split('@')[0]} ➻ *${u.size} cm* ${catIcon}\n`;
        });

        testoclassifica += `\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

        await conn.sendMessage(m.chat, { text: testoclassifica, mentions: menzioni, contextInfo: legamContext }, { quoted: m });
        return;
    }

    // ==========================================
    // 🍆 LO SCANNER FISICO (.pene)
    // ==========================================
    
    // Determina chi scansionare (chi invia il messaggio o chi viene taggato)
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender);
    
    // Assicurati che l'utente esista nel DB
    let userDb = global.db.data.users[who];
    if (!userDb) {
        global.db.data.users[who] = {};
        userDb = global.db.data.users[who];
    }

    // Recupera il nome
    let name = await conn.getName(who);
    if (who === m.sender) name = m.pushName || 'Tu';

    // Generatore casuale da 1 a 100
    let length = Math.floor(Math.random() * 100) + 1;
    
    // 🔥 SALVA LA MISURA NEL DATABASE! 🔥
    // Se rifai il comando, la misura vecchia viene cancellata. Rischi la Top 10!
    userDb.pene = length;
    
    // Disegna l'attrezzo in proporzione (1 segno '=' ogni 4 cm circa)
    let equalsCount = Math.max(1, Math.floor(length / 4)); 
    let asciiArt = '8' + '='.repeat(equalsCount) + 'D';

    let category = '';
    let phrase = '';

    // 🔬 DA 1 A 20: CORTO
    if (length <= 20) {
        category = '🔬 MICRO (Corto)';
        let phrases = [
            "Spero per te che tu abbia un bellissimo carattere...",
            "Come un Tic Tac! Almeno sa di menta?",
            "C'è ma non si vede. Sei un ninja della mutanda.",
            "Consiglio: compra subito una lente d'ingrandimento.",
            "La genetica è stata crudele con te, mi dispiace amico.",
            "Fa quasi tenerezza. Sembra un bruco infreddolito.",
            "Utile solo se devi sbloccare il carrello della spesa senza la moneta."
        ];
        phrase = phrases[Math.floor(Math.random() * phrases.length)];
    } 
    // 📏 DA 21 A 60: GRANDE / NORMALE
    else if (length <= 60) {
        category = '📏 GRANDE (Rispetto)';
        let phrases = [
            "Di tutto rispetto! Fai la tua sporca figura.",
            "Nella media-alta. Un onesto lavoratore che non delude mai.",
            "Non ti puoi lamentare, la natura è stata equilibrata.",
            "Un'ottima clava. Usala con saggezza.",
            "Sei armato e pericoloso al punto giusto.",
            "Una misura perfetta per non fare brutte figure. Approvato dal sistema.",
            "Complimenti, hai il certificato di 'portatore sano di gioie'."
        ];
        phrase = phrases[Math.floor(Math.random() * phrases.length)];
    } 
    // 🐉 DA 61 A 100: ENORME
    else {
        category = '🐉 ENORME (Titanico)';
        let phrases = [
            "Rocco Siffredi ti ha appena chiesto l'autografo.",
            "Ma lo usi anche come terza gamba quando sei stanco di camminare?",
            "Attento quando ti siedi, potresti schiacciarlo e fare un disastro.",
            "Devi pagare un biglietto a parte per portarlo in aereo?",
            "Una bestia indomabile. Rispetto totale per questo mostro.",
            "Porto d'armi obbligatorio per circolare con quella proboscide.",
            "Ho provato a calcolarne il volume ma il mio server è andato in surriscaldamento."
        ];
        phrase = phrases[Math.floor(Math.random() * phrases.length)];
    }

    // Costruzione del messaggio finale
    let msg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🍆 𝐒𝐂𝐀𝐍𝐍𝐄𝐑 𝐏𝐄𝐍𝐄 🍆 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

👤 *Soggetto:* ${name}
📏 *Misura:* ${length} cm
📊 *Categoria:* ${category}

${asciiArt}

💬 *Giudizio di Legam OS:*
_${phrase}_

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    await conn.sendMessage(m.chat, { text: msg, contextInfo: legamContext }, { quoted: m });
}

handler.help = ['pene', 'classificapene'];
handler.tags = ['fun'];
handler.command = /^(pene|pisello|cazzo|scanner|classificapene|toppene)$/i;

export default handler;


