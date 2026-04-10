
import fs from 'fs'
import path from 'path'
import os from 'os'
import { exec } from 'child_process'

// 🔥 SCUDO VIP LEGAM OS 🔥
const legamContext = (title) => ({
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363259442839354@newsletter',
        serverMessageId: 100,
        newsletterName: `🎛️ ${title}`
    }
});

// 🎛️ MOTORE AUDIO LEGAM (Formule FFmpeg Garantite al 100%)
const effettiLegam = {
    'bass': 'equalizer=f=60:width_type=h:width=50:g=15',
    '8d': 'apulsator=hz=0.125',
    'demone': 'asetrate=44100*0.7,acrusher=0.1:1:64:0:log',
    'alieno': 'asetrate=44100*1.15,atempo=0.85,aecho=0.8:0.8:50:0.5',
    'robot': 'afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75',
    'scoiattolo': 'asetrate=44100*1.35,atempo=0.85',
    'nightcore': 'atempo=1.06,asetrate=44100*1.25',
    'slowed': 'asetrate=44100*0.85,aresample=44100,aecho=0.8:0.8:250:0.5',
    'lofi': 'asetrate=44100*0.9,atempo=0.9,lowpass=f=2500,highpass=f=100,aecho=0.8:0.8:250:0.3', // 🔥 NUOVO: Effetto Lofi Chill
    '8bit': 'acrusher=level_in=8:level_out=18:bits=4:mode=log:aa=1', // 🔥 NUOVO: Videogioco Retro
    'lento': 'atempo=0.75',
    'veloce': 'atempo=1.5',
    'sottacqua': 'asetrate=44100*0.7,atempo=1.2,lowpass=f=300',
    'radio': 'bandpass=f=1200:width_type=h,highpass=f=200,lowpass=f=2600',
    'telefono': 'highpass=f=800,lowpass=f=2500',
    'eco': 'aecho=0.8:0.9:500:0.5',
    'tremolo': 'tremolo=f=6.0:d=0.8',
    'reverse': 'areverse',
    'earrape': 'volume=5.0,alimiter=limit=0.95'
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. MENU ELEGANTE SE NON SI SPECIFICA L'EFFETTO
    let targetEffect = args[0]?.toLowerCase();

    if (!targetEffect || !effettiLegam[targetEffect]) {
        let listaEffetti = Object.keys(effettiLegam).map(e => `│ ➭ *${e}*`).join('\n');
        let menu = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🎛️ 𝐋𝐄𝐆𝐀𝐌 𝐒𝐎𝐔𝐍𝐃 𝐒𝐓𝐔𝐃𝐈𝐎 🎛️ ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 💡 』 *𝐂𝐨𝐦𝐞 𝐬𝐢 𝐮𝐬𝐚:*
Rispondi a un audio o a un vocale scrivendo:
*${usedPrefix}${command} [nome_effetto]*

╭── 🎚️ 𝐄𝐅𝐅𝐄𝐓𝐓𝐈 𝐃𝐈𝐒𝐏𝐎𝐍𝐈𝐁𝐈𝐋𝐈 ──⬣
${listaEffetti}
╰───────────────⬣

📌 *Esempio:* \`${usedPrefix}${command} slowed\`
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        return conn.sendMessage(m.chat, { text: menu, contextInfo: legamContext('Mixer Audio') }, { quoted: m });
    }

    // 2. CONTROLLO MESSAGGIO
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    if (!/audio/.test(mime)) {
        return m.reply('『 ⚠️ 』 \`Devi rispondere a una nota vocale o a un file audio!\`');
    }

    try {
        await conn.sendPresenceUpdate('recording', m.chat);
        await m.react('⏳');

        // 3. PREPARAZIONE FILE TEMPORANEI
        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `legam_in_${Date.now()}.tmp`);
        const outputPath = path.join(tmpDir, `legam_out_${Date.now()}.mp3`); 

        // Scarica l'audio originale
        let audioData = await q.download();
        fs.writeFileSync(inputPath, audioData);

        // 4. ELABORAZIONE CON FFMPEG
        let filtro = effettiLegam[targetEffect];
        let flag = (targetEffect === 'robot' || targetEffect === 'reverse' || targetEffect === '8bit') ? '-filter_complex' : '-af';
        
        let comandoFFmpeg = `ffmpeg -i "${inputPath}" ${flag} "${filtro}" -vn -ar 44100 -ac 2 -b:a 128k "${outputPath}"`;

        await new Promise((resolve, reject) => {
            exec(comandoFFmpeg, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // 5. INVIO COME BRANO MP3 (Anti-Crash per iOS)
        let audioModificato = fs.readFileSync(outputPath);

        await conn.sendMessage(m.chat, {
            audio: audioModificato,
            mimetype: 'audio/mpeg',
            fileName: `LegamFX_${targetEffect.toUpperCase()}.mp3`,
            ptt: false, 
            contextInfo: legamContext(`Effetto: ${targetEffect.toUpperCase()}`)
        }, { quoted: m });

        await m.react('✅');

        // 6. PULIZIA SERVER
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    } catch (e) {
        console.error("[LEGAM AUDIO FX ERROR]", e);
        await m.react('❌');
        m.reply('『 ❌ 』 \`Errore del mixer audio.\` _Assicurati che il file originale non sia corrotto._');
    } finally {
        await conn.sendPresenceUpdate('paused', m.chat);
    }
}

handler.help = ['fx <effetto>'];
handler.tags = ['strumenti'];
handler.command = /^(fx|effetto|audio|mix)$/i;

export default handler;


