
import yts from 'yt-search';
import fg from 'api-dylux';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// --- CONFIGURAZIONE ESTETICA LEGΛM OS ---
const legamContext = {
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363259442839354@newsletter',
        newsletterName: "✨.✦★彡 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐒𝐲𝐬𝐭𝐞𝐦 Ξ★✦.•",
        serverMessageId: 100
    }
};

const legamHeader = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n·  𝐋 𝐄 𝐆 𝐀 𝐌  𝐏 𝐋 𝐀 𝐘 𝐄 𝐑  ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
const legamFooter = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n. . ✦  .  ⁺  .  ✦  . .`;

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // 1. Nessun testo inserito
  if (!text) {
      let msg = `${legamHeader}\n\n『 💡 』 𝐒 𝐈 𝐍 𝐓 𝐀 𝐒 𝐒 𝐈\n· 𝐔𝐬𝐨 ➻ ${usedPrefix + command} <nome canzone>\n\n${legamFooter}`;
      return conn.sendMessage(m.chat, { text: msg, contextInfo: legamContext }, { quoted: m });
  }

  try {
    const search = await yts(text);
    const vid = search.videos[0];
    
    // 2. Risultato non trovato
    if (!vid) {
        let msg = `${legamHeader}\n\n『 ❌ 』 𝐄 𝐑 𝐑 𝐎 𝐑 𝐄\n· Nessun risultato trovato.\n\n${legamFooter}`;
        return conn.sendMessage(m.chat, { text: msg, contextInfo: legamContext }, { quoted: m });
    }

    const url = vid.url;

    // 3. Menu principale di Play (con Immagine, Bottoni e Fake Channel)
    if (command === 'play') {
        let infoMsg = `${legamHeader}\n\n`;
        infoMsg += `『 🎵 』 𝐈 𝐍 𝐅 𝐎  𝐓 𝐑 𝐀 𝐂 𝐂 𝐈 𝐀\n`;
        infoMsg += `· 𝐓𝐢𝐭𝐨𝐥𝐨 ➻ ${vid.title}\n`;
        infoMsg += `· 𝐃𝐮𝐫𝐚𝐭𝐚 ➻ ${vid.timestamp}\n\n`;
        infoMsg += `${legamFooter}`;

        return await conn.sendMessage(m.chat, {
            image: { url: vid.thumbnail },
            caption: infoMsg,
            footer: '𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒',
            buttons: [
                { buttonId: `${usedPrefix}playaud ${url}`, buttonText: { displayText: '🎵 𝐀𝐔𝐃𝐈𝐎 (𝐌𝐏𝟑)' }, type: 1 },
                { buttonId: `${usedPrefix}playvid ${url}`, buttonText: { displayText: '🎬 𝐕𝐈𝐃𝐄𝐎 (𝐌𝐏𝟒)' }, type: 1 }
            ],
            headerType: 4,
            contextInfo: legamContext
        }, { quoted: m });
    }

    // Rotellina di caricamento stile sistema operativo
    await conn.sendMessage(m.chat, { react: { text: "⚙️", key: m.key } });

    let downloadUrl = null;
    const isAudio = command === 'playaud';

    try {
        let res = isAudio ? await fg.yta(url) : await fg.ytv(url);
        if (res && res.dl_url) downloadUrl = res.dl_url;
    } catch {
        let api = isAudio ? 'ytmp3' : 'ytmp4';
        let res = await fetch(`https://api.vreden.my.id/api/${api}?url=${url}`);
        let json = await res.json();
        downloadUrl = json.result?.download?.url || json.result?.url;
    }

    if (!downloadUrl) throw new Error();

    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `input_${Date.now()}`);
    const outputPath = path.join(tmpDir, `output_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`);

    const res = await fetch(downloadUrl);
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(inputPath, Buffer.from(arrayBuffer));

    // 4. Invio file con Fake Channel integrato
    if (isAudio) {
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${inputPath} -vn -ar 44100 -ac 2 -b:a 128k ${outputPath}`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        await conn.sendMessage(m.chat, {
            audio: fs.readFileSync(outputPath),
            mimetype: 'audio/mpeg',
            fileName: `${vid.title}.mp3`,
            ptt: false,
            contextInfo: legamContext
        }, { quoted: m });
    } else {
        await conn.sendMessage(m.chat, {
            video: fs.readFileSync(inputPath),
            mimetype: 'video/mp4',
            caption: `✨ *𝐒𝐜𝐚𝐫𝐢𝐜𝐚𝐭𝐨 𝐜𝐨𝐧 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒*`,
            contextInfo: legamContext
        }, { quoted: m });
    }

    // Pulizia
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (e) {
    console.error(e);
    let errorMsg = `${legamHeader}\n\n『 ❌ 』 𝐄 𝐑 𝐑 𝐎 𝐑 𝐄\n· File non disponibile o server offline.\n\n${legamFooter}`;
    await conn.sendMessage(m.chat, { text: errorMsg, contextInfo: legamContext }, { quoted: m });
  }
};

handler.help = ['play'];
handler.tags = ['strumenti'];
handler.command = /^(play|playaud|playvid)$/i;

export default handler;
