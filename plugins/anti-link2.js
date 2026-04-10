import fetch from 'node-fetch'
import { FormData } from 'formdata-node'
import { downloadContentFromMessage } from '@realvare/baileys'
import Jimp from 'jimp'
import jsQR from 'jsqr'

const sonoilgattoperquestitopi = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)/gi;
const doms = {
    tiktok: ['tiktok.com', 'vm.tiktok.com', 'tiktok.it'],
    youtube: ['youtube.com', 'youtu.be', 'm.youtube.com'],
    telegram: ['telegram.me', 'telegram.org', 't.me'],
    facebook: ['facebook.com', 'fb.com', 'm.facebook.com'],
    instagram: ['instagram.com', 'instagr.am'],
    twitter: ['twitter.com', 'x.com'],
    discord: ['discord.gg', 'discord.com', 'discordapp.com'],
    twitch: ['twitch.tv', 'm.twitch.tv'],
    onlyfans: ['onlyfans.com']
};

async function getMediaBuffer(message) {
    try {
        let node = message?.message?.imageMessage || message?.message?.videoMessage;
        let type = message?.message?.videoMessage ? 'video' : 'image';
        if (!node) return null;

        const stream = await downloadContentFromMessage(node, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        return buffer;
    } catch (e) {
        return null;
    }
}

async function readQRCode(imageBuffer) {
    try {
        const img = await Jimp.read(imageBuffer);
        const { data, width, height } = img.bitmap;
        const clamped = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);
        const code = jsQR(clamped, width, height);
        return code?.data || null;
    } catch {
        return null;
    }
}

function extractTextFromMessage(m) {
    let texts = [];
    if (m?.text) texts.push(m.text);
    if (m?.message?.imageMessage?.caption) texts.push(m.message.imageMessage.caption);
    if (m?.message?.videoMessage?.caption) texts.push(m.message.videoMessage.caption);
    return texts.join(' ').trim();
}

function detectSocialLink(url) {
    if (!url) return null;
    const lowerUrl = url.toLowerCase();
    for (const [platform, domains] of Object.entries(doms)) {
        if (domains.some(domain => lowerUrl.includes(domain))) return platform;
    }
    return null;
}

let handler = m => m;

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
    if (!m.isGroup || isAdmin || isOwner || isSam || m.fromMe) return false;
    
    const chat = global.db.data.chats[m.chat];
    if (!chat || !chat.antiLink2) return false;

    try {
        const extractedText = extractTextFromMessage(m);
        let detectedPlatform = null;
        let isQR = false;

        // 1. Controllo Testo
        if (extractedText) {
            const urls = extractedText.match(sonoilgattoperquestitopi) || [];
            for (const url of urls) {
                detectedPlatform = detectSocialLink(url);
                if (detectedPlatform) break;
            }
        }

        // 2. Controllo Immagini per QR Code
        if (!detectedPlatform && (m.mtype === 'imageMessage')) {
            const media = await getMediaBuffer(m);
            if (media) {
                const qrData = await readQRCode(media);
                if (qrData) {
                    detectedPlatform = detectSocialLink(qrData);
                    if (detectedPlatform) isQR = true;
                }
            }
        }

        // --- SISTEMA DI PUNIZIONE (3 AVVISI) ---
        if (detectedPlatform) {
            if (!isBotAdmin) return false; // Deve essere admin

            const user = global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
            user.antiLink2Warns = (user.antiLink2Warns || 0) + 1;

            await conn.sendMessage(m.chat, { delete: m.key });

            let msgTipo = isQR ? `QR con link` : `link`;

            if (user.antiLink2Warns < 3) {
                await conn.sendMessage(m.chat, {
                    text: `> 『 ⚠️ 』 Avviso ${user.antiLink2Warns}/3 per ${msgTipo} *${detectedPlatform.toUpperCase()}*.\nAl terzo avviso verrai rimosso.\n\n> \`Legam OS System\``,
                    mentions: [m.sender]
                });
            } else {
                user.antiLink2Warns = 0;
                let username = m.sender.split('@')[0];
                await conn.sendMessage(m.chat, {
                    text: `> 『 🛑 』 \`${msgTipo.toUpperCase()} ${detectedPlatform.toUpperCase()} RILEVATO.\`\n*Hai raggiunto i 3 avvisi. Ciao ciao* @${username}\n\n> \`Legam OS System\``,
                    mentions: [m.sender]
                });
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            }
            return true;
        }

    } catch (error) {
        console.error('[ANTILINK SOCIAL] Errore:', error);
    }

    return false;
}

export default handler;


