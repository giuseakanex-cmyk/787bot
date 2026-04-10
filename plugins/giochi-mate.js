// Inizializza la memoria per i quiz
global.mathQuiz = global.mathQuiz || {};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundToTwo(num) {
  return Math.round(num * 100) / 100;
}

// 🧮 GENERATORE MATEMATICO
function generateQuestion(level = 'facile') {
  let q = '';
  let a = 0;

  switch (level) {
    case 'facile':
      let n1 = randomInt(1, 30), n2 = randomInt(1, 30);
      let op = Math.random() > 0.5 ? '+' : '-';
      if (op === '-' && n1 < n2) [n1, n2] = [n2, n1]; 
      q = `${n1} ${op} ${n2}`;
      a = op === '+' ? n1 + n2 : n1 - n2;
      break;

    case 'medio':
      let m1 = randomInt(5, 15), m2 = randomInt(2, 10);
      if (Math.random() > 0.5) {
        q = `${m1} × ${m2}`;
        a = m1 * m2;
      } else {
        a = randomInt(3, 12);
        q = `${a * m2} ÷ ${m2}`;
      }
      break;

    case 'difficile':
      let d1 = randomInt(2, 6), d2 = randomInt(2, 3);
      let squares = [9, 16, 25, 36, 49, 64, 81, 100];
      let sq = squares[randomInt(0, squares.length - 1)];
      q = `(${d1}^${d2}) + √${sq}`;
      a = Math.pow(d1, d2) + Math.sqrt(sq);
      break;

    case 'estremo':
      let e1 = randomInt(10, 30), e2 = randomInt(2, 5), e3 = randomInt(2, 8);
      q = `(${e1} × ${e2}) - (${e1} ÷ ${e2}) + ${e3}²`;
      a = (e1 * e2) - (e1 / e2) + Math.pow(e3, 2);
      a = roundToTwo(a);
      break;
  }
  return { question: q, answer: a };
}

// 🔀 GENERATORE DI OPZIONI SBAGLIATE
function generateOptions(correctAnswer) {
    let options = new Set([correctAnswer]);
    while(options.size < 4) {
        let offset = randomInt(-15, 15);
        if (offset === 0) continue;
        let wrong = roundToTwo(correctAnswer + offset);
        if (Number.isInteger(correctAnswer)) wrong = Math.round(wrong); 
        options.add(wrong);
    }
    // Mischia le opzioni
    return Array.from(options).sort(() => Math.random() - 0.5);
}

function getTimer(level) {
  const timers = { facile: 30000, medio: 45000, difficile: 60000, estremo: 90000 };
  return timers[level] || 30000;
}

const legamContext = (title) => ({
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363428220415117@newsletter',
        serverMessageId: 100,
        newsletterName: `🧠 ${title}`
    }
});

// =========================================================
// 1. IL COMANDO PRINCIPALE
// =========================================================
let handler = async (m, { conn, text, usedPrefix }) => {
  const chatId = m.chat;
  const level = (text || '').trim().toLowerCase();

  // Menu di base
  if (!['facile', 'medio', 'difficile', 'estremo'].includes(level)) {
      let menu = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🔢 𝐐𝐔𝐈𝐙 𝐌𝐀𝐓𝐄𝐌𝐀𝐓𝐈𝐂𝐎 🔢 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

Scegli una difficoltà per iniziare:
➭ *${usedPrefix}mate facile*
➭ *${usedPrefix}mate medio*
➭ *${usedPrefix}mate difficile*
➭ *${usedPrefix}mate estremo*

✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();
      return conn.sendMessage(m.chat, { text: menu, contextInfo: legamContext('Game Center') }, { quoted: m });
  }

  if (global.mathQuiz[chatId]) {
      return m.reply(`『 ⏳ 』 \`C'è già un quiz in corso in questo gruppo! Rispondi a quello.\``);
  }

  const { question, answer } = generateQuestion(level);
  const options = generateOptions(answer);
  const timeLimit = getTimer(level);

  let quizText = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🔢 𝐈𝐍𝐃𝐎𝐕𝐈𝐍𝐄𝐋𝐋𝐎 𝐌𝐀𝐓𝐄𝐌𝐀𝐓𝐈𝐂𝐎 🔢 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

『 📝 』 𝐃𝐢𝐟𝐟𝐢𝐜𝐨𝐥𝐭𝐚̀: ${level.toUpperCase()}
『 ❓ 』 𝐏𝐫𝐨𝐛𝐥𝐞𝐦𝐚: ${question}

💡 *Come rispondere:*
Tocca uno dei pulsanti qui sotto.
Hai *3 tentativi* e *${timeLimit / 1000} secondi*.
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

  // 🔥 PULSANTI FORMATO NATIVO (Anticrash) 🔥
  const dynamicButtons = options.map(opt => ({
      buttonId: String(opt),
      buttonText: { displayText: String(opt) },
      type: 1
  }));

  await conn.sendMessage(chatId, {
      text: quizText,
      footer: "Seleziona la risposta esatta",
      buttons: dynamicButtons,
      headerType: 1, 
      contextInfo: legamContext(`Livello: ${level.toUpperCase()}`)
  }, { quoted: m });

  // Salva il quiz in memoria
  global.mathQuiz[chatId] = {
      answer: answer,
      level: level,
      attempts: 3, 
      players: {}, 
      timeout: setTimeout(() => {
          if (global.mathQuiz[chatId]) {
              conn.sendMessage(chatId, { text: `『 ⌛ 』 \`Tempo scaduto!\`\nNessuno ha indovinato. La risposta esatta era *${answer}*.` });
              delete global.mathQuiz[chatId];
          }
      }, timeLimit)
  };
};

