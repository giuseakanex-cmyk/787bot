let cooldowns = {}
const COOLDOWN_TIME = 2000 // 2 secondi di cooldown dopo vittoria

// Funzione per formattare i numeri (es. 1000 -> 1.000)
const f = (n) => new Intl.NumberFormat('it-IT').format(n);

let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    
    let cmd = command.toLowerCase();

    // ==========================================
    // 1. MENU PRINCIPALE (Scelta della puntata)
    // ==========================================
    if ((cmd === 'tc' && args.length === 0) || (cmd === 'coinflip' && args.length === 0) || args[0] === 'menu') {
        let menuText = `🪙 *TESTA O CROCE*\n\nScegli quanto vuoi puntare:\n\n💰 *Puntate Basse:* 10€, 50€, 100€\n💰 *Puntate Medie:* 500€, 1.000€, 5.000€\n💰 *Puntate Alte:* 10.000€, 50.000€, 100.000€\n💰 *Puntate Estreme:* 500.000€, 1.000.000€`;

        let puntate = [10, 50, 100, 500, 1000, 5000, 10000, 50000];
        let buttons = puntate.map(p => ({
            buttonId: `${usedPrefix}tcask ${p}`,
            buttonText: { displayText: `↩️ ${f(p)}€` },
            type: 1
        }));

        return await conn.sendMessage(m.chat, {
            text: menuText,
            footer: '🎮 Minigames | 👑 Legam Bot',
            buttons: buttons
        }, { quoted: m });
    }

    // ==========================================
    // 2. SCELTA TESTA/CROCE (Dopo aver cliccato la puntata)
    // ==========================================
    if (cmd === 'tcask') {
        let q = parseInt(args[0]);
        if (isNaN(q)) return;

        let askText = `🪙 *TESTA O CROCE*\n\nHai scelto di puntare: *${f(q)}€*\nScegli su cosa puntare:`;
        let buttons = [
            { buttonId: `${usedPrefix}tc ${q} testa`, buttonText: { displayText: `↩️ 🪙 Testa (${f(q)}€)` }, type: 1 },
            { buttonId: `${usedPrefix}tc ${q} croce`, buttonText: { displayText: `↩️ 💿 Croce (${f(q)}€)` }, type: 1 },
            { buttonId: `${usedPrefix}tc menu`, buttonText: { displayText: `↩️ 💰 Cambia puntata` }, type: 1 }
        ];

        return await conn.sendMessage(m.chat, {
            text: askText,
            footer: '🎮 Minigames | 👑 Legam Bot',
            buttons: buttons
        }, { quoted: m });
    }

    // ==========================================
    // 3. GIOCO EFFETTIVO E CALCOLO VITTORIA
    // ==========================================
    let scelta, quantita;

    if (cmd === 'testa' || cmd === 'croce') {
        scelta = cmd;
        quantita = parseInt(text.trim());
    } else {
        // Riconosce formati come ".tc 100 testa" o ".tc testa 100"
        if (args.length < 2) return m.reply(`❌ Uso corretto: ${usedPrefix}tc <puntata> <testa/croce>\n💡 Oppure scrivi *${usedPrefix}tc* per aprire il menu.`);
        if (!isNaN(args[0])) { quantita = parseInt(args[0]); scelta = args[1].toLowerCase(); }
        else if (!isNaN(args[1])) { quantita = parseInt(args[1]); scelta = args[0].toLowerCase(); }
    }

    if (scelta !== 'testa' && scelta !== 'croce') return m.reply(`❌ Scegli testa o croce.`);
    if (isNaN(quantita) || quantita <= 0) return m.reply(`❌ Inserisci una puntata valida.`);

    // Controllo DB
    global.db.data.users = global.db.data.users || {};
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { euro: 0 };
    let user = global.db.data.users[m.sender];

    if (user.euro < quantita) return m.reply(`❌ Non hai abbastanza fondi.\n💰 Il tuo saldo: ${f(user.euro)}€`);

    // Cooldown (Solo se ha vinto l'ultima volta)
    if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < COOLDOWN_TIME) {
        let remainingTime = Math.ceil((cooldowns[m.sender] + COOLDOWN_TIME - Date.now()) / 1000);
        return m.reply(`⏳ Attendi ${remainingTime} secondi prima di giocare di nuovo.`);
    }

    // Risultato Random (50/50)
    let risultato = Math.random() < 0.5 ? 'testa' : 'croce';
    let vinto = (risultato === scelta);

    if (vinto) {
        user.euro += quantita;
        cooldowns[m.sender] = Date.now();
    } else {
        user.euro -= quantita;
    }

    // Creazione del testo finale
    let iconRisultato = risultato === 'testa' ? '🪙' : '💿';
    
    let resText = `🪙 *TESTA O CROCE* 🪙\n\n`;
    resText += `È uscito: *${risultato.toUpperCase()}* ${iconRisultato}\n`;
    resText += `La tua scelta: *${scelta.toUpperCase()}*\n\n`;

    if (vinto) {
        resText += `🎉 *HAI VINTO!*\n`;
        resText += `💰 Hai guadagnato: ${f(quantita)}€\n\n`;
        resText += `⏳ _*ATTENDI 2 SECONDI PRIMA DI RIPROVARE*_`;
    } else {
        resText += `❌ *HAI PERSO!*\n`;
        resText += `💸 Hai perso: ${f(quantita)}€`;
    }

    // Creazione dei bottoni di fine partita
    let finalButtons = [
        { buttonId: `${usedPrefix}tc ${quantita} testa`, buttonText: { displayText: `↩️ 🪙 Testa (${f(quantita)}€)` }, type: 1 },
        { buttonId: `${usedPrefix}tc ${quantita} croce`, buttonText: { displayText: `↩️ 💿 Croce (${f(quantita)}€)` }, type: 1 },
        { buttonId: `${usedPrefix}tc menu`, buttonText: { displayText: `↩️ 💰 Cambia puntata` }, type: 1 }
    ];

    await conn.sendMessage(m.chat, {
        text: resText,
        footer: '🎮 Minigames | 👑 Legam Bot',
        buttons: finalButtons
    }, { quoted: m });
}

handler.help = ['coinflip', 'tc', 'testa', 'croce'];
handler.tags = ['giochi'];
// Aggiunto 'tcask' per gestire i menu interattivi internamente
handler.command = /^(coinflip|tc|testacroce|testa|croce|tcask)$/i;

export default handler;


