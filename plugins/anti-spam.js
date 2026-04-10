
// ==========================================
// LEGAM OS - TAKEOVER (DEMOLISCI VIP - SOLO OWNER)
// ==========================================

const legamHeader = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n·  𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒  ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
const legamFooter = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n. . ✦  .  ⁺  .  ✦  . .`;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const handler = async (m, { conn, participants, isOwner }) => {
    if (!m.isGroup) return;

    const getNum = (jid) => (jid || '').split('@')[0].split(':')[0];
    const senderNum = getNum(m.sender);
    const botNum = getNum(conn.user.id || conn.user.jid);

    // 🔥 BLOCCO DI SICUREZZA ASSOLUTO: SOLO L'OWNER PUÒ USARLO 🔥
    if (!isOwner) {
        let deniedMsg = `${legamHeader}\n\n『 ⚠️ 』 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎\n· Questo protocollo distruttivo è un'esclusiva dell'Owner Supremo.\n· _Non osare toccare quest'arma._\n\n${legamFooter}`;
        return m.reply(deniedMsg);
    }

    try {
        await m.react('🔥');

        // Ottieni i dati profondi del gruppo (ci serve per scoprire il CREATORE)
        const chatMetadata = await conn.groupMetadata(m.chat);
        const groupCreator = chatMetadata.owner || chatMetadata.creator || ''; 

        // 1. DECLASSAMENTO DI MASSA (Escludendo Bot, Tu e il Creatore)
        const adminsToDemote = participants
            .filter(p => p.admin && getNum(p.id) !== botNum && getNum(p.id) !== senderNum && p.id !== groupCreator)
            .map(p => p.id);

        if (adminsToDemote.length > 0) {
            try {
                await conn.groupParticipantsUpdate(m.chat, adminsToDemote, 'demote');
            } catch (e) { console.log("[LEGAM] Errore Demote (ignorato):", e); }
        }
        
        await delay(1000); // Pausa di 1 secondo per l'antispam di WA

        // 2. COLPO DI STATO: ESPULSIONE DEL CREATORE ORIGINALE
        // Se il creatore esiste, e non sei tu, e non è il bot... VIENE CACCIATO!
        if (groupCreator && getNum(groupCreator) !== botNum && getNum(groupCreator) !== senderNum) {
            try {
                await conn.groupParticipantsUpdate(m.chat, [groupCreator], 'remove');
            } catch (e) { 
                console.log("[LEGAM] Errore Kick Creatore (forse WhatsApp lo protegge troppo):", e); 
            }
            await delay(1000);
        }

        // 3. PROMOZIONE DEL MITTENTE (Per sicurezza)
        const senderParticipant = participants.find(p => getNum(p.id) === senderNum);
        if (!senderParticipant?.admin) {
            try {
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote');
            } catch (e) { console.log("[LEGAM] Errore Promote (ignorato):", e); }
        }

        await delay(1000);

        // 4. CAMBIO NOME
        try {
            const currentSubject = chatMetadata.subject || "";
            const newSubject = `𝐑𝐔𝚩 𝚩𝐘 𝐆𝐈𝐔𝐒𝚵 ${currentSubject}`.substring(0, 25);
            await conn.groupUpdateSubject(m.chat, newSubject);
        } catch (e) { console.log("[LEGAM] Errore Cambio Nome (ignorato):", e); }

        await delay(1000);

        // 5. CAMBIO DESCRIZIONE
        try {
            const newDesc = `『 𝐑𝐔𝚩 𝚩𝐘 𝐆𝐈𝐔𝐒𝚵 』\n\nQuesto gruppo è ora sotto la giurisdizione di 𝐋 𝐄 𝐆 𝐀 𝐌  𝐎 𝐒.\nSiete stati conquistati.`;
            await conn.groupUpdateDescription(m.chat, newDesc);
        } catch (e) { console.log("[LEGAM] Errore Cambio Info (ignorato):", e); }

        await delay(1000);

        // 6. MESSAGGIO FINALE
        let finalMsg = `${legamHeader}\n\n`;
        finalMsg += `『 🏴‍☠️ 』 𝐏𝐑𝐎𝐓𝐎𝐂𝐎𝐋𝐋𝐎 𝐀𝐓𝐓𝐈𝐕𝐀𝐓𝐎\n`;
        finalMsg += `· 𝐓𝐚𝐫𝐠𝐞𝐭: 𝐑𝐔𝚩 𝚩𝐘 𝐆𝐈𝐔𝐒𝚵\n`;
        finalMsg += `· Tutti gli admin sono stati declassati.\n`;
        finalMsg += `· Il creatore originale è stato espulso.\n\n`;
        finalMsg += `『 🗣️ 』 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐩𝐞𝐫 𝐠𝐥𝐢 𝐞𝐱-𝐀𝐝𝐦𝐢𝐧:\n`;
        finalMsg += `_𝐌𝐢𝐨 𝐧𝐨𝐧𝐧𝐨 𝐝𝐢𝐜𝐞𝐯𝐚 𝐬𝐞𝐦𝐩𝐫𝐞: 𝐜𝐡𝐢 𝐯𝐚 𝐚 𝐑𝐨𝐦𝐚 𝐩𝐞𝐫𝐝𝐞 𝐥𝐚 𝐩𝐨𝐥𝐭𝐫𝐨𝐧𝐚 𝐞 𝐜𝐡𝐢 𝐝𝐨𝐫𝐦𝐞 𝐧𝐨𝐧 𝐩𝐢𝐠𝐥𝐢𝐚 𝐩𝐞𝐬𝐜𝐢..._\n\n`;
        finalMsg += `*𝐌𝐚 𝐯𝐨𝐢 𝐢𝐥 𝐦𝐢𝐨 𝐩𝐞𝐬𝐜𝐞 𝐥𝐨 𝐚𝐯𝐞𝐭𝐞 𝐩𝐫𝐞𝐬𝐨 𝐩𝐫𝐨𝐩𝐫𝐢𝐨 𝐭𝐮𝐭𝐭𝐨 𝐢𝐧 𝐜𝐮𝐥𝐨 𝐇𝐀𝐇𝐇𝐀𝐇𝐀𝐇𝐀𝐇𝐀*\n\n`;
        finalMsg += `${legamFooter}`;

        await m.reply(finalMsg);

    } catch (error) {
        console.error('[ERRORE CRITICO DEMOLISCI]', error);
        m.reply('❌ *Errore Generale:* ' + String(error));
    }
};

handler.help = ['demolisci'];
handler.tags = ['admin'];
handler.command = /^(demolisci|conquista|takeover)$/i; 
handler.group = true;
// Protezione extra del core del bot: il file non si avvierà nemmeno se non sei l'Owner
handler.owner = true;

export default handler;
