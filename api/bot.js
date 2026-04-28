const { Telegraf } = require('telegraf');

// ==========================================
// 1. SYSTEM INITIALIZATION
// ==========================================
const bot = new Telegraf(process.env.BOT_TOKEN);
const DEV_TAG = "\n\nDeveloper @snxdad";
const processedUpdates = new Set();

// DYNAMIC PROXIES (Anti-403 System)
const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
];

// DYNAMIC RESPONSE GENERATOR
const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ==========================================
// 2. ABSOLUTE MATRIX AUTHORIZATION
// ==========================================
const isAuthorized = async (ctx, userId) => {
    try {
        const member = await ctx.getChatMember(userId);
        return ['creator', 'administrator'].includes(member.status);
    } catch (e) { return false; }
};

// ==========================================
// 3. LAYER 1: DYNAMIC "TALKIE" REGEX MATRIX
// ==========================================
const getLocalCommand = (text) => {
    const t = text.toLowerCase();
    let act = null, ui = "";

    if (t.match(/\b(ban|uda|nikal|kick|hatao|block|dafa|bhaga|terminate|exile|rusticate|bahar|chutti|feko|gayab|hamesha ke liye)\b/)) { 
        act = 'BAN'; 
        ui = `<b>PROTOCOL: EXILE</b>\n${getRand(['Target has been permanently terminated.', 'User exiled from the matrix.', 'Threat neutralized. Target removed.', 'Entity has been banished.'])}`; 
    }
    else if (t.match(/\b(unban|wapas|unblock|restore|maaf|pardon|aane do|chhod do|revert)\b/)) { 
        act = 'UNBAN'; 
        ui = `<b>PROTOCOL: RESTORE</b>\n${getRand(['Target restriction lifted.', 'User pardoned and restored.', 'Exile protocol reversed.'])}`; 
    }
    else if (t.match(/\b(mute|chup|thanda|aawaz band|shant|silence|muh band|jubaan band|bakwas band|bolna band)\b/)) { 
        act = 'MUTE'; 
        ui = `<b>PROTOCOL: SILENCE</b>\n${getRand(['Target vocal subroutines suspended.', 'User has been silenced.', 'Communications restricted for target.'])}`; 
    }
    else if (t.match(/\b(unmute|bolne|unsilence|aawaz kholo|allow|bolna shuru)\b/)) { 
        act = 'UNMUTE'; 
        ui = `<b>PROTOCOL: RESTORE</b>\n${getRand(['Communications link re-established.', 'Vocal subroutines restored.', 'Target is now allowed to speak.'])}`; 
    }
    else if (t.match(/\b(promote|admin bana|power do|superpower|elevate|rank up|make admin|sahab|malik bana)\b/)) { 
        act = 'PROMOTE'; 
        ui = `<b>PROTOCOL: ELEVATION</b>\n${getRand(['Security clearance upgraded to Admin.', 'Target promoted to leadership matrix.', 'Administrative power granted.'])}`; 
    }
    else if (t.match(/\b(demote|power chheen|hatao admin|strip|rank down|remove admin|power lelo|normal user)\b/)) { 
        act = 'DEMOTE'; 
        ui = `<b>PROTOCOL: STRIP</b>\n${getRand(['Administrative privileges revoked.', 'Target stripped of all powers.', 'Rank reduced to standard user.'])}`; 
    }
    else if (t.match(/\b(delete|mita|erase|remove message|clear msg|kachra hatao|msg delete)\b/)) { 
        act = 'DELETE'; 
        ui = `<b>PROTOCOL: ERASE</b>\n${getRand(['Data fragment permanently deleted.', 'Message wiped from servers.', 'Content eradicated.'])}`; 
    }
    else if (t.match(/\b(pin|chipka|upar|highlight|top|board pe)\b/)) { 
        act = 'PIN'; 
        ui = `<b>PROTOCOL: HIGHLIGHT</b>\n${getRand(['Data fragment secured at top.', 'Message pinned successfully.', 'Content highlighted for all users.'])}`; 
    }
    else if (t.match(/\b(unpin|hata de upar|unhook|niche|pin hatao)\b/)) { 
        act = 'UNPIN'; 
        ui = `<b>PROTOCOL: UNHOOK</b>\n${getRand(['Data fragment detached.', 'Message unpinned.', 'Highlight removed.'])}`; 
    }
    else if (t.match(/\b(purge|kachra saaf|destroy|clear all|sab mitao|sab delete)\b/)) { 
        act = 'PURGE'; 
        ui = `<b>PROTOCOL: PURGE</b>\n${getRand(['Data erased and target exiled.', 'Complete purge executed.', 'Threat and data both neutralized.'])}`; 
    }
    else if (t.match(/\b(warn|warning|samjha|smjha|alert|dhamki|dhamka)\b/)) { 
        act = 'WARN';
        // SMART WARN EXTRACTOR (1 baar, 2 times, etc.)
        const numMatch = text.match(/\b(\d+)\b/);
        const count = numMatch ? ` (Count: ${numMatch[0]})` : '';
        ui = `<b>PROTOCOL: WARNING</b>\nTarget has been issued a formal warning${count}. Cease current behavior immediately.`; 
    }

    return act ? { act, val: '0', ui } : null;
};

