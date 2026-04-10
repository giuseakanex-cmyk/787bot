//PLUGIN BY GISE - PRO BETTING MENU EDITION
import fetch from 'node-fetch';

global.virtualMatches = global.virtualMatches || {};

function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num);
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const legamContext = (title) => ({
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363233544482011@newsletter',
        serverMessageId: 100,
        newsletterName: `⚽ ${title}`
    }
});

function refundBets(match) {
    if (!match || !match.bets) return;
    for (let b of match.bets) {
        if (global.db.data.users[b.sender]) {
            global.db.data.users[b.sender].euro += b.puntata;
        }
    }
}

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

function getContrastColor(hexColor) {
    let hex = hexColor.replace('#', '');
    let r = parseInt(hex.substr(0, 2), 16);
    let g = parseInt(hex.substr(2, 2), 16);
    let b = parseInt(hex.substr(4, 2), 16);
    let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
}

// ==========================================
// 📂 DATABASE SQUADRE (FOTMOB HD)
// ==========================================
const serieAData = {
    "Atalanta": { rating: 89, color1: '#1A428A', color2: '#000000', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8524.png', roster: ["Lookman", "Retegui", "De Ketelaere", "Ederson"] },
    "Bologna": { rating: 82, color1: '#1A2F48', color2: '#A21C26', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9857.png', roster: ["Castro", "Orsolini", "Ndoye", "Freuler"] },
    "Cagliari": { rating: 64, color1: '#002350', color2: '#E32219', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8529.png', roster: ["Piccoli", "Luvumbo", "Gaetano", "Marin"] },
    "Cremonese": { rating: 76, color1: '#B11E22', color2: '#969696', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/7801.png', roster: ["Vazquez", "Bonazzoli", "Johnsen", "Castagnetti"] },
    "Como": { rating: 72, color1: '#0055A4', color2: '#FFFFFF', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8530.png', roster: ["Cutrone", "Strefezza", "Paz", "Fadera"] },
    "Fiorentina": { rating: 84, color1: '#4A2583', color2: '#FFFFFF', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8535.png', roster: ["Kean", "Gudmundsson", "Colpani", "Bove"] },
    "Verona": { rating: 68, color1: '#002B5C', color2: '#FFCC00', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9876.png', roster: ["Tengstedt", "Lazovic", "Suslov", "Kastanos"] },
    "Inter": { rating: 95, color1: '#00529F', color2: '#000000', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8636.png', roster: ["Lautaro", "Thuram", "Barella", "Calhanoglu", "Dimarco"] },
    "Juventus": { rating: 92, color1: '#FFFFFF', color2: '#000000', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9885.png', roster: ["Vlahovic", "Yildiz", "Koopmeiners", "Conceicao"] },
    "Lazio": { rating: 87, color1: '#87D8F7', color2: '#FFFFFF', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8543.png', roster: ["Zaccagni", "Castellanos", "Dia", "Guendouzi"] },
    "Milan": { rating: 90, color1: '#FB090B', color2: '#000000', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8564.png', roster: ["Leao", "Morata", "Pulisic", "Reijnders", "Theo"] },
    "Napoli": { rating: 93, color1: '#12A0D7', color2: '#FFFFFF', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9875.png', roster: ["Kvara", "Lukaku", "McTominay", "Politano", "Di Lorenzo"] },
    "Parma": { rating: 73, color1: '#FFD700', color2: '#0000FF', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10167.png', roster: ["Man", "Mihaila", "Bernabé", "Bonny"] },
    "Roma": { rating: 85, color1: '#8E1F2F', color2: '#F0BC42', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8686.png', roster: ["Dybala", "Dovbyk", "Soulé", "Pellegrini"] },
    "Sassuolo": { rating: 79, color1: '#00A752', color2: '#000000', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/7943.png', roster: ["Berardi", "Laurienté", "Mulattieri", "Boloca"] },
    "Torino": { rating: 79, color1: '#8A1538', color2: '#FFFFFF', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9804.png', roster: ["Adams", "Sanabria", "Ricci", "Ilic"] },
    "Udinese": { rating: 79, color1: '#000000', color2: '#FFFFFF', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8600.png', roster: ["Thauvin", "Lucca", "Brenner", "Bijol"] }
};

function getPlayer(team, exclude = null) {
    let roster = serieAData[team].roster;
    let player = roster[Math.floor(Math.random() * roster.length)];
    while (player === exclude && roster.length > 1) {
        player = roster[Math.floor(Math.random() * roster.length)];
    }
    return player;
}

// Calcolo quote mappato sui NUMERI
function calcolaQuote(sq1, sq2) {
    let diff = serieAData[sq1].rating - serieAData[sq2].rating;
    let prob1 = Math.max(0.10, Math.min(0.85, 0.38 + (diff * 0.015)));
    let prob2 = Math.max(0.10, Math.min(0.85, 0.38 - (diff * 0.015)));
    let probX = 0.24 - (Math.abs(diff) * 0.005);
    let total = prob1 + prob2 + probX; prob1 /= total; prob2 /= total; probX /= total;
    
    let avgR = (serieAData[sq1].rating + serieAData[sq2].rating) / 2;
    let probOver = 0.45 + (avgR > 85 ? 0.08 : 0) + (Math.abs(diff) > 15 ? 0.07 : 0);
    let probGG = 0.50 + (Math.abs(diff) < 10 ? 0.08 : -0.05);

    const margin = 0.95; 

    return {
        '1': parseFloat(((1 / prob1) * margin).toFixed(2)),           // [1] Vittoria Casa
        '2': parseFloat(((1 / probX) * margin).toFixed(2)),           // [2] Pareggio
        '3': parseFloat(((1 / prob2) * margin).toFixed(2)),           // [3] Vittoria Trasferta
        '4': parseFloat(((1 / probOver) * margin).toFixed(2)),        // [4] Over 2.5
        '5': parseFloat(((1 / (1 - probOver)) * margin).toFixed(2)),  // [5] Under 2.5
        '6': parseFloat(((1 / probGG) * margin).toFixed(2)),          // [6] GG
        '7': parseFloat(((1 / (1 - probGG)) * margin).toFixed(2)),    // [7] NG
        '14': 3.50,                                                   // [14] Marcatore Fisso
        '15': 15.00                                                   // [15] Risultato Esatto Fisso
    };
}

async function fetchSafeImage(url, loadImage) {
    if (!url || url === "") return null;
    try {
        let res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) return await loadImage(Buffer.from(await res.arrayBuffer()));
        return null;
    } catch (e) { return null; }
}

// ==========================================
// 🔥 MOTORE GRAFICO TV LIVE 🔥
// ==========================================
async function generateTVGraphic(sq1, sq2, mode = 'VS', score1 = 0, score2 = 0, minute = 0) {
    let createCanvas, loadImage;
    try { 
        const canvasLib = await import('canvas'); 
        createCanvas = canvasLib.createCanvas; 
        loadImage = canvasLib.loadImage;
    } catch (e) { return null; }

    const cvs = createCanvas(800, 450); 
    const ctx = cvs.getContext('2d');

    let bg = ctx.createLinearGradient(0, 0, 800, 450);
    bg.addColorStop(0, '#0a192f');
    bg.addColorStop(1, '#020c1b');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 800, 450);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 2;
    for (let i = -800; i < 800; i += 15) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 800, 800); ctx.stroke();
    }

    ctx.fillStyle = '#10b981'; ctx.fillRect(0, 435, 800, 15);

    if (minute > 0 && mode !== 'FINE') {
        fillRoundRect(ctx, 360, 20, 80, 35, 10, '#ef4444');
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(`⏱️ ${minute}'`, 400, 45);
    }

    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('VIRTUAL MATCH', 400, 80);
    ctx.fillStyle = '#10b981'; ctx.fillRect(320, 95, 160, 3); 

    let logo1 = await fetchSafeImage(serieAData[sq1].logo, loadImage);
    let logo2 = await fetchSafeImage(serieAData[sq2].logo, loadImage);

    if (logo1) {
        ctx.drawImage(logo1, 150, 160, 130, 130);
    } else {
        fillRoundRect(ctx, 150, 160, 130, 130, 20, serieAData[sq1].color1); 
        ctx.fillStyle = getContrastColor(serieAData[sq1].color1); 
        ctx.font = 'bold 35px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(sq1.substring(0, 3).toUpperCase(), 215, 235); 
    }
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(sq1, 215, 340); 

    if (logo2) {
        ctx.drawImage(logo2, 520, 160, 130, 130);
    } else {
        fillRoundRect(ctx, 520, 160, 130, 130, 20, serieAData[sq2].color1);
        ctx.fillStyle = getContrastColor(serieAData[sq2].color1); 
        ctx.font = 'bold 35px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(sq2.substring(0, 3).toUpperCase(), 585, 235);
    }
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(sq2, 585, 340); 

    ctx.textAlign = 'center';
    if (mode === 'VS') {
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 60px sans-serif';
        ctx.fillText('VS', 400, 240);
    } else {
        fillRoundRect(ctx, 330, 180, 140, 80, 15, 'rgba(0, 0, 0, 0.6)'); 
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 65px sans-serif';
        ctx.fillText(`${score1} - ${score2}`, 400, 243);
        
        if (mode === 'GOAL') {
            ctx.fillStyle = '#facc15'; ctx.font = 'bold 24px sans-serif';
            ctx.fillText('GOAL!', 400, 150);
        } else if (mode === 'HALF') {
            ctx.fillStyle = '#3b82f6'; ctx.font = 'bold 22px sans-serif';
            ctx.fillText('INTERVALLO', 400, 150);
        } else if (mode === 'FINE') {
            ctx.fillStyle = '#ef4444'; ctx.font = 'bold 24px sans-serif';
            ctx.fillText('FINALE', 400, 150);
        }
    }

    return cvs.toBuffer('image/png');
}

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    let chatId = m.chat;
    let cmd = command.toLowerCase();

    let createCanvas;
    try { const canvasLib = await import('canvas'); createCanvas = canvasLib.createCanvas; } catch (e) {}

    try {
        if (cmd === 'resetmatch' && isOwner) {
            if (global.virtualMatches[chatId]) {
                refundBets(global.virtualMatches[chatId]);
                delete global.virtualMatches[chatId];
                return m.reply(`『 👻 』 \`Partita resettata.\``);
            } else return m.reply(`『 💡 』 \`Nessun match bloccato.\``);
        }

        // ==========================================
        // COMANDO: !VIRTUALI (Botteghino Menu Avanzato)
        // ==========================================
        if (cmd === 'virtuali') {
            if (global.virtualMatches[chatId]) return m.reply(`『 🛑 』 \`C'è già un match in corso!\``);

            const squadre = Object.keys(serieAData);
            let shuffled = squadre.sort(() => 0.5 - Math.random());
            let sq1 = shuffled[0]; let sq2 = shuffled[1];

            let quote = calcolaQuote(sq1, sq2);

            global.virtualMatches[chatId] = {
                state: 'betting', sq1: sq1, sq2: sq2, score1: 0, score2: 0, 
                bets: [], timer: null, quote: quote,
                scorersMatch: [] // Array per tracciare chi segna!
            };

            let testoQuote = `
🏆 *VIRTUAL MATCH*
⚽️ *${sq1} vs ${sq2}*

📊 *Quote:*
[1] 1️⃣ Vittoria ${sq1}: ${quote['1']}x
[2] ⭕️ Pareggio: ${quote['2']}x
[3] 2️⃣ Vittoria ${sq2}: ${quote['3']}x
[4] 📈 Over 2.5: ${quote['4']}x
[5] 📉 Under 2.5: ${quote['5']}x
[6] ✅ GG (Entrambe Segnano): ${quote['6']}x
[7] ❌ NG (Nessun Goal o Solo Una): ${quote['7']}x
[14] 🎯 Marcatore: ${quote['14']}x
[15] 📊 Risultato Esatto: >${quote['15']}x

⏳ *In attesa di scommesse...*
Usa *${usedPrefix}bet <numero_quota> <importo>* per scommettere
Esempio: *${usedPrefix}bet 4 100* (Punta 100€ sull'Over 2.5)

💡 *Speciali:*
Per marcatore: *${usedPrefix}bet 14 <nome_giocatore> <importo>*
Per risultato: *${usedPrefix}bet 15 <gol_casa>-<gol_trasferta> <importo>*`.trim();

            let imageBuffer = await generateTVGraphic(sq1, sq2, 'VS');
            
            if (imageBuffer) {
                await conn.sendMessage(chatId, { image: imageBuffer, caption: testoQuote, contextInfo: legamContext('Botteghino Aperto') }, { quoted: m });
            } else {
                await conn.sendMessage(chatId, { text: testoQuote, contextInfo: legamContext('Botteghino Aperto') }, { quoted: m });
            }

            global.virtualMatches[chatId].timer = setTimeout(async () => {
                await avviaPartitaLive(conn, chatId);
            }, 60000); // 1 minuto per scommettere
            return;
        }

        // ==========================================
        // COMANDO: !BET (Logica Speciale)
        // ==========================================
        if (cmd === 'bet' || cmd === 'punta') {
            let match = global.virtualMatches[chatId];
            if (!match) return m.reply(`『 ⚠️ 』 \`Nessun match. Usa ${usedPrefix}virtuali\``);
            if (match.state !== 'betting') return m.reply(`『 🛑 』 \`Botteghino chiuso!\``);

            let user = global.db.data.users[m.sender];
            if (!args[0]) return m.reply(`👉 Usa: *${usedPrefix}bet [NUMERO_QUOTA] [EURO]*`);
            
            let scommessaId = args[0].toUpperCase();
            let valide = Object.keys(match.quote);
            if (!valide.includes(scommessaId)) return m.reply(`『 ⚠️ 』 \`Numero quota errato (scegli tra 1 e 7, oppure 14 o 15).\``);

            let puntata = 0;
            let extraData = ""; // Per memorizzare nome marcatore o risultato esatto

            // Gestione Giocate Speciali (14 e 15)
            if (scommessaId === '14' || scommessaId === '15') {
                if (!args[1] || !args[2]) return m.reply(`👉 Errore sintassi speciale.\nEsempio Marcatore: *${usedPrefix}bet 14 Kvara 100*\nEsempio Risultato: *${usedPrefix}bet 15 2-1 100*`);
                extraData = args[1].toUpperCase();
                puntata = parseInt(args[2]);
            } else {
                // Giocata Normale
                if (!args[1]) return m.reply(`👉 Usa: *${usedPrefix}bet ${scommessaId} [EURO]*`);
                puntata = parseInt(args[1]);
            }

            if (isNaN(puntata) || puntata <= 0) return m.reply(`『 ⚠️ 』 \`Puntata non valida.\``);
            if (user.euro < puntata) return m.reply(`『 💸 』 \`Fondi insufficienti. Hai ${formatNumber(user.euro)} €.\``);
            if (match.bets.some(b => b.sender === m.sender)) return m.reply(`『 ⏳ 』 \`Hai già piazzato un ticket per questo match!\``);

            user.euro -= puntata;
            match.bets.push({ sender: m.sender, id: scommessaId, extra: extraData, puntata: puntata });

            let moltiplicatore = match.quote[scommessaId];
            let potenziale = Math.floor(puntata * moltiplicatore);
            let timeString = new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' });

            // Testo della scommessa da mostrare sul ticket
            let nomeScommessaTxt = `ESITO [${scommessaId}]`;
            if (scommessaId === '1') nomeScommessaTxt = `VITTORIA ${match.sq1}`;
            if (scommessaId === '2') nomeScommessaTxt = `PAREGGIO`;
            if (scommessaId === '3') nomeScommessaTxt = `VITTORIA ${match.sq2}`;
            if (scommessaId === '4') nomeScommessaTxt = `OVER 2.5`;
            if (scommessaId === '5') nomeScommessaTxt = `UNDER 2.5`;
            if (scommessaId === '6') nomeScommessaTxt = `GOL (GG)`;
            if (scommessaId === '7') nomeScommessaTxt = `NO GOL (NG)`;
            if (scommessaId === '14') nomeScommessaTxt = `GOL DI ${extraData}`;
            if (scommessaId === '15') nomeScommessaTxt = `RIS. ESATTO ${extraData}`;

            if (createCanvas) {
                const cvs = createCanvas(600, 780);
                const ctx = cvs.getContext('2d');

                let bgGradient = ctx.createLinearGradient(0, 0, 0, 780);
                bgGradient.addColorStop(0, '#0f172a'); bgGradient.addColorStop(1, '#1e1b4b');
                ctx.fillStyle = bgGradient; ctx.fillRect(0, 0, 600, 780);

                ctx.fillStyle = '#facc15'; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center';
                ctx.fillText('BETTER', 300, 75);

                const ticketId = Math.floor(Math.random() * 900000) + 100000;
                fillRoundRect(ctx, 470, 45, 90, 32, 16, '#e11d48'); 
                ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif';
                ctx.fillText(`TKT #${match.bets.length}`, 515, 66);

                fillRoundRect(ctx, 40, 110, 520, 140, 16, '#1e293b'); 
                
                ctx.fillStyle = '#94a3b8'; ctx.font = '14px sans-serif'; ctx.textAlign = 'left';
                ctx.fillText(`Utente: @${m.sender.split('@')[0]}`, 65, 145);
                ctx.textAlign = 'right'; ctx.fillText(timeString.split(',')[1].trim(), 535, 145);

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(60, 160); ctx.lineTo(540, 160); ctx.stroke();
                
                ctx.fillStyle = '#ffffff'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'right';
                ctx.fillText(match.sq1, 260, 210);
                
                fillRoundRect(ctx, 275, 185, 50, 30, 15, '#7e22ce'); 
                ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
                ctx.fillText('VS', 300, 206);
                
                ctx.fillStyle = '#ffffff'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'left';
                ctx.fillText(match.sq2, 340, 210);

                fillRoundRect(ctx, 40, 270, 520, 110, 16, '#1e293b');
                fillRoundRect(ctx, 40, 270, 520, 6, 3, '#ec4899'); 
                
                ctx.fillStyle = '#94a3b8'; ctx.font = '14px sans-serif'; ctx.textAlign = 'left';
                ctx.fillText('PRONOSTICO', 65, 315); ctx.textAlign = 'right'; ctx.fillText('QUOTA', 535, 315);

                ctx.fillStyle = '#ffffff'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'left';
                ctx.fillText(nomeScommessaTxt, 65, 355);
                
                let quotaStr = `${moltiplicatore.toFixed(2)}x`;
                ctx.font = 'bold 18px sans-serif';
                let quotaWidth = ctx.measureText(quotaStr).width;
                fillRoundRect(ctx, 535 - quotaWidth - 20, 332, quotaWidth + 20, 30, 8, '#facc15');
                ctx.fillStyle = '#000000'; ctx.textAlign = 'center';
                ctx.fillText(quotaStr, 535 - (quotaWidth/2) - 10, 353);

                fillRoundRect(ctx, 40, 400, 520, 210, 16, '#1e293b');
                
                ctx.fillStyle = '#cbd5e1'; ctx.font = '16px sans-serif'; ctx.textAlign = 'left';
                ctx.fillText('Puntata Totale:', 65, 450); ctx.fillText('Moltiplicatore:', 65, 500);
                
                ctx.font = 'bold 18px sans-serif';
                let pStr = `€ ${formatNumber(puntata)}`; let pw = ctx.measureText(pStr).width;
                fillRoundRect(ctx, 535 - pw - 20, 428, pw + 20, 30, 8, '#10b981'); 
                ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.fillText(pStr, 535 - (pw/2) - 10, 449);

                let qtStr = `${moltiplicatore.toFixed(2)}x`; let qtw = ctx.measureText(qtStr).width;
                fillRoundRect(ctx, 535 - qtw - 20, 478, qtw + 20, 30, 8, '#059669');
                ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.fillText(qtStr, 535 - (qtw/2) - 10, 499);

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(60, 535); ctx.lineTo(540, 535); ctx.stroke();

                ctx.fillStyle = '#ffffff'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'left';
                ctx.fillText('VINCITA POTENZIALE:', 65, 575);
                
                let winStr = `€ ${formatNumber(potenziale)}`; let winW = ctx.measureText(winStr).width;
                fillRoundRect(ctx, 535 - winW - 30, 545, winW + 30, 40, 8, '#10b981'); 
                ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.font = 'bold 22px sans-serif';
                ctx.fillText(winStr, 535 - (winW/2) - 15, 573);

                ctx.fillStyle = '#64748b'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center';
                ctx.fillText('BUONA FORTUNA!', 300, 660);
                ctx.font = 'italic 12px sans-serif'; ctx.fillText(`Emesso: ${timeString} • ID: ${ticketId}`, 300, 680);
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                for (let i = 0; i < 40; i++) { ctx.fillRect(200 + (i * 5), 700, Math.random() > 0.5 ? 2 : 4, 30); }

                const imageBuffer = cvs.toBuffer('image/png');
                await conn.sendMessage(chatId, { image: imageBuffer, caption: `『 🎟️ 』 \`Ticket piazzato!\``, contextInfo: legamContext('Ticket Registrato') }, { quoted: m });
            } else {
                m.reply(`✅ Ticket registrato! Puntata: ${puntata}€ su ${nomeScommessaTxt}. Potenziale: ${potenziale}€`);
            }
        }
    } catch (e) {
        console.error("Errore:", e);
    }
};

// ==========================================
// 🔥 TELECRONACA LIVE 🔥
// ==========================================
async function avviaPartitaLive(conn, chatId) {
    let match = global.virtualMatches[chatId];
    if (!match) return;
    match.state = 'playing';

    try {
        await conn.sendMessage(chatId, { text: `『 🚨 』 \`BOTTEGHINO CHIUSO!\`\n\n🏟️ Fischio d'inizio! La partita durerà esattamente 3 minuti reali.` });

        const firstHalfTimeReal = 110000; 
        const halfTimeBreak = 10000;      
        const secondHalfTimeReal = 60000; 

        let eventsCount = Math.floor(Math.random() * 4) + 6;
        let minutiAzioneSet = new Set();
        while(minutiAzioneSet.size < eventsCount) { minutiAzioneSet.add(Math.floor(Math.random() * 89) + 1); }
        let events = Array.from(minutiAzioneSet).sort((a, b) => a - b);
        
        let r1 = serieAData[match.sq1].rating; let r2 = serieAData[match.sq2].rating; let totalR = r1 + r2;
        let currentTimeReal = 0; let halfTimeTriggered = false;

        for (let i = 0; i < events.length; i++) {
            let evMin = events[i];

            if (evMin > 45 && !halfTimeTriggered) {
                let timeToHalfTime = firstHalfTimeReal - currentTimeReal;
                if (timeToHalfTime > 0) { await delay(timeToHalfTime); }

                let htGraphic = await generateTVGraphic(match.sq1, match.sq2, 'HALF', match.score1, match.score2, 45);
                let htText = `⏱️ *45'* - ⏸️ *FINE PRIMO TEMPO!*\nL'arbitro manda le squadre negli spogliatoi sul risultato di [${match.score1} - ${match.score2}].\n⏳ _Intervallo in corso..._`;
                
                if (htGraphic) await conn.sendMessage(chatId, { image: htGraphic, caption: htText });
                else await conn.sendMessage(chatId, { text: htText });

                await delay(halfTimeBreak);
                await conn.sendMessage(chatId, { text: `⏱️ *46'* - ▶️ *INIZIA IL SECONDO TEMPO!*\nPalla al centro, si riparte!`});

                currentTimeReal = firstHalfTimeReal + halfTimeBreak;
                halfTimeTriggered = true;
            }

            let targetRealTime = evMin <= 45 ? (evMin / 45) * firstHalfTimeReal : firstHalfTimeReal + halfTimeBreak + ((evMin - 45) / 45) * secondHalfTimeReal;

            let waitTime = targetRealTime - currentTimeReal;
            if (waitTime > 0) {
                await delay(waitTime);
                currentTimeReal += waitTime;
            }

            let isTeam1 = Math.random() < (r1 / totalR); 
            let attTeam = isTeam1 ? match.sq1 : match.sq2;
            let defTeam = isTeam1 ? match.sq2 : match.sq1;
            let attPlayer = getPlayer(attTeam); let assistPlayer = getPlayer(attTeam, attPlayer); let defPlayer = getPlayer(defTeam);
            let actionType = Math.random();

            if (actionType < 0.35) {
                if (isTeam1) match.score1++; else match.score2++;
                // SALVA IL MARCATORE PER PAGARE I TICKET "14"
                match.scorersMatch.push(attPlayer.toUpperCase());

                let telecronaca = `⏱️ *${evMin}'*: ⚽ *GOOOAAAL ${attTeam.toUpperCase()}!*\n↳ *${attPlayer}* insacca a rete e fa esplodere lo stadio!`;

                let imgScore = await generateTVGraphic(match.sq1, match.sq2, 'GOAL', match.score1, match.score2, evMin);
                if (imgScore) await conn.sendMessage(chatId, { image: imgScore, caption: telecronaca, contextInfo: legamContext('Aggiornamento Live') });
                else await conn.sendMessage(chatId, { text: telecronaca });

            } else {
                let azione = "";
                if (actionType < 0.50) azione = `⏱️ *${evMin}'*: 🪵 *TRAVERSA PIENA* di *${attPlayer}*! Si dispera l'attaccante.`;
                else if (actionType < 0.65) azione = `⏱️ *${evMin}'*: 📺 *VAR!* Fallo in area di *${defPlayer}*... ma l'arbitro fa segno che non c'è nulla!`;
                else if (actionType < 0.80) azione = `⏱️ *${evMin}'*: 🧤 *MIRACOLO* del portiere su un colpo di testa a botta sicura di *${attPlayer}*!`;
                else azione = `⏱️ *${evMin}'*: 🟨 *GIALLO* per *${defPlayer}* dopo un duro intervento.`;
                await conn.sendMessage(chatId, { text: azione });
            }
        }

        let totalMatchTime = firstHalfTimeReal + halfTimeBreak + secondHalfTimeReal;
        if (currentTimeReal < totalMatchTime) await delay(totalMatchTime - currentTimeReal);

        // ==========================================
        // 🏁 CONTROLLO VINCITORI
        // ==========================================
        let is1 = match.score1 > match.score2; let isX = match.score1 === match.score2; let is2 = match.score1 < match.score2;
        let isGG = match.score1 > 0 && match.score2 > 0; let isNG = match.score1 === 0 || match.score2 === 0;
        let isOver = (match.score1 + match.score2) > 2; let isUnder = (match.score1 + match.score2) <= 2;
        let risultatoFinaleFormato = `${match.score1}-${match.score2}`;

        let esitiVincenti = [];
        if (is1) esitiVincenti.push('1'); if (isX) esitiVincenti.push('2'); if (is2) esitiVincenti.push('3');
        if (isOver) esitiVincenti.push('4'); if (isUnder) esitiVincenti.push('5');
        if (isGG) esitiVincenti.push('6'); if (isNG) esitiVincenti.push('7');

        let winnersTxt = '';
        let scommettitori = match.bets.map(b => b.sender);
        
        for (let b of match.bets) {
            let won = false;
            
            // Check classico 1 a 7
            if (['1','2','3','4','5','6','7'].includes(b.id)) {
                if (esitiVincenti.includes(b.id)) won = true;
            } 
            // Check Marcatore (14)
            else if (b.id === '14') {
                if (match.scorersMatch.includes(b.extra)) won = true;
            } 
            // Check Risultato Esatto (15)
            else if (b.id === '15') {
                if (b.extra === risultatoFinaleFormato) won = true;
            }

            if (won) {
                let winAmount = Math.floor(b.puntata * match.quote[b.id]);
                global.db.data.users[b.sender].euro += winAmount;
                winnersTxt += `\n✅ @${b.sender.split('@')[0]} vince *+${formatNumber(winAmount)} €* (Quota ${b.id})`;
            } else {
                winnersTxt += `\n❌ @${b.sender.split('@')[0]} perde -${formatNumber(b.puntata)} € (Quota ${b.id})`;
            }
        }

        let txtEsitiFinali = `[${is1?'1':isX?'X':'2'}], [${isOver?'Over 2.5':'Under 2.5'}], [${isGG?'GG':'NG'}]`;

        let finaleTesto = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 𝐓 𝐑 𝐈 𝐏 𝐋 𝐈 𝐂 𝐄  𝐅 𝐈 𝐒 𝐂 𝐇 𝐈 𝐎 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

🎯 *𝐄𝐬𝐢𝐭𝐢 𝐕𝐢𝐧𝐜𝐞𝐧𝐭𝐢:* ${txtEsitiFinali}
📊 *Ris. Esatto:* ${risultatoFinaleFormato}
🎯 *Marcatori:* ${match.scorersMatch.length > 0 ? match.scorersMatch.join(', ') : 'Nessuno'}

│ 🏆 𝐑 𝐄 𝐒 𝐎 𝐂 𝐎 𝐍 𝐓 𝐎`;

        finaleTesto += match.bets.length === 0 ? `\n│ 😅 \`Nessuna giocata registrata.\`` : winnersTxt;
        finaleTesto += `\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

        let imgFinale = await generateTVGraphic(match.sq1, match.sq2, 'FINE', match.score1, match.score2, 90);
        await conn.sendMessage(chatId, { image: imgFinale, caption: finaleTesto.trim(), mentions: scommettitori, contextInfo: legamContext('Fine Partita') });

    } catch (err) {
        refundBets(match);
        await conn.sendMessage(chatId, { text: `『 ❌ 』 \`Errore tecnico. Partita annullata.\`` }).catch(()=>{});
    } finally {
        delete global.virtualMatches[chatId];
    }
}

handler.command = /^(virtuali|bet|punta|resetmatch)$/i;
handler.group = true;
export default handler;


