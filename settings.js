// settings.js
import { extension_settings, saveSettingsDebounced } from "../../../extensions.js"; // 假设 saveSettingsDebounced 在那里或可以导入
import * as Constants from './constants.js';
import { sharedState, setMenuVisible } from './state.js';
import { updateMenuVisibilityUI } from './ui.js';
import { updateRocketButtonIcon } from './index.js'; // 引入图标更新函数

// --- 新增常量 ---
const ID_SETTINGS_ICON_BUTTON = `${Constants.EXTENSION_NAME}-icon-change-button`;
const ID_SETTINGS_ICON_INPUT = `${Constants.EXTENSION_NAME}-icon-file-input`;
const ID_SETTINGS_ICON_RESET_BUTTON = `${Constants.EXTENSION_NAME}-icon-reset-button`;
const ID_SETTINGS_ICON_PREVIEW = `${Constants.EXTENSION_NAME}-icon-preview`; // 可选：添加预览区域

/**
 * Creates the HTML for the settings panel.
 * @returns {string} HTML string for the settings.
 */
export function createSettingsHtml() {
    // 获取当前设置，用于显示预览（如果实现）
    const currentIconType = extension_settings[Constants.EXTENSION_NAME]?.iconType || 'default';
    const currentIconData = extension_settings[Constants.EXTENSION_NAME]?.iconData || '';
    let previewHtml = '';
    if (currentIconType !== 'default' && currentIconData) {
         // 简单的预览逻辑，可根据需要调整
        if (currentIconType === 'svg') {
            // 注意：直接注入 SVG 可能有安全风险，但在此受控环境中通常可接受
            // 限制大小以用于预览
            previewHtml = `<div id="${ID_SETTINGS_ICON_PREVIEW}" class="qr-icon-preview">${currentIconData}</div>`;
        } else if (currentIconType === 'png') {
            previewHtml = `<div id="${ID_SETTINGS_ICON_PREVIEW}" class="qr-icon-preview"><img src="${currentIconData}" alt="Icon Preview"></div>`;
        }
    } else {
         previewHtml = `<div id="${ID_SETTINGS_ICON_PREVIEW}" class="qr-icon-preview"><i class="fa-solid fa-rocket"></i> (默认)</div>`;
    }


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
                <div class="flex-container flexGap5">
                    <label for="${Constants.ID_SETTINGS_ENABLED_DROPDOWN}">插件状态:</label>
                    <select id="${Constants.ID_SETTINGS_ENABLED_DROPDOWN}" class="text_pole">
                        <option value="true">启用</option>
                        <option value="false">禁用</option>
                    </select>
                </div>
                <hr class="sysHR">
                <p><b>自定义菜单图标:</b></p>
                <div class="flex-container flexGap5" style="align-items: center;">
                   <span>当前图标:</span>
                   ${previewHtml}
                   <button id="${ID_SETTINGS_ICON_BUTTON}" class="menu_button">更改图标 (SVG/PNG)</button>
                   <input type="file" id="${ID_SETTINGS_ICON_INPUT}" accept=".svg,.png" style="display: none;">
                   <button id="${ID_SETTINGS_ICON_RESET_BUTTON}" class="menu_button danger_button">重置为默认</button>
                </div>
                <hr class="sysHR">
            </div>
        </div>
    </div>`;
}

/**
 * Handles the click event for the "Change Icon" button.
 */
function handleIconChangeClick() {
    const fileInput = document.getElementById(ID_SETTINGS_ICON_INPUT);
    fileInput?.click(); // Trigger the hidden file input
}

/**
 * Handles the file selection event from the hidden input.
 * Reads the file and saves the icon setting.
 * @param {Event} event
 */
function handleIconFileSelected(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
        const content = e.target?.result;
        if (!content) return;

        let iconType = '';
        let iconData = '';

        if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
            iconType = 'svg';
            iconData = content; // Store SVG code as text
             // 简单验证 SVG
            if (typeof iconData !== 'string' || !iconData.trim().startsWith('<svg')) {
                 console.error(`[${Constants.EXTENSION_NAME}] Invalid SVG file content.`);
                 alert('错误：无效的 SVG 文件内容。');
                 return;
            }
        } else if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
            iconType = 'png';
            iconData = content; // Store PNG as Data URL
        } else {
            console.warn(`[${Constants.EXTENSION_NAME}] Unsupported file type: ${file.type}`);
            alert(`不支持的文件类型: ${file.type || file.name.split('.').pop()}. 请选择 SVG 或 PNG.`);
            return;
        }

        console.log(`[${Constants.EXTENSION_NAME}] Icon selected: type=${iconType}, size=${file.size} bytes`);

        // Save settings
        extension_settings[Constants.EXTENSION_NAME].iconType = iconType;
        extension_settings[Constants.EXTENSION_NAME].iconData = iconData;
        saveSettingsDebounced();

        // Update the button icon immediately
        updateRocketButtonIcon();
        // Update preview
        updateIconPreview(iconType, iconData);
    };

    reader.onerror = (e) => {
        console.error(`[${Constants.EXTENSION_NAME}] Error reading file:`, e);
        alert('读取文件时出错。');
    };

    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
        reader.readAsText(file); // Read SVG as text
    } else if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
        reader.readAsDataURL(file); // Read PNG as Data URL
    }
}

/**
 * Handles the click event for the "Reset Icon" button.
 */
function handleIconResetClick() {
    console.log(`[${Constants.EXTENSION_NAME}] Resetting icon to default.`);
    // Reset settings
    extension_settings[Constants.EXTENSION_NAME].iconType = 'default';
    extension_settings[Constants.EXTENSION_NAME].iconData = null;
    saveSettingsDebounced();

    // Update the button icon immediately
    updateRocketButtonIcon();
     // Update preview
     updateIconPreview('default', null);
}

/**
 * Updates the icon preview in the settings panel.
 * @param {string} iconType 'default', 'svg', or 'png'.
 * @param {string | null} iconData SVG text or PNG Data URL.
 */
function updateIconPreview(iconType, iconData) {
    const previewElement = document.getElementById(ID_SETTINGS_ICON_PREVIEW);
    if (!previewElement) return;

    if (iconType === 'svg' && iconData) {
        previewElement.innerHTML = iconData; // Inject SVG
    } else if (iconType === 'png' && iconData) {
        previewElement.innerHTML = `<img src="${iconData}" alt="Icon Preview">`;
    } else { // Default
        previewElement.innerHTML = '<i class="fa-solid fa-rocket"></i> (默认)';
    }
}


/**
 * Handles changes in the extension's enabled setting dropdown.
 * @param {Event} event
 */
export function handleSettingsChange(event) {
    const targetId = event.target.id;

    if (targetId === Constants.ID_SETTINGS_ENABLED_DROPDOWN) {
        const isEnabled = event.target.value === 'true';
        extension_settings[Constants.EXTENSION_NAME].enabled = isEnabled;
        saveSettingsDebounced(); // Use the imported debounced function

        if (sharedState.domElements.rocketButton) {
            sharedState.domElements.rocketButton.style.display = isEnabled ? '' : 'none';
            // Also apply correct icon when enabling/disabling
            if (isEnabled) {
                updateRocketButtonIcon();
            }
        }
        if (!isEnabled) {
            setMenuVisible(false); // Update state
            updateMenuVisibilityUI(); // Update UI based on new state
        }
        console.log(`[${Constants.EXTENSION_NAME}] Enabled status set to: ${isEnabled}`);
    }
    // Note: Icon changes are handled by separate listeners below
}

/**
 * Loads initial settings and applies them.
 * Also sets up listeners for the icon buttons.
 */
export function loadAndApplySettings() {
     // Ensure settings object exists
    extension_settings[Constants.EXTENSION_NAME] = extension_settings[Constants.EXTENSION_NAME] || {};

    // Default enabled state
    const currentSetting = extension_settings[Constants.EXTENSION_NAME].enabled;
    const isEnabled = currentSetting !== false; // Treat undefined/null as true
    extension_settings[Constants.EXTENSION_NAME].enabled = isEnabled;

    // Default icon state
    const iconType = extension_settings[Constants.EXTENSION_NAME].iconType || 'default';
    const iconData = extension_settings[Constants.EXTENSION_NAME].iconData || null;
    extension_settings[Constants.EXTENSION_NAME].iconType = iconType; // Ensure consistent state
    extension_settings[Constants.EXTENSION_NAME].iconData = iconData;

    // Apply initial state to UI elements
    const dropdown = document.getElementById(Constants.ID_SETTINGS_ENABLED_DROPDOWN); // Find after HTML is added
     if (dropdown) {
        dropdown.value = String(isEnabled);
        // Add listener for enable/disable changes
        dropdown.addEventListener('change', handleSettingsChange);
     }

    if (!isEnabled && sharedState.domElements.rocketButton) {
        sharedState.domElements.rocketButton.style.display = 'none';
    }

    // --- Add listeners for icon buttons ---
    const changeIconButton = document.getElementById(ID_SETTINGS_ICON_BUTTON);
    const fileInput = document.getElementById(ID_SETTINGS_ICON_INPUT);
    const resetIconButton = document.getElementById(ID_SETTINGS_ICON_RESET_BUTTON);

    changeIconButton?.addEventListener('click', handleIconChangeClick);
    fileInput?.addEventListener('change', handleIconFileSelected);
    resetIconButton?.addEventListener('click', handleIconResetClick);
    // --------------------------------------

    console.log(`[${Constants.EXTENSION_NAME}] Initial enabled state: ${isEnabled}, Icon type: ${iconType}`);
    // Apply the initial icon (will be done in initializePlugin after button exists)
}

// Remove the debounce function if it's imported from extensions.js
// let saveTimeout;
// function saveSettingsDebounced() { ... }
