
// 🌌 LEGAM OS - QUIZ ARENA (BOTTONI NATIVE & GRAFICA CURVA PREMIUM) 🌌
const { generateWAMessageFromContent, proto } = (await import('@realvare/baileys')).default;

let isCanvasReady = false;
let createCanvas, loadImage;

try {
    const canvasModule = await import('canvas');
    createCanvas = canvasModule.createCanvas;
    loadImage = canvasModule.loadImage;
    isCanvasReady = true;
} catch (error) {
    console.log("[LEGAM OS] Modulo 'canvas' non trovato. Esegui: npm install canvas");
}

// ==========================================
// 📚 DATABASE TITANICO (ESPANDO)
// ==========================================
const quizDB = {
    generale: [
        { q: "Qual è il fiume più lungo del mondo?", opts: ["Nilo", "Gange", "Mississipi"], copts: "Rio delle Amazzoni", diff: "EASY", max: 300 },
        { q: "Chi ha dipinto la Gioconda?", opts: ["Raffaello", "Michelangelo", "Donatello"], copts: "Leonardo da Vinci", diff: "EASY", max: 250 },
        { q: "Qual è la valuta ufficiale del Giappone?", opts: ["Yuan", "Won", "Dollaro"], copts: "Yen", diff: "EASY", max: 200 },
        { q: "In quale città si trova il Colosseo?", opts: ["Milano", "Napoli", "Firenze"], copts: "Roma", diff: "EASY", max: 150 },
        { q: "Qual è il simbolo chimico dell'Oro?", opts: ["Ag", "Or", "Fe"], copts: "Au", diff: "MEDIUM", max: 400 },
        { q: "Qual è la capitale dell'Australia?", opts: ["Sydney", "Melbourne", "Brisbane"], copts: "Canberra", diff: "HARD", max: 600 },
        { q: "Qual è l'osso più lungo del corpo umano?", opts: ["Tibia", "Omero", "Perone"], copts: "Femore", diff: "MEDIUM", max: 400 },
        { q: "Qual è il colore della scatola nera degli aerei?", opts: ["Nera", "Rossa", "Gialla"], copts: "Arancione", diff: "HARD", max: 700 }
    ],
    logica: [
        { q: "Cosa ha le chiavi ma non apre nessuna porta?", opts: ["Un lucchetto", "Una mappa", "Un tesoro"], copts: "Il pianoforte", diff: "MEDIUM", max: 500 },
        { q: "Più ne togli, più diventa grande. Cos'è?", opts: ["Il tempo", "Il debito", "Il vuoto"], copts: "Un buco", diff: "MEDIUM", max: 500 },
        { q: "Se mi nomini, mi rompi. Chi sono?", opts: ["Il vetro", "Il segreto", "Il ghiaccio"], copts: "Il silenzio", diff: "EASY", max: 350 },
        { q: "Sono alto quando sono giovane, e corto quando sono vecchio. Cosa sono?", opts: ["Un albero", "Un uomo", "Un serpente"], copts: "Una candela", diff: "HARD", max: 650 },
        { q: "Più ne lasci dietro, più ne fai. Cosa sono?", opts: ["Ricordi", "Debiti", "Anni"], copts: "Passi", diff: "MEDIUM", max: 400 },
        { q: "Cosa può viaggiare per il mondo restando sempre in un angolo?", opts: ["Un aereo", "Un pensiero", "Il vento"], copts: "Un francobollo", diff: "HARD", max: 650 }
    ],
    anime: [
        { q: "A chi è stato dato il titolo 'Full Metal' in Fullmetal Alchemist?", opts: ["Izumi Curtis", "Van Hohenheim", "Alphonse Elric"], copts: "Edward Elric", diff: "EASY", max: 380 },
        { q: "Qual è il vero nome di L in Death Note?", opts: ["Light Yagami", "Nate River", "Mihael Keehl"], copts: "L Lawliet", diff: "MEDIUM", max: 500 },
        { q: "In Dragon Ball, chi uccide per primo Freezer?", opts: ["Goku", "Vegeta", "Gohan"], copts: "Trunks del Futuro", diff: "MEDIUM", max: 400 },
        { q: "Come si chiama il maestro del Team 7 in Naruto?", opts: ["Jiraiya", "Iruka", "Asuma"], copts: "Kakashi", diff: "EASY", max: 200 },
        { q: "Chi è il protagonista di Attack on Titan?", opts: ["Levi Ackerman", "Armin Arlert", "Zeke Yeager"], copts: "Eren Yeager", diff: "EASY", max: 250 },
        { q: "Chi è il creatore del manga Berserk?", opts: ["Eiichiro Oda", "Masashi Kishimoto", "Akira Toriyama"], copts: "Kentaro Miura", diff: "HARD", max: 700 }
    ],
    sport: [
        { q: "Quanti Palloni d'Oro ha vinto Messi (fino al 2023)?", opts: ["6", "7", "5"], copts: "8", diff: "MEDIUM", max: 450 },
        { q: "Chi ha vinto il mondiale di calcio nel 2014?", opts: ["Argentina", "Francia", "Brasile"], copts: "Germania", diff: "EASY", max: 300 },
        { q: "Quanti tornei del Grande Slam di tennis ci sono in un anno?", opts: ["3", "5", "6"], copts: "4", diff: "EASY", max: 200 },
        { q: "Chi detiene il record di campionati vinti in Formula 1 insieme a Schumacher?", opts: ["Ayrton Senna", "Sebastian Vettel", "Max Verstappen"], copts: "Lewis Hamilton", diff: "MEDIUM", max: 400 },
        { q: "Quanti anelli NBA ha vinto Michael Jordan?", opts: ["4", "5", "7"], copts: "6", diff: "HARD", max: 700 }
    ],
    storia: [
        { q: "In che anno è stata scoperta l'America?", opts: ["1490", "1500", "1482"], copts: "1492", diff: "EASY", max: 300 },
        { q: "In quale anno è finita la Seconda Guerra Mondiale?", opts: ["1943", "1944", "1946"], copts: "1945", diff: "EASY", max: 300 },
        { q: "In che anno iniziò la Rivoluzione Francese?", opts: ["1776", "1804", "1799"], copts: "1789", diff: "HARD", max: 700 },
        { q: "Chi è stato il primo imperatore romano?", opts: ["Giulio Cesare", "Nerone", "Traiano"], copts: "Augusto", diff: "MEDIUM", max: 500 },
        { q: "In che anno è avvenuto lo sbarco sulla Luna?", opts: ["1965", "1971", "1960"], copts: "1969", diff: "MEDIUM", max: 500 }
    ],
    videogiochi: [
        { q: "Come si chiama il fratello di Super Mario?", opts: ["Wario", "Yoshi", "Toad"], copts: "Luigi", diff: "EASY", max: 200 },
        { q: "Quale azienda ha creato la console PlayStation?", opts: ["Microsoft", "Nintendo", "Sega"], copts: "Sony", diff: "EASY", max: 150 },
        { q: "Come si chiama il protagonista della saga di Zelda?", opts: ["Zelda", "Ganon", "Cloud"], copts: "Link", diff: "EASY", max: 250 },
        { q: "Chi urla la celebre frase 'Get over here!' in Mortal Kombat?", opts: ["Sub-Zero", "Raiden", "Shao Kahn"], copts: "Scorpion", diff: "MEDIUM", max: 400 },
        { q: "Chi è il creatore del gioco 'Five Nights at Freddy's'?", opts: ["Toby Fox", "Markus Persson", "Hideo Kojima"], copts: "Scott Cawthon", diff: "HARD", max: 800 }
    ]
};

