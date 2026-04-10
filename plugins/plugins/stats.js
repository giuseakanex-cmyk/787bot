import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Percorsi ai file del tuo plugin Last.fm
const USERS_FILE = path.join(__dirname, '..', 'lastfm_users.json');
const LIKES_FILE = path.join(__dirname, '..', 'song_likes.json');

// --- HELPER GRAFICI CANVAS ---
function fillRoundRect(ctx, x, y, w, h, r, fillColor) {
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
}

function drawBadge(ctx, text, x, y, icon = '') {
    ctx.font = 'bold 16px sans-serif';
    const fullText = icon + (icon ? ' ' : '') + text;
    const textWidth = ctx.measureText(fullText).width;
    const paddingX = 16;
    const height = 34; 
    
    // Sfondo badge (Blu Notte Premium)
    fillRoundRect(ctx, x, y, textWidth + (paddingX * 2), height, height / 2, '#1e3a8a');
    
    // Testo badge (Blu Ghiaccio)
    ctx.fillStyle = '#bfdbfe'; 
    ctx.fillText(fullText, x + paddingX, y + 23);
}

// --- ESTRAZIONE FUOCHI (LAST.FM) ---
function getFuochiRicevuti(userId) {
    try {
        if (!fs.existsSync(USERS_FILE) || !fs.existsSync(LIKES_FILE)) return 0;
        
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        const likes = JSON.parse(fs.readFileSync(LIKES_FILE, 'utf8'));
        
        const userLastfm = users[userId];
        if (!userLastfm) return 0;

        let totalLikes = 0;
        for (const songId in likes) {
            const parts = songId.split('_');
            if (parts.length > 0 && parts[0].toLowerCase() === userLastfm.toLowerCase()) {
                totalLikes += likes[songId].likes || 0;
            }
        }
        return totalLikes;
    } catch (e) {
        return 0; 
    }
}

