// settings.js
import { extension_settings } from "../../../extensions.js";
import * as Constants from './constants.js';
import { sharedState, setMenuVisible } from './state.js';
import { updateMenuVisibilityUI, updateRocketButtonIcon } from './ui.js'; // Import updateRocketButtonIcon

const DEFAULT_ICON_SETTINGS = {
    type: 'default', // 'default', 'svg', 'url'
    value: '',       // SVG code or image URL
    color: '#a0a0a0',
    hoverColor: '#ffffff',
    activeColor: '#55aaff',
    size: '1.2em' // 默认大小
};

/**
 * 获取当前图标设置，如果不存在则返回默认值
 * @returns {object} 图标设置
 */
function getIconSettings() {
    const saved = extension_settings[Constants.EXTENSION_NAME]?.iconSettings;
    // 合并保存的设置和默认设置，确保所有字段都存在
    return { ...DEFAULT_ICON_SETTINGS, ...saved };
}

/**
 * Creates the HTML for the settings panel.
 * @returns {string} HTML string for the settings.
 */
export function createSettingsHtml() {
    return `
    <div id="${Constants.ID_SETTINGS_CONTAINER}" class="extension-settings">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>QR助手</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div>
            </div>
            <div class="inline-drawer-content">
                <p>此插件隐藏了原有的快捷回复栏，并创建了一个新的快速回复菜单。</p>
                <p>点击发送按钮旁边的小火箭图标可以打开或关闭菜单。</p>
                <div class="flex-container flexGap5" style="align-items: center;">
                    <label for="${Constants.ID_SETTINGS_ENABLED_DROPDOWN}">插件状态:</label>
                    <select id="${Constants.ID_SETTINGS_ENABLED_DROPDOWN}" class="text_pole">
                        <option value="true">启用</option>
                        <option value="false">禁用</option>
                    </select>
                    <button id="${Constants.ID_CUSTOMIZE_ICON_BUTTON}" class="menu_button fa-solid fa-palette" title="自定义图标"></button>
                </div>
                <hr class="sysHR">
            </div>
        </div>
    </div>`;
}

/**
 * Creates the HTML for the icon settings modal.
 * @returns {string} HTML string for the modal.
 */
export function createIconSettingsModalHtml() {
    return `
    <div id="${Constants.ID_ICON_SETTINGS_MODAL}" class="${Constants.CLASS_ICON_SETTINGS_MODAL}" style="display: none;" role="${Constants.ARIA_ROLE_DIALOG}" aria-modal="true" aria-labelledby="qs-icon-settings-title">
      <div class="${Constants.CLASS_ICON_SETTINGS_BACKDROP}"></div>
      <div class="${Constants.CLASS_ICON_SETTINGS_CONTENT}">
        <h3 id="qs-icon-settings-title">自定义菜单按钮图标</h3>

        <div class="${Constants.CLASS_ICON_SETTINGS_FIELD}">
          <label for="${Constants.ID_ICON_TYPE_SELECT}">图标类型:</label>
          <select id="${Constants.ID_ICON_TYPE_SELECT}" class="text_pole">
            <option value="default">默认 (火箭)</option>
            <option value="svg">SVG 代码</option>
            <option value="url">图片 URL</option>
          </select>
        </div>

        <div id="${Constants.ID_ICON_SVG_INPUT_CONTAINER}" class="${Constants.CLASS_ICON_SETTINGS_FIELD}" style="display: none;">
          <label for="${Constants.ID_ICON_SVG_INPUT}">SVG 代码:</label>
          <textarea id="${Constants.ID_ICON_SVG_INPUT}" class="text_pole" rows="4" placeholder="粘贴 SVG 代码... e.g., <svg>...</svg>"></textarea>
          <small>注意：直接使用 SVG 代码可能存在安全风险。</small>
        </div>

        <div id="${Constants.ID_ICON_URL_INPUT_CONTAINER}" class="${Constants.CLASS_ICON_SETTINGS_FIELD}" style="display: none;">
          <label for="${Constants.ID_ICON_URL_INPUT}">图片 URL:</label>
          <input type="text" id="${Constants.ID_ICON_URL_INPUT}" class="text_pole" placeholder="输入图片链接... e.g., https://...">
        </div>

        <div class="${Constants.CLASS_ICON_SETTINGS_FIELD}">
            <label for="${Constants.ID_ICON_COLOR_PICKER}">图标颜色:</label>
            <input type="color" id="${Constants.ID_ICON_COLOR_PICKER}" class="text_pole">
        </div>
        <div class="${Constants.CLASS_ICON_SETTINGS_FIELD}">
            <label for="${Constants.ID_ICON_HOVER_COLOR_PICKER}">悬停颜色:</label>
            <input type="color" id="${Constants.ID_ICON_HOVER_COLOR_PICKER}" class="text_pole">
        </div>
        <div class="${Constants.CLASS_ICON_SETTINGS_FIELD}">
            <label for="${Constants.ID_ICON_ACTIVE_COLOR_PICKER}">激活颜色:</label>
            <input type="color" id="${Constants.ID_ICON_ACTIVE_COLOR_PICKER}" class="text_pole">
        </div>

        <div class="${Constants.CLASS_ICON_SETTINGS_FIELD}">
            <label>预览:</label>
            <div id="${Constants.ID_ICON_PREVIEW}" class="${Constants.CLASS_ICON_SETTINGS_PREVIEW}">
                <!-- 预览内容将由 JS 更新 -->
            </div>
        </div>


        <div style="text-align: right; margin-top: 15px;">
          <button id="${Constants.ID_ICON_SETTINGS_CLOSE}" class="menu_button">取消</button>
          <button id="${Constants.ID_ICON_SETTINGS_SAVE}" class="menu_button menu_button_primary">保存</button>
        </div>
      </div>
    </div>`;
}

