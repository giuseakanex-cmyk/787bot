global.crazyTime = global.crazyTime || {}
const f = (n) => new Intl.NumberFormat('it-IT').format(n)
import fetch from 'node-fetch';

const MENU_IMAGE_URL = 'https://i.ibb.co/TM079xF2/IMG-2037.webp';

const WHEEL = [
    { name: '1', mul: 1, weight: 21 }, { name: '2', mul: 2, weight: 13 },
    { name: '5', mul: 5, weight: 7 }, { name: '10', mul: 10, weight: 4 },
    { name: 'COIN', mul: 0, weight: 4 }, { name: 'PACHINKO', mul: 0, weight: 2 }, 
    { name: 'CASH', mul: 0, weight: 2 }, { name: 'CRAZY', mul: 0, weight: 1 }      
]

// [LOGICA CANVAS INVARIATA]
function spinWheel() {
    let totalWeight = WHEEL.reduce((acc, s) => acc + s.weight, 0); let random = Math.random() * totalWeight;
    for (let s of WHEEL) { if (random < s.weight) return s; random -= s.weight; }
}

function fillRoundRect(ctx, x, y, w, h, r, fillColor) {
    ctx.fillStyle = fillColor; ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill();
}

const colors = {
    '1': ['#3b82f6', '#1d4ed8'], '2': ['#eab308', '#a16207'], '5': ['#ec4899', '#be185d'], '10': ['#a855f7', '#7e22ce'],
    'COIN': ['#0ea5e9', '#0369a1'], 'PACHINKO': ['#d946ef', '#a21caf'], 'CASH': ['#22c55e', '#15803d'], 'CRAZY': ['#ef4444', '#b91c1c']
};

async function generateTicket(username, pick, amount, round) {
    let createCanvas; try { const canvasLib = await import('canvas'); createCanvas = canvasLib.createCanvas; } catch (e) { return null; }
    const cvs = createCanvas(500, 250); const ctx = cvs.getContext('2d');
    let bg = ctx.createLinearGradient(0, 0, 500, 250); bg.addColorStop(0, '#0f172a'); bg.addColorStop(1, '#020617');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 500, 250);
    ctx.strokeStyle = '#facc15'; ctx.lineWidth = 4; ctx.strokeRect(10, 10, 480, 230);
    ctx.fillStyle = '#facc15'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('787 SYSTEM • CORE TICKET', 250, 45);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(50, 60, 400, 2);
    ctx.fillStyle = '#94a3b8'; ctx.font = '16px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(`User: @${username}`, 40, 95);
    ctx.textAlign = 'right'; ctx.fillText(`Round: ${round}/5`, 460, 95);
    fillRoundRect(ctx, 40, 115, 200, 70, 10, 'rgba(255,255,255,0.05)');
    ctx.fillStyle = '#94a3b8'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('SETTORE', 140, 135);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 30px sans-serif'; ctx.fillText(pick, 140, 170);
    fillRoundRect(ctx, 260, 115, 200, 70, 10, 'rgba(255,255,255,0.05)');
    ctx.fillStyle = '#94a3b8'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('VALORE (€)', 360, 135);
    ctx.fillStyle = '#10b981'; ctx.font = 'bold 26px sans-serif'; ctx.fillText(f(amount), 360, 168);
    ctx.fillStyle = '#ffffff'; for (let i = 0; i < 60; i++) { let bw = Math.random() > 0.5 ? 2 : 4; ctx.fillRect(50 + (i * 6.5), 200, bw, 20); }
    return cvs.toBuffer('image/png');
}

async function drawHDWheel(winner, isSpinning = false) {
    let createCanvas; try { const canvasLib = await import('canvas'); createCanvas = canvasLib.createCanvas; } catch (e) { return null; }
    const cvs = createCanvas(800, 800); const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, 800, 800);
    const cx = 400; const cy = 400; const r = 300; const segments = 16; const anglePerSegment = (Math.PI * 2) / segments;
    let wheelItems = [winner];
    let allKeys = Object.keys(colors);
    for(let i=1; i<segments; i++) wheelItems.push(allKeys[Math.floor(Math.random() * allKeys.length)]);
    ctx.beginPath(); ctx.arc(cx, cy, r + 15, 0, Math.PI*2); ctx.fillStyle = '#facc15'; ctx.fill();
    if (isSpinning) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.random() * Math.PI); ctx.translate(-cx, -cy); }
    for(let i=0; i<segments; i++) {
        let startAngle = -Math.PI/2 - (anglePerSegment/2) + (i * anglePerSegment);
        let endAngle = startAngle + anglePerSegment;
        let item = wheelItems[i]; let color = colors[item][i % 2]; 
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, startAngle, endAngle); ctx.closePath();
        ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#fcd34d'; ctx.stroke();
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(startAngle + anglePerSegment/2);
        ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.fillStyle = "#ffffff"; ctx.font = "bold 40px sans-serif";
        ctx.fillText(item, r - 20, 0); ctx.restore();
    }
    if (isSpinning) ctx.restore();
    ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI*2); ctx.fillStyle = '#0f172a'; ctx.fill();
    ctx.fillStyle = '#facc15'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('787', cx, cy);
    fillRoundRect(ctx, 150, 680, 500, 80, 20, 'rgba(15, 23, 42, 0.9)');
    ctx.fillStyle = '#facc15'; ctx.font = 'bold 45px sans-serif'; ctx.textAlign = 'center';
    if (isSpinning) ctx.fillText(`SPINNING...`, 400, 735);
    else ctx.fillText(`WINNER: ${winner}`, 400, 735);
    return cvs.toBuffer('image/png');
}

