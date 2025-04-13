// settings.js
import { extension_settings } from "../../../extensions.js";
import * as Constants from './constants.js';
import { sharedState, setMenuVisible } from './state.js';
import { updateMenuVisibilityUI, updateIconDisplay } from './ui.js'; // 导入新的函数

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
                <p>点击发送按钮旁边的图标可以打开或关闭菜单。</p>
                <div class="flex-container flexGap5">
                    <label for="${Constants.ID_SETTINGS_ENABLED_DROPDOWN}">插件状态:</label>
                    <select id="${Constants.ID_SETTINGS_ENABLED_DROPDOWN}" class="text_pole">
                        <option value="true">启用</option>
                        <option value="false">禁用</option>
                    </select>
                </div>
                
                <hr class="sysHR">
                <div class="${Constants.CLASS_SETTINGS_ROW}">
                    <label for="${Constants.ID_ICON_TYPE_DROPDOWN}">图标类型:</label>
                    <select id="${Constants.ID_ICON_TYPE_DROPDOWN}" class="text_pole">
                        <option value="${Constants.ICON_TYPES.ROCKET}">火箭图标</option>
                        <option value="${Constants.ICON_TYPES.COMMENT}">对话图标</option>
                        <option value="${Constants.ICON_TYPES.STAR}">星星图标</option>
                        <option value="${Constants.ICON_TYPES.BOLT}">闪电图标</option>
                        <option value="${Constants.ICON_TYPES.CUSTOM}">自定义图标</option>
                    </select>
                    <div class="${Constants.CLASS_ICON_PREVIEW}">
                        <i class="fa-solid fa-rocket"></i>
                    </div>
                </div>
                
                <div class="${Constants.CLASS_SETTINGS_ROW} custom-icon-container" style="display: none;">
                    <label for="${Constants.ID_CUSTOM_ICON_URL}">自定义图标URL:</label>
                    <input type="text" id="${Constants.ID_CUSTOM_ICON_URL}" class="text_pole" 
                           placeholder="输入图片URL地址（支持PNG、SVG等）" />
                </div>
                
                <div class="${Constants.CLASS_SETTINGS_ROW}">
                    <label>
                        <input type="checkbox" id="${Constants.ID_COLOR_MATCH_CHECKBOX}" />
                        使用与发送按钮相匹配的颜色风格
                    </label>
                </div>
                <hr class="sysHR">
            </div>
        </div>
    </div>`;
}

// Debounce function (simple version)
let saveTimeout;
function saveSettingsDebounced() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        console.log(`[${Constants.EXTENSION_NAME}] (Debounced) Settings saved.`);
        if (typeof context !== 'undefined' && context.saveExtensionSettings) {
            context.saveExtensionSettings();
        }
    }, 500);
}

/**
 * 处理图标类型更改
 * @param {Event} event 
 */
export function handleIconTypeChange(event) {
    const iconType = event.target.value;
    const settings = extension_settings[Constants.EXTENSION_NAME];
    settings.iconType = iconType;
    
    // 显示或隐藏自定义图标URL输入框
    const customIconContainer = document.querySelector('.custom-icon-container');
    if (customIconContainer) {
        customIconContainer.style.display = iconType === Constants.ICON_TYPES.CUSTOM ? 'flex' : 'none';
    }
    
    // 更新图标预览
    updateIconPreview(iconType);
    
    // 应用到实际按钮
    updateIconDisplay();
    
    saveSettingsDebounced();
}

/**
 * 处理自定义图标URL更改
 * @param {Event} event 
 */
export function handleCustomIconUrlChange(event) {
    const url = event.target.value;
    const settings = extension_settings[Constants.EXTENSION_NAME];
    settings.customIconUrl = url;
    
    // 如果当前是自定义图标模式，立即更新显示
    if (settings.iconType === Constants.ICON_TYPES.CUSTOM) {
        updateIconDisplay();
    }
    
    saveSettingsDebounced();
}

/**
 * 处理颜色匹配选项更改
 * @param {Event} event 
 */
export function handleColorMatchChange(event) {
    const isMatched = event.target.checked;
    const settings = extension_settings[Constants.EXTENSION_NAME];
    settings.matchButtonColors = isMatched;
    
    // 更新样式
    updateIconDisplay();
    
    saveSettingsDebounced();
}

/**
 * 更新图标预览
 * @param {string} iconType 图标类型
 */
function updateIconPreview(iconType) {
    const previewContainer = document.querySelector(`.${Constants.CLASS_ICON_PREVIEW}`);
    if (!previewContainer) return;
    
    previewContainer.innerHTML = '';
    
    if (iconType === Constants.ICON_TYPES.CUSTOM) {
        const url = extension_settings[Constants.EXTENSION_NAME].customIconUrl;
        if (url) {
            const img = document.createElement('img');
            img.src = url;
            img.style.maxHeight = '20px';
            previewContainer.appendChild(img);
        } else {
            previewContainer.innerHTML = '<span>(无预览)</span>';
        }
    } else {
        const iconClass = Constants.ICON_CLASS_MAP[iconType] || Constants.ICON_CLASS_MAP[Constants.ICON_TYPES.ROCKET];
        previewContainer.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
    }
}

/**
 * Handles changes in the extension's enabled setting dropdown.
 * @param {Event} event
 */
export function handleSettingsChange(event) {
    const target = event.target;
    
    if (target.id === Constants.ID_SETTINGS_ENABLED_DROPDOWN) {
        const isEnabled = target.value === 'true';
        extension_settings[Constants.EXTENSION_NAME].enabled = isEnabled;
    
        if (sharedState.domElements.rocketButton) {
            sharedState.domElements.rocketButton.style.display = isEnabled ? '' : 'none';
        }
        if (!isEnabled) {
            setMenuVisible(false); // Update state
            updateMenuVisibilityUI(); // Update UI based on new state
        }
        console.log(`[${Constants.EXTENSION_NAME}] Enabled status set to: ${isEnabled}`);
    } else if (target.id === Constants.ID_ICON_TYPE_DROPDOWN) {
        handleIconTypeChange(event);
    } else if (target.id === Constants.ID_CUSTOM_ICON_URL) {
        handleCustomIconUrlChange(event);
    } else if (target.id === Constants.ID_COLOR_MATCH_CHECKBOX) {
        handleColorMatchChange(event);
    }
    
    saveSettingsDebounced();
}

/**
 * Loads initial settings and applies them.
 */
export function loadAndApplySettings() {
     // Ensure settings object exists with default values
    const settings = extension_settings[Constants.EXTENSION_NAME] = extension_settings[Constants.EXTENSION_NAME] || {};
    
    // 设置默认值
    settings.enabled = settings.enabled !== false; // 默认启用
    settings.iconType = settings.iconType || Constants.ICON_TYPES.ROCKET; // 默认火箭图标
    settings.customIconUrl = settings.customIconUrl || ''; // 默认空URL
    settings.matchButtonColors = settings.matchButtonColors !== false; // 默认匹配颜色

    // Apply initial state to UI elements
    const dropdown = sharedState.domElements.settingsDropdown;
    if (dropdown) {
        dropdown.value = String(settings.enabled);
    }
    
    // 设置图标类型下拉框
    const iconTypeDropdown = document.getElementById(Constants.ID_ICON_TYPE_DROPDOWN);
    if (iconTypeDropdown) {
        iconTypeDropdown.value = settings.iconType;
        // 触发一次变更事件来显示/隐藏自定义URL输入框
        const event = new Event('change');
        iconTypeDropdown.dispatchEvent(event);
    }
    
    // 设置自定义图标URL
    const customIconUrl = document.getElementById(Constants.ID_CUSTOM_ICON_URL);
    if (customIconUrl) {
        customIconUrl.value = settings.customIconUrl;
    }
    
    // 设置颜色匹配复选框
    const colorMatchCheckbox = document.getElementById(Constants.ID_COLOR_MATCH_CHECKBOX);
    if (colorMatchCheckbox) {
        colorMatchCheckbox.checked = settings.matchButtonColors;
    }
    
    // 更新图标预览
    updateIconPreview(settings.iconType);
    
    if (!settings.enabled && sharedState.domElements.rocketButton) {
        sharedState.domElements.rocketButton.style.display = 'none';
    }

    // 更新图标显示
    updateIconDisplay();

    console.log(`[${Constants.EXTENSION_NAME}] Settings loaded and applied.`);
}
