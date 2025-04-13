// events.js
import * as Constants from './constants.js';
import { sharedState, setMenuVisible } from './state.js';
import { updateMenuVisibilityUI } from './ui.js';
import { triggerQuickReply } from './api.js';
import { 
    handleSettingsChange as settingsChangeHandler, 
    handleIconTypeChange,
    handleCustomIconUrlChange,
    handleColorMatchChange
} from './settings.js'; // Import new handlers

// 保留其他函数不变...

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

    // Item click listeners are added dynamically in ui.js (createQuickReplyItem),
    // but they all point to handleQuickReplyClick defined here.

    // Settings listeners
    settingsDropdown?.addEventListener('change', settingsChangeHandler);
    iconTypeDropdown?.addEventListener('change', handleIconTypeChange);
    customIconUrl?.addEventListener('input', handleCustomIconUrlChange);
    colorMatchCheckbox?.addEventListener('change', handleColorMatchChange);
}
