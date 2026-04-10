import axios from 'axios';

// ==========================================
// 🎨 STILE E BOTTONI LEGAM OS
// ==========================================
const playAgainButtons = () => [{
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: '🎵 Gioca Ancora!', id: `.ic` })
}];

const legamContext = (title, thumb = '') => {
    let ctx = {
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter',
            serverMessageId: 100,
            newsletterName: `🎵 ${title}`
        }
    };
    if (thumb) {
        ctx.externalAdReply = {
            title: 'Indovina la Canzone',
            body: 'Legam OS Audio Games',
            thumbnailUrl: thumb,
            sourceUrl: '',
            mediaType: 1,
            renderLargerThumbnail: true
        };
    }
    return ctx;
};

// ==========================================
// 🎤 DATABASE ARTISTI E LOGICA
// ==========================================
const artistiLegam = [
    "Lazza", "Sfera Ebbasta", "Ghali", "Baby Gang", "Shiva", "Drake", "Tony Boy", 
    "Kid Yugi", "21 savage", "Marracash", "Capo Plaza", "Guè Pequeno", "King Von", 
    "Central Cee", "Lil Durk", "Tha Supreme", "Gemitaiz", "Fabri Fibra", "Simba La Rue", 
    "Il tre", "RondoDaSosa", "Drefgold", "Noyz Narcos", "Salmo", "Ariete", "Tedua", 
    "Anna", "Rose Villain", "Artie 5ive", "Glocky", "Lil Baby", "Kodack Black", "LUCKI", 
    "YoungBoy Never Broke Again", "Il Ghost", "Massimo Pericolo", "Geolier", "Paky", 
    "Villabanks", "Blanco", "Mahmood", "Irama"
];