/**
 * Saves extension settings (including icon settings).
 */
function saveSettings() {
    console.log(`[${Constants.EXTENSION_NAME}] Saving settings...`);
    // Placeholder for actual save call using context if needed
    // if (typeof context !== 'undefined' && context.saveExtensionSettings) {
    //     context.saveExtensionSettings();
    // } else {
    //     console.warn(`[${Constants.EXTENSION_NAME}] context.saveExtensionSettings not available.`);
    // }
    // In SillyTavern, modifying extension_settings often triggers auto-save,
    // but calling the context function is safer if available.
}


/**
 * Handles changes in the extension's enabled setting dropdown.
 * @param {Event} event
 */
export function handleSettingsChange(event) {
    const isEnabled = event.target.value === 'true';
    extension_settings[Constants.EXTENSION_NAME].enabled = isEnabled;
    saveSettings(); // Save immediately

    if (sharedState.domElements.rocketButton) {
        sharedState.domElements.rocketButton.style.display = isEnabled ? '' : 'none';
    }
    if (!isEnabled) {
        setMenuVisible(false); // Update state
        updateMenuVisibilityUI(); // Update UI based on new state
    }
    console.log(`[${Constants.EXTENSION_NAME}] Enabled status set to: ${isEnabled}`);
}

/**
 * Opens the icon settings modal.
 */
export function handleCustomizeIconClick() {
    const { iconSettingsModal } = sharedState.domElements;
    if (iconSettingsModal) {
        // Load current settings into the modal before showing
        const currentSettings = getIconSettings();
        populateIconSettingsModal(currentSettings);
        updateIconPreview(); // Update preview on open
        iconSettingsModal.style.display = 'flex'; // Use flex for centering backdrop content
        iconSettingsModal.querySelector(`.${Constants.CLASS_ICON_SETTINGS_CONTENT}`).focus(); // Focus content for accessibility
    }
}

/**
 * Closes the icon settings modal.
 */
export function handleIconSettingsClose() {
    const { iconSettingsModal } = sharedState.domElements;
    if (iconSettingsModal) {
        iconSettingsModal.style.display = 'none';
    }
}

/**
 * Saves the icon settings from the modal.
 */
export function handleIconSettingsSave() {
    const { iconTypeSelect, iconSvgInput, iconUrlInput, iconColorPicker, iconHoverColorPicker, iconActiveColorPicker } = sharedState.domElements;

    const newSettings = {
        type: iconTypeSelect.value,
        value: iconTypeSelect.value === 'svg' ? iconSvgInput.value : iconUrlInput.value,
        color: iconColorPicker.value,
        hoverColor: iconHoverColorPicker.value,
        activeColor: iconActiveColorPicker.value,
        // size: '1.2em' // Size currently handled by CSS, could add input later
    };

    // Ensure iconSettings exists
    if (!extension_settings[Constants.EXTENSION_NAME]) {
        extension_settings[Constants.EXTENSION_NAME] = {};
    }
    extension_settings[Constants.EXTENSION_NAME].iconSettings = newSettings;
    saveSettings(); // Save all settings

    // Apply the new settings to the actual button
    updateRocketButtonIcon(newSettings);

    console.log(`[${Constants.EXTENSION_NAME}] Icon settings saved:`, newSettings);
    handleIconSettingsClose(); // Close modal after saving
}

