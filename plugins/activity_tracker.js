// ==========================================
// 787 SYSTEM - ACTIVITY TRACKER & REWARDS 
// ==========================================

const sysHeader = `⌬ ━━━───  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ───━━━ ⌬`;
const sysSeparator = `◈───────────────────────────◈`;
const sysFooter = `⌬ ━━━───  𝐒𝐘𝐒𝐓𝐄𝐌 𝐀𝐂𝐓𝐈𝐕𝐄  ───━━━ ⌬`;

// ================================================
// 🔄 COMANDO MANUALE: !resetstats (Solo Admin)
// ================================================
let handler = async (m, { conn, isGroup, isAdmin, isOwner }) => {
    if (!isGroup) return;
    
    if (!isAdmin && !isOwner) {
        return m.reply("⚠ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎: Permessi insufficienti.");
    }

    // Reset statistiche attività
    global.db.data.groupActivity = global.db.data.groupActivity || {};
    global.db.data.groupActivity[m.chat] = {}; 
    
    let msg = `
${sysHeader}

⌬ ❯ 𝐑 𝐄 𝐒 𝐄 𝐓  𝐒 𝐓 𝐀 𝐓 𝐒
${sysSeparator}
➡ Protocollo di reset completato.
➡ Database attività ricalibrato.
↪ 💰 I crediti utente sono rimasti invariati.

${sysFooter}`;

    await conn.sendMessage(m.chat, { text: msg }, { quoted: m });
};

// ================================================
// ⚙️ MOTORE BACKGROUND: TRACCIAMENTO ATTIVITÀ
// ================================================
handler.before = async function (m) {
    if (!m.chat || m.fromMe || !m.sender || !m.isGroup) return;

    global.db.data.groupActivity = global.db.data.groupActivity || {};
    if (!global.db.data.groupActivity[m.chat]) global.db.data.groupActivity[m.chat] = {};

    let now = Date.now();
    let chatData = global.db.data.groupActivity[m.chat];

    if (!chatData[m.sender]) {
        chatData[m.sender] = {
            msgCount: 0,
            onlineTime: 0,
            timeForReward: 0,
            lastMessageTime: now
        };
    }
    
    let userAct = chatData[m.sender];

    global.db.data.users = global.db.data.users || {};
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { euro: 0 };
    if (typeof global.db.data.users[m.sender].euro !== 'number') global.db.data.users[m.sender].euro = 0;

    // ⏱️ CALCOLO TEMPO ATTIVO
    let diffSeconds = Math.floor((now - userAct.lastMessageTime) / 1000);
    let secondsToAdd = (diffSeconds > 0 && diffSeconds <= 300) ? diffSeconds : 10;

    userAct.onlineTime += secondsToAdd;
    userAct.timeForReward += secondsToAdd;
    userAct.lastMessageTime = now;

    // 🎯 REWARD: MESSAGGI (Ogni 100)
    userAct.msgCount += 1;
    if (userAct.msgCount % 100 === 0) {
        global.db.data.users[m.sender].euro += 200; 
        
        let msgReward = `
${sysHeader}
⌬ ❯ 𝐑 𝐄 𝐖 𝐀 𝐑 𝐃  𝐃 𝐄 𝐓 𝐄 𝐂 𝐓 𝐄 𝐃
${sysSeparator}
➡ Utente: @${m.sender.split('@')[0]}
➡ Obiettivo: 𝐡𝐚𝐢 𝐬𝐜𝐫𝐢𝐭𝐭𝐨 𝐚𝐥𝐭𝐫𝐢 𝟏𝟎𝟎 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢!
↪ 💰 Accredito: *200€*
${sysFooter}`;

        await this.sendMessage(m.chat, { text: msgReward, mentions: [m.sender] });
    }

    // 🎁 REWARD: TEMPO (Ogni 1 Ora)
    if (userAct.timeForReward >= 3600) {
        global.db.data.users[m.sender].euro += 300;
        userAct.timeForReward = 0; 
        
        let oreTotali = Math.floor(userAct.onlineTime / 3600) || 1;
        
        let txtOra = `
${sysHeader}
⌬ ❯ 𝐋 𝐄 𝐕 𝐄 𝐋  𝐔 𝐏  𝐀 𝐂 𝐓 𝐈 𝐕 𝐈 𝐓 𝐘
${sysSeparator}
➡ Utente: @${m.sender.split('@')[0]}
➡ Obiettivo: 𝐡𝐚𝐢 𝐫𝐚𝐠𝐠𝐢𝐮𝐧𝐭𝐨 ${oreTotali} 𝐨𝐫𝐞 𝐝𝐢 𝐚𝐭𝐭𝐢𝐯𝐢𝐭𝐚̀!
↪ 💰 Bonus Fedeltà: *300€*
${sysFooter}`;

        await this.sendMessage(m.chat, { text: txtOra, mentions: [m.sender] });
    }
};

handler.help = ['resetstats'];
handler.tags = ['admin'];
handler.command = /^(resetstats|azzerastats)$/i;
handler.group = true;
handler.admin = true;

export default handler;
