// index.js - Main Entry Point
import { extension_settings } from "../../../extensions.js";
import * as Constants from './constants.js';
import { sharedState } from './state.js';
import { createMenuElement, updateRocketButtonIcon } from './ui.js'; // Import updateRocketButtonIcon
import { createSettingsHtml, createIconSettingsModalHtml, loadAndApplySettings } from './settings.js'; // Import icon modal html creator
import { setupEventListeners } from './events.js';

/**
 * Injects the rocket button next to the send button
 * @returns {HTMLElement|null} The created rocket button or null if send button wasn't found
 */
function injectRocketButton() {
    const sendButton = $('#send_but');
    if (sendButton.length === 0) {
        console.error(`[${Constants.EXTENSION_NAME}] Could not find send button to inject rocket button`);
        return null;
    }

    // Create the button container, initially empty. Icon added by updateRocketButtonIcon.
    const rocketButtonHtml = `<div id="${Constants.ID_ROCKET_BUTTON}" class="interactable secondary-button" title="快速回复菜单" aria-haspopup="true" aria-expanded="false" aria-controls="${Constants.ID_MENU}"></div>`; // Removed fa-rocket here

    sendButton.before(rocketButtonHtml);
    return document.getElementById(Constants.ID_ROCKET_BUTTON);
}

/**
 * Initializes the plugin: creates UI, sets up listeners, loads settings.
 */
function initializePlugin() {
    console.log(`[${Constants.EXTENSION_NAME}] Initializing...`);

    // 1. Create and inject the rocket button (structure only)
    const rocketButton = injectRocketButton();

    // 2. Create menu element
    const menu = createMenuElement();

    // 3. Create icon settings modal (hidden initially)
    const iconSettingsModalHtml = createIconSettingsModalHtml();
    document.body.insertAdjacentHTML('beforeend', iconSettingsModalHtml); // Append modal HTML to body

    // 4. Store references in shared state
    sharedState.domElements.rocketButton = rocketButton;
    sharedState.domElements.menu = menu;
    sharedState.domElements.chatItemsContainer = menu.querySelector(`#${Constants.ID_CHAT_ITEMS}`);
    sharedState.domElements.globalItemsContainer = menu.querySelector(`#${Constants.ID_GLOBAL_ITEMS}`);
    sharedState.domElements.settingsDropdown = document.getElementById(Constants.ID_SETTINGS_ENABLED_DROPDOWN); // Get after settings HTML is added
    // --- Get references for icon settings modal elements ---
    sharedState.domElements.customizeIconButton = document.getElementById(Constants.ID_CUSTOMIZE_ICON_BUTTON);
    sharedState.domElements.iconSettingsModal = document.getElementById(Constants.ID_ICON_SETTINGS_MODAL);
    sharedState.domElements.iconSettingsBackdrop = sharedState.domElements.iconSettingsModal?.querySelector(`.${Constants.CLASS_ICON_SETTINGS_BACKDROP}`);
    sharedState.domElements.iconTypeSelect = document.getElementById(Constants.ID_ICON_TYPE_SELECT);
    sharedState.domElements.iconSvgInputContainer = document.getElementById(Constants.ID_ICON_SVG_INPUT_CONTAINER);
    sharedState.domElements.iconSvgInput = document.getElementById(Constants.ID_ICON_SVG_INPUT);
    sharedState.domElements.iconUrlInputContainer = document.getElementById(Constants.ID_ICON_URL_INPUT_CONTAINER);
    sharedState.domElements.iconUrlInput = document.getElementById(Constants.ID_ICON_URL_INPUT);
    sharedState.domElements.iconSettingsSaveButton = document.getElementById(Constants.ID_ICON_SETTINGS_SAVE);
    sharedState.domElements.iconSettingsCloseButton = document.getElementById(Constants.ID_ICON_SETTINGS_CLOSE);
    sharedState.domElements.iconPreview = document.getElementById(Constants.ID_ICON_PREVIEW);
    sharedState.domElements.iconColorPicker = document.getElementById(Constants.ID_ICON_COLOR_PICKER);
    sharedState.domElements.iconHoverColorPicker = document.getElementById(Constants.ID_ICON_HOVER_COLOR_PICKER);
    sharedState.domElements.iconActiveColorPicker = document.getElementById(Constants.ID_ICON_ACTIVE_COLOR_PICKER);


    // 5. Append menu to the body
    document.body.appendChild(menu);

    // 6. Load initial settings state and apply it (this will now also call updateRocketButtonIcon)
    loadAndApplySettings();

    // 7. Setup event listeners (including new ones for icon settings)
    setupEventListeners();

    console.log(`[${Constants.EXTENSION_NAME}] Initialization complete.`);
}


// --- SillyTavern Extension Entry Point ---
jQuery(async () => {
    // 1. Ensure base settings object exists
    extension_settings[Constants.EXTENSION_NAME] = extension_settings[Constants.EXTENSION_NAME] || {};

    // 2. Add settings panel HTML to the UI
    //    (This needs to happen before initializePlugin tries to find the dropdown and customize button)
    $('#extensions_settings').append(createSettingsHtml());

    // 3. Initialize the core plugin logic
    //    (This will create elements, find elements, load settings, apply icon, and set listeners)
    initializePlugin();
});