/**
 * Handles changes in the icon type dropdown (shows/hides relevant inputs).
 */
export function handleIconTypeChange() {
    const { iconTypeSelect, iconSvgInputContainer, iconUrlInputContainer } = sharedState.domElements;
    const selectedType = iconTypeSelect.value;

    iconSvgInputContainer.style.display = selectedType === 'svg' ? 'block' : 'none';
    iconUrlInputContainer.style.display = selectedType === 'url' ? 'block' : 'none';
    updateIconPreview(); // Update preview when type changes
}

/**
 * Populates the icon settings modal with current values.
 * @param {object} settings - The current icon settings.
 */
function populateIconSettingsModal(settings) {
    const { iconTypeSelect, iconSvgInput, iconUrlInput, iconColorPicker, iconHoverColorPicker, iconActiveColorPicker } = sharedState.domElements;

    iconTypeSelect.value = settings.type;
    iconSvgInput.value = settings.type === 'svg' ? settings.value : '';
    iconUrlInput.value = settings.type === 'url' ? settings.value : '';
    iconColorPicker.value = settings.color;
    iconHoverColorPicker.value = settings.hoverColor;
    iconActiveColorPicker.value = settings.activeColor;

    // Trigger change handler to show/hide correct inputs
    handleIconTypeChange();
}

/**
 * Updates the preview area in the icon settings modal based on current modal inputs.
 */
export function updateIconPreview() {
    const { iconPreview, iconTypeSelect, iconSvgInput, iconUrlInput, iconColorPicker } = sharedState.domElements;
    if (!iconPreview) return;

    const type = iconTypeSelect.value;
    const value = type === 'svg' ? iconSvgInput.value : iconUrlInput.value;
    const color = iconColorPicker.value; // Use the current color picker value for preview

    // Clear previous preview
    iconPreview.innerHTML = '';
    iconPreview.style.color = color; // Apply color to the container for inheritance

    try {
        if (type === 'default') {
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-rocket';
            icon.style.fontSize = '1.5em'; // Make preview slightly larger
            iconPreview.appendChild(icon);
        } else if (type === 'svg' && value) {
            // Directly use innerHTML for SVG preview. Be cautious in production.
            iconPreview.innerHTML = value;
            const svgElement = iconPreview.querySelector('svg');
            if (svgElement) {
                svgElement.style.width = '1.5em';
                svgElement.style.height = '1.5em';
                svgElement.style.fill = 'currentColor'; // Ensure SVG uses container color
            } else {
                 iconPreview.textContent = '(无效 SVG)';
            }
        } else if (type === 'url' && value) {
            const img = document.createElement('img');
            img.src = value;
            img.alt = 'Icon Preview';
            img.style.width = '1.5em';
            img.style.height = '1.5em';
            img.style.objectFit = 'contain';
            img.onerror = () => { iconPreview.textContent = '(无法加载图片)'; };
            iconPreview.appendChild(img);
        } else {
             iconPreview.textContent = '(无预览)';
        }
    } catch (error) {
         console.error(`[${Constants.EXTENSION_NAME}] Error updating icon preview:`, error);
         iconPreview.textContent = '(预览出错)';
    }
}


/**
 * Loads initial settings and applies them.
 */
export function loadAndApplySettings() {
     // Ensure base settings object exists
    if (!extension_settings[Constants.EXTENSION_NAME]) {
         extension_settings[Constants.EXTENSION_NAME] = {};
    }

    // Handle Enabled state
    const currentSetting = extension_settings[Constants.EXTENSION_NAME].enabled;
    const isEnabled = currentSetting !== false; // Treat undefined as true
    extension_settings[Constants.EXTENSION_NAME].enabled = isEnabled; // Store consistent state

    const dropdown = sharedState.domElements.settingsDropdown;
     if (dropdown) {
        dropdown.value = String(isEnabled);
     }

    // Handle Icon Settings
    const iconSettings = getIconSettings();
    extension_settings[Constants.EXTENSION_NAME].iconSettings = iconSettings; // Store potentially updated settings

    // Apply settings to UI elements
    if (sharedState.domElements.rocketButton) {
        sharedState.domElements.rocketButton.style.display = isEnabled ? '' : 'none';
        if (isEnabled) {
            updateRocketButtonIcon(iconSettings); // Apply loaded icon settings
        }
    }

     console.log(`[${Constants.EXTENSION_NAME}] Initial enabled state: ${isEnabled}`);
     console.log(`[${Constants.EXTENSION_NAME}] Initial icon settings:`, iconSettings);
}
