import fetch from 'node-fetch';

function formatNumber(num) { return new Intl.NumberFormat('it-IT').format(num); }

const legamContext = (title) => ({
    isForwarded: true, forwardingScore: 999,
    forwardedNewsletterMessageInfo: { newsletterJid: '120363233544482011@newsletter', serverMessageId: 100, newsletterName: `⚽ ${title}` }
});

function fillRoundRect(ctx, x, y, w, h, r, fillColor) {
    ctx.fillStyle = fillColor; ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill();
}

function getContrastColor(hexColor) {
    let hex = hexColor.replace('#', ''); let r = parseInt(hex.substr(0, 2), 16); let g = parseInt(hex.substr(2, 2), 16); let b = parseInt(hex.substr(4, 2), 16);
    let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000; return (yiq >= 128) ? '#000000' : '#FFFFFF';
}

// ==========================================
// 📂 DATABASE SQUADRE (Condiviso)
// ==========================================
const serieAData = {
    "Atalanta": { rating: 89, color1: '#1A428A', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8524.png', roster: ["Lookman", "Retegui", "De Ketelaere"] },
    "Bologna": { rating: 82, color1: '#1A2F48', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9857.png', roster: ["Castro", "Orsolini", "Ndoye"] },
    "Como": { rating: 72, color1: '#0055A4', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8530.png', roster: ["Cutrone", "Paz", "Fadera"] },
    "Fiorentina": { rating: 84, color1: '#4A2583', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8535.png', roster: ["Kean", "Gudmundsson", "Colpani"] },
    "Inter": { rating: 95, color1: '#00529F', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8636.png', roster: ["Lautaro", "Thuram", "Barella"] },
    "Juventus": { rating: 92, color1: '#FFFFFF', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9885.png', roster: ["Vlahovic", "Yildiz", "Koopmeiners"] },
    "Lazio": { rating: 87, color1: '#87D8F7', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8543.png', roster: ["Zaccagni", "Castellanos", "Dia"] },
    "Milan": { rating: 90, color1: '#FB090B', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8564.png', roster: ["Leao", "Morata", "Pulisic"] },
    "Napoli": { rating: 93, color1: '#12A0D7', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/9875.png', roster: ["Kvara", "Lukaku", "McTominay"] },
    "Roma": { rating: 85, color1: '#8E1F2F', logo: 'https://images.fotmob.com/image_resources/logo/teamlogo/8686.png', roster: ["Dybala", "Dovbyk", "Soulé"] }
};

function getPlayer(team) {
    let roster = serieAData[team].roster; return roster[Math.floor(Math.random() * roster.length)];
}

function calcolaQuote(sq1, sq2) {
    let diff = serieAData[sq1].rating - serieAData[sq2].rating;
    let prob1 = Math.max(0.10, Math.min(0.85, 0.38 + (diff * 0.015)));
    let prob2 = Math.max(0.10, Math.min(0.85, 0.38 - (diff * 0.015)));
    let probX = 0.24 - (Math.abs(diff) * 0.005);
    let total = prob1 + prob2 + probX; prob1 /= total; prob2 /= total; probX /= total;
    
    let probOver = 0.45 + (Math.abs(diff) > 15 ? 0.07 : 0);
    let probGG = 0.50 + (Math.abs(diff) < 10 ? 0.08 : -0.05);

    const margin = 0.95; 
    return {
        '1': parseFloat(((1 / prob1) * margin).toFixed(2)), '2': parseFloat(((1 / probX) * margin).toFixed(2)), '3': parseFloat(((1 / prob2) * margin).toFixed(2)),
        '4': parseFloat(((1 / probOver) * margin).toFixed(2)), '5': parseFloat(((1 / (1 - probOver)) * margin).toFixed(2)),
        '6': parseFloat(((1 / probGG) * margin).toFixed(2)), '7': parseFloat(((1 / (1 - probGG)) * margin).toFixed(2)),
        '14': 3.50, '15': 15.00
    };
}

async function fetchSafeImage(url, loadImage) {
    if (!url || url === "") return null;
    try { let res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }); if (res.ok) return await loadImage(Buffer.from(await res.arrayBuffer())); return null; } catch (e) { return null; }
}

// ==========================================
// 📅 GENERATORE PALINSESTO ASINCRONO
// ==========================================
function refreshPalinsesto() {
    let now = Date.now();
    global.db.data.palinsestoMatches = global.db.data.palinsestoMatches || {};
    let matchesDb = global.db.data.palinsestoMatches;
    let activeMatches = 0;

    // Pulisce match di 2 giorni fa
    for (let id in matchesDb) {
        if (now > matchesDb[id].endTime + 86400000) delete matchesDb[id];
        else if (now < matchesDb[id].endTime) activeMatches++;
    }

    // Se ci sono poche partite, ne crea di nuove per oggi/domani
    if (activeMatches < 5) {
        const teams = Object.keys(serieAData);
        for (let i = 0; i < (5 - activeMatches); i++) {
            let sq1 = teams[Math.floor(Math.random() * teams.length)];
            let sq2 = teams[Math.floor(Math.random() * teams.length)];
            while(sq1 === sq2) sq2 = teams[Math.floor(Math.random() * teams.length)];

            let matchId = 'P' + Math.floor(Math.random() * 9000 + 1000); // Prefisso P per Palinsesto
            
            // Orario casuale (tra 30 min e 24h)
            let offsetStart = Math.floor(Math.random() * 24 * 3600000) + 1800000; 
            let startTime = now + offsetStart;
            let endTime = startTime + (90 * 60000); // 90 min dopo

            matchesDb[matchId] = { id: matchId, sq1, sq2, startTime, endTime, quote: calcolaQuote(sq1, sq2), risultato: null, marcatori: [] };
        }
    }
}

// ==========================================
// 🎮 SIMULATORE RISULTATI (Fast Engine)
// ==========================================
function simulaMatch(match) {
    let r1 = serieAData[match.sq1].rating; let r2 = serieAData[match.sq2].rating;
    let prob1 = r1 / (r1 + r2);

    let gol1 = 0; let gol2 = 0; let marcatori = [];
    let totalGoals = Math.floor(Math.random() * 4); 
    if (r1 + r2 > 175 && Math.random() > 0.6) totalGoals += Math.floor(Math.random() * 3); 

    for(let i=0; i<totalGoals; i++) {
        if(Math.random() < prob1) { gol1++; marcatori.push(getPlayer(match.sq1).toUpperCase()); } 
        else { gol2++; marcatori.push(getPlayer(match.sq2).toUpperCase()); }
    }

    match.risultato = { score1: gol1, score2: gol2 }; match.marcatori = marcatori;
    return match;
}

// ==========================================
// 🎫 GENERATORE TICKET CANVAS
// ==========================================
async function generateTicket(username, match, ticketId, nomeScommessaTxt, moltiplicatore, importo, potenziale) {
    let createCanvas; try { const canvasLib = await import('canvas'); createCanvas = canvasLib.createCanvas; } catch (e) { return null; }
    const cvs = createCanvas(600, 780); const ctx = cvs.getContext('2d');

    let bgGradient = ctx.createLinearGradient(0, 0, 0, 780); bgGradient.addColorStop(0, '#0f172a'); bgGradient.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGradient; ctx.fillRect(0, 0, 600, 780);

    ctx.fillStyle = '#facc15'; ctx.font = 'bold 40px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('LEGAM SNAI', 300, 75);

    fillRoundRect(ctx, 450, 45, 110, 32, 16, '#e11d48'); 
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16px sans-serif'; ctx.fillText(`ID: ${ticketId}`, 505, 66);

    fillRoundRect(ctx, 40, 110, 520, 140, 16, '#1e293b'); 
    ctx.fillStyle = '#94a3b8'; ctx.font = '14px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(`Player: @${username}`, 65, 145);
    
    let timeStr = new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'short' });
    let startStr = new Date(match.startTime).toLocaleString('it-IT', { timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'short' });
    
    ctx.textAlign = 'right'; ctx.fillText(`Emesso: ${timeStr}`, 535, 145);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(60, 160); ctx.lineTo(540, 160); ctx.stroke();
    
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'right'; ctx.fillText(match.sq1, 260, 210);
    fillRoundRect(ctx, 275, 185, 50, 30, 15, '#7e22ce'); 
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('VS', 300, 206);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(match.sq2, 340, 210);

    fillRoundRect(ctx, 40, 270, 520, 110, 16, '#1e293b'); fillRoundRect(ctx, 40, 270, 520, 6, 3, '#ec4899'); 
    
    ctx.fillStyle = '#94a3b8'; ctx.font = '14px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(`PRONOSTICO (Match ${match.id})`, 65, 315); ctx.textAlign = 'right'; ctx.fillText('QUOTA', 535, 315);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(nomeScommessaTxt, 65, 355);
    
    let quotaStr = `${moltiplicatore.toFixed(2)}x`; ctx.font = 'bold 18px sans-serif'; let quotaWidth = ctx.measureText(quotaStr).width;
    fillRoundRect(ctx, 535 - quotaWidth - 20, 332, quotaWidth + 20, 30, 8, '#facc15');
    ctx.fillStyle = '#000000'; ctx.textAlign = 'center'; ctx.fillText(quotaStr, 535 - (quotaWidth/2) - 10, 353);

    fillRoundRect(ctx, 40, 400, 520, 210, 16, '#1e293b');
    ctx.fillStyle = '#cbd5e1'; ctx.font = '16px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('Puntata Totale:', 65, 450); ctx.fillText('Moltiplicatore:', 65, 500);
    
    ctx.font = 'bold 18px sans-serif'; let pStr = `€ ${formatNumber(importo)}`; let pw = ctx.measureText(pStr).width;
    fillRoundRect(ctx, 535 - pw - 20, 428, pw + 20, 30, 8, '#10b981'); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.fillText(pStr, 535 - (pw/2) - 10, 449);
    let qtStr = `${moltiplicatore.toFixed(2)}x`; let qtw = ctx.measureText(qtStr).width;
    fillRoundRect(ctx, 535 - qtw - 20, 478, qtw + 20, 30, 8, '#059669'); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.fillText(qtStr, 535 - (qtw/2) - 10, 499);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(60, 535); ctx.lineTo(540, 535); ctx.stroke();

    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('VINCITA POTENZIALE:', 65, 575);
    let winStr = `€ ${formatNumber(potenziale)}`; let winW = ctx.measureText(winStr).width;
    fillRoundRect(ctx, 535 - winW - 30, 545, winW + 30, 40, 8, '#10b981'); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.font = 'bold 22px sans-serif'; ctx.fillText(winStr, 535 - (winW/2) - 15, 573);

    ctx.fillStyle = '#64748b'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(`Riscatta con: .riscatta ${ticketId} (Da: ${startStr})`, 300, 660);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; for (let i = 0; i < 40; i++) { ctx.fillRect(200 + (i * 5), 700, Math.random() > 0.5 ? 2 : 4, 30); }

    return cvs.toBuffer('image/png');
}

// Generatore Grafica Risultato Finale
async function generateTVGraphic(sq1, sq2, score1 = 0, score2 = 0) {
    let createCanvas, loadImage; try { const canvasLib = await import('canvas'); createCanvas = canvasLib.createCanvas; loadImage = canvasLib.loadImage; } catch (e) { return null; }
    const cvs = createCanvas(800, 450); const ctx = cvs.getContext('2d');

    let bg = ctx.createLinearGradient(0, 0, 800, 450); bg.addColorStop(0, '#0a192f'); bg.addColorStop(1, '#020c1b'); ctx.fillStyle = bg; ctx.fillRect(0, 0, 800, 450);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'; ctx.lineWidth = 2; for (let i = -800; i < 800; i += 15) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 800, 800); ctx.stroke(); }
    ctx.fillStyle = '#10b981'; ctx.fillRect(0, 435, 800, 15);

    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('RISULTATO UFFICIALE', 400, 80);
    ctx.fillStyle = '#10b981'; ctx.fillRect(270, 95, 260, 3); 

    let logo1 = await fetchSafeImage(serieAData[sq1].logo, loadImage); let logo2 = await fetchSafeImage(serieAData[sq2].logo, loadImage);

    if (logo1) ctx.drawImage(logo1, 150, 160, 130, 130);
    else { fillRoundRect(ctx, 150, 160, 130, 130, 20, serieAData[sq1].color1); ctx.fillStyle = getContrastColor(serieAData[sq1].color1); ctx.font = 'bold 35px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(sq1.substring(0, 3).toUpperCase(), 215, 235); }
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(sq1, 215, 340); 

    if (logo2) ctx.drawImage(logo2, 520, 160, 130, 130);
    else { fillRoundRect(ctx, 520, 160, 130, 130, 20, serieAData[sq2].color1); ctx.fillStyle = getContrastColor(serieAData[sq2].color1); ctx.font = 'bold 35px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(sq2.substring(0, 3).toUpperCase(), 585, 235); }
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(sq2, 585, 340); 

    ctx.textAlign = 'center'; fillRoundRect(ctx, 330, 180, 140, 80, 15, 'rgba(0, 0, 0, 0.6)'); 
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 65px sans-serif'; ctx.fillText(`${score1} - ${score2}`, 400, 243);
    ctx.fillStyle = '#ef4444'; ctx.font = 'bold 24px sans-serif'; ctx.fillText('FINALE', 400, 150);

    return cvs.toBuffer('image/png');
}

// ==========================================
// 🚀 COMANDI PRINCIPALI
// ==========================================
let handler = async (m, { conn, args, usedPrefix, command }) => {
    let cmd = command.toLowerCase();

    // Inizializza DB in modo sicuro
    global.db.data.palinsestoMatches = global.db.data.palinsestoMatches || {};
    global.db.data.palinsestoTickets = global.db.data.palinsestoTickets || {};

    // ==========================================
    // 1️⃣ .PARTITE / .PALINSESTO
    // ==========================================
    if (cmd === 'partite' || cmd === 'palinsesto') {
        refreshPalinsesto();
        let matches = Object.values(global.db.data.palinsestoMatches).filter(mat => Date.now() < mat.startTime);
        
        if (matches.length === 0) return m.reply("『 😅 』 `Nessuna partita disponibile al momento. Riprova più tardi.`");
        matches.sort((a, b) => a.startTime - b.startTime);

        let testo = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 📅 𝐏𝐀𝐋𝐈𝐍𝐒𝐄𝐒𝐓𝐎 𝐋𝐄𝐆𝐀𝐌 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n`;
        
        for (let mat of matches) {
            let startStr = new Date(mat.startTime).toLocaleString('it-IT', { weekday: 'short', hour: '2-digit', minute: '2-digit' }).toUpperCase();
            testo += `⚽ *${mat.sq1} vs ${mat.sq2}*\n`;
            testo += `🔑 ID: *${mat.id}* |  ⏱️ Inizio: *${startStr}*\n`;
            testo += `📊 *Quote:*\n[1] ${mat.quote['1']}x | [2] ${mat.quote['2']}x | [3] ${mat.quote['3']}x\n[4] Over: ${mat.quote['4']}x | [5] Under: ${mat.quote['5']}x\n[6] GG: ${mat.quote['6']}x | [7] NG: ${mat.quote['7']}x\n`;
            testo += `🎯 Marcatore: [14] ${mat.quote['14']}x | 📊 Ris. Esatto: [15] ${mat.quote['15']}x\n\n`;
        }
        testo += `💡 Punta con: *${usedPrefix}betpa [ID] [QUOTA] [EURO]*\nEsempio: *${usedPrefix}betpa ${matches[0].id} 4 100*\n\nSpeciali: *${usedPrefix}betpa ${matches[0].id} 14 Kvara 100*`;
        
        return conn.sendMessage(m.chat, { text: testo.trim(), contextInfo: legamContext('Eventi Snai Disponibili') }, { quoted: m });
    }

    // ==========================================
    // 2️⃣ .BETPA (Piazza Scommessa Asincrona)
    // ==========================================
    if (cmd === 'betpa') {
        if (!args[0] || !args[1]) return m.reply(`👉 Usa: *${usedPrefix}betpa [ID_PARTITA] [NUM_QUOTA] [EURO]*\nEsempio: *${usedPrefix}betpa P1234 4 100*`);
        
        let matchId = args[0].toUpperCase();
        let quotaId = args[1].toUpperCase();
        let match = global.db.data.palinsestoMatches[matchId];
        
        if (!match) return m.reply(`『 ❌ 』 \`ID Partita non trovato nel palinsesto. Usa ${usedPrefix}partite\``);
        if (Date.now() > match.startTime) return m.reply(`『 🛑 』 \`Botteghino chiuso! La partita è già in corso o finita.\``);
        if (!Object.keys(match.quote).includes(quotaId)) return m.reply(`『 ⚠️ 』 \`Numero quota errato.\``);

        let puntata = 0; let extraData = "";
        if (quotaId === '14' || quotaId === '15') {
            if (!args[2] || !args[3]) return m.reply(`👉 Errore sintassi speciale.\nMarcatore: *${usedPrefix}betpa ${matchId} 14 Kvara 100*\nRisultato: *${usedPrefix}betpa ${matchId} 15 2-1 100*`);
            extraData = args[2].toUpperCase(); puntata = parseInt(args[3]);
        } else {
            if (!args[2]) return m.reply(`👉 Usa: *${usedPrefix}betpa ${matchId} ${quotaId} [EURO]*`);
            puntata = parseInt(args[2]);
        }

        let user = global.db.data.users[m.sender];
        if (isNaN(puntata) || puntata <= 0) return m.reply(`『 ⚠️ 』 \`Importo non valido.\``);
        if (user.euro < puntata) return m.reply(`『 💸 』 \`Fondi insufficienti. Hai ${formatNumber(user.euro)} €.\``);

        let ticketId = 'TKP' + Math.random().toString(36).substr(2, 6).toUpperCase(); // TKP = Ticket Palinsesto
        let moltiplicatore = match.quote[quotaId];
        let potenziale = Math.floor(puntata * moltiplicatore);

        user.euro -= puntata;
        global.db.data.palinsestoTickets[ticketId] = {
            sender: m.sender, matchId, quotaId, extraData, puntata, potenziale, claimed: false
        };

        let nomeScommessaTxt = `ESITO [${quotaId}]`;
        if (quotaId === '1') nomeScommessaTxt = `VITTORIA ${match.sq1}`; if (quotaId === '2') nomeScommessaTxt = `PAREGGIO`; if (quotaId === '3') nomeScommessaTxt = `VITTORIA ${match.sq2}`;
        if (quotaId === '4') nomeScommessaTxt = `OVER 2.5`; if (quotaId === '5') nomeScommessaTxt = `UNDER 2.5`;
        if (quotaId === '6') nomeScommessaTxt = `GOL (GG)`; if (quotaId === '7') nomeScommessaTxt = `NO GOL (NG)`;
        if (quotaId === '14') nomeScommessaTxt = `GOL DI ${extraData}`; if (quotaId === '15') nomeScommessaTxt = `RIS. ESATTO ${extraData}`;

        let ticketImg = await generateTicket(m.sender.split('@')[0], match, ticketId, nomeScommessaTxt, moltiplicatore, puntata, potenziale);
        
        if (ticketImg) {
            await conn.sendMessage(m.chat, { image: ticketImg, caption: `『 🎟️ 』 \`TICKET REGISTRATO!\`\nConserva il codice: *${ticketId}*\nRiscatta a partita conclusa con: *${usedPrefix}riscatta ${ticketId}*`, contextInfo: legamContext('Scommessa Piazzata') }, { quoted: m });
        } else {
            m.reply(`✅ Ticket ${ticketId} registrato! Puntata: ${puntata}€ su ${nomeScommessaTxt}. Potenziale: ${potenziale}€\nUsa ${usedPrefix}riscatta ${ticketId} a fine match.`);
        }
        return;
    }

    // ==========================================
    // 3️⃣ .RISCATTA (Incassa Vincita)
    // ==========================================
    if (cmd === 'riscatta') {
        if (!args[0]) return m.reply(`👉 Usa: *${usedPrefix}riscatta [ID_TICKET]*`);
        let ticketId = args[0].toUpperCase();
        let ticket = global.db.data.palinsestoTickets[ticketId];

        if (!ticket) return m.reply(`『 ❌ 』 \`Ticket inesistente.\``);
        if (ticket.sender !== m.sender) return m.reply(`『 🛑 』 \`Questo ticket non ti appartiene.\``);
        if (ticket.claimed) return m.reply(`『 ⚠️ 』 \`Ticket già riscosso o elaborato!\``);

        let match = global.db.data.palinsestoMatches[ticket.matchId];
        if (!match) return m.reply(`『 ❌ 』 \`La partita di questo ticket non esiste più nel palinsesto.\``);

        if (Date.now() < match.endTime) {
            let tempoInizio = Math.max(0, Math.ceil((match.startTime - Date.now()) / 60000));
            let tempoFine = Math.ceil((match.endTime - Date.now()) / 60000);
            if (tempoInizio > 0) return m.reply(`『 ⏳ 』 \`Partita non ancora iniziata!\`\nInizia tra *${tempoInizio} minuti*.`);
            return m.reply(`『 ⏳ 』 \`Partita in corso!\`\nTermina tra circa *${tempoFine} minuti*.`);
        }

        // SIMULAZIONE RISULTATO (Solo al primo riscatto)
        if (!match.risultato) match = simulaMatch(match);

        let s1 = match.risultato.score1; let s2 = match.risultato.score2;
        let is1 = s1 > s2; let isX = s1 === s2; let is2 = s1 < s2;
        let isOver = (s1 + s2) > 2; let isUnder = (s1 + s2) <= 2;
        let isGG = s1 > 0 && s2 > 0; let isNG = s1 === 0 || s2 === 0;
        let risultatoFormato = `${s1}-${s2}`;

        let esitiVincenti = [];
        if (is1) esitiVincenti.push('1'); if (isX) esitiVincenti.push('2'); if (is2) esitiVincenti.push('3');
        if (isOver) esitiVincenti.push('4'); if (isUnder) esitiVincenti.push('5');
        if (isGG) esitiVincenti.push('6'); if (isNG) esitiVincenti.push('7');

        let won = false;
        if (['1','2','3','4','5','6','7'].includes(ticket.quotaId)) won = esitiVincenti.includes(ticket.quotaId);
        else if (ticket.quotaId === '14') won = match.marcatori.includes(ticket.extraData);
        else if (ticket.quotaId === '15') won = ticket.extraData === risultatoFormato;

        ticket.claimed = true; // Segna riscosso per non pagare 2 volte

        let resTesto = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🏁 𝐑𝐈𝐒𝐔𝐋𝐓𝐀𝐓𝐎 𝐌𝐀𝐓𝐂𝐇 🏁 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

🏟️ *${match.sq1} ${s1} - ${s2} ${match.sq2}*
⚽ *Marcatori:* ${match.marcatori.length > 0 ? match.marcatori.join(', ') : 'Nessuno'}

🎯 *Tuo Ticket:* ${ticketId}
`;

        if (won) {
            global.db.data.users[m.sender].euro += ticket.potenziale;
            resTesto += `\n🎉 *TICKET VINCENTE!*\nHai incassato *+${formatNumber(ticket.potenziale)} €*! 💸`;
        } else {
            resTesto += `\n❌ *TICKET PERDENTE*\nRitenta, sarai più fortunato!`;
        }
        resTesto += `\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

        let imgFinale = await generateTVGraphic(match.sq1, match.sq2, s1, s2);
        if (imgFinale) await conn.sendMessage(m.chat, { image: imgFinale, caption: resTesto.trim(), contextInfo: legamContext('Verifica Ticket') }, { quoted: m });
        else await conn.sendMessage(m.chat, { text: resTesto.trim() }, { quoted: m });
    }
};

handler.command = /^(partite|palinsesto|betpa|riscatta)$/i;
handler.group = true;
export default handler;

