import os from 'os';
import { performance } from 'perf_hooks';

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const startTime = performance.now();
    const endTime = performance.now();
    const latenza = (endTime - startTime).toFixed(4);

    const uptimeMs = process.uptime() * 1000;
    const uptimeStr = clockString(uptimeMs);
    const ramBot = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);

    const textMsg = `
 ━━━──  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──━━━ 

█ ⚡ **LATENZA** ↳ Protocollo: ${latenza} ms

█ ⏳ **RUNTIME**
↳ Attivo da: ${uptimeStr}

█ 🧠 **RESOURCES**
↳ RAM: ${ramBot} MB

⌬ ━━━──  𝐒𝐘𝐒𝐓𝐄𝐌 𝐎𝐕𝐄𝐑𝐑𝐈𝐃𝐄  ──━━━ ⌬`.trim();

    await conn.sendMessage(m.chat, {
      text: textMsg,
      footer: "✧ 𝟕 𝟖 𝟕 ✧",
      buttons: [
        { buttonId: usedPrefix + "stats", buttonText: { displayText: "𝐒𝐭𝐚𝐭𝐬" }, type: 1 },
        { buttonId: usedPrefix + "menu", buttonText: { displayText: "𝐌𝐞𝐧𝐮" }, type: 1 },
        { buttonId: usedPrefix + "ds", buttonText: { displayText: "𝐒𝐯𝐮𝐨𝐭𝐚 𝐒𝐞𝐬𝐬𝐢𝐨𝐧𝐢" }, type: 1 }
      ],
      headerType: 1,
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363233544482011@newsletter',
          newsletterName: "𝟕𝟖𝟕 𝐒𝐘𝐒𝐓𝐄𝐌: 𝐎𝐕𝐄𝐑𝐑𝐈𝐃𝐄",
          serverMessageId: 100
        }
      }
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    m.reply("⌬ ❯ `SYSTEM_FAILURE` ");
  }
};

function clockString(ms) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor(ms / 3600000) % 24;
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [d, h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

handler.help = ['ping'];
handler.tags = ['info'];
handler.command = /^(ping)$/i;

export default handler;
