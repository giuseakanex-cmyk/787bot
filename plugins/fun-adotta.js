// ==========================================
// 𝟕𝟖𝟕 𝐒𝐘𝐒𝐓𝐄𝐌 - 𝐃𝐈𝐍𝐀𝐒𝐓𝐈𝐀 𝐄 𝐀𝐔𝐓𝐎𝐑𝐈𝐓𝐀̀ 👨‍👩‍👧‍👦
// ==========================================

const sysHeader = `⌬ ━━━───  𝟕 𝟖 𝟕  𝐃 𝐈 𝐍 𝐀 𝐒 𝐓 𝐈 𝐀  ───━━━ ⌬`;
const sysFooter = `⌬ ━━━───  𝐒𝐘𝐒𝐓𝐄𝐌  𝐀𝐔𝐓𝐇  ───━━━ ⌬`;

let handler = async (m, { conn, command, text, usedPrefix }) => {
    if (!m.isGroup) return;

    let db = global.db.data.users;
    let sender = m.sender;
    
    if (!db[sender].figli) db[sender].figli = [];
    if (!db[sender].genitori) db[sender].genitori = [];

    const getNum = (jid) => (jid || '').split('@')[0].split(':')[0];
    let cmd = command.toLowerCase();

    // 🔥 1. SCAPPA DI CASA
    if (cmd === 'scappa' || cmd === 'scappadicasa') {
        if (db[sender].genitori.length === 0) {
            return m.reply(`${sysHeader}\n\n⌬ ❯ Errore: Stato civile 'randagio' già attivo.\n\n${sysFooter}`);
        }

        let exGenitori = db[sender].genitori;
        for (let g of exGenitori) {
            if (db[g] && db[g].figli) {
                db[g].figli = db[g].figli.filter(f => f !== sender);
            }
        }
        db[sender].genitori = [];

        let msg = `${sysHeader}\n\n⌬ ❯ FUGA RIUSCITA\n@${getNum(sender)} ha troncato ogni legame di sangue.\n\n${sysFooter}`;
        return conn.sendMessage(m.chat, { text: msg, mentions: [sender] }, { quoted: m });
    }

    let targetUser;
    if (m.mentionedJid && m.mentionedJid[0]) targetUser = m.mentionedJid[0];
    else if (m.quoted && m.quoted.sender) targetUser = m.quoted.sender;

    if (!targetUser) {
        return m.reply(`${sysHeader}\n\n⌬ ❯ COMANDI:\n➤ ${usedPrefix}adotta @tag\n➤ ${usedPrefix}ripudia @tag\n➤ ${usedPrefix}scappa\n\n${sysFooter}`);
    }

    if (targetUser === sender) return m.reply("⌬ ❯ Errore: Impossibile interagire con il proprio host.");
    if (targetUser === conn.user.jid) return m.reply("⌬ ❯ Errore: Il Sistema non puo' essere adottato.");

    if (!db[targetUser]) db[targetUser] = { figli: [], genitori: [] };
    if (!db[targetUser].figli) db[targetUser].figli = [];
    if (!db[targetUser].genitori) db[targetUser].genitori = [];

    let myPartner = db[sender].partner || null;

    // 🔥 2. ADOTTA
    if (cmd === 'adotta') {
        if (db[targetUser].genitori.length > 0) {
            return m.reply(`⌬ ❯ @${getNum(targetUser)} appartiene gia' a un'altra dinastia.`, null, { mentions: [targetUser] });
        }
        if (db[sender].figli.includes(targetUser)) {
            return m.reply("⌬ ❯ Il soggetto fa gia' parte della prole.");
        }
        if (myPartner === targetUser) {
            return m.reply("⌬ ❯ Errore: Conflitto di interessi con il partner.");
        }

        db[sender].figli.push(targetUser);
        db[targetUser].genitori.push(sender);

        let extraMsg = "";
        if (myPartner && db[myPartner]) {
            if (!db[myPartner].figli) db[myPartner].figli = [];
            db[myPartner].figli.push(targetUser);
            db[targetUser].genitori.push(myPartner);
            extraMsg = `\nL'unione con @${getNum(myPartner)} estende la patria potesta'.`;
        }

        let msg = `${sysHeader}\n\n⌬ ❯ NUOVA ADOZIONE\n@${getNum(sender)} ha acquisito @${getNum(targetUser)}.\n${extraMsg}\n\n${sysFooter}`;
        
        let mentionsArr = [sender, targetUser];
        if (myPartner) mentionsArr.push(myPartner);

        return conn.sendMessage(m.chat, { 
            text: msg, 
            mentions: mentionsArr,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: { newsletterJid: '120363428220415117@newsletter', serverMessageId: 100, newsletterName: "𝟕𝟖𝟕 𝐒𝐘𝐒𝐓𝐄𝐌: DINASTIA" }
            }
        });
    }

    // 🔥 3. RIPUDIA
    if (cmd === 'ripudia') {
        if (!db[sender].figli.includes(targetUser)) {
            return m.reply(`⌬ ❯ @${getNum(targetUser)} non risulta nel database della prole.`, null, { mentions: [targetUser] });
        }

        db[sender].figli = db[sender].figli.filter(f => f !== targetUser);
        
        let extraMsg = "";
        if (myPartner && db[myPartner] && db[myPartner].figli) {
            db[myPartner].figli = db[myPartner].figli.filter(f => f !== targetUser);
            extraMsg = `\nEspulso anche dalla giurisdizione di @${getNum(myPartner)}.`;
        }

        db[targetUser].genitori = [];

        let msg = `${sysHeader}\n\n⌬ ❯ SOGGETTO RIPUDIATO\n@${getNum(sender)} ha rimosso @${getNum(targetUser)} dalla dinastia.\n${extraMsg}\n\n${sysFooter}`;
        
        let mentionsArr = [sender, targetUser];
        if (myPartner) mentionsArr.push(myPartner);

        return conn.sendMessage(m.chat, { text: msg, mentions: mentionsArr }, { quoted: m });
    }
};

handler.help = ['adotta', 'ripudia', 'scappa'];
handler.tags = ['strumenti'];
handler.command = /^(adotta|ripudia|scappa|scappadicasa)$/i;
handler.group = true;

export default handler;
