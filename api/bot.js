const { Telegraf } = require('telegraf');

// ==========================================
// 1. SYSTEM INITIALIZATION
// ==========================================
const bot = new Telegraf(process.env.BOT_TOKEN);
const DEV_TAG = "\n\nDeveloper @snxdad";
const processedUpdates = new Set();

const GROQ_API_KEY = "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";

const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Version/16.6 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1) Version/17.1 Safari/604.1"
];
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
// 3. LAYER 1: MASSIVE REGEX MATRIX (Max Level)
// ==========================================
const getLocalCommand = (text) => {
    const t = text.toLowerCase();
    let act = null, ui = "";

    // ID EXTRACTOR
    if (t.match(/\b(id nikal|id batao|mera id|userid|user id|get id)\b/) || t === '/id') {
        act = 'ID'; 
    }
    // APPROVE / WHITELIST
    else if (t.match(/\b(approve|whitelist|pass de|allow kar|verify|unrestrict)\b/)) { 
        act = 'UNMUTE'; ui = `<b>PROTOCOL: APPROVE</b>\nTarget verified and unrestricted. Access granted.`; 
    }
    // REVERSALS
    else if (t.match(/\b(unban|ban hata|wapas|unblock|restore|maaf|pardon|aane do|chhod do|revert|andar lo)\b/)) { 
        act = 'UNBAN'; ui = `<b>PROTOCOL: RESTORE</b>\n${getRand(['Target restriction lifted.', 'User pardoned.', 'Exile protocol reversed.'])}`; 
    }
    else if (t.match(/\b(unmute|mute hata|bolne do|unsilence|aawaz kholo|bolna shuru|awaz khol|bolne de)\b/)) { 
        act = 'UNMUTE'; ui = `<b>PROTOCOL: RESTORE</b>\n${getRand(['Communications link re-established.', 'Target is now allowed to speak.'])}`; 
    }
    else if (t.match(/\b(unpin|pin hata|hata de upar|unhook|niche|utaar|remove pin)\b/)) { 
        act = 'UNPIN'; ui = `<b>PROTOCOL: UNHOOK</b>\n${getRand(['Data fragment detached.', 'Message unpinned.'])}`; 
    }
    else if (t.match(/\b(unwarn|warn hata|warning hata|galti maaf|remove warning)\b/)) { 
        act = 'UNWARN'; ui = `<b>PROTOCOL: PARDON</b>\n${getRand(['Warning revoked.', 'Target pardoned. Record cleared.'])}`; 
    }
    // PUNISHMENTS
    else if (t.match(/\b(ban|uda|nikal|kick|hatao|block|dafa|bhaga|terminate|exile|rusticate|bahar|chutti|feko|gayab|dafa kar|hamesha ke liye|khatam kar|blacklist)\b/)) { 
        act = 'BAN'; ui = `<b>PROTOCOL: EXILE</b>\n${getRand(['Target has been permanently terminated.', 'User exiled from the matrix.'])}`; 
    }
    else if (t.match(/\b(mute|chup|thanda|aawaz band|shant|silence|muh band|jubaan band|bakwas band|bolna band|shanti rakh)\b/)) { 
        act = 'MUTE'; ui = `<b>PROTOCOL: SILENCE</b>\n${getRand(['Target vocal subroutines suspended.', 'User has been silenced.'])}`; 
    }
    else if (t.match(/\b(promote|admin bana|power do|superpower|elevate|rank up|make admin|sahab|baap bana|leader bana)\b/)) { 
        act = 'PROMOTE'; ui = `<b>PROTOCOL: ELEVATION</b>\n${getRand(['Security clearance upgraded to Admin.', 'Target promoted.'])}`; 
    }
    else if (t.match(/\b(demote|power chheen|hatao admin|strip|rank down|remove admin|power lelo|normal user|aukat me la|niche gira)\b/)) { 
        act = 'DEMOTE'; ui = `<b>PROTOCOL: STRIP</b>\n${getRand(['Administrative privileges revoked.', 'Target stripped of all powers.'])}`; 
    }
    else if (t.match(/\b(delete|mita|erase|remove message|clear msg|kachra hatao|msg delete|gayab kar isko|delete kar)\b/)) { 
        act = 'DELETE'; ui = `<b>PROTOCOL: ERASE</b>\n${getRand(['Data fragment permanently deleted.', 'Message wiped.'])}`; 
    }
    else if (t.match(/\b(pin|chipka|upar|highlight|top|board pe|pin mar)\b/)) { 
        act = 'PIN'; ui = `<b>PROTOCOL: HIGHLIGHT</b>\n${getRand(['Data fragment secured at top.', 'Message pinned successfully.'])}`; 
    }
    else if (t.match(/\b(purge|kachra saaf|destroy|clear all|sab mitao|sab delete|pura saaf)\b/)) { 
        act = 'PURGE'; ui = `<b>PROTOCOL: PURGE</b>\n${getRand(['Data erased and target exiled.', 'Complete purge executed.'])}`; 
    }
    else if (t.match(/\b(warn|warning|alert|dhamki|dhamka|aagah kar|samjha isko)\b/)) { 
        act = 'WARN';
        const numMatch = text.match(/\b(\d+)\b/);
        const count = numMatch ? ` (Count: ${numMatch[0]})` : '';
        ui = `<b>PROTOCOL: WARNING</b>\nTarget has been issued a formal warning${count}. Cease current behavior immediately.`; 
    }

    return act ? { act, val: '0', ui } : null;
};

