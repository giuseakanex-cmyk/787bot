import fetch from 'node-fetch';

function fillRoundRect(ctx, x, y, w, h, r, fillColor) {
    ctx.fillStyle = fillColor; ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill();
}

function drawPill(ctx, x, y, text, bgColor, textColor) {
    ctx.save();
    ctx.font = 'bold 12px sans-serif'; 
    let textWidth = ctx.measureText(text).width;
    let w = textWidth + 24; let h = 26;
    fillRoundRect(ctx, x, y, w, h, 13, bgColor);
    ctx.fillStyle = textColor; 
    ctx.textAlign = 'center'; 
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2); 
    ctx.restore();
}

async function getProfilePic(conn, jid, loadImage) {
    try {
        let url = await conn.profilePictureUrl(jid, 'image');
        let res = await fetch(url);
        return await loadImage(Buffer.from(await res.arrayBuffer()));
    } catch (e) {
        try {
            let res = await fetch('https://files.catbox.moe/pyp87f.jpg'); 
            return await loadImage(Buffer.from(await res.arrayBuffer()));
        } catch (e2) { return null; }
    }
}

async function generateTimeDashboard(conn, sender, pushName, userStats, rank, totalUsers) {
    let createCanvas, loadImage;
    try { const canvasLib = await import('canvas'); createCanvas = canvasLib.createCanvas; loadImage = canvasLib.loadImage; } catch (e) { return null; }

    const cvs = createCanvas(800, 520); const ctx = cvs.getContext('2d');

    let bgGradient = ctx.createLinearGradient(0, 0, 800, 520);
    bgGradient.addColorStop(0, '#040b16'); bgGradient.addColorStop(1, '#0a192f');
    ctx.fillStyle = bgGradient; ctx.fillRect(0, 0, 800, 520);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)'; ctx.lineWidth = 4;
    for (let i = -800; i < 800; i += 20) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 800, 800); ctx.stroke(); }

    const cardBg = '#112240'; const accentBlue = '#3b82f6'; 
    const textMain = '#ffffff'; const textSub = '#94a3b8'; const badgeBg = 'rgba(59, 130, 246, 0.2)'; 

    let totalSec = userStats.onlineTime || 0;
    
    let hh = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    let mm = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    let ss = Math.floor(totalSec % 60).toString().padStart(2, '0');
    let timeString = `${hh}:${mm}:${ss}`;
    
    let oreCumulative = Math.floor(totalSec / 3600);
    let topPercent = ((rank / totalUsers) * 100).toFixed(1);
    
    let secsToReward = userStats.timeForReward || 0;
    let progressNextHour = Math.floor((secsToReward / 3600) * 100);
    if (progressNextHour > 100) progressNextHour = 100;

    // HEADER
    fillRoundRect(ctx, 30, 30, 740, 110, 20, cardBg);
    
    let pfp = await getProfilePic(conn, sender, loadImage);
    if (pfp) {
        ctx.save(); ctx.beginPath(); ctx.roundRect(50, 45, 80, 80, 15); ctx.clip();
        ctx.drawImage(pfp, 50, 45, 80, 80); ctx.restore();
    }

    ctx.textAlign = 'left';
    ctx.fillStyle = textMain; ctx.font = 'bold 28px sans-serif'; ctx.fillText(pushName || 'Utente', 150, 75);
    ctx.fillStyle = textSub; ctx.font = '16px sans-serif'; ctx.fillText(`@${sender.split('@')[0]} • Legam OS`, 150, 100);
    drawPill(ctx, 150, 115, 'Tempo online questa settimana', badgeBg, accentBlue);

    const cardW = 355; const cardH = 150; const startY = 170; const padX = 60;

    // CARD 1: TEMPO TOTALE
    fillRoundRect(ctx, 30, startY, cardW, cardH, 20, cardBg);
    ctx.textAlign = 'left';
    ctx.fillStyle = textSub; ctx.font = 'bold 14px sans-serif'; ctx.fillText('TEMPO TOTALE (GRUPPO)', padX, startY + 35);
    
    // 🔥 FIX FONT OROLOGIO 🔥 (Più grande, pulito e compatto)
    ctx.fillStyle = textMain; ctx.font = 'bold 48px sans-serif'; ctx.fillText(timeString, padX, startY + 90);
    
    drawPill(ctx, padX, startY + 110, `${oreCumulative}h cumulative`, badgeBg, accentBlue);

    // CARD 2: POSIZIONE
    let rightCardX = 415; let rightPadX = rightCardX + 30;
    fillRoundRect(ctx, rightCardX, startY, cardW, cardH, 20, cardBg);
    ctx.textAlign = 'left';
    ctx.fillStyle = textSub; ctx.font = 'bold 14px sans-serif'; ctx.fillText('POSIZIONE NEL GRUPPO', rightPadX, startY + 35);
    ctx.fillStyle = textMain; ctx.font = 'bold 45px sans-serif'; ctx.fillText(`${rank}/${totalUsers}`, rightPadX, startY + 90);
    drawPill(ctx, rightPadX, startY + 110, `Top ${topPercent}%`, badgeBg, accentBlue);

    // CARD 3: VERSO PROSSIMA ORA
    let bottomY = startY + cardH + 20;
    fillRoundRect(ctx, 30, bottomY, cardW, cardH, 20, cardBg);
    ctx.textAlign = 'left';
    ctx.fillStyle = textSub; ctx.font = 'bold 14px sans-serif'; ctx.fillText('VERSO PROSSIMA ORA', padX, bottomY + 35);
    ctx.fillStyle = textMain; ctx.font = 'bold 45px sans-serif'; ctx.fillText(`${progressNextHour}%`, padX, bottomY + 90);
    
    fillRoundRect(ctx, padX, bottomY + 115, 295, 10, 5, 'rgba(255,255,255,0.1)'); 
    if (progressNextHour > 0) {
        let barWidth = (progressNextHour / 100) * 295;
        fillRoundRect(ctx, padX, bottomY + 115, barWidth, 10, 5, accentBlue); 
    }

    // CARD 4: UTENTI ATTIVI SETTIMANA
    fillRoundRect(ctx, rightCardX, bottomY, cardW, cardH, 20, cardBg);
    ctx.textAlign = 'left';
    ctx.fillStyle = textSub; ctx.font = 'bold 14px sans-serif'; ctx.fillText('UTENTI ATTIVI QUESTA SETTIMANA', rightPadX, bottomY + 35);
    ctx.fillStyle = textMain; ctx.font = 'bold 45px sans-serif'; ctx.fillText(`${totalUsers}`, rightPadX, bottomY + 90);
    drawPill(ctx, rightPadX, bottomY + 110, `Sessione settimanale`, badgeBg, accentBlue);

    return cvs.toBuffer('image/png');
}