// ================================================
// ⚙️ 787 SYSTEM CORE MODULE
// ================================================
let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    let chatId = m.chat; let user = global.db.data.users[m.sender];
    const sysHeader = `⌬ ━━━───  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ───━━━ ⌬`;

    if (command === 'resetct' || command === 'stopct') {
        if (!isOwner) return m.reply(`⌬ ❯ Accesso negato host.`);
        let game = global.crazyTime[chatId]; if (!game) return m.reply(`⌬ ❯ Nessun processo attivo.`);
        if (game.timer) clearTimeout(game.timer);
        if (game.bets && game.bets.length > 0) {
            for (let b of game.bets) if (global.db.data.users[b.sender]) global.db.data.users[b.sender].euro += b.amount;
            m.reply(`⌬ ❯ *SESSIONE INTERROTTA*\nCrediti ripristinati.`);
        } else m.reply(`⌬ ❯ *SESSIONE ANNULLATA*`);
        delete global.crazyTime[chatId]; return;
    }

    if (command === 'crazytime' || command === 'ct') {
        if (global.crazyTime[chatId]) return m.reply(`⌬ ❯ Errore: Processo in esecuzione.`);
        global.crazyTime[chatId] = { state: 'betting', round: 1, maxRounds: 5, bets: [], timer: null };
        apriLobby(conn, chatId, usedPrefix); return;
    }

    if (command === 'betct') {
        let game = global.crazyTime[chatId]; if (!game) return m.reply(`⌬ ❯ Modulo non inizializzato.`);
        if (game.state !== 'betting') return m.reply(`⌬ ❯ Errore: Puntate chiuse.`);
        if (!args[0] || !args[1]) return m.reply(`⌬ ❯ Uso: ${usedPrefix}betct [Settore] [Importo]`);

        let pick = args[0].toUpperCase(); let amount = parseInt(args[1]); let validPicks = WHEEL.map(s => s.name);
        if (!validPicks.includes(pick)) return m.reply(`⌬ ❯ Settore non presente nel database.`);
        if (isNaN(amount) || amount <= 0) return m.reply(`⌬ ❯ Valore non valido.`);
        if (user.euro < amount) return m.reply(`⌬ ❯ Fondi insufficienti.`);

        user.euro -= amount; game.bets.push({ sender: m.sender, pick, amount });
        let username = m.sender.split('@')[0];
        let ticketImg = await generateTicket(username, pick, amount, game.round);
        if (ticketImg) await conn.sendMessage(chatId, { image: ticketImg, caption: `⌬ ❯ *TICKET ACQUISITO*\n➡ Settore: ${pick}\n➡ Valore: ${f(amount)}€` }, { quoted: m });
    }
}