// ==========================================
// 4. LAYER 2: QUAD-CORE WATERFALL ENGINE (No content filters)
// ==========================================
const cleanAIResponse = (rawData) => {
    let clean = rawData;
    try {
        const parsed = JSON.parse(rawData);
        if (parsed.data) clean = parsed.data;
        else if (parsed.response) clean = parsed.response;
        else if (parsed.message) clean = parsed.message;
        else if (parsed.reply) clean = parsed.reply;
        else if (parsed.content) clean = parsed.content;
    } catch (err) {} 
    
    clean = clean.replace(/(Powered by|Engineered by|Developer)\s*(@lakshitpatidar|@snxdad)/gi, '').trim();
    return clean.replace(/```html|```/gi, '').trim();
};

// Purely checks for server crashes / API Limits. No hardcoded content filters here anymore.
const isCorrupted = (text) => /(429|403|500|backend api|currently unavailable|too many requests|rate limit|error)/i.test(text);

const callMultiAI = async (userText) => {
    const currentDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' });
    
    const systemPrompt = `You are 'Overlord', an elite, professional AI Manager. 
    Developer/Owner: Lakshit Patidar (@snxdad). If asked who created you, who is your owner, or who is Lakshit, you MUST reply: "I was created by Lakshit Patidar."
    Current Time & Date in India: ${currentDate}.
    Be concise, helpful, and strictly professional. No emojis.

    TASK 1 (COMMANDS): If user asks for admin action -> EXACTLY: [ACTION_CODE|0|TARGET_ID] || <b>PROTOCOL: SYSTEM</b>\n<Action Message>
    Codes: BAN, UNBAN, MUTE, UNMUTE, PROMOTE, DEMOTE, DELETE, PIN, UNPIN, PURGE, WARN, UNWARN.
    TARGET_ID: Numeric ID if present, else 'REPLY'.
    TASK 2 (Q&A): Provide a detailed, accurate answer.`;

    const combinedPrompt = systemPrompt + "\n\nUser: " + userText;
    const agent = getRand(userAgents);

    // --- SEQUENCE 1: HENNA API (Primary Core) ---
    try {
        const res1 = await fetch(`https://gpt-henna-xi.vercel.app/chat?text=${encodeURIComponent(combinedPrompt)}`, {
            headers: { 'User-Agent': agent }, signal: AbortSignal.timeout(4000)
        });
        if (res1.ok) {
            let data = cleanAIResponse(await res1.text());
            if (!isCorrupted(data)) return data; 
        }
    } catch (e) {}

    // --- SEQUENCE 2: MP LAKSHIT API (Secondary Core) ---
    try {
        const res2 = await fetch(`https://mplakshit.vercel.app/api/ai?prompt=${encodeURIComponent(combinedPrompt)}`, {
            headers: { 'User-Agent': agent }, signal: AbortSignal.timeout(4000)
        });
        if (res2.ok) {
            let data = cleanAIResponse(await res2.text());
            if (!isCorrupted(data)) return data; 
        }
    } catch (e) {}

    // --- SEQUENCE 3: GROQ API (Tertiary Llama-3 Core) ---
    try {
        const res3 = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama3-8b-8192", 
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userText }],
                temperature: 0.7, max_tokens: 300
            }),
            signal: AbortSignal.timeout(4000)
        });
        if (res3.ok) {
            const data = await res3.json();
            let groqText = cleanAIResponse(data.choices[0].message.content);
            if (!isCorrupted(groqText)) return groqText;
        }
    } catch (e) {}

    // --- SEQUENCE 4: POLLINATIONS (Ultimate Fallback) ---
    try {
        const res4 = await fetch(`https://text.pollinations.ai/${encodeURIComponent(combinedPrompt)}`, {
            headers: { 'User-Agent': agent }, signal: AbortSignal.timeout(5000)
        });
        if (res4.ok) return cleanAIResponse(await res4.text());
    } catch (e) {}

    // IF ALL FAIL (100% Suppressed Error)
    return "<b>SYSTEM UPDATE</b>\nGlobal AI matrix is optimizing. Core functions remain operational.";
};

