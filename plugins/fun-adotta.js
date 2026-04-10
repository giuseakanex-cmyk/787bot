
// ==========================================
// LEGAM OS - DINASTIA E ADOZIONI VIP
// ==========================================

const legamHeader = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n· 👨‍👩‍👧‍👦 𝐃𝐈𝐍𝐀𝐒𝐓𝐈𝐀 𝐋𝐄𝐆𝐀𝐌 ·\n✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;
const legamFooter = `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

let handler = async (m, { conn, command, text, usedPrefix }) => {
    if (!m.isGroup) return;

    let db = global.db.data.users;
    let sender = m.sender;
    
    // Inizializza array se non esistono
    if (!db[sender].figli) db[sender].figli = [];
    if (!db[sender].genitori) db[sender].genitori = [];

    const getNum = (jid) => (jid || '').split('@')[0].split(':')[0];
    let cmd = command.toLowerCase();

    // 🔥 1. SCAPPA DI CASA (.scappa)
    if (cmd === 'scappa' || cmd === 'scappadicasa') {
        if (db[sender].genitori.length === 0) {
            return m.reply(`${legamHeader}\n\n『 ⚠️ 』 \`𝐄𝐫𝐫𝐨𝐫𝐞\`\nNon hai genitori da cui scappare. Sei già un randagio.\n\n${legamFooter}`);
        }

        let exGenitori = db[sender].genitori;
        
        // Rimuovi il figlio dai genitori
        for (let g of exGenitori) {
            if (db[g] && db[g].figli) {
                db[g].figli = db[g].figli.filter(f => f !== sender);
            }
        }
        
        // Svuota i genitori del mittente
        db[sender].genitori = [];

        let msg = `${legamHeader}\n\n『 🏃🏻‍♂️ 』 \`𝐅𝐔𝐆𝐀 𝐑𝐈𝐔𝐒𝐂𝐈𝐓𝐀\`\n\n@${getNum(sender)} è scappato di casa!\n_Ha rinnegato la sua famiglia e ora vaga da solo per il mondo._\n\n${legamFooter}`;
        return conn.sendMessage(m.chat, { text: msg, mentions: [sender] }, { quoted: m });
    }

    // 🎯 IDENTIFICAZIONE TARGET PER ADOTTA/RIPUDIA
    let targetUser;
    if (m.mentionedJid && m.mentionedJid[0]) targetUser = m.mentionedJid[0];
    else if (m.quoted && m.quoted.sender) targetUser = m.quoted.sender;

    if (!targetUser) {
        return m.reply(`${legamHeader}\n\n『 ⚙️ 』 \`𝐔𝐬𝐨 𝐜𝐨𝐫𝐫𝐞𝐭𝐭𝐨:\`\n➤ ${usedPrefix}adotta @tag\n➤ ${usedPrefix}ripudia @tag\n➤ ${usedPrefix}scappa\n\n${legamFooter}`);
    }

    if (targetUser === sender) return m.reply("『 ❌ 』 Non puoi adottare/ripudiare te stesso. Vai dallo psicologo.");
    if (targetUser === conn.user.jid) return m.reply("『 ❌ 』 Io sono Legam OS, non sono tuo figlio.");

    if (!db[targetUser]) db[targetUser] = { figli: [], genitori: [] };
    if (!db[targetUser].figli) db[targetUser].figli = [];
    if (!db[targetUser].genitori) db[targetUser].genitori = [];

    let myPartner = db[sender].partner || null; // Se l'utente è sposato (tramite .sposa)

    // 🔥 2. ADOTTA (.adotta)
    if (cmd === 'adotta') {
        if (db[targetUser].genitori.length > 0) {
            return m.reply(`『 ❌ 』 @${getNum(targetUser)} ha già una famiglia. Non puoi rapirlo!`, null, { mentions: [targetUser] });
        }
        if (db[sender].figli.includes(targetUser)) {
            return m.reply("『 ❌ 』 È già tuo figlio!");
        }
        if (myPartner === targetUser) {
            return m.reply("『 ❌ 』 Non puoi adottare tuo marito/tua moglie. Siete malati.");
        }

        // Aggiungi figlio a chi adotta
        db[sender].figli.push(targetUser);
        db[targetUser].genitori.push(sender);

        // Se l'adottante è sposato, il partner diventa automaticamente l'altro genitore!
        let extraMsg = "";
        if (myPartner && db[myPartner]) {
            if (!db[myPartner].figli) db[myPartner].figli = [];
            db[myPartner].figli.push(targetUser);
            db[targetUser].genitori.push(myPartner);
            extraMsg = `\n_Essendo sposato, anche @${getNum(myPartner)} diventa genitore legale!_`;
        }

        let msg = `${legamHeader}\n\n『 🍼 』 \`𝐍𝐔𝐎𝐕𝐀 𝐀𝐃𝐎𝐙𝐈𝐎𝐍𝐄\`\n\n@${getNum(sender)} ha appena adottato @${getNum(targetUser)}! 🎊\nBenvenuto nella famiglia.${extraMsg}\n\n${legamFooter}`;
        
        let mentionsArr = [sender, targetUser];
        if (myPartner) mentionsArr.push(myPartner);

        return conn.sendMessage(m.chat, { 
            text: msg, 
            mentions: mentionsArr,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: { newsletterJid: '120363428220415117@newsletter', serverMessageId: 100, newsletterName: "✨ 𝐋𝐞𝐠𝐚𝐦 𝐎𝐒 𝐅𝐚𝐦𝐢𝐥𝐲 ✨" }
            }
        });
    }

    // 🔥 3. RIPUDIA (.ripudia)
    if (cmd === 'ripudia') {
        if (!db[sender].figli.includes(targetUser)) {
            return m.reply(`『 ❌ 』 @${getNum(targetUser)} non è tuo figlio!`, null, { mentions: [targetUser] });
        }

        // Rimuove dai figli del mittente
        db[sender].figli = db[sender].figli.filter(f => f !== targetUser);
        
        // Se c'è un partner, rimuove il figlio anche a lui
        let extraMsg = "";
        if (myPartner && db[myPartner] && db[myPartner].figli) {
            db[myPartner].figli = db[myPartner].figli.filter(f => f !== targetUser);
            extraMsg = `\n_È stato disconosciuto anche da @${getNum(myPartner)}._`;
        }

        // Rimuove i genitori dal figlio
        db[targetUser].genitori = [];

        let msg = `${legamHeader}\n\n『 💔 』 \`𝐅𝐈𝐆𝐋𝐈𝐎 𝐑𝐈𝐏𝐔𝐃𝐈𝐀𝐓𝐎\`\n\n@${getNum(sender)} ha cacciato di casa @${getNum(targetUser)}!\n_È stato spogliato del nome di famiglia ed esiliato._${extraMsg}\n\n${legamFooter}`;
        
        let mentionsArr = [sender, targetUser];
        if (myPartner) mentionsArr.push(myPartner);

        return conn.sendMessage(m.chat, { text: msg, mentions: mentionsArr }, { quoted: m });
    }
};

handler.help = ['adotta', 'ripudia', 'scappa'];
handler.tags = ['giochi'];
handler.command = /^(adotta|ripudia|scappa|scappadicasa)$/i;
handler.group = true;

export default handler;


