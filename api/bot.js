const { Telegraf } = require('telegraf');

// ==========================================
// 1. SYSTEM INITIALIZATION
// ==========================================
const bot = new Telegraf(process.env.BOT_TOKEN);
const DEV_TAG = "\n\nDeveloper @lakshitpatidar";
const processedUpdates = new Set();

// ==========================================
// 2. MATRIX AUTHORIZATION
// ==========================================
const isAuthorized = async (ctx, userId) => {
    try {
        const member = await ctx.getChatMember(userId);
        return ['creator', 'administrator'].includes(member.status);
    } catch (e) { return false; }
};

// ==========================================
// 3. LAYER 1: MASSIVE REGEX MATRIX (0ms Lag)
// ==========================================
const getLocalCommand = (text) => {
    const t = text.toLowerCase();
    let act = null, ui = "";

    // Massive Dictionary for BAN / KICK
    if (t.match(/\b(ban|uda do|nikal|kick|hatao|block|dafa karo|bhaga do|hamesha ke liye nikal|exile|terminate|bahar feko|remove)\b/)) { 
        act = 'BAN'; ui = '<b>PROTOCOL: EXILE</b>\nTarget has been permanently terminated.'; 
    }
    // Massive Dictionary for UNBAN
    else if (t.match(/\b(unban|wapas laao|unblock|maaf karo|restore|pardon|wapas aane do)\b/)) { 
        act = 'UNBAN'; ui = '<b>PROTOCOL: RESTORE</b>\nTarget restriction lifted.'; 
    }
    // Massive Dictionary for MUTE
    else if (t.match(/\b(mute|chup|thanda|aawaz band|shant|silence|muh band|jubaan band|bolna band)\b/)) { 
        act = 'MUTE'; ui = '<b>PROTOCOL: SILENCE</b>\nTarget vocal subroutines suspended.'; 
    }
    // Massive Dictionary for UNMUTE
    else if (t.match(/\b(unmute|bolne do|wapas bolne do|aawaz kholo|unsilence|shanti khatam)\b/)) { 
        act = 'UNMUTE'; ui = '<b>PROTOCOL: RESTORE</b>\nCommunications link re-established.'; 
    }
    // Massive Dictionary for PROMOTE
    else if (t.match(/\b(promote|admin bana|power do|superpower dedo|rank up|elevate|make admin|bade sahab)\b/)) { 
        act = 'PROMOTE'; ui = '<b>PROTOCOL: ELEVATION</b>\nSecurity clearance upgraded to Admin.'; 
    }
    // Massive Dictionary for DEMOTE
    else if (t.match(/\b(demote|power chheen|hatao admin|rank down|strip power|remove admin|power khatam)\b/)) { 
        act = 'DEMOTE'; ui = '<b>PROTOCOL: STRIP</b>\nAdministrative privileges revoked.'; 
    }
    // Massive Dictionary for DELETE
    else if (t.match(/\b(delete|mita|delete kr|erase|remove message|kachra hatao|gayab kar)\b/)) { 
        act = 'DELETE'; ui = '<b>PROTOCOL: ERASE</b>\nData fragment permanently deleted.'; 
    }
    // Massive Dictionary for PIN
    else if (t.match(/\b(pin|chipka|upar rakh|highlight|top pe laga|board pe laga)\b/)) { 
        act = 'PIN'; ui = '<b>PROTOCOL: HIGHLIGHT</b>\nData fragment secured at top.'; 
    }
    // Massive Dictionary for UNPIN
    else if (t.match(/\b(unpin|hata de upar se|unhook|niche utar)\b/)) { 
        act = 'UNPIN'; ui = '<b>PROTOCOL: UNHOOK</b>\nData fragment detached from highlights.'; 
    }
    // Massive Dictionary for PURGE (Delete + Ban)
    else if (t.match(/\b(purge|kachra saaf|destroy all|mita ke bhagao)\b/)) { 
        act = 'PURGE'; ui = '<b>PROTOCOL: PURGE</b>\nData erased and target exiled.'; 
    }

    return act ? { act, val: '0', ui } : null;
};

