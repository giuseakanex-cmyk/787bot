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
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)'; ctx.lineWidth = 1; ctx.strokeRect(15, 15, 470, 220);

    ctx.fillStyle = '#facc15'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('LEGAM CASINO • VIP TICKET', 250, 45);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(50, 60, 400, 2);

    ctx.fillStyle = '#94a3b8'; ctx.font = '16px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(`Player: @${username}`, 40, 95);
    ctx.textAlign = 'right'; ctx.fillText(`Round: ${round}/5`, 460, 95);

    fillRoundRect(ctx, 40, 115, 200, 70, 10, 'rgba(255,255,255,0.05)');
    ctx.fillStyle = '#94a3b8'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('PUNTATA SUL', 140, 135);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 30px sans-serif'; ctx.fillText(pick, 140, 170);

    fillRoundRect(ctx, 260, 115, 200, 70, 10, 'rgba(255,255,255,0.05)');
    ctx.fillStyle = '#94a3b8'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('IMPORTO (€)', 360, 135);
    ctx.fillStyle = '#10b981'; ctx.font = 'bold 26px sans-serif'; ctx.fillText(f(amount), 360, 168);

    ctx.fillStyle = '#ffffff'; for (let i = 0; i < 60; i++) { let bw = Math.random() > 0.5 ? 2 : 4; ctx.fillRect(50 + (i * 6.5), 200, bw, 20); }
    return cvs.toBuffer('image/png');
}

async function drawHDWheel(winner, isSpinning = false) {
    let createCanvas; try { const canvasLib = await import('canvas'); createCanvas = canvasLib.createCanvas; } catch (e) { return null; }
    const cvs = createCanvas(800, 800); const ctx = cvs.getContext('2d');

    ctx.fillStyle = '#020617'; ctx.fillRect(0, 0, 800, 800);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'; ctx.lineWidth = 2;
    for (let i = -800; i < 800; i += 20) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 800, 800); ctx.stroke(); }

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
        
        if (isSpinning) { ctx.shadowColor = color; ctx.shadowBlur = 20; } 
        else { ctx.shadowColor = "rgba(0,0,0,0.8)"; ctx.shadowBlur = 10; }
        
        ctx.fillText(item, r - 20, 0); ctx.restore();
    }
    if (isSpinning) ctx.restore();

    ctx.beginPath(); ctx.arc(cx, cy, 60, 0, Math.PI*2); ctx.fillStyle = '#0f172a'; ctx.fill();
    ctx.lineWidth = 10; ctx.strokeStyle = '#facc15'; ctx.stroke();
    ctx.fillStyle = '#facc15'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('LEGAM', cx, cy);

    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 15; ctx.beginPath();
    ctx.moveTo(400, 30); ctx.lineTo(440, 0); 
    if (isSpinning) ctx.lineTo(400, 110); 
    else ctx.lineTo(400, 130); 
    ctx.lineTo(360, 0); ctx.closePath();
    ctx.fillStyle = '#ef4444'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffffff'; ctx.stroke(); ctx.shadowBlur = 0;

    fillRoundRect(ctx, 150, 680, 500, 80, 20, 'rgba(15, 23, 42, 0.9)');
    ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3; ctx.strokeRect(150, 680, 500, 80); 
    ctx.fillStyle = '#facc15'; ctx.font = 'bold 45px sans-serif'; ctx.textAlign = 'center';
    
    if (isSpinning) ctx.fillText(`SPINNING...`, 400, 735);
    else ctx.fillText(`WINNER: ${winner}`, 400, 735);

    return cvs.toBuffer('image/png');
}

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    let chatId = m.chat; let user = global.db.data.users[m.sender];

    if (command === 'resetct' || command === 'stopct') {
        if (!isOwner) return m.reply(`『 ❌ 』 \`Solo l'Owner può chiudere il banco in anticipo!\``)
        let game = global.crazyTime[chatId]; if (!game) return m.reply(`『 💡 』 \`Nessuna sessione attiva.\``)
        if (game.timer) clearTimeout(game.timer);
        if (game.bets && game.bets.length > 0) {
            for (let b of game.bets) if (global.db.data.users[b.sender]) global.db.data.users[b.sender].euro += b.amount;
            m.reply(`『 🛑 』 \`SESSIONE ANNULLATA DALL'OWNER\`\nTutti i ticket rimborsati.`)
        } else m.reply(`『 🛑 』 \`SESSIONE ANNULLATA\``)
        delete global.crazyTime[chatId]; return
    }

    if (command === 'crazytime' || command === 'ct') {
        if (global.crazyTime[chatId]) return m.reply(`『 🛑 』 \`Sessione in corso!\``)
        global.crazyTime[chatId] = { state: 'betting', round: 1, maxRounds: 5, bets: [], timer: null }
        apriLobby(conn, chatId, usedPrefix); return
    }

    if (command === 'betct') {
        let game = global.crazyTime[chatId]; if (!game) return m.reply(`『 ⚠️ 』 \`Nessuna sessione. Usa ${usedPrefix}ct\``)
        if (game.state !== 'betting') return m.reply(`『 🛑 』 \`Puntate chiuse!\``)
        if (!args[0] || !args[1]) return m.reply(`👉 Usa: *${usedPrefix}betct [SEGMENTO] [EURO]*`)

        let pick = args[0].toUpperCase(); let amount = parseInt(args[1]); let validPicks = WHEEL.map(s => s.name);
        if (!validPicks.includes(pick)) return m.reply(`『 ❌ 』 \`Segmento non valido.\``)
        if (isNaN(amount) || amount <= 0) return m.reply(`『 ⚠️ 』 \`Puntata non valida.\``)
        if (user.euro < amount) return m.reply(`『 💸 』 \`Fondi insufficienti.\``)

        user.euro -= amount; game.bets.push({ sender: m.sender, pick, amount })

        let username = m.sender.split('@')[0];
        let ticketImg = await generateTicket(username, pick, amount, game.round);
        if (ticketImg) await conn.sendMessage(chatId, { image: ticketImg, caption: `『 🎟️ 』 \`Ticket Stampato con Successo!\`` }, { quoted: m });
        else m.reply(`✅ Ticket: ${pick} - ${amount}€`); 
    }
}