// ==========================================
// 🛠️ FUNZIONI DI DISEGNO CANVAS (DESIGN CURVO)
// ==========================================

function drawRoundedPill(ctx, x, y, width, height, bgColor, strokeColor) {
    let radius = height / 2; // Raggio perfetto per pillole
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    
    if (bgColor) { ctx.fillStyle = bgColor; ctx.fill(); }
    if (strokeColor) { ctx.lineWidth = 3; ctx.strokeStyle = strokeColor; ctx.stroke(); }
}

function drawElegantBadge(ctx, text, x, y, bgColor, textColor) {
    ctx.font = 'bold 16px sans-serif';
    let textWidth = ctx.measureText(text).width;
    let width = textWidth + 40;
    let height = 36;

    drawRoundedPill(ctx, x, y, width, height, bgColor, null);
    
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + (width / 2), y + (height / 2) + 1); 
    
    return x + width + 15; 
}

function wrapTextCenter(ctx, text, x, y, maxWidth, lineHeight) {
    let words = text.split(' '), line = '';
    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ', metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, y); line = words[n] + ' '; y += lineHeight;
        } else line = testLine;
    }
    ctx.fillText(line, x, y);
}

// 🎨 IMMAGINE DELLA DOMANDA (PREMIUM)
async function generateQuizImage(category, diff, maxReward, question, options) {
    const canvas = createCanvas(1000, 600);
    const ctx = canvas.getContext('2d');

    // Sfondo Super Dark Blue
    ctx.fillStyle = '#0B1121'; ctx.fillRect(0, 0, 1000, 600);
    
    // Card Centrale Morbida
    drawRoundedPill(ctx, 40, 40, 920, 520, '#172033', null);

    // Titolo
    ctx.fillStyle = '#FFFFFF'; 
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('𝐋 𝐄 𝐆 𝐀 𝐌  𝐀 𝐑 𝐄 𝐍 𝐀', 500, 70);

    // Badges Centrati
    let totalBadgesWidth = ctx.measureText(`Difficoltà: ${diff}`).width + ctx.measureText(category.toUpperCase()).width + ctx.measureText(`${maxReward}€`).width + 150;
    let startX = (1000 - totalBadgesWidth) / 2;
    
    let nextX = startX;
    nextX = drawElegantBadge(ctx, `Difficoltà: ${diff}`, nextX, 120, '#1E293B', '#94A3B8');
    nextX = drawElegantBadge(ctx, category.toUpperCase(), nextX, 120, '#3B82F6', '#FFFFFF');
    drawElegantBadge(ctx, `💰 ${maxReward}€`, nextX, 120, '#1E293B', '#FACC15');

    // Testo Domanda
    ctx.fillStyle = '#FFFFFF'; 
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    wrapTextCenter(ctx, question, 500, 220, 800, 42);

    // Bottoni a Pillola 2x2
    const optBoxes = [{ x: 80, y: 360 }, { x: 510, y: 360 }, { x: 80, y: 450 }, { x: 510, y: 450 }];
    
    for (let i = 0; i < 4; i++) {
        let box = optBoxes[i];
        
        drawRoundedPill(ctx, box.x, box.y, 410, 70, '#1E293B', '#334155');
        
        // Cerchio del numero a sinistra
        ctx.beginPath(); 
        ctx.arc(box.x + 45, box.y + 35, 22, 0, Math.PI * 2); 
        ctx.fillStyle = '#3B82F6'; 
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF'; 
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i + 1}`, box.x + 45, box.y + 37); 
        
        ctx.fillStyle = '#F8FAFC'; 
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(options[i], box.x + 85, box.y + 37);
    }
    return canvas.toBuffer();
}

// 🎨 IMMAGINE DELLA VITTORIA (PREMIUM)
async function generateWinImage(earned, timeSec, winnerName, question, options, correctIndex) {
    const canvas = createCanvas(1000, 600);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0B1121'; ctx.fillRect(0, 0, 1000, 600);
    drawRoundedPill(ctx, 40, 40, 920, 520, '#172033', null);

    ctx.fillStyle = '#10B981'; 
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('𝐑 𝐈 𝐒 𝐏 𝐎 𝐒 𝐓 𝐀  𝐄 𝐒 𝐀 𝐓 𝐓 𝐀', 500, 70);

    let totalBadgesWidth = ctx.measureText(`Vincitore: ${winnerName}`).width + ctx.measureText(`+${earned}€`).width + ctx.measureText(`⏱️ ${timeSec}s`).width + 150;
    let startX = (1000 - totalBadgesWidth) / 2;
    
    let nextX = startX;
    nextX = drawElegantBadge(ctx, `Vincitore: ${winnerName}`, nextX, 120, '#1E293B', '#FFFFFF');
    nextX = drawElegantBadge(ctx, `+${earned}€`, nextX, 120, '#F59E0B', '#FFFFFF');
    drawElegantBadge(ctx, `⏱️ ${timeSec}s`, nextX, 120, '#1E293B', '#94A3B8');

    ctx.fillStyle = '#FFFFFF'; 
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    wrapTextCenter(ctx, question, 500, 220, 800, 42);

    const optBoxes = [{ x: 80, y: 360 }, { x: 510, y: 360 }, { x: 80, y: 450 }, { x: 510, y: 450 }];
    
    for (let i = 0; i < 4; i++) {
        let box = optBoxes[i], isCorrect = (i === correctIndex - 1);
        
        drawRoundedPill(ctx, box.x, box.y, 410, 70, isCorrect ? '#10B981' : '#1E293B', isCorrect ? null : '#334155');
        
        ctx.beginPath(); 
        ctx.arc(box.x + 45, box.y + 35, 22, 0, Math.PI * 2);
        ctx.fillStyle = isCorrect ? '#047857' : '#3B82F6'; 
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF'; 
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i + 1}`, box.x + 45, box.y + 37);
        
        ctx.fillStyle = isCorrect ? '#022C22' : '#F8FAFC'; 
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(options[i], box.x + 85, box.y + 37);
    }
    return canvas.toBuffer();
}