// =========================================================
// 2. IL GIUDICE IN BACKGROUND (Intercetta, Giudica e Registra)
// =========================================================
handler.before = async function (m, { conn }) {
  const chatId = m.chat;
  let quiz = global.mathQuiz[chatId];

  // Se non c'è un quiz attivo o se l'utente non ha premuto/scritto nulla
  if (!quiz || !m.text) return true;

  // Cerca di leggere il numero che l'utente ha inviato/premuto
  const userAnswerNum = Number(m.text.trim());
  if (isNaN(userAnswerNum)) return true;

  // 🔥 INTEGRAZIONE STATS E RANKING 🔥
  // 1. Assicura che l'utente esista nel DB
  let userDb = global.db.data.users[m.sender];
  if (!userDb) {
      global.db.data.users[m.sender] = {};
      userDb = global.db.data.users[m.sender];
  }
  
  // 2. Aggiunge +1 ai messaggi totali dell'utente
  userDb.messaggi = (userDb.messaggi || 0) + 1;

  // 3. Aggiunge +1 al Ranking Giornaliero del Gruppo
  let chatDb = global.db.data.chats[m.chat];
  if (chatDb && chatDb.ranking) {
      chatDb.ranking.totali = (chatDb.ranking.totali || 0) + 1;
      chatDb.ranking.utenti[m.sender] = (chatDb.ranking.utenti[m.sender] || 0) + 1;
  }

  // Controllo tentativi
  if (quiz.players[m.sender] && quiz.players[m.sender] >= quiz.attempts) {
      m.reply(`『 🚫 』 \`Hai esaurito i tuoi 3 tentativi!\``);
      return true;
  }

  if (!quiz.players[m.sender]) quiz.players[m.sender] = 0;

  // CONTROLLO RISPOSTA
  if (userAnswerNum === quiz.answer) {
      // HA VINTO!
      clearTimeout(quiz.timeout);
      delete global.mathQuiz[chatId]; 

      let expReward = quiz.level === 'facile' ? 20 : quiz.level === 'medio' ? 40 : quiz.level === 'difficile' ? 80 : 150;
      let euroReward = quiz.level === 'facile' ? 5 : quiz.level === 'medio' ? 10 : quiz.level === 'difficile' ? 25 : 50;

      // Aggiorna le Stats Reali
      userDb.exp = (userDb.exp || 0) + expReward;
      userDb.euro = (userDb.euro || 0) + euroReward;
      userDb.quiz_vinti = (userDb.quiz_vinti || 0) + 1;
      userDb.quiz_giocati = (userDb.quiz_giocati || 0) + 1;

      let winMsg = `
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦
· 🏆 𝐑𝐈𝐒𝐏𝐎𝐒𝐓𝐀 𝐄𝐒𝐀𝐓𝐓𝐀! 🏆 ·
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦

Complimenti @${m.sender.split('@')[0]}! 🎉
Hai indovinato il risultato: *${quiz.answer}*

🎁 𝐑𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐞 𝐨𝐭𝐭𝐞𝐧𝐮𝐭𝐞:
➭ 🎓 +${expReward} EXP
➭ 💰 +${euroReward} Euro
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim();

      await conn.sendMessage(chatId, { text: winMsg, mentions: [m.sender], contextInfo: legamContext('Vittoria!') }, { quoted: m });
      
  } else {
      // HA SBAGLIATO!
      quiz.players[m.sender]++;
      let tentativiRimasti = quiz.attempts - quiz.players[m.sender];
      
      if (tentativiRimasti > 0) {
          m.reply(`『 ❌ 』 \`Sbagliato!\` Ti restano *${tentativiRimasti} tentativi*.`);
      } else {
          // Ha esaurito i tentativi: conta come partita giocata per abbassare la sua precisione!
          userDb.quiz_giocati = (userDb.quiz_giocati || 0) + 1;
          m.reply(`『 💀 』 \`Hai esaurito tutti i tentativi per questo round.\``);
      }
  }

  return true; 
};

handler.help = ['matematica'];
handler.tags = ['giochi'];
handler.command = /^(mate|matematica)$/i;

export default handler;


