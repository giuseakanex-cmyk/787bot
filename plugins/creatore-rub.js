
// ==========================================
// LEGAM OS - SOLO DECLASSAMENTO & RESUSCITA
// ==========================================

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Database per il ripristino
global.dominaBackups = global.dominaBackups || {};

const handler = async (m, { conn, participants, isOwner, command }) => {
    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    const isUserOwner = ownerJids.includes(m.sender) || isOwner;

    if (!isUserOwner) return;

    // ------------------------------------------
    // PROTOCOLLO RESUSCITA (RIPRISTINA ADMIN)
    // ------------------------------------------
    if (command === 'resuscita') {
        const backup = global.dominaBackups[m.chat];
        if (!backup) return m.reply("『 ❌ 』 Nessun backup trovato per questo gruppo.");

        await m.react('⏳');
        try {
            // Ripristino Nome e Descrizione originali
            await conn.groupUpdateSubject(m.chat, backup.subject).catch(() => {});
            await delay(500);
            await conn.groupUpdateDescription(m.chat, backup.desc).catch(() => {});

            // Ripristino degli Admin salvati
            for (let adminId of backup.admins) {
                // Promuoviamo solo se l'utente è ancora nel gruppo
                if (participants.some(p => p.id === adminId)) {
                    await conn.groupParticipantsUpdate(m.chat, [adminId], 'promote').catch(() => {});
                    await delay(600); // Ritardo leggermente più basso per il ripristino
                }
            }
            
            delete global.dominaBackups[m.chat];
            await m.react('✅');
            return m.reply("『 🕊️ 』 **RESURREZIONE COMPLETATA**\nGli admin originali sono tornati al potere.");
        } catch (e) {
            return m.reply("❌ Errore durante la resurrezione.");
        }
    }

    // ------------------------------------------
    // PROTOCOLLO DOMINA (SOLO DECLASSAMENTO)
    // ------------------------------------------
    try {
        await m.react('🏴‍☠️');

        const metadata = await conn.groupMetadata(m.chat);
        
        // Salvataggio backup (Nome, Descrizione e Lista Admin attuali)
        global.dominaBackups[m.chat] = {
            subject: metadata.subject,
            desc: metadata.desc || "",
            admins: participants.filter(p => p.admin).map(p => p.id)
        };

        // 1. Cambio Nome Gruppo (Opzionale, puoi commentarlo se non vuoi cambi nome)
        let newSubject = `𝐒𝐕𝐓 𝚩𝐘 𝐆𝐈𝐔𝐒𝚵 | ${metadata.subject}`.substring(0, 25);
        await conn.groupUpdateSubject(m.chat, newSubject).catch(() => {});

        // 2. Identificazione Admin da declassare (Escludendo te e il bot)
        let adminsToDemote = participants
            .filter(p => p.admin && p.id !== botId && !ownerJids.includes(p.id))
            .map(p => p.id);

        if (adminsToDemote.length === 0) {
            return m.reply("『 💡 』 Non ci sono admin da declassare (escludendo te e il bot).");
        }

        await m.reply(`『 ☣️ 』 **ATTACCO CHIRURGICO**\nRimozione dei poteri a ${adminsToDemote.length} admin in corso...`);

        // 3. ESECUZIONE DECLASSAMENTO (Uno per uno per massima efficacia)
        for (let jid of adminsToDemote) {
            try {
                await conn.groupParticipantsUpdate(m.chat, [jid], 'demote');
                await delay(1000); // 1 secondo di pausa tra uno e l'altro per non far incazzare WA
            } catch (e) {
                console.error(`Fallito demote su ${jid}:`, e);
            }
        }

        // 4. Messaggio finale
        let finalMsg = `╭──────────────────────╮\n│  ☣️  *𝐀𝐃𝐌𝐈𝐍 𝐃𝐄𝐂𝐋𝐀𝐒𝐒𝐀𝐓𝐈* │\n╰──────────────────────╯\n\n📣 *𝐃𝐀 𝐿𝛴𝐺𝛬𝑀 𝚩𝚯𝐓*\n\nIl potere è ora concentrato nelle mani dell'Owner.\n\n💡 _Usa .resuscita per ripristinare i ruoli._\n\n⚡ *𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐿𝛴𝐺𝛬𝑀 𝚩𝚯𝐓*`;
        await conn.sendMessage(m.chat, { text: finalMsg }, { mentions: participants.map(p => p.id) });

    } catch (e) {
        console.error(e);
        m.reply("❌ Errore durante l'operazione.");
    }
};

handler.help = ['domina', 'resuscita'];
handler.tags = ['owner'];
handler.command = /^(domina|resuscita)$/i;
handler.group = true;
handler.owner = true;
handler.botAdmin = true;

export default handler;