function shuffleArray(array) {
    let cur = array.length, rand;
    while (cur !== 0) { rand = Math.floor(Math.random() * cur); cur--; [array[cur], array[rand]] = [array[rand], array[cur]]; }
    return array;
}

// ==========================================
// 🎮 GESTIONE MENU A BOTTONI E AVVIO QUIZ
// ==========================================
let handler = async (m, { conn, args, usedPrefix }) => {
    if (!isCanvasReady) return m.reply("『 ⚠️ 』 *ERRORE*\nInstalla Canvas sul server digitando: `npm install canvas`");

    conn.quiz = conn.quiz || {};
    if (conn.quiz[m.chat]) return m.reply(`『 ⏳ 』 \`𝐐𝐔𝐈𝐙 𝐆𝐈𝐀' 𝐈𝐍 𝐂𝐎𝐑𝐒𝐎\`\nRispondi al quiz attuale prima di avviarne un altro!`);

    // 🔥 MENU A BOTTONI NATIVE FLOW 🔥
    if (!args[0]) {
        let menuTesto = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 🌌 𝐋𝐄𝐆𝐀𝐌 𝐐𝐔𝐈𝐙 𝐀𝐑𝐄𝐍𝐀 🌌 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 💡 』 Scegli il tuo campo di battaglia.\n_Rispondi in fretta, il montepremi scende ogni secondo!_\n\n*Clicca su un bottone qui sotto per iniziare:*`;

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({ text: menuTesto }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "✨ 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐆𝐚𝐦𝐢𝐧𝐠 ✨" }),
                        header: proto.Message.InteractiveMessage.Header.create({ title: "", hasMediaAttachment: false }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🌍 Generale", id: `${usedPrefix}quiz generale` }) },
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🧠 Logica", id: `${usedPrefix}quiz logica` }) },
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "⛩️ Anime", id: `${usedPrefix}quiz anime` }) },
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "⚽ Sport", id: `${usedPrefix}quiz sport` }) },
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "📜 Storia", id: `${usedPrefix}quiz storia` }) },
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "🎮 Videogiochi", id: `${usedPrefix}quiz videogiochi` }) }
                            ]
                        })
                    })
                }
            }
        }, { quoted: m });

        return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    }

    let category = args[0].toLowerCase();
    if (!quizDB[category]) return m.reply(`『 ❌ 』 \`𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐚 𝐧𝐨𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐚.\`\nDigita solo *${usedPrefix}quiz* per aprire il menu a bottoni.`);

    let qArray = quizDB[category];
    let qData = qArray[Math.floor(Math.random() * qArray.length)];

    let options = [...qData.opts, qData.copts];
    shuffleArray(options);
    let correctIndex = options.indexOf(qData.copts) + 1;

    let imgBuffer = await generateQuizImage(category, qData.diff, qData.max, qData.q, options);

    let sentMsg = await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: `Rispondi a questo messaggio con il numero dell'opzione (*1, 2, 3 o 4*).\n\n⏳ _Sbrigati, i soldi scendono di 1€ al secondo!_`
    }, { quoted: m });

    conn.quiz[m.chat] = {
        id: sentMsg.key.id, category: category, diff: qData.diff, maxReward: qData.max,
        question: qData.q, options: options, correctOption: correctIndex, startTime: Date.now(),
        timer: setTimeout(() => {
            if (conn.quiz[m.chat]) {
                conn.sendMessage(m.chat, { text: `『 ⏳ 』 \`𝐓𝐄𝐌𝐏𝐎 𝐒𝐂𝐀𝐃𝐔𝐓𝐎\`\nNessuno ha indovinato in tempo!\nLa risposta era la numero *${correctIndex}* (${qData.copts}).` });
                delete conn.quiz[m.chat];
            }
        }, 60000)
    };
};