async function apriLobby(conn, chatId, usedPrefix) {
    let game = global.crazyTime[chatId]; if (!game) return
    let tempo = game.round === 1 ? 40000 : 25000 
    
    let lobbyTesto = `
⌬ ━━━───  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ───━━━ ⌬

⌬ ❯ **ROUND ${game.round} / ${game.maxRounds}**
Ingresso puntate aperto. Inserire settore e valore.

⌬ ❯ **SETTORI DISPONIBILI**
➡ [1] [2] [5] [10]
➡ [COIN] [PACHINKO] [CASH] [CRAZY]

⌬ ❯ **SINTASSI**
${usedPrefix}betct [Settore] [Euro]
Esempio: *.betct CRAZY 500*

⏱️ Chiusura modulo: ${tempo/1000}s
⌬ ━━━───  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ───━━━ ⌬`.trim()

    let sysCtx = { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363259442839354@newsletter', newsletterName: `𝟕𝟖𝟕 𝐒𝐘𝐒𝐓𝐄𝐌 𝐂𝐎𝐑𝐄`, serverMessageId: 100 } };
    
    if (game.round === 1) {
        try {
            let imgRes = await fetch(MENU_IMAGE_URL);
            let imgBuffer = Buffer.from(await imgRes.arrayBuffer());
            await conn.sendMessage(chatId, { image: imgBuffer, caption: lobbyTesto, contextInfo: sysCtx });
        } catch (e) { await conn.sendMessage(chatId, { text: lobbyTesto, contextInfo: sysCtx }); }
    } else {
        await conn.sendMessage(chatId, { text: lobbyTesto, contextInfo: sysCtx })
    }
    game.timer = setTimeout(() => startSpin(conn, chatId), tempo)
}

async function startSpin(conn, chatId) {
    let game = global.crazyTime[chatId]; if (!game) return
    game.state = 'spinning'
    await conn.sendMessage(chatId, { text: `⌬ ❯ *LOCK PUNTATE*\nElaborazione dati Top Slot...` })

    let tsSegment = WHEEL[Math.floor(Math.random() * WHEEL.length)].name; let tsMultiplier = [2, 3, 5, 7, 10, 15, 20, 50][Math.floor(Math.random() * 8)]; let tsHit = Math.random() > 0.6 
    let result = spinWheel(); let bonusTS = (tsHit && tsSegment === result.name) ? tsMultiplier : 1
    let tsMsg = tsHit ? `🔥 *TOP SLOT HIT!* 🔥\n[ ${tsSegment} ] ➻ *${tsMultiplier}x*` : `💨 *TOP SLOT MISS!*`

    let spinImg = await drawHDWheel(result.name, true);
    if (spinImg) await conn.sendMessage(chatId, { image: spinImg, caption: `${tsMsg}\n\nEsecuzione rotazione modulo...` });
    
    await new Promise(r => setTimeout(r, 4500)); 
    let winImg = await drawHDWheel(result.name, false);
    if (winImg) await conn.sendMessage(chatId, { image: winImg, caption: `⌬ ❯ Risultato finale: [ **${result.name}** ]` });

    await new Promise(r => setTimeout(r, 2000));
    if (result.mul === 0) await handleBonus(conn, chatId, result.name, game, bonusTS)
    else await finalizeRound(conn, chatId, result.name, result.mul * bonusTS, game)
}

async function handleBonus(conn, chatId, type, game, ts) {
    let winMul = 0;
    switch(type) {
        case 'COIN': 
            await conn.sendMessage(chatId, { text: `🪙 *COIN FLIP*\nSincronizzazione Rosso vs Blu...` }); 
            await new Promise(r => setTimeout(r, 3000)); winMul = Math.random() > 0.5 ? 5 : Math.floor(Math.random() * 20) + 10; break;
        case 'PACHINKO': 
            await conn.sendMessage(chatId, { text: `🏮 *PACHINKO*\nCalcolo caduta pallina...` }); 
            await new Promise(r => setTimeout(r, 4000)); winMul = [10, 20, 30, 50, 100][Math.floor(Math.random() * 5)]; break;
        case 'CASH': 
            await conn.sendMessage(chatId, { text: `🎯 *CASH HUNT*\nAggancio bersaglio...` }); 
            await new Promise(r => setTimeout(r, 4000)); winMul = Math.floor(Math.random() * 80) + 10; break;
        case 'CRAZY': 
            await conn.sendMessage(chatId, { text: `🌈 *CRAZY TIME ACCESS*\nIngresso area bonus confermato.` }); 
            await new Promise(r => setTimeout(r, 5000)); winMul = [50, 100, 200, 500, 1000][Math.floor(Math.random() * 5)]; break;
    }
    await conn.sendMessage(chatId, { text: `⌬ ❯ Moltiplicatore acquisito: *${winMul}x*!` })
    await finalizeRound(conn, chatId, type, winMul * ts, game)
}

async function finalizeRound(conn, chatId, resultName, totalMul, game) {
    let winners = ""; let participants = game.bets.map(b => b.sender);
    for (let b of game.bets) {
        if (b.pick === resultName) {
            let winAmount = Math.floor(b.amount * totalMul); global.db.data.users[b.sender].euro += (winAmount + b.amount); winners += `\n✅ @${b.sender.split('@')[0]} ➻ *+${f(winAmount)} €*`
        } else { winners += `\n❌ @${b.sender.split('@')[0]} ➻ -${f(b.amount)} €` }
    }

    let report = `
⌬ ━━━───  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ───━━━ ⌬

⌬ ❯ **REPORT ROUND ${game.round}**
Settore: [ **${resultName}** ]
Moltiplicatore: *${totalMul}x*

⌬ ❯ **LOG TRANSAZIONI**
${game.bets.length > 0 ? winners : "Nessun dato registrato."}

⌬ ━━━───  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ───━━━ ⌬`.trim()
    await conn.sendMessage(chatId, { text: report, mentions: participants })

    if (game.round < game.maxRounds) {
        await new Promise(r => setTimeout(r, 4000)); game.round++; game.bets = []; game.state = 'betting'; await apriLobby(conn, chatId, ".") 
    } else {
        await new Promise(r => setTimeout(r, 3000)); await conn.sendMessage(chatId, { text: `⌬ ❯ *SESSIONE CHIUSA*\nDatabase ricalibrato.` }); delete global.crazyTime[chatId]
    }
}

handler.command = /^(crazytime|ct|betct|resetct|stopct)$/i; handler.group = true; export default handler;
