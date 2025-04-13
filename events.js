// events.js
import * as Constants from './constants.js';
import { sharedState, setMenuVisible } from './state.js';
import { updateMenuVisibilityUI } from './ui.js';
import { triggerQuickReply } from './api.js';
import { extension_settings } from "../../../extensions.js"; // 需要引入 extension_settings 来检查启用状态

/**
 * Handles clicks on the rocket button. Toggles menu visibility state and updates UI.
 * Checks if the extension is enabled first.
 */
export function handleRocketButtonClick() {
    // Check if the extension is enabled before showing the menu
    if (extension_settings[Constants.EXTENSION_NAME]?.enabled === false) {
        console.log(`[${Constants.EXTENSION_NAME}] Extension is disabled. Button click ignored.`);
        return; // Do nothing if disabled
    }
    setMenuVisible(!sharedState.menuVisible); // Toggle state
    updateMenuVisibilityUI(); // Update UI based on new state
}

/**
 * Handles clicks outside the menu to close it.
 * @param {Event} event
 */
export function handleOutsideClick(event) {
    const { menu, rocketButton } = sharedState.domElements;

    // Check if the menu is visible and if the necessary elements exist
    if (!sharedState.menuVisible || !menu || !rocketButton) {
        return;
    }

    // Check if the click target is outside the menu AND outside the rocket button
    const isClickInsideMenu = menu.contains(event.target);
    const isClickOnRocketButton = rocketButton === event.target || rocketButton.contains(event.target);

    // Also check if the click target is inside the settings panel (which might be open)
    // Assuming settings panel has a known container ID or class
    const settingsPanel = document.getElementById(Constants.ID_SETTINGS_CONTAINER); // Or querySelector if needed
    const isClickInsideSettings = settingsPanel ? settingsPanel.contains(event.target) : false;

    // Close the menu ONLY if the click is outside the menu, outside the rocket button,
    // AND potentially allow clicks inside settings without closing the menu (if desired, adjust logic)
    // Current logic: close if outside menu AND outside button.
    if (!isClickInsideMenu && !isClickOnRocketButton) {
         // Optional: Add logging for debugging clicks
         // console.log('[Quick Reply Menu] Outside click detected. Closing menu.');
        setMenuVisible(false); // Update state
        updateMenuVisibilityUI(); // Update UI
    }
    // If you want clicks inside the settings panel *not* to close the menu, you would modify the condition:
    // if (!isClickInsideMenu && !isClickOnRocketButton && !isClickInsideSettings) { ... }
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

    // Optional: Indicate processing state? (Maybe add a class to the button)
    button.disabled = true; // Prevent double-clicks

    try {
        await triggerQuickReply(setName, label); // Await the API call
    } catch (error) {
        // Error logging is already inside triggerQuickReply
        // You might want to add user feedback here (e.g., a small notification)
    } finally {
        // Always close the menu after attempting to trigger, regardless of success/failure
        setMenuVisible(false);
        updateMenuVisibilityUI();
        // Re-enable button in case the menu is reopened quickly (though closing usually handles this)
        // button.disabled = false; // Usually not needed as the menu closes and items are rebuilt
    }
}


/**
 * Sets up event listeners for the core plugin UI (button, outside clicks).
 * Note: Settings listeners (dropdown, icon buttons) are now set up within settings.js
 */
export function setupEventListeners() {
    const { rocketButton } = sharedState.domElements;

    // Ensure listeners aren't added multiple times if initialization runs again
    // A simple way is to remove before adding, though ideally init runs only once.
    rocketButton?.removeEventListener('click', handleRocketButtonClick);
    document.removeEventListener('click', handleOutsideClick);

    // Add core listeners
    rocketButton?.addEventListener('click', handleRocketButtonClick);
    document.addEventListener('click', handleOutsideClick);

    // Item click listeners are added dynamically when items are created in ui.js
    // (createQuickReplyItem function attaches handleQuickReplyClick).

    console.log(`[${Constants.EXTENSION_NAME}] Core event listeners set up.`);
}