async function apriLobby(conn, chatId, usedPrefix) {
    let game = global.crazyTime[chatId]; if (!game) return
    let tempo = game.round === 1 ? 40000 : 25000 
    let lobbyTesto = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n·  𝐂 𝐑 𝐀 𝐙 𝐘  𝐓 𝐈 𝐌 𝐄  ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 🔄 』 𝐑 𝐎 𝐔 𝐍 𝐃  ${game.round} / ${game.maxRounds}\nFate le puntate! Il banco è aperto.\n\n『 💰 』 𝐒 𝐄 𝐆 𝐌 𝐄 𝐍 𝐓 𝐈\n· [𝟏] · [𝟐] · [𝟓] · [𝟏𝟎]\n· [𝐂𝐎𝐈𝐍] · [𝐏𝐀𝐂𝐇𝐈𝐍𝐊𝐎]\n· [𝐂𝐀𝐒𝐇] · [𝐂𝐑𝐀𝐙𝐘]\n\n💡 Scrivi: *.betct [Segmento] [Euro]*\n⏱️ 𝐂𝐡𝐢𝐮𝐬𝐮𝐫𝐚: ${tempo/1000}s`.trim()

    let legamCtx = { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: '120363259442839354@newsletter', newsletterName: `🎡 Legam Casino`, serverMessageId: 100 } };
    
    if (game.round === 1) {
        try {
            // 🔥 FIX ENOENT: Scarichiamo manualmente il buffer dell'immagine invece di passare l'URL nudo a Baileys
            let imgRes = await fetch(MENU_IMAGE_URL);
            let imgBuffer = Buffer.from(await imgRes.arrayBuffer());
            await conn.sendMessage(chatId, { image: imgBuffer, caption: lobbyTesto, contextInfo: legamCtx });
        } catch (e) {
            // Se fallisce il download, manda il testo normale
            await conn.sendMessage(chatId, { text: lobbyTesto, contextInfo: legamCtx });
        }
    } else {
        await conn.sendMessage(chatId, { text: lobbyTesto, contextInfo: legamCtx })
    }

    game.timer = setTimeout(() => startSpin(conn, chatId), tempo)
}

async function startSpin(conn, chatId) {
    let game = global.crazyTime[chatId]; if (!game) return
    game.state = 'spinning'
    await conn.sendMessage(chatId, { text: `『 🚨 』 \`PUNTATE CHIUSE!\`\n🎰 Analisi Top Slot in corso...` })
    if (!global.crazyTime[chatId]) return 

    let tsSegment = WHEEL[Math.floor(Math.random() * WHEEL.length)].name; let tsMultiplier = [2, 3, 5, 7, 10, 15, 20, 50][Math.floor(Math.random() * 8)]; let tsHit = Math.random() > 0.6 
    let result = spinWheel(); let finalMultiplier = result.mul; let isBonus = result.mul === 0; let bonusTS = (tsHit && tsSegment === result.name) ? tsMultiplier : 1

    let tsMsg = tsHit ? `🔥 **TOP SLOT HIT!** 🔥\n[ *${tsSegment}* ] ➻ **${tsMultiplier}x**` : `💨 **TOP SLOT MISS!**`

    let spinImg = await drawHDWheel(result.name, true);
    if (spinImg) await conn.sendMessage(chatId, { image: spinImg, caption: `${tsMsg}\n\n🎡 La ruota gigante gira velocemente...` });
    
    await new Promise(r => setTimeout(r, 4500)); 
    if (!global.crazyTime[chatId]) return 

    let winImg = await drawHDWheel(result.name, false);
    if (winImg) await conn.sendMessage(chatId, { image: winImg, caption: `✨ La ruota rallenta e si ferma su... [ **${result.name}** ] ✨` });

    await new Promise(r => setTimeout(r, 2000));
    if (!global.crazyTime[chatId]) return 

    if (isBonus) await handleBonus(conn, chatId, result.name, game, bonusTS)
    else await finalizeRound(conn, chatId, result.name, finalMultiplier * bonusTS, game)
}

