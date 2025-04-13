// events.js
import * as Constants from './constants.js';
import { sharedState, setMenuVisible } from './state.js';
import { updateMenuVisibilityUI } from './ui.js';
import { triggerQuickReply } from './api.js';
import {
    handleSettingsChange as settingsChangeHandler, // Keep alias
    handleCustomizeIconClick,
    handleIconSettingsClose,
    handleIconSettingsSave,
    handleIconTypeChange,
    updateIconPreview // Import preview updater
} from './settings.js';

/**
 * Handles clicks on the rocket button. Toggles menu visibility state and updates UI.
 */
export function handleRocketButtonClick() {
    setMenuVisible(!sharedState.menuVisible); // Toggle state
    updateMenuVisibilityUI(); // Update UI based on new state
}

/**
 * Handles clicks outside the menu AND outside the icon settings modal to close the menu.
 * Also handles clicks on the modal backdrop to close the modal.
 * @param {Event} event
 */
export function handleOutsideClick(event) {
    const { menu, rocketButton, iconSettingsModal, iconSettingsBackdrop, customizeIconButton } = sharedState.domElements;

    // Close menu if click is outside menu, rocket button, AND the icon settings modal
    if (sharedState.menuVisible &&
        menu && rocketButton && iconSettingsModal &&
        !menu.contains(event.target) &&
        event.target !== rocketButton && !rocketButton.contains(event.target) &&
        !iconSettingsModal.contains(event.target) // Added check for modal
       ) {
        setMenuVisible(false);
        updateMenuVisibilityUI();
    }

    // Close icon settings modal if click is on the backdrop
    if (iconSettingsModal && iconSettingsModal.style.display !== 'none' && event.target === iconSettingsBackdrop) {
        handleIconSettingsClose();
    }
}

// handleQuickReplyClick remains unchanged...
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

     // Check if core QR is enabled before triggering
    const qrApi = window.quickReplyApi;
    const isQrCoreEnabled = !qrApi || !qrApi.settings || qrApi.settings.isEnabled !== false;

    if (!isQrCoreEnabled) {
         console.log(`[${Constants.EXTENSION_NAME}] Core Quick Reply v2 is disabled. Cannot trigger reply.`);
         setMenuVisible(false); // Close menu
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
        customizeIconButton,
        iconSettingsCloseButton,
        iconSettingsSaveButton,
        iconTypeSelect,
        // Listeners for inputs that should trigger preview update
        iconSvgInput,
        iconUrlInput,
        iconColorPicker
    } = sharedState.domElements;

    // Menu Trigger and Global Close
    rocketButton?.addEventListener('click', handleRocketButtonClick);
    document.addEventListener('click', handleOutsideClick); // Handles menu close and modal backdrop close

    // Item click listeners are added dynamically in ui.js -> createQuickReplyItem

    // Main Settings Listener
    settingsDropdown?.addEventListener('change', settingsChangeHandler);

    // Icon Settings Modal Listeners
    customizeIconButton?.addEventListener('click', handleCustomizeIconClick);
    iconSettingsCloseButton?.addEventListener('click', handleIconSettingsClose);
    iconSettingsSaveButton?.addEventListener('click', handleIconSettingsSave);
    iconTypeSelect?.addEventListener('change', handleIconTypeChange); // Update inputs visibility and preview

    // Listeners to update preview in real-time(ish)
    iconSvgInput?.addEventListener('input', updateIconPreview);
    iconUrlInput?.addEventListener('input', updateIconPreview);
    iconColorPicker?.addEventListener('input', updateIconPreview); // Update preview on color change

    // Close modal on Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && sharedState.domElements.iconSettingsModal?.style.display !== 'none') {
            handleIconSettingsClose();
        }
    });
}
