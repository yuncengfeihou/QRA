// index.js - Main Entry Point
import { extension_settings } from "../../../extensions.js";
import * as Constants from './constants.js';
import { sharedState } from './state.js';
import { createMenuElement, updateMenuVisibilityUI } from './ui.js'; // Import updateMenuVisibilityUI
import { createSettingsHtml, loadAndApplySettings } from './settings.js';
import { setupEventListeners } from './events.js';

/**
 * Injects the rocket button next to the send button, applying the correct icon from settings.
 * @returns {HTMLElement|null} The created rocket button or null if send button wasn't found
 */
function injectRocketButton() {
    const sendButton = $('#send_but');
    if (sendButton.length === 0) {
        console.error(`[${Constants.EXTENSION_NAME}] Could not find send button to inject rocket button`);
        return null;
    }

    // Create the container div for the button
    const buttonDiv = document.createElement('div');
    buttonDiv.id = Constants.ID_ROCKET_BUTTON;
    buttonDiv.className = 'interactable secondary-button'; // Keep interactable for styling/events
    buttonDiv.title = "快速回复菜单";
    buttonDiv.setAttribute('aria-haspopup', 'true');
    buttonDiv.setAttribute('aria-expanded', 'false');
    buttonDiv.setAttribute('aria-controls', Constants.ID_MENU);

    // Insert the container before the send button
    sendButton.before(buttonDiv);

    // Apply the icon based on settings (will be called again later to ensure it's correct)
    updateRocketButtonIcon(buttonDiv); // Pass the element directly

    return buttonDiv; // Return the reference to the container div
}

/**
 * Updates the content (icon) of the rocket button based on current settings.
 * @param {HTMLElement | null} [buttonElement] - Optional. The button element to update. Defaults to sharedState.
 */
export function updateRocketButtonIcon(buttonElement = null) {
    const button = buttonElement || sharedState.domElements.rocketButton;
    if (!button) return;

    const iconType = extension_settings[Constants.EXTENSION_NAME]?.iconType || 'default';
    const iconData = extension_settings[Constants.EXTENSION_NAME]?.iconData || '';

    // Clear previous content and classes related to icons
    button.innerHTML = '';
    button.classList.remove('custom-svg-icon', 'custom-png-icon', 'default-icon', 'fa-solid', 'fa-rocket'); // Clean up old classes

    if (iconType === 'svg' && iconData) {
        button.classList.add('custom-svg-icon');
        // Directly injecting SVG. Ensure it's reasonably safe for your context.
        // Basic sanitization: remove script tags (very basic, not foolproof)
        const sanitizedSvg = iconData.replace(/<script[\s\S]*?<\/script>/gi, '');
        button.innerHTML = sanitizedSvg;
        // Attempt to set width/height from SVG attributes if not set via CSS
        const svgElement = button.querySelector('svg');
        if (svgElement && !svgElement.getAttribute('width') && !svgElement.getAttribute('height')) {
             // Optional: Set a default size if SVG lacks dimensions
             // svgElement.setAttribute('width', '1em');
             // svgElement.setAttribute('height', '1em');
        }
    } else if (iconType === 'png' && iconData) {
        button.classList.add('custom-png-icon');
        const img = document.createElement('img');
        img.src = iconData;
        img.alt = "Menu Icon"; // Accessibility
        button.appendChild(img);
    } else { // Default icon
        button.classList.add('default-icon', 'fa-solid', 'fa-rocket');
        // Font Awesome might be added purely by class, or might need explicit element/pseudo-element
        // If just classes work, this is enough. If not, might need <i> or similar.
        // The provided CSS uses #ID so the class approach should work if FA is loaded globally.
    }
}


/**
 * Initializes the plugin: creates UI, sets up listeners, loads settings.
 */
function initializePlugin() {
    console.log(`[${Constants.EXTENSION_NAME}] Initializing...`);

    // Create and inject the rocket button container
    const rocketButton = injectRocketButton(); // This now also applies the initial icon

    // Create menu element
    const menu = createMenuElement();

    // Store references in shared state
    sharedState.domElements.rocketButton = rocketButton;
    sharedState.domElements.menu = menu;
    sharedState.domElements.chatItemsContainer = menu.querySelector(`#${Constants.ID_CHAT_ITEMS}`);
    sharedState.domElements.globalItemsContainer = menu.querySelector(`#${Constants.ID_GLOBAL_ITEMS}`);
    // Note: settingsDropdown is now found and listener added within loadAndApplySettings

    // Append menu to the body
    document.body.appendChild(menu);

    // Load initial settings state and apply it (this now also adds settings listeners)
    loadAndApplySettings();

    // Apply initial icon state (redundant if injectRocketButton worked, but safe)
    updateRocketButtonIcon();

     // Apply initial visibility based on enabled state
     if (extension_settings[Constants.EXTENSION_NAME].enabled === false && rocketButton) {
        rocketButton.style.display = 'none';
     }

    // Setup general event listeners (like button click, outside click)
    setupEventListeners(); // Ensure this doesn't re-add settings listeners

    console.log(`[${Constants.EXTENSION_NAME}] Initialization complete.`);
}


// --- SillyTavern Extension Entry Point ---
jQuery(async () => {
    // 1. Ensure base settings object exists
    extension_settings[Constants.EXTENSION_NAME] = extension_settings[Constants.EXTENSION_NAME] || {};

    // 2. Add settings panel HTML to the UI
    //    (This needs to happen before initializePlugin tries to find elements within it)
    $('#extensions_settings').append(createSettingsHtml());

    // 3. Initialize the core plugin logic
    //    (Creates elements, loads settings, sets listeners including new icon ones via loadAndApplySettings)
    initializePlugin();
});
