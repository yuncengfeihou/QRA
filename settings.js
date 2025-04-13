// settings.js
import { extension_settings } from "./index.js"; 
import * as Constants from './constants.js';
import { sharedState, setMenuVisible } from './state.js';
import { updateMenuVisibilityUI } from './ui.js';

// 在settings.js中添加自己的updateIconDisplay实现，避免循环依赖
function updateIconDisplay() {
    const button = sharedState.domElements.rocketButton;
    if (!button) return;
    
    const settings = extension_settings[Constants.EXTENSION_NAME];
    const iconType = settings.iconType || Constants.ICON_TYPES.ROCKET;
    
    // 清除按钮内容
    button.innerHTML = '';
    button.className = 'interactable secondary-button';
    
    // 如果是自定义图标，使用图片元素
    if (iconType === Constants.ICON_TYPES.CUSTOM && settings.customIconUrl) {
        const img = document.createElement('img');
        img.src = settings.customIconUrl;
        img.alt = '快速回复';
        img.style.maxHeight = '20px';
        img.style.maxWidth = '20px';
        button.appendChild(img);
    } else {
        // 使用FontAwesome图标
        const iconClass = Constants.ICON_CLASS_MAP[iconType] || Constants.ICON_CLASS_MAP[Constants.ICON_TYPES.ROCKET];
        button.classList.add('fa-solid', iconClass);
    }
    
    // 应用颜色匹配设置
    if (settings.matchButtonColors) {
        // 从发送按钮获取CSS变量并应用到我们的按钮
        const sendButton = document.getElementById('send_but');
        if (sendButton) {
            // 获取计算后的样式
            const sendButtonStyle = getComputedStyle(sendButton);
            
            // 应用颜色
            button.style.color = sendButtonStyle.color;
            
            // 添加额外的CSS类以匹配发送按钮
            if (sendButton.classList.contains('primary-button')) {
                button.classList.remove('secondary-button');
                button.classList.add('primary-button');
            }
        }
    }
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

// 统一处理设置变更的函数
export function handleSettingsChange(event) {
    const target = event.target;
    const settings = extension_settings[Constants.EXTENSION_NAME];
    
    // 根据设置类型处理
    if (target.id === Constants.ID_SETTINGS_ENABLED_DROPDOWN) {
        const isEnabled = target.value === 'true';
        settings.enabled = isEnabled;
        
        if (sharedState.domElements.rocketButton) {
            sharedState.domElements.rocketButton.style.display = isEnabled ? '' : 'none';
        }
        if (!isEnabled) {
            setMenuVisible(false);
            updateMenuVisibilityUI();
        }
        console.log(`[${Constants.EXTENSION_NAME}] Enabled status set to: ${isEnabled}`);
    } 
    else if (target.id === Constants.ID_ICON_TYPE_DROPDOWN) {
        const iconType = target.value;
        settings.iconType = iconType;
        
        // 显示或隐藏自定义图标URL输入框
        const customIconContainer = document.querySelector('.custom-icon-container');
        if (customIconContainer) {
            customIconContainer.style.display = iconType === Constants.ICON_TYPES.CUSTOM ? 'flex' : 'none';
        }
        
        // 更新图标预览
        updateIconPreview(iconType);
    } 
    else if (target.id === Constants.ID_CUSTOM_ICON_URL) {
        const url = target.value;
        settings.customIconUrl = url;
        
        // 如果当前是自定义图标模式，更新预览
        if (settings.iconType === Constants.ICON_TYPES.CUSTOM) {
            updateIconPreview(Constants.ICON_TYPES.CUSTOM);
        }
    } 
    else if (target.id === Constants.ID_COLOR_MATCH_CHECKBOX) {
        const isMatched = target.checked;
        settings.matchButtonColors = isMatched;
    }
    
    // 更新图标显示
    updateIconDisplay();
    
    // 保存设置
    saveSettings();
}

// 保存设置
function saveSettings() {
    if (typeof context !== 'undefined' && context.saveExtensionSettings) {
        context.saveExtensionSettings();
    } else {
        console.log(`[${Constants.EXTENSION_NAME}] 设置已更新（模拟保存）`);
    }
}

/**
 * Loads initial settings and applies them.
 */
export function loadAndApplySettings() {
    // 确保设置对象存在并设置默认值
    const settings = extension_settings[Constants.EXTENSION_NAME] = extension_settings[Constants.EXTENSION_NAME] || {};
    
    // 设置默认值
    settings.enabled = settings.enabled !== false; // 默认启用
    settings.iconType = settings.iconType || Constants.ICON_TYPES.ROCKET; // 默认火箭图标
    settings.customIconUrl = settings.customIconUrl || ''; // 默认空URL
    settings.matchButtonColors = settings.matchButtonColors !== false; // 默认匹配颜色

    // 应用设置到UI元素
    const dropdown = sharedState.domElements.settingsDropdown;
    if (dropdown) {
        dropdown.value = String(settings.enabled);
    }
    
    // 设置图标类型下拉框
    const iconTypeDropdown = document.getElementById(Constants.ID_ICON_TYPE_DROPDOWN);
    if (iconTypeDropdown) {
        iconTypeDropdown.value = settings.iconType;
        
        // 显示或隐藏自定义图标URL输入框
        const customIconContainer = document.querySelector('.custom-icon-container');
        if (customIconContainer) {
            customIconContainer.style.display = settings.iconType === Constants.ICON_TYPES.CUSTOM ? 'flex' : 'none';
        }
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
    
    // 如果禁用则隐藏按钮
    if (!settings.enabled && sharedState.domElements.rocketButton) {
        sharedState.domElements.rocketButton.style.display = 'none';
    }

    // 更新图标显示
    updateIconDisplay();

    console.log(`[${Constants.EXTENSION_NAME}] Settings loaded and applied.`);
}
