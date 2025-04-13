// state.js

// Use an object to allow modifications from other modules
export const sharedState = {
    menuVisible: false,
    domElements: {
        // Existing elements
        rocketButton: null,
        menu: null,
        chatItemsContainer: null,
        globalItemsContainer: null,
        settingsDropdown: null,
        // New elements for icon settings
        customizeIconButton: null,
        iconSettingsModal: null,
        iconSettingsBackdrop: null,
        iconTypeSelect: null,
        iconSvgInputContainer: null,
        iconSvgInput: null,
        iconUrlInputContainer: null,
        iconUrlInput: null,
        iconSettingsSaveButton: null,
        iconSettingsCloseButton: null,
        iconPreview: null, // Reference to preview area
        iconColorPicker: null,
        iconHoverColorPicker: null,
        iconActiveColorPicker: null,
    }
};

/**
 * Updates the menu visibility state.
 * @param {boolean} visible
 */
export function setMenuVisible(visible) {
    sharedState.menuVisible = visible;
}
