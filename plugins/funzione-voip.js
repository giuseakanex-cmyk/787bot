import axios from 'axios';
import * as cheerio from 'cheerio';

const baseUrl = 'https://sms24.me';

// --- CONFIGURAZIONE ESTETICA LEGΛM OS ---
const legamHeader = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n·  𝐋 𝐄 𝐆 𝐀 𝐌  𝐕 𝐎 𝐈 𝐏  ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
const legamFooter = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n. . ✦  .  ⁺  .  ✦  . .`;

const nazioni = [
    { id: '1', nome: 'Stati Uniti 🇺🇸', path: '/en/countries/us' },
    { id: '2', nome: 'Regno Unito 🇬🇧', path: '/en/countries/gb' },
    { id: '3', nome: 'Francia 🇫🇷', path: '/en/countries/fr' },
    { id: '4', nome: 'Svezia 🇸🇪', path: '/en/countries/se' },
    { id: '5', nome: 'Germania 🇩🇪', path: '/en/countries/de' },
    { id: '6', nome: 'Italia 🇮🇹', path: '/en/countries/it' },
    { id: '7', nome: 'Olanda 🇳🇱', path: '/en/countries/nl' },
    { id: '8', nome: 'Spagna 🇪🇸', path: '/en/countries/es' },
    { id: '9', nome: 'Canada 🇨🇦', path: '/en/countries/ca' },
    { id: '10', nome: 'Belgio 🇧🇪', path: '/en/countries/be' },
    { id: '11', nome: 'Austria 🇦🇹', path: '/en/countries/at' },
    { id: '12', nome: 'Danimarca 🇩🇰', path: '/en/countries/dk' },
    { id: '13', nome: 'Polonia 🇵🇱', path: '/en/countries/pl' },
    { id: '14', nome: 'Portogallo 🇵🇹', path: '/en/countries/pt' },
    { id: '15', nome: 'Russia 🇷🇺', path: '/en/countries/ru' },
    { id: '16', nome: 'Estonia 🇪🇪', path: '/en/countries/ee' },
    { id: '17', nome: 'Lettonia 🇱🇻', path: '/en/countries/lv' },
    { id: '18', nome: 'Lituania 🇱🇹', path: '/en/countries/lt' },
    { id: '19', nome: 'Rep. Ceca 🇨🇿', path: '/en/countries/cz' },
    { id: '20', nome: 'Romania 🇷🇴', path: '/en/countries/ro' },
    { id: '21', nome: 'Croazia 🇭🇷', path: '/en/countries/hr' },
    { id: '22', nome: 'Hong Kong 🇭🇰', path: '/en/countries/hk' },
    { id: '23', nome: 'Cina 🇨🇳', path: '/en/countries/cn' },
    { id: '24', nome: 'Malesia 🇲🇾', path: '/en/countries/my' },
    { id: '25', nome: 'Indonesia 🇮🇩', path: '/en/countries/id' },
    { id: '26', nome: 'Filippine 🇵🇭', path: '/en/countries/ph' },
    { id: '27', nome: 'Thailandia 🇹🇭', path: '/en/countries/th' },
    { id: '28', nome: 'Vietnam 🇻🇳', path: '/en/countries/vn' },
    { id: '29', nome: 'Sudafrica 🇿🇦', path: '/en/countries/za' },
    { id: '30', nome: 'Brasile 🇧🇷', path: '/en/countries/br' },
    { id: '31', nome: 'Messico 🇲🇽', path: '/en/countries/mx' },
    { id: '32', nome: 'India 🇮🇳', path: '/en/countries/in' },
    { id: '33', nome: 'Ucraina 🇺🇦', path: '/en/countries/ua' },
    { id: '34', nome: 'Svizzera 🇨🇭', path: '/en/countries/ch' },
    { id: '35', nome: 'Irlanda 🇮🇪', path: '/en/countries/ie' },
    { id: '36', nome: 'Norvegia 🇳🇴', path: '/en/countries/no' },
    { id: '37', nome: 'Australia 🇦🇺', path: '/en/countries/au' },
    { id: '38', nome: 'Israele 🇮🇱', path: '/en/countries/il' },
    { id: '39', nome: 'Kazakistan 🇰🇿', path: '/en/countries/kz' },
    { id: '40', nome: 'Finlandia 🇫🇮', path: '/en/countries/fi' }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sendLegam = async (conn, m, text) => {
    return await conn.sendMessage(m.chat, {
        text: text,
        contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363259442839354@newsletter',
                newsletterName: "✨.✦★彡 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐒𝐲𝐬𝐭𝐞𝐦 Ξ★✦.•",
                serverMessageId: 100
            }
        }
    }, { quoted: m });
};

async function fetchMessaggi(num) {
    try {
        const { data } = await axios.get(`${baseUrl}/en/numbers/${num.replace('+', '')}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const $ = cheerio.load(data);
        let logs = [];
        $('.shadow-sm, .list-group-item, .callout').each((i, el) => {
            let mitt = $(el).find('a').first().text().trim() || 'System';
            let time = $(el).find('.text-info, .text-muted, small').first().text().trim() || 'Poco fa';
            let txt = $(el).text().replace(/\s+/g, ' ').replace(mitt, '').replace(time, '').replace('From:', '').replace('Copy', '').trim();
            if (txt.length > 2) logs.push({ mitt, time, txt });
        });
        return logs;
    } catch { return null; }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const cmd = command.toLowerCase();
    const arg = args[0] ? args[0].toLowerCase() : null;

    // --- MENUVOIP ---
    if (cmd === 'menuvoip') {
        let text = `${legamHeader}\n\n『 🛠️ 』 𝐌 𝐄 𝐍 𝐔  𝐂 𝐎 𝐌 𝐀 𝐍 𝐃 𝐈\n`;
        text += `· 𝐍𝐚𝐳𝐢𝐨𝐧𝐢 ➻ ${usedPrefix}voip\n`;
        text += `· 𝐆𝐞𝐧𝐞𝐫𝐚 ➻ ${usedPrefix}voip <ID>\n`;
        text += `· 𝐅𝐫𝐞𝐬𝐜𝐡𝐢 ➻ ${usedPrefix}lastvoips\n`;
        text += `· 𝐑𝐚𝐝𝐚𝐫 ➻ ${usedPrefix}regvoip <Num>\n`;
        text += `· 𝐋𝐨𝐠𝐬 ➻ ${usedPrefix}voip sms <Num>\n\n${legamFooter}`;
        return sendLegam(conn, m, text);
    }

    // --- LASTVOIPS ---
    if (cmd === 'lastvoips') {
        try {
            const { data } = await axios.get(baseUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const $ = cheerio.load(data);
            let ultimi = [];
            
            // Scraper infallibile per la homepage
            $('a').each((i, el) => {
                let t = $(el).text().trim();
                if (t.includes('+') && t.replace(/[^0-9]/g, '').length >= 8) {
                    let n = t.replace(/[^0-9]/g, '');
                    if (!ultimi.some(x => x.num === n)) ultimi.push({ num: n });
                }
            });
            
            if (ultimi.length === 0) return m.reply("❌ Nessun numero recente trovato in Homepage.");

            let text = `${legamHeader}\n\n『 🔥 』 𝐋 𝐀 𝐒 𝐓  𝐕 𝐎 𝐈 𝐏 𝐒\n`;
            ultimi.slice(0, 10).forEach((n, i) => {
                text += `· [${i+1}] ➻ +${n.num}\n`;
            });
            text += `\n${legamFooter}`;
            return sendLegam(conn, m, text);
        } catch { return m.reply("❌ Errore critico Core."); }
    }

    // --- REGVOIP (RADAR) ---
    if (cmd === 'regvoip') {
        const num = args[0]?.replace('+', '').replace(/\s+/g, '');
        if (!num) return m.reply("Specifica un numero per il radar.");
        
        await sendLegam(conn, m, `${legamHeader}\n\n『 📡 』 𝐑 𝐀 𝐃 𝐀 𝐑  𝐀 𝐓 𝐓 𝐈 𝐕 𝐎\n· 𝐍𝐮𝐦𝐞𝐫𝐨 ➻ +${num}\n· 𝐒𝐭𝐚𝐭𝐨 ➻ In ascolto per 3 min...\n\n${legamFooter}`);
        
        let old = await fetchMessaggi(num);
        let oldTxt = (old && old.length > 0) ? old[0].txt : "EMPTY";

        for (let i = 0; i < 18; i++) {
            await sleep(10000);
            let now = await fetchMessaggi(num);
            if (now && now[0] && now[0].txt !== oldTxt) {
                let text = `${legamHeader}\n\n『 🔓 』 𝐒 𝐌 𝐒  𝐈 𝐍 𝐓 𝐄 𝐑 𝐂 𝐄 𝐓 𝐓 𝐀 𝐓 𝐎\n`;
                text += `· 𝐃𝐚 ➻ ${now[0].mitt}\n`;
                text += `· 𝐓𝐞𝐦𝐩𝐨 ➻ ${now[0].time}\n`;
                text += `· 𝐂𝐨𝐝𝐢𝐜𝐞 ➻ ${now[0].txt}\n\n${legamFooter}`;
                return sendLegam(conn, m, text);
            }
        }
        return sendLegam(conn, m, `${legamHeader}\n\n『 ❌ 』 𝐓 𝐈 𝐌 𝐄 𝐎 𝐔 𝐓\n· Nessun pacchetto rilevato.\n\n${legamFooter}`);
    }

    // --- VOIP (NAZIONI / SMS) ---
    if (cmd === 'voip') {
        if (!arg) {
            let text = `${legamHeader}\n\n『 🌍 』 𝐍 𝐀 𝐙 𝐈 𝐎 𝐍 𝐈\n`;
            for(let i=0; i<nazioni.length; i+=2) {
                let c1 = `${nazioni[i].id}.${nazioni[i].nome}`.padEnd(16);
                let c2 = nazioni[i+1] ? `${nazioni[i+1].id}.${nazioni[i+1].nome}` : '';
                text += `· ${c1} · ${c2}\n`;
            }
            text += `\n${legamFooter}`;
            return sendLegam(conn, m, text);
        }

        if (arg === 'sms') {
            const target = args[1]?.replace('+', '');
            if (!target) return m.reply("Inserisci il numero.");
            let logs = await fetchMessaggi(target);
            if (!logs || !logs.length) return m.reply("Nessun log trovato.");
            let text = `${legamHeader}\n\n『 📩 』 𝐀 𝐑 𝐂 𝐇 𝐈 𝐕 𝐈 𝐎  𝐒 𝐌 𝐒\n· 𝐍𝐮𝐦𝐞𝐫𝐨 ➻ +${target}\n\n`;
            logs.slice(0, 5).forEach(l => text += `· ${l.mitt} (${l.time})\n  ➻ ${l.txt}\n\n`);
            text += legamFooter;
            return sendLegam(conn, m, text);
        }

        const naz = nazioni.find(n => n.id === arg);
        if (naz) {
            try {
                const { data } = await axios.get(`${baseUrl}${naz.path}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                const $ = cheerio.load(data);
                let found = [];
                $('a').each((i, el) => {
                    let t = $(el).text().trim();
                    if (t.includes('+') && t.replace(/[^0-9]/g, '').length >= 8) {
                        let n = t.replace(/[^0-9]/g, '');
                        if (!found.includes(n)) found.push(n);
                    }
                });
                let text = `${legamHeader}\n\n『 🔍 』 𝐍 𝐔 𝐌 𝐄 𝐑 𝐈  𝐅 𝐑 𝐄 𝐒 𝐂 𝐇 𝐈\n· 𝐍𝐚𝐳𝐢𝐨𝐧𝐞 ➻ ${naz.nome}\n\n`;
                found.slice(0, 5).forEach(n => text += `· ➔ +${n}\n`);
                text += `\n${legamFooter}`;
                return sendLegam(conn, m, text);
            } catch { return m.reply("Errore connessione sito."); }
        }
    }
};

handler.help = ['voip', 'regvoip', 'lastvoips', 'menuvoip'];
handler.tags = ['strumenti'];
handler.command = /^(voip|regvoip|lastvoips|menuvoip)$/i;

export default handler;

