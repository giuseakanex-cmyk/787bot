let handler = async (m, { conn, text }) => {
    // Individua il bersaglio
    let target = m.mentionedJid?.[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
    const botJid = conn.user.jid.split('@')[0];
    const targetId = target.split('@')[0];
    const normalizedTarget = conn.decodeJid?.(target) || target;
    const sep = '----------------------------';

    // Se prova a doxare il bot
    if (target.includes(botJid)) {
        await conn.sendMessage(m.chat, { react: { text: '🛡️', key: m.key } });
        return m.reply('// 𝟕𝟖𝟕 BOT // ACCESSG NEGATO //\n\n> I firewall del sistema sono impenetrabili.\n> Non sfidare il tuo creatore.\n\n' + sep);
    }

    const isSelf = target === m.sender;

    // Animazione di caricamento (Testi Originali Ripristinati)
    let waitMsg = await conn.sendMessage(m.chat, { text: '`[ 0% ] Inizializzazione protocollo OSINT...`' }, { quoted: m });
    
    const hackSteps = [
        '`[ 12% ] Intercettazione pacchetti TCP/IP...`',
        '`[ 38% ] Risoluzione indirizzo MAC e IP Pubblico...`',
        '`[ 64% ] Bypass della crittografia end-to-end...`',
        '`[ 89% ] Estrazione cronologia browser locale...`',
        '`[ 100% ] Compilazione report Legam OSINT...`'
    ];

    for (let step of hackSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        await conn.sendMessage(m.chat, { edit: waitMsg.key, text: step });
    }

    // Recupera Info
    let targetName = null;
    try { targetName = await conn.getName(normalizedTarget); } catch (e) { targetName = targetId; }
    
    let isBusiness = false;
    try {
        const biz = await conn.getBusinessProfile?.(target);
        isBusiness = !!(biz && (biz.wid || biz.description));
    } catch (e) { isBusiness = false; }

    let ppUrl = null;
    try { ppUrl = await conn.profilePictureUrl(target, 'image'); } 
    catch (e) { ppUrl = 'https://i.ibb.co/gMDMVjJn/IMG-1824.png'; }

    // Generazione Dati Realistici
    const carrier = getItalianCarrier(targetId);
    const deviceType = getDeviceType(m, target, isSelf);
    const fake = getExtendedFakeData(carrier, deviceType);
    const header = isSelf ? 'AUTO-BREACH REPORT' : 'TARGET REPORT';

    const caption = `// 𝟕𝟖𝟕 BOT // ${header} //

『 🌐 』 INFO GENERALI
· Target: @${targetId}
· Account: ${isBusiness ? 'Business (API)' : 'Standard (Mobile)'}
· Stato: Compromesso

『 📡 』 NETWORK
· IP Pubblico: ${fake.ip}
· ISP: ${fake.isp}
· MAC Address: ${fake.mac}
· Porte Aperte: 80, 443, 22 (Vuln)

『 📍 』 GEOLOCATION
· Città: ${fake.city}
· Coordinate: ${fake.coords}
· Precisione: ± 4.2 metri

『 📱 』 DEVICE
· Modello: ${fake.deviceModel}
· Sistema: ${fake.os}
· CPU: ${fake.cpu}
· Batteria: ${fake.battery}

『 👁️ 』 PRIVACY BREACH
· Ultima Ricerca: "${fake.history}"
· Malware: ${fake.virus}

${sep}
👑 OWNER: GIUȘΞ`.trim();

    await conn.sendMessage(m.chat, { delete: waitMsg.key });

    await conn.sendMessage(m.chat, {
        image: { url: ppUrl },
        caption: caption,
        mentions: [target],
        contextInfo: {
            mentionedJid: [target],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363233544482011@newsletter',
                newsletterName: "𝟕𝟖𝟕 BOT | Breach Report",
                serverMessageId: 100
            }
        }
    }, { quoted: m });
};

handler.help = ['dox @utente'];
handler.tags = ['giochi'];
handler.command = /^(dox|osint)$/i;

export default handler;

// =========================================================
// FUNZIONI DI SUPPORTO
// =========================================================

function getItalianCarrier(num) {
  if (!num.startsWith('39')) return 'International Roaming / VoIP';
  const p = num.replace('39', '').substring(0, 3);
  const m = {
    'TIM Italia S.p.A.': ['330','331','333','334','335','336','337','338','339','360','368'],
    'Vodafone Omnitel B.V.': ['340','341','342','343','344','345','346','347','348','349','383'],
    'Wind Tre S.p.A.': ['320','322','323','324','327','328','329','380','388','389','391','392','393'],
    'Iliad Italia S.p.A.': ['351','352'],
    'PostePay S.p.A.': ['350','370','371','377','379','375'],
    'Fastweb S.p.A.': ['373', '3756'],
  };
  for (let [k, v] of Object.entries(m)) { if (v.includes(p)) return k; }
  return 'MVNO Sconosciuto';
}

function getDeviceType(m, target, isSelf) {
  const qId = m.quoted ? m.quoted.id : (isSelf ? m.key.id : null);
  if (qId) {
    if (qId.startsWith('3A') && qId.length < 30) return 'ios';
    if (qId.startsWith('3EB0')) return 'web';
    if (qId.length > 18) return 'android';
  }
  return 'unknown';
}

function getExtendedFakeData(carrier, type) {
  const iosModels = ['iPhone 15 Pro Max', 'iPhone 14 Pro', 'iPhone 13', 'iPhone 12 Mini'];
  const androidModels = ['Samsung Galaxy S24 Ultra', 'Samsung Galaxy A54', 'Xiaomi 13 Pro', 'Google Pixel 8'];
  const webModels = ['Windows 11 Desktop', 'MacBook Air M2', 'Windows 10 Laptop'];
  const locations = [
    { c: 'Milano (IT)', lat: 45.464, lon: 9.190 }, { c: 'Roma (IT)', lat: 41.902, lon: 12.496 },
    { c: 'Napoli (IT)', lat: 40.851, lon: 14.268 }, { c: 'Torino (IT)', lat: 45.070, lon: 7.686 }
  ];
  const history = ['Come spiare WhatsApp gratis', 'Prestiti senza busta paga', 'Sintomi calvizie precoce', 'Rolex replica perfetta'];
  const virus = ['Trojan.Win32.Agent', 'Nessuno (Scansione pulita)', 'Keylogger_Hidden.apk', 'Adware.TrackingCookie'];

  const loc = pick(locations);
  let model, os, cpu;
  
  if (type === 'ios') {
    model = pick(iosModels); os = `iOS 17.${randomInt(1, 4)}.${randomInt(0, 2)}`; cpu = 'Apple A' + randomInt(13, 17) + ' Bionic';
  } else if (type === 'web') {
    model = pick(webModels); os = 'Windows NT 10.0 / macOS 14.3'; cpu = 'Intel Core i' + pick([5, 7, 9]);
  } else {
    model = pick(androidModels); os = `Android ${randomInt(12, 14)}`; cpu = pick(['Snapdragon 8 Gen 2', 'Exynos 2200']);
  }

  return {
    deviceModel: model,
    ip: `${randomInt(11, 212)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`,
    mac: Array.from({length: 6}, () => Math.floor(Math.random()*256).toString(16).padStart(2, '0').toUpperCase()).join(':'),
    isp: carrier, city: loc.c, coords: `${(loc.lat + (Math.random() * 0.01)).toFixed(6)}, ${(loc.lon + (Math.random() * 0.01)).toFixed(6)}`,
    os: os, cpu: cpu, battery: `${randomInt(5, 95)}%`, history: pick(history), virus: pick(virus)
  };
}

function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
