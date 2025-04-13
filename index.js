// index.js - Main Entry Point
import { extension_settings } from "../../../extensions.js";
import * as Constants from './constants.js';
import { sharedState } from './state.js';
import { createMenuElement, updateIconDisplay } from './ui.js';
import { createSettingsHtml, loadAndApplySettings } from './settings.js';
import { setupEventListeners, handleQuickReplyClick } from './events.js';

/**
 * Injects the rocket button next to the send button
 * @returns {HTMLElement|null} The created rocket button or null if send button wasn't found
 */
function injectRocketButton() {
    // Find the send button in the UI
    const sendButton = $('#send_but');
    if (sendButton.length === 0) {
        console.error(`[${Constants.EXTENSION_NAME}] Could not find send button to inject rocket button`);
        return null;
    }
    
    // 创建按钮容器，最初不包含任何图标内容，将在updateIconDisplay中填充
    const buttonHtml = `<div id="${Constants.ID_ROCKET_BUTTON}" class="interactable secondary-button" title="快速回复菜单" aria-haspopup="true" aria-expanded="false" aria-controls="${Constants.ID_MENU}"></div>`;
    
    // Insert the button before the send button
    sendButton.before(buttonHtml);
    
    // Return the reference to the newly created button
    return document.getElementById(Constants.ID_ROCKET_BUTTON);
}

/**
 * Initializes the plugin: creates UI, sets up listeners, loads settings.
 */
function initializePlugin() {
    console.log(`[${Constants.EXTENSION_NAME}] Initializing...`);

    // Create and inject the rocket button
    const rocketButton = injectRocketButton();
    
    // Create menu element
    const menu = createMenuElement();

    // Store references in shared state
    sharedState.domElements.rocketButton = rocketButton;
    sharedState.domElements.menu = menu;
    sharedState.domElements.chatItemsContainer = menu.querySelector(`#${Constants.ID_CHAT_ITEMS}`);
    sharedState.domElements.globalItemsContainer = menu.querySelector(`#${Constants.ID_GLOBAL_ITEMS}`);
    sharedState.domElements.settingsDropdown = document.getElementById(Constants.ID_SETTINGS_ENABLED_DROPDOWN);
    sharedState.domElements.iconTypeDropdown = document.getElementById(Constants.ID_ICON_TYPE_DROPDOWN);
    sharedState.domElements.customIconUrl = document.getElementById(Constants.ID_CUSTOM_ICON_URL);
    sharedState.domElements.colorMatchCheckbox = document.getElementById(Constants.ID_COLOR_MATCH_CHECKBOX);

    // 创建全局对象以暴露事件处理函数，解决循环依赖问题
    window.quickReplyMenu = {
        handleQuickReplyClick
    };

    // Append menu to the body
    document.body.appendChild(menu);

    // Load initial settings state and apply it to UI
    loadAndApplySettings();

    // Setup event listeners
    setupEventListeners();

    console.log(`[${Constants.EXTENSION_NAME}] Initialization complete.`);
}

// --- SillyTavern Extension Entry Point ---
jQuery(async () => {
    try {
        // 1. Ensure base settings object exists
        if (typeof extension_settings === 'undefined') {
            console.warn(`[${Constants.EXTENSION_NAME}] extension_settings 对象不存在，创建本地对象`);
            window.extension_settings = window.extension_settings || {};
            window.extension_settings[Constants.EXTENSION_NAME] = {};
        }

        // 2. Add settings panel HTML to the UI
        const settingsContainer = $('#extensions_settings');
        if (settingsContainer.length === 0) {
            console.warn(`[${Constants.EXTENSION_NAME}] 未找到设置容器，添加到body`);
            $('body').append('<div id="extensions_settings" style="display:none"></div>');
        }
        $('#extensions_settings').append(createSettingsHtml());

        // 3. Initialize the core plugin logic
        initializePlugin();
    } catch (err) {
        console.error(`[${Constants.EXTENSION_NAME}] 初始化失败:`, err);
    }
});