function normalize(str) {
    if (!str) return '';
    return str.split('-')[0].split(/[\(\[{]/)[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').trim();
}

function similarity(str1, str2) {
    const s1 = normalize(str1); const s2 = normalize(str2);
    if (!s1 || !s2) return 0;
    const words1 = s1.split(/\s+/); const words2 = s2.split(/\s+/);
    const intersection = words1.filter(w => words2.includes(w));
    return (2.0 * intersection.length) / (words1.length + words2.length);
}

// Estrazione da iTunes
async function getRandomTrack(artist = null) {
    let found = null; let tentativi = 0;
    const searchTerms = artist ? [artist] : artistiLegam;
    
    while (!found && tentativi < 3) {
        const query = artist || searchTerms[Math.floor(Math.random() * searchTerms.length)];
        try {
            const response = await axios.get('https://itunes.apple.com/search', {
                params: { term: query, country: 'IT', media: 'music', entity: 'song', attribute: 'artistTerm', limit: 100 }
            });
            const valid = response.data.results.filter(b => {
                const title = b.trackName.toLowerCase(); const artistName = b.artistName.toLowerCase();
                return b.previewUrl && b.trackName && b.artistName && b.artworkUrl100 && b.trackTimeMillis > 45000 &&
                !title.includes('karaoke') && !title.includes('tribute') && !title.includes('cover') &&
                !title.includes('instrumental') && !title.includes('remix') && !title.includes('live');
            });
            let filteredValid = valid;
            if (artist) {
                const searchNorm = normalize(artist);
                filteredValid = valid.filter(b => normalize(b.artistName).includes(searchNorm));
            }
            if (filteredValid.length > 0) {
                const topHits = filteredValid.slice(0, Math.min(filteredValid.length, 25));
                found = topHits[Math.floor(Math.random() * topHits.length)];
            }
        } catch (e) { console.error('Errore iTunes:', e.message); }
        tentativi++;
    }
    if (!found) throw new Error('Canzone non trovata. Riprova.');
    
    return {
        title: found.trackName,
        artist: found.artistName,
        preview: found.previewUrl,
        artwork: found.artworkUrl100.replace('100x100bb', '600x600bb') // Qualità HD
    };
}

// ==========================================
// 🚀 AVVIO DEL GIOCO
// ==========================================
let handler = async (m, { conn, text, usedPrefix }) => {
    const chat = m.chat;

    if (global.canzoneGame && global.canzoneGame[chat]) {
        return m.reply('『 ⚠️ 』 \`C\'è già una canzone da indovinare!\`');
    }

    try {
        await m.react('⏳');
        const track = await getRandomTrack(text);
        
        // Scarica l'audio in RAM invece di usare l'hard disk
        const audioResponse = await axios.get(track.preview, { responseType: 'arraybuffer' });
        const audioBuffer = Buffer.from(audioResponse.data);

        const txtMessage = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🎵 𝐌𝐔𝐒𝐈𝐂 𝐐𝐔𝐈𝐙 🎵 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 👤 』 \`Artista:\` *${track.artist}*
『 ⏱️ 』 \`Tempo:\` *30 Secondi*

👉 *Ascolta l'audio e scrivi il titolo!*
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        // 1. Invia il testo con l'immagine dell'album
        let gameMessage = await conn.sendMessage(m.chat, {
            text: txtMessage,
            contextInfo: legamContext('In Riproduzione', track.artwork)
        }, { quoted: m });

        // 2. Invia la nota vocale
        await conn.sendMessage(m.chat, { 
            audio: audioBuffer, 
            mimetype: 'audio/mp4', 
            ptt: true,
            contextInfo: legamContext('Audio Originale')
        }, { quoted: gameMessage });

        // Crea la sessione di gioco
        global.canzoneGame = global.canzoneGame || {};
        global.canzoneGame[chat] = {
            track: track,
            startTime: Date.now(),
            timeout: setTimeout(async () => {
                if (global.canzoneGame && global.canzoneGame[chat]) {
                    let timeoutText = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· ⌛ 𝐓𝐄𝐌𝐏𝐎 𝐒𝐂𝐀𝐃𝐔𝐓𝐎 ⌛ ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 ❌ 』 \`Nessuno ha indovinato!\`
『 🎵 』 \`Titolo:\` *${track.title}*

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();
                    
                    await conn.sendMessage(m.chat, {
                        text: timeoutText,
                        footer: '✨ 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 ✨',
                        interactiveButtons: playAgainButtons()
                    }, { quoted: gameMessage });
                    
                    delete global.canzoneGame[chat];
                }
            }, 30000)
        };

        await m.react('✅');

    } catch (e) {
        console.error('Errore Music Quiz:', e);
        await m.react('❌');
        m.reply('『 ❌ 』 `Errore durante il recupero della traccia. Riprova.`');
    }
}

// ==========================================
// 🎯 MOTORE DI CONTROLLO RISPOSTE & BOTTONI
// ==========================================
handler.before = async (m, { conn, usedPrefix, command }) => {
    const chat = m.chat;
    
    // 1. GESTIONE CLICK SUL BOTTONE (Gioca Ancora)
    if (m.message && m.message.interactiveResponseMessage) {
        const response = m.message.interactiveResponseMessage;
        if (response.nativeFlowResponseMessage?.paramsJson) {
            try {
                const params = JSON.parse(response.nativeFlowResponseMessage.paramsJson);
                if (params.id === '.ic') {
                    if (!global.canzoneGame?.[chat]) {
                        const fakeMessage = { ...m, text: usedPrefix + 'ic', body: usedPrefix + 'ic' };
                        await handler(fakeMessage, { conn, usedPrefix, text: '' });
                    } else {
                        conn.reply(chat, '『 ⏳ 』 `C\'è già una partita in corso!`', m);
                    }
                }
            } catch (error) {}
        }
        return;
    }

    if (!global.canzoneGame || !global.canzoneGame[chat]) return;
    if (!m.text || m.text.length < 2 || m.text.startsWith('.')) return;

    const game = global.canzoneGame[chat];
    const userAnswer = normalize(m.text);
    const correctAnswer = normalize(game.track.title);
    const score = similarity(m.text, game.track.title);
    
    const isCorrect = 
        userAnswer === correctAnswer || 
        (correctAnswer.length > 3 && userAnswer.includes(correctAnswer)) ||
        (userAnswer.length > 3 && correctAnswer.includes(userAnswer)) ||
        score >= 0.75;

    // ==========================================
    // ✅ RISPOSTA CORRETTA
    // ==========================================
    if (isCorrect) {
        clearTimeout(game.timeout);
        
        let reward = Math.floor(Math.random() * 200) + 100;
        let exp = Math.floor(Math.random() * 300) + 200;
        
        let user = global.db.data.users[m.sender];
        if (!user) { global.db.data.users[m.sender] = {}; user = global.db.data.users[m.sender]; }
        user.euro = (user.euro || 0) + reward;
        user.exp = (user.exp || 0) + exp;

        await conn.sendMessage(m.chat, { react: { text: '🎉', key: m.key } });
        
        let winText = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🏆 𝐑𝐈𝐒𝐏𝐎𝐒𝐓𝐀 𝐄𝐒𝐀𝐓𝐓𝐀 🏆 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

👤 @${m.sender.split('@')[0]} ha indovinato!
『 🎵 』 \`Canzone:\` *${game.track.title}*

🎁 *𝐑𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐞:*
💰 +${reward} Euro
🆙 +${exp} EXP

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        await conn.sendMessage(chat, { 
            text: winText, 
            mentions: [m.sender], 
            footer: '✨ 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 ✨',
            interactiveButtons: playAgainButtons()
        }, { quoted: m });

        delete global.canzoneGame[chat];

    } 
    // ==========================================
    // 👀 QUASI CORRETTO
    // ==========================================
    else if (score >= 0.45) {
        await conn.sendMessage(m.chat, { react: { text: '👀', key: m.key } });
    }
}

handler.help = ['indovinacanzone [artista]'];
handler.tags = ['giochi'];
handler.command = /^(indovinacanzone|ic)$/i;
handler.group = true;

export default handler;

