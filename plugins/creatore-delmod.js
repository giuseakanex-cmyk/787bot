
import fetch from 'node-fetch'

const handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.isGroup)
    return m.reply('『 ⚠️ 』 `Questo comando può essere usato solo nei gruppi.`');

  let who = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
  if (!who)
    return m.reply('『 ⚠️ 』 `Devi taggare l’utente a cui revocare il grado VIP.`');

  const user = global.db.data.users[who];
  if (!user || !user.premium || user.premiumGroup !== m.chat)
    return m.reply('『 💡 』 `Questo utente non è un membro VIP in questo gruppo.`');

  user.premium = false;
  delete user.premiumGroup;

  let ppUrl;
  try {
    ppUrl = await conn.profilePictureUrl(who, 'image');
  } catch {
    ppUrl = 'https://qu.ax/fmHdc.png'; 
  }

  const name = '@' + who.split('@')[0];
  const caption = `𝐨𝐫𝐚 ${name} 𝐧𝐨𝐧 è 𝐩𝐢ù 𝐮𝐧 𝐯𝐢𝐩 𝐢𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨, 𝐛𝐮𝐨𝐧𝐚 𝐩𝐞𝐫𝐦𝐚𝐧𝐞𝐧𝐳𝐚 (𝐟𝐨𝐫𝐬𝐞).`.trim();

  await conn.sendMessage(m.chat, {
      text: caption,
      mentions: [who],
      contextInfo: {
          mentionedJid: [who],
          externalAdReply: {
              title: '𝐋𝐄𝐆𝐀𝐌 𝐀𝐔𝐓𝐇𝐎𝐑𝐈𝐓𝐘',
              body: 'Grado VIP Revocato',
              thumbnailUrl: ppUrl,
              mediaType: 1,
              renderLargerThumbnail: false,
              sourceUrl: null
          }
      }
  });
};

handler.help = ['delvip @user'];
handler.tags = ['group'];
handler.command = ['delvip'];
handler.group = true;
handler.owner = true; 

export default handler;


