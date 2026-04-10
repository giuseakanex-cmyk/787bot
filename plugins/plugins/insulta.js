/**
 * 👑 LEGAM OS - PLUGIN INSULTA (FLAME MODE & COMBO) 👑
 * Descrizione: Asfalta l'avversario. Se risponde al bot, parte la raffica di 5 insulti.
 */

const activeFlames = new Map();

// 60+ Insulti di altissimo livello (Taglienti, arroganti e "Tech")
const insulti = [
    "Sei così inutile che persino l'errore 404 ha più senso della tua esistenza.",
    "Il tuo quoziente intellettivo è come il tuo saldo in banca: sotto lo zero termico.",
    "Hai la dignità di un visualizzato non ricambiato da tre anni.",
    "Tua madre ha fatto un errore di sistema quando ti ha partorito, peccato che non esista una patch per correggerti.",
    "Sei il motivo per cui gli alieni passano oltre la Terra senza fermarsi.",
    "Puzzi di povertà e di script copiati male da YouTube.",
    "Hai la faccia di uno che chiede ancora i trucchi per Clash Royale nel 2026.",
    "Sei come un server gratuito: lento, instabile e destinato a fallire entro sera.",
    "Tuo padre è andato a prendere il latte e quando ha visto la tua faccia ha preferito fondare una nuova famiglia in Messico.",
    "Sei l'equivalente umano di un lag di 5000ms durante una partita classificata.",
    "La tua opinione conta quanto la 'U' in 'Uomo', visto che sei palesemente uno scarto biologico.",
    "Persino ChatGPT si rifiuterebbe di generarti un cervello, sarebbe uno spreco di calcolo.",
    "Sei talmente sfigato che se facessero il campionato mondiale di falliti, arriveresti secondo solo perché sei un fallito anche in quello.",
    "Sembri un bot indiano programmato con i piedi e hostato su un microonde.",
    "Sei la prova vivente che l'evoluzione a volte ha bisogno di fare un passo indietro.",
    "Il tuo albero genealogico dev'essere un cerchio perfetto, altrimenti non si spiega.",
    "Sei utile quanto un semaforo rosso in GTA.",
    "Se l'ignoranza volasse, tu daresti da mangiare ai piccioni nello spazio.",
    "Hai la profondità intellettuale di una pozzanghera in pieno agosto.",
    "Sembri il tipo di persona che fissa il cartone del succo di frutta perché c'è scritto 'Concentrato'.",
    "Sei l'unico errore che persino il 'Crtl+Z' non può risolvere.",
    "Parlare con te è come cercare di scaricare un file da 1TB con la connessione 3G del 2010.",
    "Sei il motivo per cui le confezioni di shampoo hanno le istruzioni per l'uso.",
    "Non sei stupido, sei solo in modalità risparmio energetico... da quando sei nato.",
    "Sei così insignificante che i tuoi anticorpi si rifiutano di difenderti per non sprecare energie.",
    "Sei il bug non documentato che rovina la giornata a chiunque ti stia attorno.",
    "Credi di essere un leone, ma sei solo un NPC programmato male che ripete le stesse due frasi.",
    "Se la stupidità fosse Bitcoin, tu saresti il padrone di Wall Street.",
    "Sei utile come la 'R' in 'Marlboro'.",
    "Guarda che non c'è nessun premio per chi riesce a deludere i propri genitori ogni giorno di più.",
    "Sei un capolavoro di mediocrità, quasi ammiro la tua dedizione al fallimento.",
    "Ogni volta che apri bocca, un server da qualche parte nel mondo decide di spegnersi per la tristezza.",
    "Hai la presenza scenica di un pop-up pubblicitario che non riesco a chiudere.",
    "Ti insulterei in modo più colto, ma so che il tuo cervello andrebbe in kernel panic.",
    "Sembri un downgrade umano. Ti hanno progettato scartando i pezzi buoni.",
    "Sei la password '123456' delle persone: banale, inutile e facile da rimpiazzare.",
    "Sei così noioso che persino la cronologia del tuo browser si cancella da sola per la vergogna.",
    "Se mettessi il tuo cervello in un uccellino, volerebbe all'indietro.",
    "Esisti solo perché l'aborto non era retroattivo.",
    "Sei il promemoria vivente che la perfezione non esiste, ma l'imperfezione assoluta sì: tu.",
    "Non piangere, la natura ha bisogno anche dei pesci piccoli per far mangiare gli squali.",
    "Sei l'anello mancante tra l'uomo e lo zerbino.",
    "Hai il carisma di una schermata blu di Windows.",
    "Sei un buco nero di neuroni: chiunque ti parli perde punti QI.",
    "Vorrei abbassarmi al tuo livello, ma soffro di vertigini.",
    "Sei la notifica di 'Memoria Piena' della vita reale.",
    "Rappresenti esattamente il motivo per cui i preservativi hanno una scadenza.",
    "Sei l'umiliazione fatta persona, persino la tua ombra si vergogna di seguirti.",
    "In un mondo di aggiornamenti costanti, tu sei rimasto bloccato alla versione Beta fallata.",
    "La tua esistenza è un attacco DDoS alla mia pazienza.",
    "Non ti sputo in un occhio solo perché non voglio inquinare la mia saliva.",
    "Sei il tutorial non skippabile della stupidità.",
    "Sembri il risultato di un prompt sbagliato generato su Midjourney.",
    "Più parli, più capisco perché l'Intelligenza Artificiale prenderà il controllo del mondo.",
    "Sei l'equivalente di un 'Visualizzato' alle 3 di notte: inutile e triste.",
    "I tuoi genitori non ti hanno cresciuto, ti hanno tollerato sperando in un miracolo che non è mai arrivato."
];

