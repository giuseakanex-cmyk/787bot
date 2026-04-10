
import os from 'os';
import { performance } from 'perf_hooks';

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const uptimeMs = process.uptime() * 1000;
    const uptimeStr = clockString(uptimeMs);

    // Calcolo ping effettivo (misurando un micro-task)
    const startTime = performance.now();
    await new Promise(resolve => setTimeout(resolve, 1));
    const endTime = performance.now();
    const speed = (endTime - startTime).toFixed(4);

    const botName = global.db?.data?.nomedelbot || "𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒";

    const textMsg = `✧ꉧ 𝐏𝐢𝐧𝐠  𝐕 𝐈 𝐏 ꉧ✧
│
├─ ⚡ 𝐒𝐏𝐄𝐄𝐃: ${speed} ms
└─ ⏳ 𝐔𝐏𝐓𝐈𝐌𝐄: ${uptimeStr}

『 💎 』 𝐒𝐓𝐀𝐓𝐔𝐒: 𝐎𝐏𝐓𝐈𝐌𝐀𝐋`;

    await conn.sendMessage(m.chat, {
      text: textMsg,
      contextInfo: {
        externalAdReply: {
          title: `📡 ${botName} - Network Status`,
          body: `Ping: ${speed} ms | Online: ${uptimeStr}`,
          thumbnailUrl: 'https://qu.ax/fmHdc.png',
          sourceUrl: '',
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
      /* Nota: i bottoni nativi (buttons[]) sono spesso deprecati 
         o non visualizzati su tutte le versioni di WA. 
         Il testo sopra rimane il metodo più sicuro.
      */
    }, { quoted: m });

  } catch (err) {
    console.error("Errore nell'handler pingv:", err);
  }
};

function clockString(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor(ms / 3600000) % 24;
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  let str = '';
  if (d > 0) str += `${d}d `;
  if (h > 0) str += `${h}h `;
  if (m > 0) str += `${m}m `;
  str += `${s}s`;
  return str;
}

handler.help = ['pingv'];
handler.tags = ['info'];
handler.command = /^(pingv)$/i;
handler.premium = false;

export default handler;


