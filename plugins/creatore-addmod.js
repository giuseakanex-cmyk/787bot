
import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.isGroup)
    return m.reply('『 ⚠️ 』 `Questo comando può essere usato solo nei gruppi.`');

  let who = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
  if (!who)
    return m.reply('『 ⚠️ 』 `Devi taggare l’utente da elevare a VIP.`');

  let user = global.db.data.users[who] || (global.db.data.users[who] = {});

  if (user.premium && user.premiumGroup === m.chat)
    return m.reply('『 💡 』 `Questo utente è già un membro VIP.`');

  user.premium = true;
  user.premiumGroup = m.chat;

  let ppUrl;
  try {
    ppUrl = await conn.profilePictureUrl(who, 'image');
  } catch {
    ppUrl = 'https://qu.ax/fmHdc.png'; 
  }

  const name = '@' + who.split('@')[0];
  const caption = `${name} 𝐨𝐫𝐚 è 𝐮𝐧 𝐧𝐮𝐨𝐯𝐨 𝐯𝐢𝐩! 𝐁𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨 𝐧𝐞𝐥𝐥𝐨 𝐬𝐭𝐚𝐟𝐟, 𝐩𝐞𝐫 𝐯𝐞𝐝𝐞𝐫𝐞 𝐢 𝐭𝐮𝐨𝐢 𝐜𝐨𝐥𝐥𝐞𝐠𝐡𝐢 𝐮𝐬𝐚 .𝐯𝐢𝐩𝐥𝐢𝐬𝐭!`.trim();

  await conn.sendMessage(m.chat, {
      text: caption,
      mentions: [who],
      contextInfo: {
          mentionedJid: [who],
          externalAdReply: {
              title: '𝐋𝐄𝐆𝐀𝐌 𝐀𝐔𝐓𝐇𝐎𝐑𝐈𝐓𝐘',
              body: 'Grado VIP Assegnato',
              thumbnailUrl: ppUrl,
              mediaType: 1,
              renderLargerThumbnail: false,
              sourceUrl: null
          }
      }
  });
};

handler.help = ['addvip @user'];
handler.tags = ['group'];
handler.command = ['addvip'];
handler.group = true;
handler.owner = true; 

export default handler;



