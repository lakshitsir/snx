const { Telegraf } = require('telegraf');

// ==========================================
// 1. SYSTEM INITIALIZATION
// ==========================================
const bot = new Telegraf(process.env.BOT_TOKEN);
const DEV_TAG = "\n\nDeveloper @lakshitpatidar";
const processedUpdates = new Set();

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
// 3. LAYER 1: LOCAL REGEX (Instant Admin Execution - No AI needed)
// ==========================================
const getLocalCommand = (text) => {
    const t = text.toLowerCase();
    let act = null, ui = "";

    if (t.match(/\b(ban|uda do|nikal|kick|hatao|block|dafa karo|bhaga do|terminate|exile)\b/)) { 
        act = 'BAN'; ui = '<b>PROTOCOL: EXILE</b>\nTarget has been permanently terminated.'; 
    }
    else if (t.match(/\b(unban|wapas laao|unblock|restore|maaf karo)\b/)) { 
        act = 'UNBAN'; ui = '<b>PROTOCOL: RESTORE</b>\nTarget restriction lifted.'; 
    }
    else if (t.match(/\b(mute|chup|thanda|aawaz band|shant|silence)\b/)) { 
        act = 'MUTE'; ui = '<b>PROTOCOL: SILENCE</b>\nTarget vocal subroutines suspended.'; 
    }
    else if (t.match(/\b(unmute|bolne do|wapas bolne do|unsilence)\b/)) { 
        act = 'UNMUTE'; ui = '<b>PROTOCOL: RESTORE</b>\nCommunications link re-established.'; 
    }
    else if (t.match(/\b(promote|admin bana|power do|superpower)\b/)) { 
        act = 'PROMOTE'; ui = '<b>PROTOCOL: ELEVATION</b>\nSecurity clearance upgraded to Admin.'; 
    }
    else if (t.match(/\b(demote|power chheen|hatao admin)\b/)) { 
        act = 'DEMOTE'; ui = '<b>PROTOCOL: STRIP</b>\nAdministrative privileges revoked.'; 
    }
    else if (t.match(/\b(delete|mita|delete kr|erase)\b/)) { 
        act = 'DELETE'; ui = '<b>PROTOCOL: ERASE</b>\nData fragment permanently deleted.'; 
    }
    else if (t.match(/\b(pin|chipka|upar rakh|highlight)\b/)) { 
        act = 'PIN'; ui = '<b>PROTOCOL: HIGHLIGHT</b>\nData fragment secured at top.'; 
    }
    else if (t.match(/\b(unpin|hata de upar se|unhook)\b/)) { 
        act = 'UNPIN'; ui = '<b>PROTOCOL: UNHOOK</b>\nData fragment detached.'; 
    }
    else if (t.match(/\b(purge|kachra saaf|destroy all)\b/)) { 
        act = 'PURGE'; ui = '<b>PROTOCOL: PURGE</b>\nData erased and target exiled.'; 
    }

    return act ? { act, val: '0', ui } : null;
};

// ==========================================
// 4. LAYER 2: SUPREME AI (Stable Endpoint for Chats & Complex Intends)
// ==========================================
const callSupremeAI = async (userText) => {
    const sys = `You are 'Overlord', a cold, professional Telegram AI. NO emojis. Never say 'Lakshit'.
    TASK 1: If user requests an admin action (ban, mute, etc.), output ONLY:
    [ACTION_CODE|0|TARGET_ID] || <b>PROTOCOL: [NAME]</b>\n<Message>
    Codes: BAN, UNBAN, KICK, MUTE, UNMUTE, PROMOTE, DEMOTE, DELETE, PIN, UNPIN, PURGE.
    TARGET_ID: Extract numeric ID if present, else 'REPLY'.
    TASK 2: If normal Q&A, reply intelligently without [CODE].`;

    // Raw, stable GET endpoint. No model parameters to avoid backend crashes.
    const url = `https://text.pollinations.ai/${encodeURIComponent(sys + "\n\nUser: " + userText)}`;

    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
        if (!response.ok) throw new Error("API Limit");
        return (await response.text()).replace(/```html|```/gi, '').trim();
    } catch (e) {
        return "<b>SYSTEM ALERT</b>\nNeural link disrupted. Traffic overload.";
    }
};

