let handler = async (m, { conn, participants, isBotAdmin }) => {
    if (!m.isGroup) return;

    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    if (!isBotAdmin) return;

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    // 🔹 CAMBIO NOME GRUPPO
    try {
        let metadata = await conn.groupMetadata(m.chat);
        let oldName = metadata.subject;
        let newName = `${oldName} | 𝟕𝟖𝟕`;
        await conn.groupUpdateSubject(m.chat, newName);
    } catch (e) {
        console.error('Errore cambio nome gruppo:', e);
    }

    // 🔹 RESET LINK GRUPPO
    let newInviteLink = '';
    try {
        await conn.groupRevokeInvite(m.chat); // invalida il vecchio link
        let code = await conn.groupInviteCode(m.chat); // prende il nuovo codice
        newInviteLink = `https://chat.whatsapp.com/${code}`;
    } catch (e) {
        console.error('Errore reset link:', e);
    }

    let usersToRemove = participants
        .map(p => p.jid)
        .filter(jid =>
            jid &&
            jid !== botId &&
            !ownerJids.includes(jid)
        );

    if (!usersToRemove.length) return;

    let allJids = participants.map(p => p.jid);

    await conn.sendMessage(m.chat, {
        text: "⌬ ❯ Perché mai dovrei odiare qualcuno più debole di me? Provo solo pietà." 
    });

    await conn.sendMessage(m.chat, {
        text: `⌬ ━━━───  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ───━━━ ⌬

⌬ ❯ **GRUPPO SVUOTATO**

Entrate tutti qui:
https://chat.whatsapp.com/FVE8D5tD0OGEAeDFOfzP4y?mode=gi_t

⌬ ━━━───  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ───━━━ ⌬`,
        mentions: allJids
    });

    try {
        await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
    } catch (e) {
        console.error(e);
        await m.reply("⌬ ❯ Errore durante l'esecuzione.");
    }
};

handler.command = ['domina'];
handler.group = true;
handler.botAdmin = true;
handler.owner = true;

export default handler;