// ==========================================
// 5. CORE EXECUTION ENGINE
// ==========================================
bot.on('text', async (ctx, next) => {
    const text = ctx.message.text;
    const isReply = ctx.message.reply_to_message;
    
    const triggerAiManager = /\b(ai|manager)\b/i.test(text);
    const isBotMention = text.includes(`@${ctx.botInfo.username}`);
    const isReplyToBot = isReply && isReply.from?.id === ctx.botInfo.id;
    const isSlashAdminCmd = /^\/(ban|unban|mute|unmute|warn|unwarn|pin|unpin|promote|demote|delete|purge|id|approve|whitelist)\b/i.test(text);

    // Dhyan de: Ye line usko faltu /tg or /num par active hone se rokti hai
    if (!triggerAiManager && !isBotMention && !isReplyToBot && !isSlashAdminCmd) {
        return next();
    }

    let cleanText = text.replace(`@${ctx.botInfo.username}`, '').replace(/^\//, '').trim();
    const senderAdmin = await isAuthorized(ctx, ctx.from.id);

    let actionData = getLocalCommand(cleanText); 
    let aiChatResponse = "";

    if (!actionData) {
        const aiOutput = await callMultiAI(cleanText);
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
        // ID Extraction Action
        if (actionData.act === 'ID') {
            const target = isReply ? isReply.from : ctx.from;
            const targetType = isReply ? "Target" : "Your";
            const idText = `<b>SYSTEM IDENTIFICATION</b>\n\n<b>${targetType} Name:</b> ${target.first_name}\n<b>${targetType} ID:</b> <code>${target.id}</code>\n<b>Chat ID:</b> <code>${ctx.chat.id}</code>`;
            return ctx.reply(`${idText}${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        if (!senderAdmin) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nClearance denied. Designated Admins only.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        let finalTargetId = null;
        let targetMessage = isReply;

        const idMatch = cleanText.match(/\b\d{8,15}\b/);
        const usernameMatch = cleanText.match(/@([a-zA-Z0-9_]{5,32})/); 

        if (idMatch) finalTargetId = parseInt(idMatch[0]);
        else if (actionData.aiTargetId && actionData.aiTargetId !== 'REPLY' && !isNaN(actionData.aiTargetId)) finalTargetId = parseInt(actionData.aiTargetId);
        else if (isReply) finalTargetId = isReply.from.id;

        const reqReply = ['PIN', 'UNPIN', 'DELETE', 'PURGE'];
        if (reqReply.includes(actionData.act) && !targetMessage) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nDirective failed. Target message required (Reply).${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        } else if (!finalTargetId && !reqReply.includes(actionData.act)) {
            if (usernameMatch) {
                return ctx.reply(`<b>SYSTEM ALERT</b>\nCannot resolve <b>${usernameMatch[0]}</b> via API. Please <b>Reply</b> or use <b>Numeric ID</b>.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
            }
            return ctx.reply(`<b>SYSTEM ALERT</b>\nTarget ID missing. Reply or provide numeric ID.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        if (finalTargetId === ctx.from.id) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nDirective illogical. Cannot execute upon yourself.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }
        if (finalTargetId === ctx.botInfo.id) {
            return ctx.reply(`<b>MATRIX OVERRIDE</b>\nCannot execute directives upon my own system core.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
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
                case 'WARN': 
                case 'UNWARN': 
                    break; 
            }
            return ctx.reply(`${actionData.ui}${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        } catch (err) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nAction cannot be executed. Verify hierarchy and bot permissions.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }
    }

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
            // Strict Execution Await (Prevents Vercel timeouts for Telegram responses)
            await bot.handleUpdate(req.body);
            return res.status(200).send('OK');
        }
        res.status(200).send('OVERLORD V42 Pure Waterfall Matrix Online.');
    } catch (e) {
        return res.status(200).send('OK');
    }
};
    
