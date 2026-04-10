
// ==========================================
// LEGAM OS - GESTIONE INATTIVI VIP
// ==========================================

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const legamContext = {
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363259442839354@newsletter',
        newsletterName: "✨.✦★彡 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐒𝐞𝐜𝐮𝐫𝐢𝐭𝐲 Ξ★✦.•",
        serverMessageId: 100
    }
};

const legamHeader = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒  ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
const legamFooter = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n. . ✦  .  ⁺  .  ✦  . .`;

let handler = async (m, { conn, text, args, isOwner, usedPrefix, command }) => {
    if (!m.isGroup) return;

    await conn.sendPresenceUpdate('composing', m.chat);

    // 🔥 FIX "UNDEFINED": Recuperiamo i dati a mano se la memoria del bot fallisce
    let chatMetadata = await conn.groupMetadata(m.chat).catch(_ => null);
    if (!chatMetadata) return m.reply("❌ Errore nel recupero dei dati del gruppo. Riprova.");
    
    let participantsList = chatMetadata.participants;

    // 🔥 ESTRATTORE NUMERI PURI (Bypass Device ID)
    const getNum = (jid) => (jid || '').split('@')[0].split(':')[0];
    const senderNum = getNum(m.sender);
    const botNum = getNum(conn.user.id || conn.user.jid);

    // Controllo Sicurezza Admin
    const isUserAdmin = participantsList.some(p => getNum(p.id) === senderNum && (p.admin === 'superadmin' || p.admin === 'admin'));
    if (!isUserAdmin && !isOwner) {
        return m.reply("❌ *Accesso Negato:* Solo gli Amministratori possono gestire gli inattivi.");
    }

    const lama = 86400000 * 7; // 7 giorni
    const now = Date.now();

    let total = 0;
    const sider = [];

    // Ricerca Inattivi
    for (let p of participantsList) {
        let userJid = p.id;
        let userNum = getNum(userJid);

        // Saltiamo gli Admin, il Bot e il Creatore del gruppo
        if (p.admin === 'superadmin' || p.admin === 'admin' || userNum === botNum || userJid === chatMetadata.owner) {
            continue;
        }

        let isInactive = false;
        let userData = global.db.data.users[userJid];

        // Se l'utente non è nel DB o non scrive da 7 giorni
        if (typeof userData === 'undefined') {
            isInactive = true;
        } else if (userData.lastseen && (now - userData.lastseen > lama)) {
            if (userData.banned !== true) isInactive = true; 
        }

        if (isInactive) {
            total++;
            sider.push(userJid);
        }
    }

    let pref = usedPrefix || '.';

    // =====================================
    // 1️⃣ MENU PRINCIPALE
    // =====================================
    if (!args[0]) {
        let txt = `${legamHeader}\n\n`;
        txt += `『 👥 』 𝐆𝐞𝐬𝐭𝐢𝐨𝐧𝐞 𝐈𝐧𝐚𝐭𝐭𝐢𝐯𝐢\n`;
        txt += `· 𝐌𝐞𝐦𝐛𝐫𝐢 𝐭𝐫𝐨𝐯𝐚𝐭𝐢: ${total}/${participantsList.length}\n`;
        txt += `· 𝐒𝐭𝐚𝐭𝐨: Inattivi da 7+ giorni\n\n${legamFooter}`;

        const buttons = [
            { buttonId: `${pref}${command} lista`, buttonText: { displayText: '📋 𝐋𝐢𝐬𝐭𝐚 𝐈𝐧𝐚𝐭𝐭𝐢𝐯𝐢' }, type: 1 },
            { buttonId: `${pref}${command} rimuovi`, buttonText: { displayText: '🗑️ 𝐑𝐢𝐦𝐮𝐨𝐯𝐢 𝐓𝐮𝐭𝐭𝐢' }, type: 1 }
        ];

        return conn.sendMessage(m.chat, {
            text: txt,
            footer: '𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒',
            buttons: buttons,
            headerType: 1,
            contextInfo: legamContext
        }, { quoted: m });
    }

    // =====================================
    // 2️⃣ LISTA INATTIVI
    // =====================================
    if (args[0] === 'lista') {
        if (total === 0) {
            return conn.sendMessage(m.chat, {
                text: `${legamHeader}\n\n『 ✅ 』 𝐍𝐞𝐬𝐬𝐮𝐧 𝐢𝐧𝐚𝐭𝐭𝐢𝐯𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨!\n· Il gruppo è completamente attivo.\n\n${legamFooter}`,
                contextInfo: legamContext
            }, { quoted: m });
        }
        
        const groupName = chatMetadata.subject;
        let txt = `${legamHeader}\n\n『 📋 』 𝐋𝐢𝐬𝐭𝐚 𝐅𝐚𝐧𝐭𝐚𝐬𝐦𝐢\n· 𝐆𝐫𝐮𝐩𝐩𝐨: ${groupName}\n· 𝐓𝐨𝐭𝐚𝐥𝐞: ${total}\n\n`;
        txt += sider.map((v, i) => `${i + 1}. @${v.split('@')[0]}`).join('\n');
        txt += `\n\n${legamFooter}`;

        const buttons = [
            { buttonId: `${pref}${command} rimuovi`, buttonText: { displayText: '🗑️ 𝐑𝐢𝐦𝐮𝐨𝐯𝐢 𝐓𝐮𝐭𝐭𝐢' }, type: 1 },
            { buttonId: `${pref}${command}`, buttonText: { displayText: '🔄 𝐌𝐞𝐧𝐮' }, type: 1 }
        ];

        return conn.sendMessage(m.chat, {
            text: txt,
            footer: '𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒',
            buttons: buttons,
            headerType: 1,
            contextInfo: { ...legamContext, mentionedJid: sider }
        }, { quoted: m });
    }

    // =====================================
    // 3️⃣ RICHIESTA DI CONFERMA
    // =====================================
    if (args[0] === 'rimuovi') {
        if (total === 0) {
            return conn.sendMessage(m.chat, {
                text: `${legamHeader}\n\n『 ✅ 』 𝐍𝐞𝐬𝐬𝐮𝐧 𝐢𝐧𝐚𝐭𝐭𝐢𝐯𝐨 𝐝𝐚 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞.\n\n${legamFooter}`,
                contextInfo: legamContext
            }, { quoted: m });
        }

        let txt = `${legamHeader}\n\n『 ⚠️ 』 𝐀𝐕𝐕𝐈𝐒𝐎 𝐃𝐈 𝐒𝐈𝐒𝐓𝐄𝐌𝐀\n`;
        txt += `· Stai per espellere *${total}* membri.\n`;
        txt += `· Questa azione è IRREVERSIBILE.\n\n`;
        txt += `Procedere con l'eliminazione?\n\n${legamFooter}`;

        const buttons = [
            { buttonId: `${pref}${command} conferma`, buttonText: { displayText: '✅ 𝐂𝐨𝐧𝐟𝐞𝐫𝐦𝐚' }, type: 1 },
            { buttonId: `${pref}${command}`, buttonText: { displayText: '❌ 𝐀𝐧𝐧𝐮𝐥𝐥𝐚' }, type: 1 }
        ];

        return conn.sendMessage(m.chat, {
            text: txt,
            footer: '𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒',
            buttons: buttons,
            headerType: 1,
            contextInfo: legamContext
        }, { quoted: m });
    }

    // =====================================
    // 4️⃣ ESECUZIONE (FORZA BRUTA & ANTI-BAN)
    // =====================================
    if (args[0] === 'conferma') {
        if (total === 0) return m.reply("Nessun inattivo da rimuovere.");

        // Avvisiamo che ci vorrà un po'
        await m.reply(`『 ⚙️ 』 _Eliminazione di ${total} membri in corso... Attendere._`);

        let removedCount = 0;
        const errors = [];

        for (const user of sider) {
            try {
                // Forza bruta
                await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
                removedCount++;
                await delay(1500); // 1.5 Secondi di pausa per non farsi bannare da WhatsApp
            } catch (e) {
                errors.push(user);
            }
        }

        let txt = `${legamHeader}\n\n『 🗑️ 』 𝐏𝐔𝐋𝐈𝐙𝐈𝐀 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐓𝐀\n`;
        txt += `· Membri rimossi: *${removedCount}*\n`;
        if (errors.length > 0) txt += `· Fallimenti: *${errors.length}* (Forse il bot non ha i poteri massimi)\n`;
        txt += `\n${legamFooter}`;

        return conn.sendMessage(m.chat, {
            text: txt,
            contextInfo: legamContext
        }, { quoted: m });
    }
};

handler.help = ['inattivi'];
handler.tags = ['gruppo'];
handler.command = /^(inattivi|ghost)$/i;
handler.group = true;
// Rimosso handler.botAdmin = Usa la Forza Bruta

export default handler;
