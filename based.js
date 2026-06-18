import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { toBoldFont } from '../lib/font.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginDir = __dirname; // Si trova già dentro la cartella plugins/

// Funzione pulita e compatibile con smsg
function getQuotedText(m) {
  if (!m.quoted) return '';
  // smsg estrae già il testo pulito in m.quoted.text
  return m.quoted.text || '';
}

export default {
  name: 'pluginmanager',
  description: 'Gestione plugin owner NYC BOT',
  commands: ['getplugin', 'editplugin', 'saveplugin'],
  owner: true,
  run: async (conn, m, { command, args, chatId }) => {
    const pluginName = (args[0] || '').trim();
    if (!pluginName) {
      await conn.sendMessage(chatId, { text: toBoldFont(`𝐔𝐬𝐚 .${command} <nome-plugin>`) }, { quoted: m });
      return;
    }

    const normalized = pluginName.replace(/[^a-zA-Z0-9_-]/g, '');
    const fileName = normalized.endsWith('.js') ? normalized : `${normalized}.js`;
    const filePath = path.join(pluginDir, fileName);

    if (command === 'getplugin') {
      if (!fs.existsSync(filePath)) {
        await conn.sendMessage(chatId, { text: toBoldFont(`𝐍𝐨𝐧 𝐡𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨 𝐢𝐥 𝐟𝐢𝐥𝐞 ${fileName}`) }, { quoted: m });
        return;
      }
      await conn.sendMessage(chatId, {
        document: fs.readFileSync(filePath),
        fileName,
        mimetype: 'application/javascript'
      }, { quoted: m });
      return;
    }

    const quotedText = getQuotedText(m).trim();
    if (!quotedText) {
      await conn.sendMessage(chatId, { text: toBoldFont('𝐃𝐞𝐯𝐢 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞 𝐚 𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐜𝐨𝐧 𝐢𝐥 𝐜𝐨𝐝𝐢𝐜𝐞 𝐝𝐞𝐥 𝐩𝐥𝐮𝐠𝐢𝐧.') }, { quoted: m });
      return;
    }

    if (command === 'editplugin') {
      if (!fs.existsSync(filePath)) {
        await conn.sendMessage(chatId, { text: toBoldFont(`𝐈𝐥 𝐩𝐥𝐮𝐠𝐢𝐧 ${fileName} 𝐧𝐨𝐧 𝐞̀ 𝐩𝐫𝐞𝐬𝐞𝐧𝐭𝐞.`) }, { quoted: m });
        return;
      }
      try {
        fs.writeFileSync(filePath, quotedText, 'utf-8');
        await conn.sendMessage(chatId, { text: toBoldFont(`𝐏𝐥𝐮𝐠𝐢𝐧 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚𝐭ο: ${fileName}`) }, { quoted: m });
      } catch (error) {
        await conn.sendMessage(chatId, { text: toBoldFont('𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥𝐚 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚 𝐝𝐞𝐥 𝐩𝐥𝐮𝐠𝐢𝐧.') }, { quoted: m });
      }
      return;
    }

    if (command === 'saveplugin') {
      if (fs.existsSync(filePath)) {
        await conn.sendMessage(chatId, { text: toBoldFont(`𝐈𝐥 𝐟𝐢𝐥𝐞 ${fileName} 𝐞̀ 𝐠𝐢𝐚̀ 𝐩𝐫𝐞𝐬𝐞𝐧𝐭𝐞.`) }, { quoted: m });
        return;
      }
      try {
        fs.writeFileSync(filePath, quotedText, 'utf-8');
        await conn.sendMessage(chatId, { text: toBoldFont(`𝐍𝐮𝐨𝐯ο 𝐩𝐥𝐮𝐠𝐢𝐧 𝐬𝐚𝐥𝐯𝐚𝐭𝐨: ${fileName}`) }, { quoted: m });
      } catch (error) {
        await conn.sendMessage(chatId, { text: toBoldFont('𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥 𝐬𝐚𝐥𝐯𝐚𝐫𝐞 𝐢𝐥 𝐩𝐥𝐮𝐠𝐢𝐧.') }, { quoted: m });
      }
      return;
    }
  }
};
