
import fetch from 'node-fetch';

let handler = async (m, { conn, text, command, isOwner, isAdmin }) => {
    if (!m.isGroup) return;

    // 🔥 CONTROLLO POTERI IN TEMPO REALE (Niente scuse di Cache) 🔥
    let hasPower = isAdmin || isOwner;
    
    // Se la cache del bot dice che l'utente NON è admin, forziamo un controllo diretto ai server WA prima di negare
    if (!hasPower) {
        let meta = await conn.groupMetadata(m.chat).catch(_ => null);
        if (meta) {
            let senderRaw = (m.sender || '').split('@')[0].split(':')[0];
            hasPower = meta.participants.some(p => {
                let partRaw = (p.id || '').split('@')[0].split(':')[0];
                return partRaw === senderRaw && (p.admin === 'admin' || p.admin === 'superadmin');
            });
        }
    }

    if (!hasPower) {
        return m.reply("❌ *Accesso Negato:* Solo gli Amministratori possono dare o togliere i poteri.");
    }

    // 🔥 CONTROLLO ANTINUKE & GERARCHIA 🔥
    const chat = global.db.data.chats[m.chat] || {};
    if (chat.antinuke && !isOwner) {
        let deniedMsg = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· ⚠️ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ⚠️ ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n『 🛡️ 』 𝐒𝐭𝐚𝐭𝐨: _Sistema Antinuke ATTIVO._\n『 👑 』 𝐏𝐞𝐫𝐦𝐞𝐬𝐬𝐢: _I poteri degli Admin sono sospesi. Solo l'Owner Supremo può usare questo comando._\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
        return m.reply(deniedMsg);
    }

    let action = ['promote', 'promuovi', 'p'].includes(command.toLowerCase()) ? 'promote' : 'demote';
    
    let targetUser;
    if (m.mentionedJid && m.mentionedJid[0]) targetUser = m.mentionedJid[0];
    else if (m.quoted && m.quoted.sender) targetUser = m.quoted.sender;
    else if (text) {
        let match = text.match(/\d+/g);
        if (match) targetUser = match.join('') + '@s.whatsapp.net';
    }

    if (!targetUser) return m.reply("⚠️ *Errore:* Tagga o rispondi all'utente a cui vuoi modificare i poteri.");

    // 🔥 AZIONE DIRETTA 🔥
    try {
        await conn.groupParticipantsUpdate(m.chat, [targetUser], action);
    } catch (e) {
        console.error('[ERRORE PROMOTE/DEMOTE]', e);
        m.reply("❌ *Errore di Sistema:* L'azione è fallita. Assicurati che il bot sia Amministratore e riprova.");
    }
};

// =========================================================
// 2. L'INTERCETTATORE GLOBALE (Banner Visivo)
// =========================================================
handler.before = async function (m, { conn }) {
    if (!m.isGroup || !m.messageStubType) return true;
    if (m.messageStubType !== 29 && m.messageStubType !== 30) return true;

    let isPromote = m.messageStubType === 29;
    let targetUser = m.messageStubParameters[0];
    let executor = m.sender;

    const getNum = (jid) => (jid || '').split('@')[0].split(':')[0];
    const botNum = getNum(conn.user.id || conn.user.jid);
    const executorNum = getNum(executor);

    const chat = global.db.data.chats[m.chat] || {};
    let isExecutorOwner = executorNum === botNum || (global.owner && global.owner.some(o => getNum(o[0]) === executorNum));
    
    if (chat.antinuke && !isExecutorOwner) return true; // Non manda il banner se entra in azione l'antinuke

    let titleStr = isPromote ? '𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐢 𝐩𝐫𝐨𝐦𝐨𝐳𝐢𝐨𝐧𝐞 👑' : '𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐢 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐨𝐧𝐞 🔻';
    let promotedUsername = getNum(targetUser);
    let senderUsername = executorNum;

    let finalMessage = isPromote
        ? `@${promotedUsername} 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐩𝐫𝐨𝐦𝐨𝐬𝐬𝐨 𝐚 𝐫𝐮𝐨𝐥𝐨 𝐝𝐢 𝐚𝐦𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐭𝐨𝐫𝐞 𝐝𝐚 @${senderUsername}`
        : `@${promotedUsername} 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐝𝐞𝐜𝐥𝐚𝐬𝐬𝐚𝐭𝐨 𝐝𝐚 @${senderUsername}`;

    let profilePicture;
    try { profilePicture = await conn.profilePictureUrl(targetUser, 'image'); } 
    catch (e) { profilePicture = 'https://files.catbox.moe/pyp87f.jpg'; }

    const getBuffer = async (url) => {
        try { const res = await fetch(url); return Buffer.from(await res.arrayBuffer()); } 
        catch (e) { return null; }
    };
    let imageBuffer = await getBuffer(profilePicture);

    await conn.sendMessage(m.chat, {
        text: finalMessage,
        contextInfo: {
            mentionedJid: [targetUser, executor], 
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363428220415117@newsletter', 
                serverMessageId: 100,
                newsletterName: "✨ 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐒𝐞𝐜𝐮𝐫𝐢𝐭𝐲 ✨"
            },
            externalAdReply: {
                title: titleStr,
                body: 'Legam Bot - Gestione Gruppo',
                thumbnail: imageBuffer,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    });
    return true;
};

handler.help = ['promuovi', 'retrocedi'];
handler.tags = ['gruppo'];
handler.command = /^(promote|promuovi|p|demote|retrocedi|r|d)$/i;
handler.group = true;

export default handler;

