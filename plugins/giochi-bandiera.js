// Plugin ottimizzato con Bottoni Interattivi e Stile Legam OS

const playAgainButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: '🏳️ Gioca Ancora!', id: `.bandiera` })
}];

const legamContext = (title) => ({
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363233544482011@newsletter',
        serverMessageId: 100,
        newsletterName: `🌍 ${title}`
    }
});

function normalizeString(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
}

function calculateSimilarity(str1, str2) {
    const words1 = str1.split(' ').filter(word => word.length > 1);
    const words2 = str2.split(' ').filter(word => word.length > 1);
    if (words1.length === 0 || words2.length === 0) return 0;
    const matches = words1.filter(word => words2.some(w2 => w2.includes(word) || word.includes(w2)));
    return matches.length / Math.max(words1.length, words2.length);
}

function isAnswerCorrect(userAnswer, correctAnswer) {
    if (userAnswer.length < 2) return false;
    const similarityScore = calculateSimilarity(userAnswer, correctAnswer);
    return (
        userAnswer === correctAnswer ||
        (correctAnswer.includes(userAnswer) && userAnswer.length > correctAnswer.length * 0.5) ||
        (userAnswer.includes(correctAnswer) && userAnswer.length < correctAnswer.length * 1.5) ||
        similarityScore >= 0.8
    );
}

