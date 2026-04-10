
// ==========================================
// LEGAM OS - ACTIVITY TRACKER & REWARDS (SAFE MONEY)
// ==========================================

const legamHeader = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n·  𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒  ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
const legamFooter = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n. . ✦  .  ⁺  .  ✦  . .`;

// ================================================
// 🔄 COMANDO MANUALE: !resetstats (Solo Admin)
// ================================================
let handler = async (m, { conn, isGroup, isAdmin, isOwner }) => {
    if (!isGroup) return;
    
    // Controlla se chi usa il comando è admin o owner
    if (!isAdmin && !isOwner) {
        return m.reply("❌ Comando riservato agli Amministratori.");
    }

    // Azzera SOLO le statistiche di attività del gruppo (messaggi e tempo)
    global.db.data.groupActivity = global.db.data.groupActivity || {};
    global.db.data.groupActivity[m.chat] = {}; 
    
    let msg = `${legamHeader}\n\n『 🔄 』 𝐑 𝐄 𝐒 𝐄 𝐓  𝐒 𝐓 𝐀 𝐓 𝐒\n· Statistiche di attività azzerate!\n· 💰 I soldi degli utenti sono intatti.\n\n${legamFooter}`;
    await conn.sendMessage(m.chat, { text: msg }, { quoted: m });
};

// ================================================
// ⚙️ MOTORE BACKGROUND: TRACCIAMENTO ATTIVITÀ
// ================================================
handler.before = async function (m) {
    if (!m.chat || m.fromMe || !m.sender || !m.isGroup) return;

    // Crea i database se non esistono
    global.db.data.groupActivity = global.db.data.groupActivity || {};
    if (!global.db.data.groupActivity[m.chat]) global.db.data.groupActivity[m.chat] = {};

    let now = Date.now();
    let chatData = global.db.data.groupActivity[m.chat];

    // Se l'utente non ha mai scritto nel gruppo, inizializzalo
    if (!chatData[m.sender]) {
        chatData[m.sender] = {
            msgCount: 0,
            onlineTime: 0,
            timeForReward: 0,
            lastMessageTime: now
        };
    }
    
    let userAct = chatData[m.sender];

    // Inizializzazione sicura dei soldi dell'utente nel database principale (INTOCCABILE DAL RESET)
    global.db.data.users = global.db.data.users || {};
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { euro: 0 };
    if (typeof global.db.data.users[m.sender].euro !== 'number') global.db.data.users[m.sender].euro = 0;

    // ================================================
    // ⏱️ 1. CALCOLO PRECISO DEI SECONDI ONLINE
    // ================================================
    let diffSeconds = Math.floor((now - userAct.lastMessageTime) / 1000);
    let secondsToAdd = 0;

    if (diffSeconds > 0 && diffSeconds <= 300) {
        secondsToAdd = diffSeconds;
    } else {
        secondsToAdd = 10; 
    }

    userAct.onlineTime += secondsToAdd;
    userAct.timeForReward += secondsToAdd;
    userAct.lastMessageTime = now;

    // ================================================
    // 🎯 2. TRAGUARDO MESSAGGI (Ogni 100 nel gruppo)
    // ================================================
    userAct.msgCount += 1;
    if (userAct.msgCount % 100 === 0) {
        // Assegna i soldi
        global.db.data.users[m.sender].euro += 200; 
        
        let msgReward = `🎉 @${m.sender.split('@')[0]} hai scritto altri 100 messaggi in questo gruppo, hai guadagnato 200€!`;
        await this.sendMessage(m.chat, { text: msgReward, mentions: [m.sender] });
    }

    // ================================================
    // 🎁 3. TRAGUARDO TEMPO (Ogni 1 Ora nel gruppo)
    // ================================================
    if (userAct.timeForReward >= 3600) {
        // Assegna i soldi e resetta solo il contatore "timeForReward"
        global.db.data.users[m.sender].euro += 300;
        userAct.timeForReward = 0; 
        
        let oreTotali = Math.floor(userAct.onlineTime / 3600);
        if (oreTotali < 1) oreTotali = 1; // Sicurezza
        
        let txtOra = `🎉 @${m.sender.split('@')[0]} hai raggiunto *${oreTotali} ore* di attività nel gruppo, hai guadagnato 300€!`;
        await this.sendMessage(m.chat, { text: txtOra, mentions: [m.sender] });
    }
};

handler.help = ['resetstats'];
handler.tags = ['admin'];
// Si può chiamare sia !resetstats che !azzerastats
handler.command = /^(resetstats|azzerastats)$/i;
handler.group = true;
handler.admin = true;

export default handler;