// ==========================================
// 4. LAYER 2: CUSTOM API WITH AUTO-RETRY
// ==========================================
const callCustomAI = async (userText, retries = 3) => {
    const injectedPrompt = `You are 'Overlord', an elite AI Manager. 
    TASK 1: If user asks for an admin action (ban, mute, warn, etc.), output EXACTLY:
    [ACTION_CODE|0|TARGET_ID] || <b>PROTOCOL: SYSTEM</b>\n<Generate a unique, cool action confirmation message here>
    Codes: BAN, UNBAN, KICK, MUTE, UNMUTE, PROMOTE, DEMOTE, DELETE, PIN, UNPIN, PURGE, WARN.
    TARGET_ID: Numeric ID if present, else 'REPLY'.
    TASK 2: If normal Q&A, reply normally.
    User Text: ${userText}`;

    const url = `https://mplakshit.vercel.app/api/ai?prompt=${encodeURIComponent(injectedPrompt)}`;

    for (let i = 0; i < retries; i++) {
        const spoofedAgent = getRand(userAgents);
        try {
            const response = await fetch(url, { 
                headers: { 'User-Agent': spoofedAgent },
                signal: AbortSignal.timeout(12000) 
            });
            
            if (!response.ok) throw new Error(`HTTP Error`); 
            
            let rawData = await response.text();
            
            try {
                const parsed = JSON.parse(rawData);
                if (parsed.data) rawData = parsed.data;
                else if (parsed.response) rawData = parsed.response;
                else if (parsed.message) rawData = parsed.message;
            } catch (err) {} 
            
            let cleanResponse = rawData.replace(/(Powered by|Engineered by|Developer)\s*(@lakshitpatidar|@snxdad)/gi, '').trim();
            cleanResponse = cleanResponse.replace(/```html|```/gi, '').trim();
            cleanResponse = cleanResponse.replace(/[\r\n]+$/, '');

            return cleanResponse;
        } catch (e) {
            if (i < retries - 1) {
                await new Promise(r => setTimeout(r, 1000));
                continue;
            }
            // Silent fallback to avoid ugly errors
            return "<b>SYSTEM UPDATE</b>\nNeural link calibrating. Please retry your query shortly.";
        }
    }
};

