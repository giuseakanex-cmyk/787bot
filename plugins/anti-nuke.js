
// 🛡️ LEGAM OS - SISTEMA ANTINUKE SUPREMO

const legamHeader = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· ☢️ 𝐀 𝐍 𝐓 𝐈 𝐍 𝐔 𝐊 𝐄 ☢️ ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

let handler = async (m, { conn, text, command, usedPrefix }) => {
    if (!m.isGroup) return m.reply("『 ❌ 』 `Questo comando funziona solo nei gruppi.`");

    const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});
    const action = text ? text.toLowerCase().trim() : '';

    if (action === 'on') {
        chat.antinuke = true;
        return m.reply(`${legamHeader}\n\n『 🛡️ 』 \`𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐝𝐢 𝐝𝐢𝐟𝐞𝐬𝐚 𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨\`\n_I poteri degli admin sono sotto sorveglianza militare._\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`);
    } else if (action === 'off') {
        chat.antinuke = false;
        return m.reply(`${legamHeader}\n\n『 ❌ 』 \`𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨\`\n_Il gruppo è ora vulnerabile agli attacchi._\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`);
    } else {
        return m.reply(`『 ⚙️ 』 \`Uso corretto:\`\n➤ ${usedPrefix + command} on\n➤ ${usedPrefix + command} off`);
    }
};

handler.help = ['antinuke on/off'];
handler.tags = ['gruppo'];
handler.command = /^(contronuke|antinuke)$/i;
handler.owner = true; // Solo l'Owner
handler.group = true;

// ==========================================
// 🚨 RADAR INVISIBILE
// ==========================================
handler.before = async function (m, { conn, isBotAdmin }) {
    if (!m.isGroup || !isBotAdmin) return;

    const chat = global.db.data.chats[m.chat];
    if (!chat?.antinuke) return;

    // 21 = Nome, 22 = Foto, 29 = Promozione, 30 = Retrocessione
    const stub = m.messageStubType;
    if (![21, 22, 29, 30].includes(stub)) return;

    let meta = await conn.groupMetadata(m.chat).catch(_ => null);
    if (!meta) return;

    const getNum = (jid) => (jid || '').split('@')[0].split(':')[0];
    
    const senderNum = getNum(m.key?.participant || m.participant || m.sender);
    const botNum = getNum(conn.user.id || conn.user.jid);
    const founderNum = getNum(meta.owner);
    const ownersNum = global.owner.map(o => getNum(o[0]));

    // 🛡️ IMMUNITÀ
    if (senderNum === botNum || senderNum === founderNum || ownersNum.includes(senderNum)) return;

    // ❌ TRADIMENTO RILEVATO ❌
    // Raccoglie tutti gli admin attuali tranne Bot, Founder e Owners
    const adminsToDemote = meta.participants
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => p.id)
        .filter(jid => {
            let jNum = getNum(jid);
            return jNum !== botNum && jNum !== founderNum && !ownersNum.includes(jNum);
        });

    // 1. Taglia le teste
    if (adminsToDemote.length > 0) {
        try { await conn.groupParticipantsUpdate(m.chat, adminsToDemote, 'demote'); } catch (e) {}
    }

    // 2. Lockdown
    try { await conn.groupSettingUpdate(m.chat, 'announcement'); } catch (e) {}

    const actionName = stub === 21 ? 'Ha modificato il nome del gruppo' :
                       stub === 22 ? 'Ha cambiato l\'icona del gruppo' :
                       stub === 29 ? 'Ha promosso un utente senza permesso' :
                       'Ha retrocesso un Admin senza permesso';

    // 3. Sentenza Estetica
    const alertText = `${legamHeader}\n\n🚨 \`𝐀𝐙𝐈𝐎𝐍𝐄 𝐍𝐎𝐍 𝐀𝐔𝐓𝐎𝐑𝐈𝐙𝐙𝐀𝐓𝐀\`\n\n👤 𝐂𝐨𝐥𝐩𝐞𝐯𝐨𝐥𝐞: @${senderNum} _(Cu tu detti u permessu?)_\n🛑 𝐀𝐳𝐢𝐨𝐧𝐞: ${actionName}\n\n🔻 \`𝐀𝐝𝐦𝐢𝐧 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐢 𝐩𝐞𝐫 𝐬𝐢𝐜𝐮𝐫𝐞𝐳𝐳𝐚:\`\n${adminsToDemote.length > 0 ? adminsToDemote.map(jid => `💀 @${getNum(jid)}`).join('\n') : 'Nessun altro admin da punire.'}\n\n🔒 \`𝐈𝐥 𝐠𝐫𝐮𝐩𝐩𝐨 è 𝐬𝐭𝐚𝐭𝐨 𝐜𝐡𝐢𝐮𝐬𝐨 𝐢𝐧 𝐋𝐨𝐜𝐤𝐝𝐨𝐰𝐧.\`\n\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

    let mentionsArr = [m.sender, ...adminsToDemote];
    
    await conn.sendMessage(m.chat, { 
        text: alertText, 
        mentions: mentionsArr,
        contextInfo: {
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363428220415117@newsletter',
                serverMessageId: 100,
                newsletterName: "🚨 LEGAM OS SECURITY"
            }
        }
    });
};

export default handler;


