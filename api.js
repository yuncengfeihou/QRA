// api.js
import * as Constants from './constants.js';
// import { setMenuVisible } from './state.js'; // No longer needed here

/**
 * Fetches chat and global quick replies from the quickReplyApi.
 * Checks if the main Quick Reply v2 extension is enabled before fetching.
 * Note: Still relies on accessing internal settings structure.
 * @returns {{ chat: Array<object>, global: Array<object> }}
 */
export function fetchQuickReplies() {
    const chatReplies = [];
    const globalReplies = [];
    const chatQrLabels = new Set(); // To track labels and avoid duplicates in global

    if (!window.quickReplyApi) {
        console.error(`[${Constants.EXTENSION_NAME}] Quick Reply API (window.quickReplyApi) not found! Cannot fetch replies.`);
        return { chat: [], global: [] };
    }

    const qrApi = window.quickReplyApi;

    // Check if Quick Reply v2 extension itself is enabled
    // Treat isEnabled=true or undefined as enabled, only false as disabled
    if (!qrApi.settings || qrApi.settings.isEnabled === false) {
        console.log(`[${Constants.EXTENSION_NAME}] Core Quick Reply v2 is disabled. Skipping reply fetch.`);
        return { chat: [], global: [] };
    }

    try {
        // Fetch Chat Quick Replies (Accessing internal settings)
        if (qrApi.settings?.chatConfig?.setList) {
            qrApi.settings.chatConfig.setList.forEach(setLink => {
                if (setLink?.isVisible && setLink.set?.qrList) {
                    setLink.set.qrList.forEach(qr => {
                        if (qr && !qr.isHidden && qr.label) {
                            chatReplies.push({
                                setName: setLink.set.name || 'Unknown Set',
                                label: qr.label,
                                message: qr.message || '(无消息内容)'
                            });
                            chatQrLabels.add(qr.label);
                        }
                    });
                }
            });
        } else {
             console.warn(`[${Constants.EXTENSION_NAME}] Could not find chatConfig.setList in quickReplyApi settings.`);
        }

        // Fetch Global Quick Replies (Accessing internal settings)
        if (qrApi.settings?.config?.setList) {
            qrApi.settings.config.setList.forEach(setLink => {
                if (setLink?.isVisible && setLink.set?.qrList) {
                    setLink.set.qrList.forEach(qr => {
                        if (qr && !qr.isHidden && qr.label && !chatQrLabels.has(qr.label)) {
                            globalReplies.push({
                                setName: setLink.set.name || 'Unknown Set',
                                label: qr.label,
                                message: qr.message || '(无消息内容)'
                            });
                        }
                    });
                }
            });
        } else {
             console.warn(`[${Constants.EXTENSION_NAME}] Could not find config.setList in quickReplyApi settings.`);
        }

        console.log(`[${Constants.EXTENSION_NAME}] Fetched Replies - Chat: ${chatReplies.length}, Global: ${globalReplies.length}`);

    } catch (error) {
        console.error(`[${Constants.EXTENSION_NAME}] Error fetching quick replies:`, error);
        return { chat: [], global: [] }; // Return empty on error
    }

    return { chat: chatReplies, global: globalReplies };
}


/**
 * Triggers a specific quick reply using the API.
 * @param {string} setName
 * @param {string} label
 */
export async function triggerQuickReply(setName, label) {
    if (!window.quickReplyApi) {
        console.error(`[${Constants.EXTENSION_NAME}] Quick Reply API not found! Cannot trigger reply.`);
        // Caller should handle UI state (e.g., closing the menu)
        return; // Indicate failure
    }

    const qrApi = window.quickReplyApi; // Get reference for check

    // Check if Core Quick Reply v2 is enabled before triggering
    if (!qrApi.settings || qrApi.settings.isEnabled === false) {
         console.log(`[${Constants.EXTENSION_NAME}] Core Quick Reply v2 is disabled. Cannot trigger reply '${setName}.${label}'.`);
         // Caller handles UI state
         return; // Indicate failure
    }

    console.log(`[${Constants.EXTENSION_NAME}] Triggering Quick Reply: "${setName}.${label}"`);
    try {
        // Assume qrApi.executeQuickReply is the correct API call method
        await window.quickReplyApi.executeQuickReply(setName, label);
        console.log(`[${Constants.EXTENSION_NAME}] Quick Reply "${setName}.${label}" executed successfully.`);
    } catch (error) {
        console.error(`[${Constants.EXTENSION_NAME}] Failed to execute Quick Reply "${setName}.${label}":`, error);
        // Caller handles UI state, even on error
    }
    // No need to setMenuVisible(false) here; let the caller (handleQuickReplyClick) do it.
}