// ==========================================
// 4. LAYER 2: SUPREME AI ENGINE (Fallback & Q&A)
// ==========================================
const callSupremeAI = async (userText) => {
    const sys = `You are 'Overlord V20', a supreme, cold Telegram AI Manager. NO emojis.
    Never mention 'Lakshit' or 'Kanu'. Understand ANY weird slang/language flawlessly.

    TASK 1 (MODERATION FALLBACK): If the user is asking to take an action against someone (ban, mute, pin, promote, delete, etc.) but used weird words, you MUST translate their intent and output ONLY this:
    [ACTION_CODE|PARAM|TARGET_ID] || <b>PROTOCOL: [NAME]</b>\n<Professional Message>
    
    Codes: BAN, UNBAN, KICK, MUTE, UNMUTE, PROMOTE, DEMOTE, DELETE, PIN, UNPIN, PURGE.
    PARAM: Seconds for mute (e.g. 600), else 0.
    TARGET_ID: Extract numeric ID from text if present, else output 'REPLY'.
    
    TASK 2 (Q&A): If the user is NOT taking an action, but just asking a question or chatting, answer directly and intelligently. NO [CODE] format. Use simple HTML.`;

    try {
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'system', content: sys }, { role: 'user', content: userText }],
                model: 'mistral' // Fast and uncensored
            }),
            signal: AbortSignal.timeout(12000)
        });
        if (!response.ok) throw new Error("API Failure");
        return (await response.text()).replace(/```html|```/gi, '').trim();
    } catch (e) {
        return "<b>SYSTEM ALERT</b>\nNeural link disrupted. Processing locally.";
    }
};

