export async function before(m, { conn }) {
  if (!m.messageStubType || !m.isGroup) return;

  let chat = global.db.data.chats[m.chat] || {};
  if (!chat.rileva) return;

  let groupMetadata = global.groupCache?.get(m.chat) || await conn.groupMetadata(m.chat).catch(() => null) || {};

  let sender = m.sender;
  if (sender && typeof sender === 'string' && sender.endsWith('@lid')) {
      const lidNumber = sender.split('@')[0].replace(/:\d+$/, '');
      const participant = groupMetadata.participants?.find(p => p.id && (p.id.split('@')[0] === lidNumber));
      if (participant) sender = participant.id;
  }
  
  let param0 = m.messageStubParameters?.[0];
  if (param0 && typeof param0 === 'string' && param0.endsWith('@lid')) {
      const lidNumber = param0.split('@')[0].replace(/:\d+$/, '');
      const participant = groupMetadata.participants?.find(p => p.id && (p.id.split('@')[0] === lidNumber));
      if (participant) param0 = participant.id;
  }

  let decodedSender = sender ? conn.decodeJid(sender) : null;
  let decodedParam0 = (param0 && typeof param0 === 'string') ? conn.decodeJid(param0) : null;

  let senderNumber = decodedSender ? decodedSender.split('@')[0] : 'Sconosciuto';
  let param0Number = decodedParam0 ? decodedParam0.split('@')[0] : 'Sconosciuto';

  const type = m.messageStubType;

  const actionNames = {
    21: 'NOME GRUPPO',
    22: 'FOTO GRUPPO',
    23: 'LINK RESET',
    25: 'PERMESSI INFO',
    26: 'CHIUSURA CHAT',
    29: 'PROMOZIONE',
    30: 'RETROCESSIONE',
    72: 'DESCRIZIONE'
  };

  if (!actionNames[type]) return;

  let textMsg = '';
  const head = '// 𝟕 𝟖 𝟕  //';
  const sep = '--------------------';
  
  switch(type) {
    case 21:
        textMsg = `${head}\n// ${actionNames[type]} //\n\nAutore: @${senderNumber}\nNuovo: ${m.messageStubParameters[0]}\n\n${sep}`;
        break;
    case 22:
        textMsg = `${head}\n// ${actionNames[type]} //\n\nAutore: @${senderNumber}\nStato: Immagine aggiornata\n\n${sep}`;
        break;
    case 23:
        textMsg = `${head}\n// ${actionNames[type]} //\n\nAutore: @${senderNumber}\nStato: Link revocato\n\n${sep}`;
        break;
    case 25:
        textMsg = `${head}\n// ${actionNames[type]} //\n\nAutore: @${senderNumber}\nModifica: ${m.messageStubParameters[0] === 'on' ? 'Solo Admin' : 'Tutti'}\n\n${sep}`;
        break;
    case 26:
        textMsg = `${head}\n// ${actionNames[type]} //\n\nAutore: @${senderNumber}\nScrittura: ${m.messageStubParameters[0] === 'on' ? 'Solo Admin' : 'Tutti'}\n\n${sep}`;
        break;
    case 29:
        textMsg = `${head}\n// ${actionNames[type]} //\n\nUtente: @${param0Number}\nAdmin: @${senderNumber}\nStato: Promosso ad admin\n\n${sep}`;
        break;
    case 30:
        textMsg = `${head}\n// ${actionNames[type]} //\n\nUtente: @${param0Number}\nAdmin: @${senderNumber}\nStato: Rimosso admin\n\n${sep}`;
        break;
    case 72:
        textMsg = `${head}\n// ${actionNames[type]} //\n\nAutore: @${senderNumber}\nStato: Testo modificato\n\n${sep}`;
        break;
  }

  if (!textMsg) return;

  const mentions = [];
  if (decodedSender && decodedSender !== 's.whatsapp.net') mentions.push(decodedSender);
  if (decodedParam0 && decodedParam0 !== 's.whatsapp.net') mentions.push(decodedParam0);

  const legamContext = {
      mentionedJid: mentions,
      isForwarded: true,
      forwardingScore: 1,
      forwardedNewsletterMessageInfo: {
          newsletterJid: '120363259442839354@newsletter',
          serverMessageId: 100,
          newsletterName: `787 BOT | ${actionNames[type]}`
      }
  };

  await conn.sendMessage(m.chat, {
      text: textMsg,
      contextInfo: legamContext
  }).catch(()=>{});
}