let handler = async (m, { conn }) => {
    global.db.data.groupActivity = global.db.data.groupActivity || {};
    let chatData = global.db.data.groupActivity[m.chat] || {};
    
    let usersArray = Object.entries(chatData).filter(u => (u[1].msgCount && u[1].msgCount > 0));
    usersArray.sort((a, b) => (b[1].onlineTime || 0) - (a[1].onlineTime || 0));

    let totalUsers = usersArray.length;
    if (totalUsers === 0) return m.reply(`『 😅 』 \`Nessun utente attivo in questa settimana. Invia il primo messaggio!\``);

    await m.react('⏳');
    let userStats = chatData[m.sender];
    
    if (!userStats) {
        await m.react('❌');
        return m.reply(`『 😅 』 \`Non hai ancora scritto questa settimana. Invia un messaggio e riprova!\``);
    }

    let rank = usersArray.findIndex(u => u[0] === m.sender) + 1;
    let pushName = m.pushName || 'Utente';

    let dashboardImg = await generateTimeDashboard(conn, m.sender, pushName, userStats, rank, totalUsers);

    if (dashboardImg) {
        await conn.sendMessage(m.chat, { 
            image: dashboardImg, 
            caption: `『 ⏱️ 』 \`DASHBOARD SETTIMANALE\`\n\nStatistiche valide per la settimana corrente.`,
            contextInfo: { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363233544482011@newsletter', serverMessageId: 100, newsletterName: `⏱️ Stats Settimanali` } }
        }, { quoted: m });
    } else {
        m.reply(`『 ❌ 』 \`Errore nella generazione della Dashboard grafica.\``);
    }
    await m.react('✅');
};

handler.command = /^(time)$/i;
handler.group = true;
export default handler;


