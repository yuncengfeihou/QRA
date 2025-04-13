// events.js
import * as Constants from './constants.js';
import { sharedState, setMenuVisible } from './state.js';
import { updateMenuVisibilityUI } from './ui.js';
import { triggerQuickReply } from './api.js';
// Import setupSettingsEventListeners directly since it's exported
import { setupSettingsEventListeners } from './settings.js';

/**
 * Handles clicks on the rocket button. Toggles menu visibility state and updates UI.
 */
export function handleRocketButtonClick() {
    setMenuVisible(!sharedState.menuVisible); // Toggle state
    updateMenuVisibilityUI(); // Update UI based on new state
}

/**
 * Handles clicks outside the menu to close it.
 * @param {Event} event
 */
export function handleOutsideClick(event) {
    const { menu, rocketButton } = sharedState.domElements;
    if (sharedState.menuVisible &&
        menu && rocketButton &&
        !menu.contains(event.target) &&
        event.target !== rocketButton &&
        !rocketButton.contains(event.target)
       ) {
        setMenuVisible(false); // Update state
        updateMenuVisibilityUI(); // Update UI
    }
}

/**
 * Handles clicks on individual quick reply items (buttons).
 * Reads data attributes and triggers the API call.
 * @param {Event} event The click event on the button.
 */
export async function handleQuickReplyClick(event) {
    const button = event.currentTarget; // Get the button that was clicked
    const setName = button.dataset.setName;
    const label = button.dataset.label;

    if (!setName || !label) {
        console.error(`[${Constants.EXTENSION_NAME}] Missing data-set-name or data-label on clicked item.`);
        setMenuVisible(false); // Close menu on error
        updateMenuVisibilityUI();
        return;
    }

    await triggerQuickReply(setName, label); // Await the API call

    // Always close the menu after attempting to trigger, regardless of success/failure
    setMenuVisible(false);
    updateMenuVisibilityUI();
}

/**
 * Sets up all event listeners for the plugin.
 */
export function setupEventListeners() {
    const { 
        rocketButton, 
        settingsDropdown,
        iconTypeDropdown,
        customIconUrl,
        colorMatchCheckbox
    } = sharedState.domElements;

    rocketButton?.addEventListener('click', handleRocketButtonClick);
    document.addEventListener('click', handleOutsideClick);

    // Settings listeners
    if (settingsDropdown) {
        settingsDropdown.addEventListener('change', function(event) {
            // Reference the function directly from the window object
            if (window.quickReplyMenu && window.quickReplyMenu.handleSettingsChange) {
                window.quickReplyMenu.handleSettingsChange(event);
            }
        });
    }
    
    // 新增图标设置相关监听器
    if (iconTypeDropdown) {
        iconTypeDropdown.addEventListener('change', function(event) {
            if (window.quickReplyMenu && window.quickReplyMenu.handleSettingsChange) {
                window.quickReplyMenu.handleSettingsChange(event);
            }
        });
    }
    
    if (customIconUrl) {
        customIconUrl.addEventListener('input', function(event) {
            if (window.quickReplyMenu && window.quickReplyMenu.handleSettingsChange) {
                window.quickReplyMenu.handleSettingsChange(event);
            }
        });
    }
    
    if (colorMatchCheckbox) {
        colorMatchCheckbox.addEventListener('change', function(event) {
            if (window.quickReplyMenu && window.quickReplyMenu.handleSettingsChange) {
                window.quickReplyMenu.handleSettingsChange(event);
            }
        });
    }
    
    // 设置文件上传事件监听器
    setupSettingsEventListeners();
}
