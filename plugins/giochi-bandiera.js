// Plugin // 𝟕𝟖𝟕 BOT //

const playAgainButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: '🏳️ Gioca Ancora', id: `.bandiera` })
}];

const botContext = (title) => ({
    isForwarded: true,
    forwardingScore: 1,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363233544482011@newsletter',
        serverMessageId: 100,
        newsletterName: `𝟕𝟖𝟕 BOT | ${title}`
    }
});

function normalizeString(str) {
    if (!str) return '';
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').trim();
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
    return (userAnswer === correctAnswer || (correctAnswer.includes(userAnswer) && userAnswer.length > correctAnswer.length * 0.5) || (userAnswer.includes(correctAnswer) && userAnswer.length < correctAnswer.length * 1.5) || similarityScore >= 0.8);
}

let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, usedPrefix, command }) => {
    let cmd = command.toLowerCase();
    const sep = '----------------------------';

    if (cmd === 'skipbandiera') {
        if (!m.isGroup) return m.reply('// 𝟕𝟖𝟕 BOT //\n\nSolo nei gruppi.');
        if (!global.bandieraGame?.[m.chat]) return m.reply('// 𝟕𝟖𝟕 BOT //\n\nNessuna partita attiva.');
        if (!isAdmin && !m.fromMe) return m.reply('// 𝟕𝟖𝟕 BOT //\n\nSolo per Admin.');

        clearTimeout(global.bandieraGame[m.chat].timeout);
        let skipText = `// 𝟕𝟖𝟕 BOT // GIOCO ANNULLATO //\n\n🏳️ La nazione era: ${global.bandieraGame[m.chat].rispostaOriginale}\n🛑 Interrotto da un Admin\n\n${sep}`;

        await conn.sendMessage(m.chat, { text: skipText, interactiveButtons: playAgainButtons() }, { quoted: m });
        delete global.bandieraGame[m.chat];
        return;
    }
    
    if (global.bandieraGame?.[m.chat]) return m.reply('// 𝟕𝟖𝟕 BOT //\n\nPartita già in corso.');

    const cooldownKey = `bandiera_${m.chat}`;
    const now = Date.now();
    if (now - (global.cooldowns?.[cooldownKey] || 0) < 5000) return m.reply('// 𝟕𝟖𝟕 BOT //\n\nAttendi 5 secondi.');
    global.cooldowns = { ...global.cooldowns, [cooldownKey]: now };

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
        let startCaption = `// 𝟕𝟖𝟕 BOT // GEO QUIZ //\n\n🏳️ Di che nazione è questa bandiera?\n⏱️ Tempo: 30s | Tentativi: 3\n\n👉 Rispondi a questo messaggio.\n\n${sep}`;
        let msg = await conn.sendMessage(m.chat, { image: { url: scelta.url }, caption: startCaption, contextInfo: botContext('Geo Quiz') }, { quoted: m });
        
        global.bandieraGame = { ...global.bandieraGame, [m.chat]: {
            id: msg.key.id,
            risposta: scelta.nome.toLowerCase(),
            rispostaOriginale: scelta.nome,
            tentativi: {},
            startTime: Date.now(),
            timeout: setTimeout(async () => {
                if (global.bandieraGame?.[m.chat]) {
                    let timeoutText = `// 𝟕𝟖𝟕 BOT // TEMPO SCADUTO //\n\n🏳️ La nazione era: ${scelta.nome}\n💡 Clicca sotto per riprovare.\n\n${sep}`;
                    await conn.sendMessage(m.chat, { text: timeoutText, interactiveButtons: playAgainButtons() }, { quoted: msg });
                    delete global.bandieraGame[m.chat];
                }
            }, 30000)
        }};
    } catch (e) { m.reply('// 𝟕𝟖𝟕 BOT //\n\nErrore caricamento immagine.'); }
};

handler.before = async (m, { conn, usedPrefix }) => {
    const chat = m.chat;
    const game = global.bandieraGame?.[chat];
    const sep = '----------------------------';
    
    if (m.message?.interactiveResponseMessage) {
        const params = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson || '{}');
        if (params.id === '.bandiera' && !game) {
            await handler(m, { conn, usedPrefix, command: 'bandiera' });
        }
        return;
    }

    if (!game || !m.quoted || m.quoted.id !== game.id || m.key.fromMe) return;

    const userAnswer = normalizeString(m.text || '');
    const correctAnswer = normalizeString(game.risposta);
    if (!userAnswer || userAnswer.length < 2) return;

    if (isAnswerCorrect(userAnswer, correctAnswer)) {
        clearTimeout(game.timeout);
        let reward = Math.floor(Math.random() * 31) + 20;
        let exp = 150;
        let user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {});
        user.euro = (user.euro || 0) + reward;
        user.exp = (user.exp || 0) + exp;

        let winMsg = `// 𝟕𝟖𝟕 BOT // RISPOSTA ESATTA //\n\n👤 @${m.sender.split('@')[0]} ha indovinato!\n🏳️ Nazione: ${game.rispostaOriginale}\n⏱️ Tempo: ${Math.round((Date.now() - game.startTime)/1000)}s\n\n🎁 PREMI:\n💰 +${reward} Euro\n🆙 +${exp} EXP\n\n${sep}`;
        await conn.sendMessage(chat, { text: winMsg, mentions: [m.sender], interactiveButtons: playAgainButtons() }, { quoted: m });
        delete global.bandieraGame[chat];
    } else {
        game.tentativi[m.sender] = (game.tentativi[m.sender] || 0) + 1;
        let rimasti = 3 - game.tentativi[m.sender];
        if (rimasti <= 0) return m.reply('// 𝟕𝟖𝟕 BOT //\n\n❌ Tentativi esauriti.');
        if (rimasti === 1) return m.reply(`// 𝟕𝟖𝟕 BOT //\n\n💡 Aiuto: Inizia con ${game.rispostaOriginale[0]} ed è lunga ${game.rispostaOriginale.length} lettere.`);
        m.reply(`// 𝟕𝟖𝟕 BOT //\n\n❌ Sbagliato! Rimasti: ${rimasti}`);
    }
};

handler.help = ['bandiera'];
handler.tags = ['giochi'];
handler.command = /^(bandiera|skipbandiera)$/i;
handler.group = true;

export default handler;