let handler = async (m, { conn, usedPrefix }) => {
    
    const cuContext = {
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363259442839354@newsletter',
            serverMessageId: 100,
            newsletterName: `𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 ✦ Statistiche`
        }
    }

    let createCanvas, loadImage;
    try {
        const canvasLib = await import('canvas');
        createCanvas = canvasLib.createCanvas;
        loadImage = canvasLib.loadImage;
    } catch (e) {
        return m.reply("୧・︶ ❌ ︶・୨ \`ERRORE GRAFICO:\`\nInstalla il motore grafico digitando nel terminale:\n*npm install canvas* ꒷꒦");
    }

    try {
        await m.react('⏳');

        // ==========================================
        // 1. DETERMINA IL TARGET E FIX BOTTONI (La Magia)
        // ==========================================
        let who = m.sender; // Di base è chi invia il comando
        
        if (m.mentionedJid && m.mentionedJid[0]) {
            who = m.mentionedJid[0]; // Se tagga qualcuno, prende il taggato
        } else if (m.quoted && !m.quoted.fromMe) {
            who = m.quoted.sender; // Se risponde a un utente (NON AL BOT), prende quell'utente
        }

        // ==========================================
        // 2. ESTRAZIONE DATI UTENTE
        // ==========================================
        let user = global.db.data.users[who] || {};
        let chat = global.db.data.chats[m.chat] || {};
        
        let number = who.split('@')[0];
        
        let currentPushName = await conn.getName(who);
        let name = (who === m.sender ? m.pushName : currentPushName) || user.name || 'Utente';
        
        let firstTime = user.firstTime || Date.now();
        let daysActive = Math.max(1, Math.floor((Date.now() - firstTime) / 86400000));
        
        let saldo = user.euro || 0;
        let coins = user.money || 0;
        
        // Sistema Messaggi Auto-Correttivo
        let msgOggi = (chat.ranking && chat.ranking.utenti && chat.ranking.utenti[who]) ? Number(chat.ranking.utenti[who]) : 0;
        let msgTotali = Number(user.messaggi || 0);
        
        if (msgTotali < msgOggi) {
            msgTotali = msgOggi;
            if (global.db.data.users[who]) global.db.data.users[who].messaggi = msgTotali;
        }

        let mediaMsg = (msgTotali / daysActive).toFixed(1);
        
        let fuochi = getFuochiRicevuti(who);
        let livello = user.level || 0;
        
        let totalWarns = Number(user.warn || 0);
        let maxWarns = 3; 
        
        let role = 'Legam OS';
        let roleIcon = global.owner.some(([n]) => n === number) ? '👑' : '⚡';

        // ==========================================
        // 3. DISEGNO DELLA TAVOLOZZA (1000 x 750)
        // ==========================================
        const canvas = createCanvas(1000, 750);
        const ctx = canvas.getContext('2d');

        let bgGradient = ctx.createRadialGradient(canvas.width / 2, 0, 0, canvas.width / 2, 0, 1000);
        bgGradient.addColorStop(0, '#0f1c35'); 
        bgGradient.addColorStop(1, '#040810'); 
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
        ctx.lineWidth = 3;
        for (let i = -1000; i < 1000; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 1000, 1000);
            ctx.stroke();
        }

        const cardBg = '#101a2c'; 
        const titleColor = '#60a5fa'; 
        const valColor = '#ffffff'; 
        const subColor = '#94a3b8'; 
        const valFont = 'bold 54px sans-serif'; 
        const titleFont = 'bold 18px sans-serif';

        fillRoundRect(ctx, 40, 40, 920, 160, 30, cardBg);
        
        let pp;
        let hasPhoto = false;
        try { 
            let ppUrl = await conn.profilePictureUrl(who, 'image'); 
            pp = await loadImage(ppUrl);
            hasPhoto = true;
        } catch (e) { 
            hasPhoto = false;
        }

        let textX = 70; 

        if (hasPhoto) {
            ctx.save();
            ctx.beginPath();
            fillRoundRect(ctx, 70, 70, 100, 100, 25, '#000'); 
            ctx.clip();
            ctx.drawImage(pp, 70, 70, 100, 100);
            ctx.restore();
            textX = 200; 
        }

        ctx.fillStyle = valColor;
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(name, textX, 105);
        
        ctx.fillStyle = subColor; 
        ctx.font = '18px sans-serif';
        ctx.fillText(`@${number} • Attivo da ${daysActive} giorni`, textX, 135);
        
        drawBadge(ctx, role, textX, 150, roleIcon);

        // --- SCHEDE GRID ---
        const startY = 240;
        const cardW = 440;
        const cardH = 220;
        const gapX = 40;
        const gapY = 30;

        // CARD 1: SALDO
        let cx = 40, cy = startY;
        fillRoundRect(ctx, cx, cy, cardW, cardH, 25, cardBg);
        ctx.fillStyle = titleColor; ctx.font = titleFont;
        ctx.fillText('SALDO', cx + 40, cy + 50);
        ctx.fillStyle = valColor; ctx.font = valFont;
        ctx.fillText(`€ ${saldo}`, cx + 40, cy + 120);
        drawBadge(ctx, `Coins: ${coins}`, cx + 40, cy + 150, '🪙');

        // CARD 2: MESSAGGI 
        cx = 40 + cardW + gapX; cy = startY;
        fillRoundRect(ctx, cx, cy, cardW, cardH, 25, cardBg);
        ctx.fillStyle = titleColor; ctx.font = titleFont;
        ctx.fillText('MESSAGGI', cx + 40, cy + 50);
        ctx.fillStyle = valColor; ctx.font = valFont;
        ctx.fillText(`${msgTotali}`, cx + 40, cy + 120);
        drawBadge(ctx, `Oggi qui: ${msgOggi} • Media: ${mediaMsg}`, cx + 40, cy + 150, '💬');

        // CARD 3: AVVERTIMENTI
        cx = 40; cy = startY + cardH + gapY;
        fillRoundRect(ctx, cx, cy, cardW, cardH, 25, cardBg);
        
        ctx.fillStyle = totalWarns > 0 ? '#ef4444' : titleColor; 
        ctx.font = titleFont;
        ctx.fillText('AVVERTIMENTI', cx + 40, cy + 50);
        ctx.fillStyle = valColor; ctx.font = valFont;
        ctx.fillText(`${totalWarns} / ${maxWarns}`, cx + 40, cy + 120);
        
        let statusWarn = totalWarns === 0 ? "Sicuro" : totalWarns === 1 ? "Attenzione" : "Rischio Kick";
        drawBadge(ctx, `Stato: ${statusWarn}`, cx + 40, cy + 150, '⚠️');
        
        let barY = cy + 195;
        fillRoundRect(ctx, cx + 40, barY, cardW - 80, 10, 5, '#1e3a8a'); 
        let warnRatio = Math.min(totalWarns / maxWarns, 1);
        let progressWidth = Math.min((cardW - 80), (cardW - 80) * warnRatio);
        if (progressWidth > 0) fillRoundRect(ctx, cx + 40, barY, progressWidth, 10, 5, '#ef4444'); 

        // CARD 4: FUOCHI
        cx = 40 + cardW + gapX; cy = startY + cardH + gapY;
        fillRoundRect(ctx, cx, cy, cardW, cardH, 25, cardBg);
        ctx.fillStyle = titleColor; ctx.font = titleFont;
        ctx.fillText('FUOCHI RICEVUTI', cx + 40, cy + 50);
        ctx.fillStyle = valColor; ctx.font = valFont;
        ctx.fillText(`${fuochi}`, cx + 40, cy + 120);
        drawBadge(ctx, `Livello ${livello}`, cx + 40, cy + 150, '🔥');

        const imageBufferFinal = canvas.toBuffer('image/png');

        await conn.sendMessage(m.chat, {
            image: imageBufferFinal,
            caption: null,
            contextInfo: cuContext 
        }, { quoted: m });

        await m.react('✅');

    } catch (e) {
        console.error("[ERRORE CANVAS STATS]", e);
        await m.react('❌');
        m.reply(`୧・︶ ❌ ︶・୨ \`Errore critico durante la generazione grafica.\` ꒷꒦`);
    }
}

// =========================================================
// 🔥 MOTORE GLOBALE DI CONTEGGIO MESSAGGI (Background) 🔥
// =========================================================
handler.before = async function (m) {
    if (m.isBaileys || m.fromMe) return true;
    if (!m.sender) return true;

    let user = global.db.data.users[m.sender];
    if (!user) {
        global.db.data.users[m.sender] = {};
        user = global.db.data.users[m.sender];
    }

    user.messaggi = (user.messaggi || 0) + 1;

    return true; 
}

handler.help = ['stats'];
handler.tags = ['info'];
handler.command = /^(stats|profilo)$/i;

export default handler;