// ==========================================
// 5. CORE ROUTING & EXECUTION MATRIX
// ==========================================
bot.on('text', async (ctx, next) => {
    const text = ctx.message.text;
    const isReply = ctx.message.reply_to_message;
    
    // Wake Word Trigger
    const trigger = /\b(ai|manager|helper|bot)\b/i;
    if (!trigger.test(text) && !text.includes(`@${ctx.botInfo.username}`) && !(isReply && isReply.from?.id === ctx.botInfo.id)) return next();

    ctx.sendChatAction('typing').catch(() => {});
    const cleanText = text.replace(`@${ctx.botInfo.username}`, '').trim();
    const senderAdmin = await isAuthorized(ctx, ctx.from.id);

    // --- EXECUTION RESOLVER (Hybrid Engine) ---
    // 1. Try Local Dictionary first (Ultra Fast)
    let actionData = getLocalCommand(cleanText); 
    let aiChatResponse = "";

    // 2. If Local Dictionary fails, send to AI (Safety Net)
    if (!actionData) {
        const aiOutput = await callSupremeAI(cleanText);
        if (aiOutput.includes('[') && aiOutput.includes('|') && aiOutput.includes('||')) {
            const [meta, uiMsg] = aiOutput.split('||');
            const [act, val, aiTargetId] = meta.replace('[', '').replace(']', '').split('|');
            actionData = { act: act.trim(), val: val ? val.trim() : '0', ui: uiMsg.trim(), aiTargetId: aiTargetId?.trim() };
        } else {
            aiChatResponse = aiOutput; // It's a normal chat question
        }
    }

    // --- TACTICAL EXECUTION (Zero-Error Handling) ---
    if (actionData) {
        if (!senderAdmin) return ctx.reply(`<b>SYSTEM ALERT</b>\nClearance denied. Only Admins can execute directives.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});

        let finalTargetId = null;
        let targetMessage = isReply;

        // Smart ID Extraction
        const idMatch = cleanText.match(/\b\d{8,15}\b/);
        if (idMatch) finalTargetId = parseInt(idMatch[0]);
        else if (actionData.aiTargetId && actionData.aiTargetId !== 'REPLY' && !isNaN(actionData.aiTargetId)) finalTargetId = parseInt(actionData.aiTargetId);
        else if (isReply) finalTargetId = isReply.from.id;

        const reqReply = ['PIN', 'UNPIN', 'DELETE', 'PURGE'];
        if (reqReply.includes(actionData.act) && !targetMessage) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nDirective failed. You MUST reply to a message to use Pin/Delete.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        } else if (!finalTargetId && !reqReply.includes(actionData.act)) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nTarget ID missing. Reply to a user OR type their numeric User ID.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        const targetAdmin = finalTargetId ? await isAuthorized(ctx, finalTargetId) : false;

        // Admin Protection Matrix
        if (targetAdmin && ['BAN', 'KICK', 'MUTE', 'DEMOTE', 'PURGE'].includes(actionData.act)) {
            return ctx.reply(`<b>MATRIX OVERRIDE</b>\nTarget holds Admin clearance. Directive nullified.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        try {
            const until = parseInt(actionData.val) > 0 ? Math.floor(Date.now() / 1000) + parseInt(actionData.val) : 0;
            
            // Core Action Switch
            switch (actionData.act) {
                case 'BAN': await ctx.banChatMember(finalTargetId); break;
                case 'UNBAN': await ctx.unbanChatMember(finalTargetId, { only_if_banned: true }); break;
                case 'MUTE': await ctx.restrictChatMember(finalTargetId, { can_send_messages: false }, until > 0 ? { until_date: until } : {}); break;
                case 'UNMUTE': await ctx.restrictChatMember(finalTargetId, { can_send_messages: true, can_send_media_messages: true, can_send_other_messages: true, can_add_web_page_previews: true }); break;
                case 'PROMOTE': await ctx.promoteChatMember(finalTargetId, { can_change_info: true, can_delete_messages: true, can_invite_users: true, can_restrict_members: true, can_pin_messages: true }); break;
                case 'DEMOTE': await ctx.promoteChatMember(finalTargetId, { can_change_info: false, can_delete_messages: false, can_invite_users: false, can_restrict_members: false, can_pin_messages: false }); break;
                case 'DELETE': await ctx.deleteMessage(targetMessage.message_id); break;
                case 'PIN': await ctx.pinChatMessage(targetMessage.message_id); break;
                case 'UNPIN': await ctx.unpinChatMessage(targetMessage.message_id); break;
                case 'PURGE': await ctx.deleteMessage(targetMessage.message_id); await ctx.banChatMember(finalTargetId); break;
            }
            return ctx.reply(`${actionData.ui}${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
            
        } catch (err) {
            // Error Parsing Engine (No crashes ever)
            let errMsg = "Execution failed. Verify bot permissions.";
            if (err.message.includes("can't remove chat owner")) errMsg = "Cannot execute action against the Chat Owner.";
            if (err.message.includes("USER_NOT_PARTICIPANT")) errMsg = "This User ID is not a participant of this group.";
            if (err.message.includes("not enough rights")) errMsg = "I do not have sufficient admin rights to do this.";
            
            return ctx.reply(`<b>SYSTEM ERROR</b>\n${errMsg}${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }
    }

    // --- AI Q&A CHAT EXECUTION ---
    if (aiChatResponse) {
        return ctx.reply(`${aiChatResponse}${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
    }
});

// ==========================================
// 6. ANTI-LOOP WEBHOOK (Vercel Optimized)
// ==========================================
module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            const updateId = req.body.update_id;
            if (updateId) {
                if (processedUpdates.has(updateId)) return res.status(200).send('Duplicate Handled'); 
                processedUpdates.add(updateId);
                if (processedUpdates.size > 500) processedUpdates.clear();
            }
            // Vercel strict sync wait to prevent premature killing
            await bot.handleUpdate(req.body);
            return res.status(200).send('OK');
        }
        res.status(200).send('OVERLORD V20 Apex Core Online.');
    } catch (e) {
        console.error("Vercel Level Error:", e);
        return res.status(200).send('Error Safely Handled');
    }
};
       
