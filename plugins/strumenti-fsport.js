import fetch from 'node-fetch';

// Feed RSS ufficiali ricalibrati
const sportFeeds = {
    'calcio': { nome: 'Calcio', url: 'https://www.gazzetta.it/rss/calcio.xml' },
    'basket': { nome: 'Basket', url: 'https://www.gazzetta.it/rss/basket.xml' },
    'tennis': { nome: 'Tennis', url: 'https://www.gazzetta.it/rss/tennis.xml' },
    'motori': { nome: 'Motori', url: 'https://www.gazzetta.it/rss/motori.xml' },
    'ciclismo': { nome: 'Ciclismo', url: 'https://www.gazzetta.it/rss/ciclismo.xml' },
    'vari': { nome: 'Sport Vari', url: 'https://www.gazzetta.it/rss/sport-vari.xml' }
};

let handler = async (m, { conn, usedPrefix, command, text }) => {
    
    const getChannelContext = (title) => ({
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter', 
            serverMessageId: 100,
            newsletterName: `𝟕𝟖𝟕 𝐒𝐘𝐒𝐓𝐄𝐌: ${title}`
        }
    });

    let args = text ? text.trim().toLowerCase() : '';

    if (!args || !sportFeeds[args]) {
        let menuText = `
⌬ ━━━───  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ───━━━ ⌬

⌬ ❯ 𝐍𝐄𝐖𝐒 𝐇𝐔𝐁
Seleziona una categoria per ricevere il feed in tempo reale.

⌬ ❯ 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐈𝐄:
➡ *${usedPrefix}${command} calcio*
➡ *${usedPrefix}${command} basket*
➡ *${usedPrefix}${command} tennis*
➡ *${usedPrefix}${command} motori*
➡ *${usedPrefix}${command} ciclismo*
➡ *${usedPrefix}${command} vari*

⌬ ━━━───  𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘  𝐀𝐂𝐓𝐈𝐕𝐄  ───━━━ ⌬`.trim();

        return conn.sendMessage(m.chat, { 
            text: menuText, 
            contextInfo: getChannelContext('News Hub') 
        }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(sportFeeds[args].url)}`;
        let response = await fetch(apiUrl);
        let data = await response.json();

        if (data.status !== 'ok' || !data.items || data.items.length === 0) {
            throw new Error('Database temporaneamente non raggiungibile.');
        }

        let topNews = data.items.slice(0, 5);
        
        let newsText = `
⌬ ━━━───  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ───━━━ ⌬

⌬ ❯ 𝐔𝐋𝐓𝐈𝐌'𝐎𝐑𝐀: *${sportFeeds[args].nome.toUpperCase()}*

`;

        topNews.forEach((item, index) => {
            let titolo = item.title.replace(/<[^>]*>?/gm, ''); 
            let link = item.link;
            newsText += `*${index + 1}.* ${titolo}\n🔗 ${link}\n\n`;
        });

        newsText += `⌬ ━━━───  𝐃𝐀𝐓𝐀  𝐒𝐎𝐔𝐑𝐂𝐄  ───━━━ ⌬`;

        await conn.sendMessage(m.chat, { 
            text: newsText.trim(), 
            contextInfo: getChannelContext(`${sportFeeds[args].nome} Feed`) 
        }, { quoted: m });

    } catch (error) {
        await conn.sendMessage(m.chat, { 
            text: `⌬ ❯ *ERRORE SISTEMA*\nImpossibile recuperare i dati.\nLog: ${error.message}` 
        }, { quoted: m });
    }
};

handler.help = ['fsport <categoria>'];
handler.tags = ['strumenti'];
handler.command = /^(fsport|sport|notizie|news)$/i;
handler.group = true;

export default handler;
