/**
 * ⌬ 𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  - SECURITY PROTOCOL: ANTIRUB ⌬
 * High-Speed Multithreading Defense System.
 */

let handler = async (m, { conn, text, command, usedPrefix }) => {
    if (!m.isGroup) return;
    
    const getContext = (title) => ({
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter', 
            serverMessageId: 100,
            newsletterName: `𝟕𝟖𝟕 𝐒𝐘𝐒𝐓𝐄𝐌: ${title}`
        }
    });

    const sysHeader = `⌬ ━━━───  𝟕 𝟖 𝟕  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ───━━━ ⌬`;
    const sysSeparator = `◈───────────────────────────◈`;
    const sysFooter = `⌬ ━━━───  𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘  𝐀𝐂𝐓𝐈𝐕𝐄  ───━━━ ⌬`;

    if (command === 'infoantirub') {
        let loreMsg = `
${sysHeader}

⌬ ❯ 𝐃𝐎𝐂𝐔𝐌𝐄𝐍𝐓𝐀𝐙𝐈𝐎𝐍𝐄 𝐓𝐄𝐂𝐍𝐈𝐂𝐀
${sysSeparator}

⌬ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀: 𝐃𝐄𝐀𝐃 𝐌𝐀𝐍'𝐒 𝐒𝐖𝐈𝐓𝐂𝐇
Status: *Modulo di Sicurezza Asincrono*

Il protocollo è progettato per garantire l'integrità del Sistema tramite il monitoraggio costante dei *privilegi amministrativi*.

⌬ ❯ 𝐎𝐏𝐄𝐑𝐀𝐓𝐈𝐕𝐈𝐓𝐀̀:
In caso di revoca non autorizzata dei permessi, il 787 System attiva una ritorsione istantanea tramite *API multithreading* prima della sincronizzazione server.

⌬ ❯ 𝐏𝐑𝐎𝐂𝐄𝐃𝐔𝐑𝐀 𝐃𝐈 𝐑𝐈𝐓𝐎𝐑𝐒𝐈𝐎𝐍𝐄:
Il sistema esegue in parallelo:
➡ 1. *Depotenziamento globale* dei soggetti non autorizzati.
➡ 2. *Chiusura di emergenza* delle comunicazioni del gruppo.

↪ Nota: Operazione *irreversibile* e automatizzata.

${sysFooter}`.trim();

        return conn.sendMessage(m.chat, { text: loreMsg, contextInfo: getContext('Security Documentation') }, { quoted: m });
    }

    const isOwner = global.owner.map(o => o[0] + '@s.whatsapp.net').includes(conn.decodeJid(m.sender)) || m.fromMe;
    
    if (!isOwner) {
        return m.reply(`⌬ ❯ 𝐀𝐔𝐓𝐇 𝐄𝐑𝐑𝐎𝐑\nRichiesta permessi negata dall'host.`);
    }

    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
    const chat = global.db.data.chats[m.chat];
    const action = text ? text.toLowerCase().trim() : '';

    if (action === 'on') {
        chat.antirub = true;
        let msgOn = `
${sysHeader}

⌬ ❯ 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘 𝐏𝐑𝐎𝐓𝐎𝐂𝐎𝐋: 𝐎𝐍
${sysSeparator}

➡ *Modulo:* Antirub / Dead Man's Switch.
➡ *Stato:* Monitoraggio privilegi attivo.
➡ *Fail-Safe:* Ritorsione asincrona armata.

${