let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, usedPrefix, command }) => {
    let cmd = command.toLowerCase();

    // ==========================================
    // 🛑 COMANDO SKIP (SOLO ADMIN)
    // ==========================================
    if (cmd === 'skipbandiera') {
        if (!m.isGroup) return m.reply('『 ⚠️ 』 `Questo comando funziona solo nei gruppi!`');
        if (!global.bandieraGame?.[m.chat]) return m.reply('『 ⚠️ 』 `Non c\'è nessuna partita attiva!`');
        if (!isAdmin && !m.fromMe) return m.reply('『 ❌ 』 `Comando riservato agli Admin.`');

        clearTimeout(global.bandieraGame[m.chat].timeout);
        
        let skipText = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🛑 𝐆𝐈𝐎𝐂𝐎 𝐀𝐍𝐍𝐔𝐋𝐋𝐀𝐓𝐎 🛑 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🏳️ 』 \`La nazione era:\` *${global.bandieraGame[m.chat].rispostaOriginale}*
『 👑 』 _Interrotto da un Admin_

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        await conn.sendMessage(m.chat, {
            text: skipText,
            footer: '✨ 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 ✨',
            interactiveButtons: playAgainButtons()
        }, { quoted: m });
        
        delete global.bandieraGame[m.chat];
        return;
    }
    
    // ==========================================
    // 🌍 AVVIO DEL GIOCO
    // ==========================================
    if (global.bandieraGame?.[m.chat]) {
        return m.reply('『 ⏳ 』 `C\'è già una partita attiva in questo gruppo!`');
    }

    // Cooldown per non spammare
    const cooldownKey = `bandiera_${m.chat}`;
    const lastGame = global.cooldowns?.[cooldownKey] || 0;
    const now = Date.now();
    const cooldownTime = 5000;

    if (now - lastGame < cooldownTime) {
        const remainingTime = Math.ceil((cooldownTime - (now - lastGame)) / 1000);
        return m.reply(`『 ⏳ 』 \`Attendi ${remainingTime} secondi prima di un nuovo gioco.\``);
    }

    global.cooldowns = global.cooldowns || {};
    global.cooldowns[cooldownKey] = now;

    let bandiere = [
        { url: 'https://flagcdn.com/w320/it.png', nome: 'Italia' }, { url: 'https://flagcdn.com/w320/fr.png', nome: 'Francia' },
        { url: 'https://flagcdn.com/w320/de.png', nome: 'Germania' }, { url: 'https://flagcdn.com/w320/gb.png', nome: 'Regno Unito' },
        { url: 'https://flagcdn.com/w320/es.png', nome: 'Spagna' }, { url: 'https://flagcdn.com/w320/se.png', nome: 'Svezia' },
        { url: 'https://flagcdn.com/w320/no.png', nome: 'Norvegia' }, { url: 'https://flagcdn.com/w320/fi.png', nome: 'Finlandia' },
        { url: 'https://flagcdn.com/w320/dk.png', nome: 'Danimarca' }, { url: 'https://flagcdn.com/w320/pl.png', nome: 'Polonia' },
        { url: 'https://flagcdn.com/w320/pt.png', nome: 'Portogallo' }, { url: 'https://flagcdn.com/w320/gr.png', nome: 'Grecia' },
        { url: 'https://flagcdn.com/w320/ch.png', nome: 'Svizzera' }, { url: 'https://flagcdn.com/w320/at.png', nome: 'Austria' },
        { url: 'https://flagcdn.com/w320/be.png', nome: 'Belgio' }, { url: 'https://flagcdn.com/w320/nl.png', nome: 'Paesi Bassi' },
        { url: 'https://flagcdn.com/w320/ua.png', nome: 'Ucraina' }, { url: 'https://flagcdn.com/w320/ro.png', nome: 'Romania' },
        { url: 'https://flagcdn.com/w320/hu.png', nome: 'Ungheria' }, { url: 'https://flagcdn.com/w320/cz.png', nome: 'Repubblica Ceca' },
        { url: 'https://flagcdn.com/w320/ie.png', nome: 'Irlanda' }, { url: 'https://flagcdn.com/w320/bg.png', nome: 'Bulgaria' },
        { url: 'https://flagcdn.com/w320/us.png', nome: 'Stati Uniti' }, { url: 'https://flagcdn.com/w320/ca.png', nome: 'Canada' },
        { url: 'https://flagcdn.com/w320/mx.png', nome: 'Messico' }, { url: 'https://flagcdn.com/w320/br.png', nome: 'Brasile' },
        { url: 'https://flagcdn.com/w320/ar.png', nome: 'Argentina' }, { url: 'https://flagcdn.com/w320/cl.png', nome: 'Cile' },
        { url: 'https://flagcdn.com/w320/co.png', nome: 'Colombia' }, { url: 'https://flagcdn.com/w320/pe.png', nome: 'Perù' },
        { url: 'https://flagcdn.com/w320/ve.png', nome: 'Venezuela' }, { url: 'https://flagcdn.com/w320/cu.png', nome: 'Cuba' },
        { url: 'https://flagcdn.com/w320/au.png', nome: 'Australia' }, { url: 'https://flagcdn.com/w320/nz.png', nome: 'Nuova Zelanda' },
        { url: 'https://flagcdn.com/w320/cn.png', nome: 'Cina' }, { url: 'https://flagcdn.com/w320/jp.png', nome: 'Giappone' },
        { url: 'https://flagcdn.com/w320/in.png', nome: 'India' }, { url: 'https://flagcdn.com/w320/kr.png', nome: 'Corea del Sud' },
        { url: 'https://flagcdn.com/w320/th.png', nome: 'Thailandia' }, { url: 'https://flagcdn.com/w320/vn.png', nome: 'Vietnam' },
        { url: 'https://flagcdn.com/w320/id.png', nome: 'Indonesia' }, { url: 'https://flagcdn.com/w320/ph.png', nome: 'Filippine' },
        { url: 'https://flagcdn.com/w320/my.png', nome: 'Malesia' }, { url: 'https://flagcdn.com/w320/sg.png', nome: 'Singapore' },
        { url: 'https://flagcdn.com/w320/pk.png', nome: 'Pakistan' }, { url: 'https://flagcdn.com/w320/af.png', nome: 'Afghanistan' },
        { url: 'https://flagcdn.com/w320/tr.png', nome: 'Turchia' }, { url: 'https://flagcdn.com/w320/il.png', nome: 'Israele' },
        { url: 'https://flagcdn.com/w320/sa.png', nome: 'Arabia Saudita' }, { url: 'https://flagcdn.com/w320/ae.png', nome: 'Emirati Arabi Uniti' },
        { url: 'https://flagcdn.com/w320/eg.png', nome: 'Egitto' }, { url: 'https://flagcdn.com/w320/ng.png', nome: 'Nigeria' },
        { url: 'https://flagcdn.com/w320/ma.png', nome: 'Marocco' }, { url: 'https://flagcdn.com/w320/za.png', nome: 'Sudafrica' }
    ];
    
    let scelta = bandiere[Math.floor(Math.random() * bandiere.length)];

    try {
        let startCaption = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🌍 𝐆𝐄𝐎 𝐐𝐔𝐈𝐙 🌍 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🏳️ 』 Di che nazione è questa bandiera?
『 ⏱️ 』 Hai *30 secondi* e *3 tentativi*!

👉 *Rispondi a questo messaggio con il nome.*
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        let msg = await conn.sendMessage(m.chat, {
            image: { url: scelta.url },
            caption: startCaption,
            contextInfo: legamContext('Geo Quiz')
        }, { quoted: m });
        
        global.bandieraGame = global.bandieraGame || {};
        global.bandieraGame[m.chat] = {
            id: msg.key.id,
            risposta: scelta.nome.toLowerCase(),
            rispostaOriginale: scelta.nome,
            tentativi: {},
            suggerito: false,
            startTime: Date.now(),
            timeout: setTimeout(async () => {
                if (global.bandieraGame?.[m.chat]) {
                    let timeoutText = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· ⌛ 𝐓𝐄𝐌𝐏𝐎 𝐒𝐂𝐀𝐃𝐔𝐓𝐎 ⌛ ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🏳️ 』 \`La nazione era:\` *${scelta.nome}*
『 💡 』 Clicca il bottone per riprovare!

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();
                    
                    await conn.sendMessage(m.chat, { 
                        text: timeoutText, 
                        footer: '✨ 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 ✨',
                        interactiveButtons: playAgainButtons() 
                    }, { quoted: msg });
                    
                    delete global.bandieraGame[m.chat];
                }
            }, 30000)
        };
    } catch (error) {
        console.error('Errore nel gioco bandiere:', error);
        m.reply('『 ❌ 』 `Errore durante il caricamento dell\'immagine. Riprova.`');
    }
};

// ==========================================
// 🎯 MOTORE DI CONTROLLO RISPOSTE & BOTTONI
// ==========================================
handler.before = async (m, { conn, usedPrefix, command }) => {
    const chat = m.chat;
    
    // 1. GESTIONE DEL CLICK SUL BOTTONE (Gioca Ancora)
    if (m.message && m.message.interactiveResponseMessage) {
        const response = m.message.interactiveResponseMessage;
        
        if (response.nativeFlowResponseMessage?.paramsJson) {
            try {
                const params = JSON.parse(response.nativeFlowResponseMessage.paramsJson);
                if (params.id === '.bandiera') {
                    if (!global.bandieraGame?.[chat]) {
                        // Finge che l'utente abbia scritto il comando per far ripartire il gioco
                        const fakeMessage = {
                            ...m,
                            text: usedPrefix + 'bandiera',
                            body: usedPrefix + 'bandiera'
                        };
                        try {
                            await handler(fakeMessage, { conn, usedPrefix, command: 'bandiera' });
                        } catch (error) {
                            console.error('Errore nel riavvio del gioco dai bottoni:', error);
                        }
                    } else {
                        conn.reply(chat, '『 ⏳ 』 `C\'è già una partita attiva!`', m);
                    }
                }
            } catch (error) {
                console.error('Errore nel parsing dei parametri del bottone:', error);
            }
        }
        return;
    }

    const game = global.bandieraGame?.[chat];
    
    // Controlla se l'utente sta rispondendo al messaggio del gioco
    if (!game || !m.quoted || m.quoted.id !== game.id || m.key.fromMe) return;

    const userAnswer = normalizeString(m.text || '');
    const correctAnswer = normalizeString(game.risposta);

    if (!userAnswer || userAnswer.length < 2) return;

    const similarityScore = calculateSimilarity(userAnswer, correctAnswer);

    // ==========================================
    // ✅ RISPOSTA CORRETTA
    // ==========================================
    if (isAnswerCorrect(userAnswer, correctAnswer)) {
        clearTimeout(game.timeout);

        const timeTaken = Math.round((Date.now() - game.startTime) / 1000);
        let reward = Math.floor(Math.random() * 31) + 20; // Tra 20 e 50 euro
        let exp = 150;

        const timeBonus = timeTaken <= 10 ? 20 : timeTaken <= 20 ? 10 : 0;
        reward += timeBonus;

        // Inserimento sicuro nel Database
        let user = global.db.data.users[m.sender];
        if (!user) { global.db.data.users[m.sender] = {}; user = global.db.data.users[m.sender]; }
        user.euro = (user.euro || 0) + reward;
        user.exp = (user.exp || 0) + exp;

        let congratsMessage = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🏆 𝐑𝐈𝐒𝐏𝐎𝐒𝐓𝐀 𝐄𝐒𝐀𝐓𝐓𝐀 🏆 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

👤 @${m.sender.split('@')[0]} ha indovinato!
『 🏳️ 』 \`Nazione:\` *${game.rispostaOriginale}*
『 ⏱️ 』 \`Tempo:\` *${timeTaken}s*

🎁 *𝐑𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐞:*
💰 +${reward} Euro ${timeBonus > 0 ? `(Bonus Velocità)` : ''}
🆙 +${exp} EXP

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();
        
        await conn.sendMessage(chat, { 
            text: congratsMessage, 
            mentions: [m.sender], 
            footer: '✨ 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 ✨',
            interactiveButtons: playAgainButtons() 
        }, { quoted: m });
        
        delete global.bandieraGame[chat];
        
    } 
    // ==========================================
    // 👀 QUASI CORRETTO (Errori di battitura)
    // ==========================================
    else if (similarityScore >= 0.6 && !game.suggerito) {
        game.suggerito = true;
        await conn.reply(chat, '『 👀 』 `Ci sei quasi! Rileggi come lo hai scritto.`', m);
        
    } 
    // ==========================================
    // ❌ RISPOSTA ERRATA E TENTATIVI
    // ==========================================
    else {
        if (!game.tentativi[m.sender]) game.tentativi[m.sender] = 0;
        game.tentativi[m.sender] += 1;
        const tentativiRimasti = 3 - game.tentativi[m.sender];

        if (tentativiRimasti <= 0) {
            await conn.reply(chat, '『 ❌ 』 `Hai esaurito i tuoi 3 tentativi personali! Lascia provare gli altri.`', m);
        } else if (tentativiRimasti === 1) {
            const primaLettera = game.rispostaOriginale[0].toUpperCase();
            const numeroLettere = game.rispostaOriginale.length;
            await conn.reply(chat, `『 ❌ 』 \`Sbagliato!\`\n\n💡 *Aiuto:* Inizia con la *${primaLettera}* ed è lunga *${numeroLettere}* lettere.`, m);
        } else {
            await conn.reply(chat, `『 ❌ 』 \`Sbagliato!\` (Tentativi rimasti: ${tentativiRimasti})`, m);
        }
    }
};

handler.help = ['bandiera'];
handler.tags = ['giochi'];
handler.command = /^(bandiera|skipbandiera)$/i;
handler.group = true;

export default handler;