// ==========================================
// 5. CORE ROUTING & STRICT ADMIN EXECUTION
// ==========================================
bot.on('text', async (ctx, next) => {
    const text = ctx.message.text;
    const isReply = ctx.message.reply_to_message;
    
    const trigger = /\b(ai|manager|helper|bot)\b/i;
    if (!trigger.test(text) && !text.includes(`@${ctx.botInfo.username}`) && !(isReply && isReply.from?.id === ctx.botInfo.id)) return next();

    ctx.sendChatAction('typing').catch(() => {});
    const cleanText = text.replace(`@${ctx.botInfo.username}`, '').trim();
    const senderAdmin = await isAuthorized(ctx, ctx.from.id);

    // Engine Resolver
    let actionData = getLocalCommand(cleanText); 
    let aiChatResponse = "";

    if (!actionData) {
        const aiOutput = await callSupremeAI(cleanText);
        if (aiOutput.includes('[') && aiOutput.includes('|') && aiOutput.includes('||')) {
            const [meta, uiMsg] = aiOutput.split('||');
            const [act, val, aiTargetId] = meta.replace('[', '').replace(']', '').split('|');
            actionData = { act: act.trim(), val: val ? val.trim() : '0', ui: uiMsg.trim(), aiTargetId: aiTargetId?.trim() };
        } else {
            aiChatResponse = aiOutput; 
        }
    }

    // --- ABSOLUTE ADMIN LOCK FOR ALL ACTIONS ---
    if (actionData) {
        if (!senderAdmin) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nClearance denied. Only designated Admins can execute system directives.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        let finalTargetId = null;
        let targetMessage = isReply;

        const idMatch = cleanText.match(/\b\d{8,15}\b/);
        if (idMatch) finalTargetId = parseInt(idMatch[0]);
        else if (actionData.aiTargetId && actionData.aiTargetId !== 'REPLY' && !isNaN(actionData.aiTargetId)) finalTargetId = parseInt(actionData.aiTargetId);
        else if (isReply) finalTargetId = isReply.from.id;

        const reqReply = ['PIN', 'UNPIN', 'DELETE', 'PURGE'];
        if (reqReply.includes(actionData.act) && !targetMessage) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nDirective failed. You MUST reply to a message to execute Pin/Delete.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        } else if (!finalTargetId && !reqReply.includes(actionData.act)) {
            return ctx.reply(`<b>SYSTEM ALERT</b>\nTarget ID missing. Reply to a user OR type their User ID.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        const targetAdmin = finalTargetId ? await isAuthorized(ctx, finalTargetId) : false;

        // Protection against banning other admins
        if (targetAdmin && ['BAN', 'KICK', 'MUTE', 'DEMOTE', 'PURGE'].includes(actionData.act)) {
            return ctx.reply(`<b>MATRIX OVERRIDE</b>\nTarget holds Admin clearance. Directive nullified.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }

        try {
            const until = parseInt(actionData.val) > 0 ? Math.floor(Date.now() / 1000) + parseInt(actionData.val) : 0;
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
            return ctx.reply(`<b>SYSTEM ERROR</b>\nExecution failed. Ensure bot has proper Admin permissions.${DEV_TAG}`, { parse_mode: 'HTML', reply_to_message_id: ctx.message.message_id }).catch(() => {});
        }
    }

    // --- AI Q&A CHAT EXECUTION (Open to all, but only for Chatting) ---
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
        res.status(200).send('OVERLORD V21 Apex Core Online.');
    } catch (e) {
        return res.status(200).send('OK');
    }
};
            
