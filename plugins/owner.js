let handler = async (m, { conn, usedPrefix }) => {
    // Reazione di protocollo
    await conn.sendMessage(m.chat, { react: { text: '⌬', key: m.key } });

    const ownerInstagram = "https://www.instagram.com/giuse0_9?igsh=dmhmczV2MHd5ZjJ0&utm_source=qr";
    
    const textMsg = `
⌬ ━━━───  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ───━━━ ⌬

⌬ ❯ **𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎**
· Nome ➻ GIUSE
· Ruolo ➻ Developer & Architecture
· Core ➻ 787 SYSTEM

⌬ ❯ **𝐒𝐎𝐂𝐈𝐀𝐋**
· Instagram ➻ @tessere___
· Profilo ➻ ${global.insta}

⌬ ❯ **𝐒𝐓𝐀𝐓𝐔𝐒**
· Disponibilità ➻ Online
· Priorità ➻ Massima

"Perché mai dovrei odiare qualcuno più debole di me? 
Provo solo pietà. L'architettura del sistema è 
stata plasmata per la perfezione assoluta."

⌬ ━━━───  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ───━━━ ⌬`.trim();

    await conn.sendMessage(m.chat, {
        text: textMsg,
        contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363233544482011@newsletter',
                newsletterName: "𝟕𝟖𝟕 𝐒𝐘𝐒𝐓𝐄𝐌 𝐎𝐕𝐄𝐑𝐑𝐈𝐃𝐄",
                serverMessageId: 100
            },
            externalAdReply: {
                showAdAttribution: true,
                title: "𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  𝐀 𝐔 𝐓 𝐇 𝐎 𝐑",
                body: "Override by Giuse",
                mediaType: 1,
                renderLargerThumbnail: true,
                thumbnailUrl: global.logoLegam, 
                sourceUrl: ownerInstagram
            }
        }
    }, { quoted: m });
}

handler.help = ['owner', 'creatore']
handler.tags = ['info']
handler.command = /^(owner|creatore|dev|sviluppatore)$/i

export default handler