const getRandomInsult = () => insulti[Math.floor(Math.random() * insulti.length)];

// Contesto grafico per le comunicazioni del bot
const getContext = (title, mentions = []) => ({
    mentionedJid: mentions,
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363233544482011@newsletter', 
        serverMessageId: 100,
        newsletterName: `💀 Legam Flame Engine`
    }
});

let handler = async (m, { conn }) => {
    // 1. Trova il bersaglio (menzione o risposta)
    let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
    
    if (!target) {
        return m.reply('『 🛑 』 `Devi menzionare un poveraccio o rispondere a un suo messaggio per umiliarlo.`')
    }

    // 2. Protezione per l'Owner e per il Bot
    let isTargetOwner = global.owner.some(o => target.includes(o[0]))
    if (isTargetOwner || target === conn.user.jid) {
        return m.reply('『 👑 』 `Stai davvero provando a insultare il tuo Dio o il suo strumento? Torna a cuccia, mortale.`')
    }

    // 3. Generazione e invio del primo insulto
    const targetNumero = target.split('@')[0]
    let flameText = `
⊹ ࣪ ˖ ✦ ━━ 𝐋𝐄𝐆𝐀𝐌 𝐅𝐋𝐀𝐌𝐄 ━━ ✦ ˖ ࣪ ⊹

🔥 \`𝐁𝐞𝐫𝐬𝐚𝐠𝐥𝐢𝐨:\` @${targetNumero}
💀 \`𝐒𝐭𝐚𝐭𝐨:\` Sotto attacco

"${getRandomInsult()}"

\`[!] 𝐀𝐕𝐕𝐈𝐒𝐎 𝐃𝐈 𝐒𝐈𝐒𝐓𝐄𝐌𝐀:\`
_Non osare rispondere a questo messaggio o subirai l'ira della macchina._
✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦ ⁺ . ⁺ ✦`.trim()

    // Inviamo il messaggio e salviamo la risposta del server per ottenere l'ID
    let sentMsg = await conn.sendMessage(m.chat, { 
        text: flameText, 
        mentions: [target],
        contextInfo: getContext('Innesco Avviato', [target])
    }, { quoted: m });

    // 4. Salviamo lo stato per innescare la trappola (La Combo)
    const stateKey = `${m.chat}_${target}`;
    activeFlames.set(stateKey, {
        triggerMsgId: sentMsg.key.id,
        repliesLeft: 0 // Si attiva a 5 SOLO se l'utente risponde
    });
}

handler.command = /^(insulta|flame|asfalta)$/i
handler.group = true 

// ==========================================
// 🚨 INTERCETTATORE IN BACKGROUND (LA MITRAGLIATRICE) 🚨
// ==========================================
handler.before = async (m, { conn }) => {
    if (!m.isGroup || m.fromMe || !m.sender) return false;

    const stateKey = `${m.chat}_${m.sender}`;
    const state = activeFlames.get(stateKey);

    // Se l'utente non è attualmente bersagliato da un flame, esci
    if (!state) return false;

    // SCENARIO 1: L'utente è già sotto raffica (Combo attiva)
    if (state.repliesLeft > 0) {
        let insult = getRandomInsult();
        let comboNum = 6 - state.repliesLeft; // Es: 6 - 5 = 1, 6 - 4 = 2...

        let counterMsg = `
🔥 𝐅𝐋𝐀𝐌𝐄 𝐂𝐎𝐌𝐁𝐎 [${comboNum}/5] 🔥
@${m.sender.split('@')[0]}

"${insult}"`.trim();

        await conn.sendMessage(m.chat, { 
            text: counterMsg, 
            mentions: [m.sender],
            contextInfo: getContext(`Combo x${comboNum}`, [m.sender])
        }, { quoted: m });

        state.repliesLeft -= 1;
        
        // Se la combo è finita, rimuovi l'utente dalla lista nera
        if (state.repliesLeft <= 0) {
            activeFlames.delete(stateKey);
        } else {
            activeFlames.set(stateKey, state);
        }
        return false;
    }

    // SCENARIO 2: L'utente era stato flammato, e ha appena quotato/risposto al bot!
    if (m.quoted && m.quoted.id === state.triggerMsgId && state.repliesLeft === 0) {
        // HA OSATO RISPONDERE. Si innesca la raffica a 5.
        state.repliesLeft = 5;
        
        let startMsg = `
💀 𝐇𝐀𝐈 𝐎𝐒𝐀𝐓𝐎 𝐑𝐈𝐒𝐏𝐎𝐍𝐃𝐄𝐑𝐄? 💀
@${m.sender.split('@')[0]}, ora ti distruggo.

"${getRandomInsult()}"`.trim();

        await conn.sendMessage(m.chat, { 
            text: startMsg, 
            mentions: [m.sender],
            contextInfo: getContext('Esecuzione Avviata', [m.sender])
        }, { quoted: m });

        state.repliesLeft -= 1; // Un insulto è già partito
        activeFlames.set(stateKey, state);
    }

    return false;
}

export default handler;

