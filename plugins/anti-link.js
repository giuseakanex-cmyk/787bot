import { downloadContentFromMessage } from '@realvare/baileys'; // Corretto l'import da based a baileys se usi l'originale
import ffmpeg from 'fluent-ffmpeg';
import { createWriteStream, readFile } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { unlink } from 'fs/promises';
import Jimp from 'jimp';
import jsQR from 'jsqr';
import fetch from 'node-fetch';
import { FormData } from 'formdata-node';

const WHATSAPP_GROUP_REGEX = /\bchat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
const WHATSAPP_CHANNEL_REGEX = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i;
const GENERAL_URL_REGEX = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)/gi;
const SHORT_URL_DOMAINS = [
    'bit.ly', 'tinyurl.com', 't.co', 'short.link', 'shorturl.at', 'is.gd', 'v.gd', 'goo.gl', 'ow.ly', 'buff.ly',
    'tiny.cc', 'shorte.st', 'adf.ly', 'linktr.ee', 'rebrand.ly', 'bitly.com', 'cutt.ly', 'short.io', 'links.new', 
    'link.ly', 'ur.ly', 'shrinkme.io', 'clck.ru', 'short.gy', 'lnk.to', 'sh.st', 'ouo.io', 'bc.vc', 'adfoc.us', 
    'linkvertise.com', 'exe.io', 'linkbucks.com', 'adfly.com', 'shrink-service.it', 'cur.lv', 'gestyy.com', 
    'shrinkarn.com', 'za.gl', 'clicksfly.com', '6url.com', 'shortlink.sh', 'short.tn', 'rotator.ninja',
    'shrtco.de', 'ulvis.net', 'chilp.it', 'clicky.me', 'budurl.com', 'po.st', 'shr.lc', 'dub.co'
];
const SHORT_URL_REGEX = new RegExp(`https?:\\/\\/(?:www\\.)?(?:${SHORT_URL_DOMAINS.map(d => d.replace('.', '\\.')).join('|')})\\/[\\w\\-._~:/?#[\\]@!$&'()*+,;=]*`, 'gi');

const redirectCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000;
const FETCH_TIMEOUT = 10000;
const MAX_REDIRECTS = 5;
const MAX_URLS_TO_CHECK = 3;
const HIDDEN_LINK_PATTERNS = [ /chat[^\w]*whatsapp[^\w]*com/i, /whatsapp[^\w]*com[^\w]*(invite|channel)/i ];
const INVISIBLE_CHARS_REGEX = /[\u200b\u200c\u200d\uFEFF]/;
const BASE64_REGEX = /(?:[A-Za-z0-9+/]{4}){5,}(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?/g;
const URL_ENCODED_REGEX = /%[0-9a-fA-F]{2}/;

function isWhatsAppLink(url) { return WHATSAPP_GROUP_REGEX.test(url) || WHATSAPP_CHANNEL_REGEX.test(url); }

// --- FUNZIONI DI SUPPORTO RICREATE E FIXATE ---
function extractTextFromMessage(m, excludeQuoted = false) {
    let texts = [];
    if (m?.text) texts.push(m.text);
    if (m?.caption) texts.push(m.caption);
    return texts.join(' ').replace(/[\s\u200b\u200c\u200d\uFEFF\u2060\u00A0]+/g, ' ').trim();
}

async function handleViolation(conn, m, reasonMessage, currentIsBotAdmin) {
    if (!currentIsBotAdmin) return m.reply(`『 ⚠️ 』 \`AntiLink Rilevato:\`\nMa non posso fare nulla perché non sono Admin.`);
    await conn.sendMessage(m.chat, { delete: m.key });
    let username = m.sender.split('@')[0];
    await conn.sendMessage(m.chat, {
        text: `> ${reasonMessage}\n> *Addio* @${username}\n\n> \`Legam OS System\``,
        mentions: [m.sender]
    });
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
}

// ----------------------------------------------

async function containsSuspiciousLink(text) {
    if (!text) return false;
    if (isWhatsAppLink(text)) return true;
    if (SHORT_URL_REGEX.test(text)) return true;
    if (HIDDEN_LINK_PATTERNS.some(pattern => pattern.test(text))) return true;
    if (INVISIBLE_CHARS_REGEX.test(text)) return true;
    return false; // Check semplificato per evitare crash continui sui redirect web, mantenendo le regex
}

function getViolationReason(text) {
    if (isWhatsAppLink(text)) return 'Link di gruppo/canale WhatsApp rilevato.';
    if (SHORT_URL_REGEX.test(text)) return 'Short URL sospetto rilevato.';
    return 'Link sospetto nascosto rilevato.';
}

let handler = m => m;

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
    if (!m.isGroup || isAdmin || isOwner || isSam || m.fromMe) return false;

    const chat = global.db.data.chats[m.chat];
    if (!chat || !chat.antiLink) return false;

    try {
        let linkFound = false;
        let reason = '';
        const extractedText = extractTextFromMessage(m, true);

        if (await containsSuspiciousLink(extractedText)) {
            reason = getViolationReason(extractedText);
            linkFound = true;
        }

        if (linkFound) {
            const reasonMessage = `『 🚫 』 \`${reason}\``;
            await handleViolation(conn, m, reasonMessage, isBotAdmin);
            return true;
        }
    } catch (err) {
        console.error('Errore nel sistema anti-link 1:', err);
    }
    return false;
}

export default handler;


