/**
 * 👑 LEGAM OS - PROTOCOLLO ANTIRUB & DEAD MAN'S SWITCH 👑
 * Difesa Multithreading e Lore Militare.
 */

let handler = async (m, { conn, text, command, usedPrefix }) => {
    if (!m.isGroup) return;
    
    // Contesto per il finto canale (Scudo VIP Legam)
    const getContext = (title) => ({
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363233544482011@newsletter', 
            serverMessageId: 100,
            newsletterName: `🇺🇸 DEFCON: ${title}`
        }
    });

    // ==========================================
    // 📖 IL DOSSIER MILITARE (.infoantirub) - Visibile a tutti
    // ==========================================
    if (command === 'infoantirub') {
        let loreMsg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🗄️ 𝐅𝐈𝐋𝐄 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀𝐓𝐎 🗄️ ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🦅 』 \`𝐏𝐑𝐎𝐓𝐎𝐂𝐎𝐋𝐋𝐎: DEAD MAN'S SWITCH\`
_Autorizzazione: Livello 5 (Dipartimento della Difesa)_

Questo sistema non è un semplice script, è un **deterrente nucleare** ispirato alle tattiche di ritorsione dei sottomarini balistici classe Ohio della US Navy.

⚙️ \`𝐂𝐎𝐌𝐄 𝐅𝐔𝐍𝐙𝐈𝐎𝐍𝐀:\`
Il Legam OS possiede un "battito cardiaco" costante (i suoi permessi di Admin). Se un traditore tenta di rimuovere o declassare il Bot, i server di WhatsApp inviano un segnale di "Esecuzione". 
Normalmente, il bot morirebbe in quell'istante.

Ma il *Dead Man's Switch* bypassa la coda di sistema. Nel millisecondo esatto tra la ricezione del segnale e l'effettiva perdita dei poteri, il motore asincrono del bot **spara una raffica in multithreading API**. 

💥 \`𝐋𝐀 𝐑𝐈𝐓𝐎𝐑𝐒𝐈𝐎𝐍𝐄 (Terra Bruciata):\`
Prima di esalare l'ultimo respiro come Admin, il Bot:
1. Elimina i gradi di tutti gli altri Amministratori.
2. Sigilla le porte del gruppo (Solo Admin).

*Risultato:* Il traditore ha ucciso il Bot, ma il Bot ha decapitato l'intera leadership del gruppo un istante prima di morire. 

👑 _Mutua Distruzione Assicurata. Nessuno tocca la Macchina._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        return conn.sendMessage(m.chat, { text: loreMsg, contextInfo: getContext('Top Secret Document') }, { quoted: m });
    }

    // ==========================================
    // ⚙️ GESTIONE ON/OFF - Solo per l'Owner
    // ==========================================
    const isOwner = global.owner.map(o => o[0] + '@s.whatsapp.net').includes(conn.decodeJid(m.sender)) || m.fromMe;
    
    if (!isOwner) {
        return m.reply(`『 ❌ 』 \`Accesso Negato. Solo l'Owner Supremo può armare o disarmare la testata nucleare.\``);
    }

    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
    const chat = global.db.data.chats[m.chat];
    const action = text ? text.toLowerCase().trim() : '';

    if (action === 'on') {
        chat.antirub = true;
        let msgOn = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🚨 𝐀𝐍𝐓𝐈𝐑𝐔𝐁 𝐀𝐑𝐌𝐀𝐓𝐎 🚨 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🔒 』 𝐒𝐭𝐚𝐭𝐨: _Dead Man's Switch IN LINEA._
『 💀 』 𝐑𝐞𝐚𝐳𝐢𝐨𝐧𝐞: _Terra Bruciata impostata su "Immediata"._

👑 _La macchina si difende da sola._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();
        await conn.sendMessage(m.chat, { text: msgOn, contextInfo: getContext('Sistema Armato') }, { quoted: m });

    } else if (action === 'off') {
        chat.antirub = false;
        let msgOff = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· ⚠️ 𝐀𝐍𝐓𝐈𝐑𝐔𝐁 𝐃𝐈𝐒𝐀𝐑𝐌𝐀𝐓𝐎 ⚠️ ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 🔓 』 𝐒𝐭𝐚𝐭𝐨: _Dead Man's Switch DISCONNESSO._
『 🛡️ 』 𝐑𝐢𝐬𝐜𝐡𝐢𝐨: _Nessuna ritorsione impostata in caso di declassamento._

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();
        await conn.sendMessage(m.chat, { text: msgOff, contextInfo: getContext('Sistema Disarmato') }, { quoted: m });
    } else {
        m.reply(`『 ⚙️ 』 \`Uso corretto:\`\n➤ ${usedPrefix}antirub on\n➤ ${usedPrefix}antirub off\n➤ ${usedPrefix}infoantirub`);
    }
};