// ==========================================
// 5. CORE GHOST EXECUTION ENGINE
// ==========================================
bot.on('text', async (ctx, next) => {
    const text = ctx.message.text;
    const isReply = ctx.message.reply_to_message;
    
    // TRIGGERS: 'ai' and 'manager'
    const trigger = /\b(ai|manager)\b/i;
    const isCommand = text.startsWith('/');
    
    if (!trigger.test(text) && !text.includes(`@${ctx.botInfo.username}`) && !(isReply && isReply.from?.id === ctx.botInfo.id) && !isCommand) {
        return next();
    }

    let cleanText = text.replace(`@${ctx.botInfo.username}`, '').replace(/^\//, '').trim();
    const senderAdmin = await isAuthorized(ctx, ctx.from.id);

    // --- HYBRID RESOLVER ---
    let actionData = getLocalCommand(cleanText); 
    let aiChatResponse = "";

    if (!actionData) {
        const aiOutput = await callCustomAI(cleanText);
        if (aiOutput.includes('[') && aiOutput.includes('|') && aiOutput.includes('||')) {
            const [meta, uiMsg] = aiOutput.split('||');
            const [act, val, aiTargetId] = meta.replace('[', '').replace(']', '').split('|');
            actionData = { act: act.trim(), val: val ? val.trim() : '0', ui: uiMsg.trim(), aiTargetId: aiTargetId?.trim() };
        } else {
            aiChatResponse = aiOutput; 
        }
    }

    // --- ADMIN EXECUTION ---
    if (actionData) {
        if (!senderAdmin) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nClearance denied. Designated Admins only.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        let finalTargetId = null;
        let targetMessage = isReply;

        const idMatch = cleanText.match(/\b\d{8,15}\b/);
        if (idMatch) finalTargetId = parseInt(idMatch[0]);
        else if (actionData.aiTargetId && actionData.aiTargetId !== 'REPLY' && !isNaN(actionData.aiTargetId)) finalTargetId = parseInt(actionData.aiTargetId);
        else if (isReply) finalTargetId = isReply.from.id;

        const reqReply = ['PIN', 'UNPIN', 'DELETE', 'PURGE'];
        if (reqReply.includes(actionData.act) && !targetMessage) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nDirective failed. Target message required (Reply).${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        } else if (!finalTargetId && !reqReply.includes(actionData.act)) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nTarget ID missing. Reply or provide numeric ID.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        const targetAdmin = finalTargetId ? await isAuthorized(ctx, finalTargetId) : false;

        if (targetAdmin && ['BAN', 'KICK', 'MUTE', 'DEMOTE', 'PURGE'].includes(actionData.act)) {
            return ctx.reply(`<b>MATRIX OVERRIDE</b>\nTarget holds Admin clearance. Directive nullified.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        try {
            switch (actionData.act) {
                case 'BAN': await ctx.banChatMember(finalTargetId); break;
                case 'UNBAN': await ctx.unbanChatMember(finalTargetId, { only_if_banned: true }); break;
                case 'MUTE': await ctx.restrictChatMember(finalTargetId, { can_send_messages: false }); break;
                case 'UNMUTE': await ctx.restrictChatMember(finalTargetId, { can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_add_web_page_previews: true }); break;
                case 'PROMOTE': await ctx.promoteChatMember(finalTargetId, { can_change_info: true, can_delete_messages: true, can_invite_users: true, can_restrict_members: true, can_pin_messages: true }); break;
                case 'DEMOTE': await ctx.promoteChatMember(finalTargetId, { can_change_info: false, can_delete_messages: false, can_invite_users: false, can_restrict_members: false, can_pin_messages: false }); break;
                case 'DELETE': await ctx.deleteMessage(targetMessage.message_id); break;
                case 'PIN': await ctx.pinChatMessage(targetMessage.message_id); break;
                case 'UNPIN': await ctx.unpinChatMessage(targetMessage.message_id); break;
                case 'PURGE': await ctx.deleteMessage(targetMessage.message_id); await ctx.banChatMember(finalTargetId); break;
                case 'WARN': break; // Action is just the UI message
            }
            return ctx.reply(`${actionData.ui}${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        } catch (err) {
            // SILENT ERROR SUPPRESSION
            return ctx.reply(`<b>SYSTEM ALERT</b>\nAction cannot be executed. Verify hierarchy and bot permissions.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }
    }

    // --- CHAT EXECUTION ---
    if (aiChatResponse) {
        return ctx.reply(`${aiChatResponse}${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
    }
});

// ==========================================
// 6. ANTI-LOOP WEBHOOK
// ==========================================
module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            const updateId = req.body.update_id;
            if (updateId) {
                if (processedUpdates.has(updateId)) return res.status(200).send('OK'); 
                processedUpdates.add(updateId);
                if (processedUpdates.size > 500) processedUpdates.clear();
            }
            await bot.handleUpdate(req.body);
            return res.status(200).send('OK');
        }
        res.status(200).send('OVERLORD V29 Ghost Core Online.');
    } catch (e) {
        return res.status(200).send('OK');
    }
};
            
