function formatTime(seconds) {
    let hh = Math.floor(seconds / 3600).toString().padStart(2, '0');
    let mm = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    let ss = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}

function formatNumber(num) {
    return new Intl.NumberFormat('it-IT').format(num);
}

let handler = async (m, { conn }) => {
    global.db.data.groupActivity = global.db.data.groupActivity || {};
    let chatData = global.db.data.groupActivity[m.chat] || {};
    
    let usersArray = Object.entries(chatData).filter(u => (u[1].msgCount && u[1].msgCount > 0));
    usersArray.sort((a, b) => (b[1].onlineTime || 0) - (a[1].onlineTime || 0));

    if (usersArray.length === 0) return m.reply(`『 😅 』 \`Nessuna attività registrata in questa settimana.\``);

    let top10 = usersArray.slice(0, 10);
    let topTxt = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 👑 𝐓𝐎𝐏 𝟏𝟎 𝐒𝐄𝐓𝐓𝐈𝐌𝐀𝐍𝐀𝐋𝐄 👑 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦\n\n`;

    for (let i = 0; i < top10.length; i++) {
        let jid = top10[i][0];
        let data = top10[i][1];
        let medaglia = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `*${i+1}.*`;
        
        let onlineSecs = data.onlineTime || 0;

        topTxt += `${medaglia} @${jid.split('@')[0]}\n`;
        topTxt += `╰ ⏱️ ${formatTime(onlineSecs)}  |  💬 ${formatNumber(data.msgCount || 0)} msg\n\n`;
    }

    topTxt += `✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`;

    let mentions = top10.map(u => u[0]);

    return conn.sendMessage(m.chat, { 
        text: topTxt.trim(), 
        mentions: mentions,
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: { 
                newsletterJid: '120363233544482011@newsletter', 
                serverMessageId: 100, 
                newsletterName: `🏆 Top 10 Settimanale` 
            }
        }
    }, { quoted: m });
};

handler.command = /^(timetop)$/i;
handler.group = true;
export default handler;