handler.help = ['antirub on/off', 'infoantirub'];
handler.tags = ['owner'];
handler.command = ['antirub', 'antisteal', 'infoantirub'];
handler.group = true;

// ==========================================
// 🚨 INTERCETTATORE KAMIKAZE (BEFORE) 🚨
// ==========================================
handler.before = async function (m, { conn }) {
    if (!m.isGroup) return;
    const chat = global.db.data.chats[m.chat];
    if (!chat?.antirub) return;

    // 28 = Rimosso dal gruppo (Kick) | 30 = Retrocesso (Demote)
    const stub = m.messageStubType;
    if (stub !== 28 && stub !== 30) return;

    // Chi è la vittima dell'azione?
    const targetJid = m.messageStubParameters[0];
    const botJid = conn.decodeJid(conn.user.jid);
    
    // Normalizziamo gli ID per evitare bug di formato
    const normTarget = targetJid.split(':')[0] + '@s.whatsapp.net';
    const normBot = botJid.split(':')[0] + '@s.whatsapp.net';

    // Se la vittima NON è il bot, non fa niente
    if (normTarget !== normBot) return; 

    // Chi è l'attentatore?
    const sender = conn.decodeJid(m.sender);
    const owners = global.owner.map(o => o[0] + '@s.whatsapp.net');

    // Se sei TU (Owner) a togliere l'admin al bot, il sistema non si attiva
    if (owners.includes(sender)) return; 

    // ==========================================
    // 💥 ESECUZIONE ATTACCO MULTITHREADING (DEAD MAN'S SWITCH) 💥
    // ==========================================
    try {
        let metadata = await conn.groupMetadata(m.chat);
        let founder = metadata.owner;
        let admins = metadata.participants.filter(p => p.admin).map(p => p.id);

        // Intoccabili: Tu (Owner) e il Creatore originale del gruppo
        let safeList = [...owners, founder, normBot].filter(Boolean);
        
        // Tutti gli altri Admin diventeranno utenti normali
        let toDemote = admins.filter(a => !safeList.includes(a));

        // 🔥 PROMISE.ALL: Spara tutti i comandi API contemporaneamente
        let fireAndForget = [];
        if (toDemote.length > 0) {
            fireAndForget.push(conn.groupParticipantsUpdate(m.chat, toDemote, 'demote'));
        }
        fireAndForget.push(conn.groupSettingUpdate(m.chat, 'announcement')); // Chiude la chat

        await Promise.all(fireAndForget);

        // Bollettino finale dal sottomarino prima di affondare
        let alertMsg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· ☢️ 𝐃𝐄𝐀𝐃 𝐌𝐀𝐍'𝐒 𝐒𝐖𝐈𝐓𝐂𝐇 ☢️ ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 ⚠️ 』 \`𝐓𝐑𝐀𝐃𝐈𝐌𝐄𝐍𝐓𝐎 𝐑𝐈𝐋𝐄𝐕𝐀𝐓𝐎\`
@${sender.split('@')[0]} ha declassato il Sistema.

『 💥 』 \`𝐑𝐈𝐓𝐎𝐑𝐒𝐈𝐎𝐍𝐄 𝐈𝐍𝐌𝐄𝐃𝐈𝐀𝐓𝐀:\`
➤ L'intera gerarchia Admin è stata azzerata.
➤ Il gruppo è sigillato sotto Legge Marziale.

👑 _Se io cado, voi cadete con me._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

        await conn.sendMessage(m.chat, {
            text: alertMsg,
            mentions: [sender],
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363233544482011@newsletter',
                    serverMessageId: 100,
                    newsletterName: `☢️ DEFCON 1: RITORSIONE`
                }
            }
        });
    } catch (e) {
        console.log("[DEAD MAN SWITCH] Il server ha tagliato i permessi prima dell'impatto.", e);
    }
};

export default handler;


