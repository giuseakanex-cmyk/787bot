import os from 'os';
import process from 'process';
import { performance } from 'perf_hooks';

const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

const fancyClock = (ms) => {
    const d = Math.floor(ms / (1000 * 60 * 60 * 24));
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const m = Math.floor((ms / (1000 * 60)) % 60);
    const s = Math.floor((ms / 1000) % 60);
    return [
        d > 0 ? `${d}g` : '',
        h > 0 ? `${h}h` : '',
        m > 0 ? `${m}m` : '',
        `${s}s`
    ].filter(Boolean).join(' ');
}

const handler = async (m, { conn }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } });
        
        const old = performance.now();
        const cpus = os.cpus();
        const cpuModel = cpus[0].model.trim();
        const cpuCores = cpus.length;
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const nodeMem = process.memoryUsage().rss;
        const uptime = fancyClock(process.uptime() * 1000);
        const osUptime = fancyClock(os.uptime() * 1000);
        const platform = os.platform();
        const arch = os.arch();
        const hostname = os.hostname();
        
        const neww = performance.now();
        const speed = (neww - old).toFixed(4);

        const text = `
⌬ ━━━──  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──━━━ ⌬

█ 📡 **NETWORK STATUS**
↳ Ping: ${speed} ms
↳ Bot Uptime: ${uptime}
↳ Host Uptime: ${osUptime}

█ 💾 **MEMORY STORAGE**
↳ RAM Totale: ${formatBytes(totalMem)}
↳ RAM Usata: ${formatBytes(usedMem)}
↳ RAM Bot: ${formatBytes(nodeMem)}

█ 💻 **HARDWARE INFO**
↳ CPU: ${cpuModel}
↳ Threads: ${cpuCores}
↳ OS: ${platform} (${arch})
↳ Host: ${hostname}

█ 👑 **AUTHORITY**
↳ Root: GIUSE

⌬ ━━━──  𝐒𝐘𝐒𝐓𝐄𝐌 𝐎𝐕𝐄𝐑𝐑𝐈𝐃𝐄  ──━━━ ⌬`.trim();

        await conn.sendMessage(m.chat, {
            text: text,
            contextInfo: {
                mentionedJid: [m.sender],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363259442839354@newsletter',
                    newsletterName: "𝟕𝟖𝟕 𝐒𝐘𝐒𝐓𝐄𝐌: 𝐂𝐎𝐑𝐄 𝐈𝐍𝐅𝐎",
                    serverMessageId: 100
                }
            }
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        m.reply("⌬ ❯ `SYSTEM_ERROR: ACCESS_DENIED_TO_CORE` ");
    }
}

handler.help = ['speed', 'info', 'system']
handler.tags = ['info']
handler.command = /^(speed|info|system)$/i

export default handler