handler.before = async function (m, { conn }) {
    if (!isCanvasReady) return false;
    
    conn.quiz = conn.quiz || {};
    let quiz = conn.quiz[m.chat];

    if (!quiz || !m.quoted || m.quoted.id !== quiz.id) return false;

    let answer = parseInt(m.text.trim());
    if (isNaN(answer) || answer < 1 || answer > 4) return false;

    if (answer !== quiz.correctOption) {
        await conn.sendMessage(m.chat, { text: `❌ Sbagliato! Riprova finché c'è tempo.` }, { quoted: m });
        return true;
    }

    let timeTakenSec = ((Date.now() - quiz.startTime) / 1000).toFixed(0);
    let earned = Math.max(10, quiz.maxReward - parseInt(timeTakenSec));

    global.db.data.users = global.db.data.users || {};
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { euro: 0 };
    global.db.data.users[m.sender].euro += earned;

    let winnerName = m.pushName || m.sender.split('@')[0];

    let winImgBuffer = await generateWinImage(earned, timeTakenSec, winnerName, quiz.question, quiz.options, quiz.correctOption);
    
    await conn.sendMessage(m.chat, { 
        image: winImgBuffer,
        caption: `🎉 *RISPOSTA ESATTA!* 🎉\n@${m.sender.split('@')[0]} ha incassato *${earned}€*!`,
        mentions: [m.sender]
    }, { quoted: m });

    clearTimeout(quiz.timer);
    delete conn.quiz[m.chat];

    return true;
};

handler.help = ['quiz'];
handler.tags = ['giochi'];
handler.command = /^(quiz|trivia)$/i;
handler.group = true;

export default handler;