async function handleBonus(conn, chatId, type, game, ts) {
    if (!global.crazyTime[chatId]) return
    let winMul = 0;
    switch(type) {
        case 'COIN': await conn.sendMessage(chatId, { text: `🪙 Inizio **COIN FLIP**!\nRosso (5x) vs Blu (Rnd)... Lancio...` }); await new Promise(r => setTimeout(r, 3000)); winMul = Math.random() > 0.5 ? 5 : Math.floor(Math.random() * 20) + 10; break;
        case 'PACHINKO': await conn.sendMessage(chatId, { text: `🏮 Inizio **PACHINKO**!\nLa pallina scende...` }); await new Promise(r => setTimeout(r, 4000)); winMul = [10, 20, 30, 50, 100][Math.floor(Math.random() * 5)]; break;
        case 'CASH': await conn.sendMessage(chatId, { text: `🎯 Inizio **CASH HUNT**!\nIl sistema spara...` }); await new Promise(r => setTimeout(r, 4000)); winMul = Math.floor(Math.random() * 80) + 10; break;
        case 'CRAZY': await conn.sendMessage(chatId, { text: `🌈 Entriamo nel **CRAZY TIME**!\nLa ruota gigante sta rallentando...` }); await new Promise(r => setTimeout(r, 5000)); winMul = [50, 100, 200, 500, 1000][Math.floor(Math.random() * 5)]; break;
    }
    if (!global.crazyTime[chatId]) return
    await conn.sendMessage(chatId, { text: `👑 Il bonus paga: **${winMul}x**!` })
    await finalizeRound(conn, chatId, type, winMul * ts, game)
}

async function finalizeRound(conn, chatId, resultName, totalMul, game) {
    if (!global.crazyTime[chatId]) return
    let winners = ""; let participants = game.bets.map(b => b.sender);
    for (let b of game.bets) {
        if (b.pick === resultName) {
            let winAmount = Math.floor(b.amount * totalMul); global.db.data.users[b.sender].euro += (winAmount + b.amount); winners += `\n✅ @${b.sender.split('@')[0]} vince **+${f(winAmount)} €**`
        } else { winners += `\n❌ @${b.sender.split('@')[0]} perde -${f(b.amount)} €` }
    }

    let report = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n·   𝐑 𝐎 𝐔 𝐍 𝐃  ${game.round} / ${game.maxRounds}   ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 🏆 』 𝐄 𝐒 𝐈 𝐓 𝐎 : [ **${resultName}** ]\n· 𝐌𝐨𝐥𝐭𝐢𝐩𝐥𝐢𝐜𝐚𝐭𝐨𝐫𝐞 ➻ ${totalMul}x\n\n${game.bets.length > 0 ? `『 💰 』 𝐑 𝐄 𝐒 𝐎 𝐂 𝐎 𝐍 𝐓 𝐎${winners}` : "『 😅 』 Nessuna giocata."}\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()
    await conn.sendMessage(chatId, { text: report, mentions: participants })

    if (game.round < game.maxRounds) {
        await new Promise(r => setTimeout(r, 4000)); if (!global.crazyTime[chatId]) return; game.round++; game.bets = []; game.state = 'betting'; await apriLobby(conn, chatId, ".") 
    } else {
        await new Promise(r => setTimeout(r, 3000)); if (!global.crazyTime[chatId]) return; await conn.sendMessage(chatId, { text: `🛑 **SESSIONE CONCLUSA!**\nGrazie per aver giocato al Casino Legam OS.` }); delete global.crazyTime[chatId]
    }
}

handler.command = /^(crazytime|ct|betct|resetct|stopct)$/i; handler.group = true; export default handler;


