// index.js - Main Entry Point
import * as Constants from './constants.js';
import { sharedState } from './state.js';
import { createMenuElement } from './ui.js';
import { createSettingsHtml, setupSettingsEventListeners } from './settings.js';
import { setupEventListeners, handleQuickReplyClick } from './events.js';

// 创建本地设置对象，如果全局对象不存在
if (typeof window.extension_settings === 'undefined') {
    window.extension_settings = {};
}
if (!window.extension_settings[Constants.EXTENSION_NAME]) {
    window.extension_settings[Constants.EXTENSION_NAME] = {
        enabled: true,
        iconType: Constants.ICON_TYPES.ROCKET,
        customIconUrl: '',
        matchButtonColors: true
    };
}



/**
 * Injects the rocket button next to the send button
 */
function injectRocketButton() {
    // Find the send button in the UI
    const sendButton = $('#send_but');
    if (sendButton.length === 0) {
        console.error(`[${Constants.EXTENSION_NAME}] Could not find send button to inject rocket button`);
        // 如果找不到发送按钮，创建一个模拟按钮到body上进行测试
        const mockButton = $('<div id="send_but" style="display:none"></div>');
        $('body').append(mockButton);
        sendButton = $('#send_but');
    }
    
    // 创建按钮容器
    const buttonHtml = `<div id="${Constants.ID_ROCKET_BUTTON}" class="interactable secondary-button" title="快速回复菜单" aria-haspopup="true" aria-expanded="false" aria-controls="${Constants.ID_MENU}"></div>`;
    
    // Insert the button before the send button
    sendButton.before(buttonHtml);
    
    // Return the reference to the newly created button
    return document.getElementById(Constants.ID_ROCKET_BUTTON);
}

/**
 * 更新图标显示
 */
function updateIconDisplay() {
    const button = sharedState.domElements.rocketButton;
    if (!button) return;
    
    const settings = window.extension_settings[Constants.EXTENSION_NAME];
    const iconType = settings.iconType || Constants.ICON_TYPES.ROCKET;
    
    // 清除按钮内容并设置基础类名
    button.innerHTML = '';
    button.className = 'interactable secondary-button';
    
    // 根据图标类型设置内容
    if (iconType === Constants.ICON_TYPES.CUSTOM && settings.customIconUrl) {
        const img = document.createElement('img');
        img.src = settings.customIconUrl;
        img.alt = '快速回复';
        img.style.maxHeight = '20px';
        img.style.maxWidth = '20px';
        button.appendChild(img);
    } else {
        const iconClass = Constants.ICON_CLASS_MAP[iconType] || Constants.ICON_CLASS_MAP[Constants.ICON_TYPES.ROCKET];
        button.classList.add('fa-solid', iconClass);
    }
    
    // 应用颜色设置
    if (settings.matchButtonColors) {
        const sendButton = document.getElementById('send_but');
        if (sendButton) {
            button.style.color = getComputedStyle(sendButton).color;
            if (sendButton.classList.contains('primary-button')) {
                button.classList.remove('secondary-button');
                button.classList.add('primary-button');
            }
        }
    }
}

/**
 * 加载设置
 */
function loadAndApplySettings() {
    const settings = window.extension_settings[Constants.EXTENSION_NAME];
    
    // 更新UI元素
    const dropdown = document.getElementById(Constants.ID_SETTINGS_ENABLED_DROPDOWN);
    if (dropdown) dropdown.value = String(settings.enabled);
    
    const iconType = document.getElementById(Constants.ID_ICON_TYPE_DROPDOWN);
    if (iconType) iconType.value = settings.iconType || Constants.ICON_TYPES.ROCKET;
    
    const customUrl = document.getElementById(Constants.ID_CUSTOM_ICON_URL);
    if (customUrl) customUrl.value = settings.customIconUrl || '';
    
    const colorMatch = document.getElementById(Constants.ID_COLOR_MATCH_CHECKBOX);
    if (colorMatch) colorMatch.checked = settings.matchButtonColors !== false;
    
    // 显示/隐藏自定义URL输入框
    const customContainer = document.querySelector('.custom-icon-container');
    if (customContainer) {
        customContainer.style.display = 
            settings.iconType === Constants.ICON_TYPES.CUSTOM ? 'flex' : 'none';
    }
    
    // 更新图标预览
    updateIconPreview(settings.iconType);
    
    // 如果禁用则隐藏按钮
    if (settings.enabled === false && sharedState.domElements.rocketButton) {
        sharedState.domElements.rocketButton.style.display = 'none';
    }

    // 更新图标显示
    updateIconDisplay();
}

/**
 * 更新图标预览
 */
function updateIconPreview(iconType) {
    const previewContainer = document.querySelector(`.${Constants.CLASS_ICON_PREVIEW}`);
    if (!previewContainer) return;
    
    previewContainer.innerHTML = '';
    const settings = window.extension_settings[Constants.EXTENSION_NAME];
    
    if (iconType === Constants.ICON_TYPES.CUSTOM) {
        const url = settings.customIconUrl;
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
 * Initializes the plugin: creates UI, sets up listeners, loads settings.
 */
// index.js - 需要修改的部分
// index.js - 只修改以下函数，保留文件中的其他内容

function initializePlugin() {
    try {
        console.log(`[${Constants.EXTENSION_NAME}] Initializing...`);

        // Create and inject the rocket button
        const rocketButton = injectRocketButton();
        
        // Create menu element
        const menu = createMenuElement();

        // Append menu to the body (先添加到DOM)
        document.body.appendChild(menu);

        // Store references in shared state
        sharedState.domElements.rocketButton = rocketButton;
        sharedState.domElements.menu = menu;
        sharedState.domElements.chatItemsContainer = menu.querySelector(`#${Constants.ID_CHAT_ITEMS}`);
        sharedState.domElements.globalItemsContainer = menu.querySelector(`#${Constants.ID_GLOBAL_ITEMS}`);
        sharedState.domElements.settingsDropdown = document.getElementById(Constants.ID_SETTINGS_ENABLED_DROPDOWN);
        sharedState.domElements.iconTypeDropdown = document.getElementById(Constants.ID_ICON_TYPE_DROPDOWN);
        sharedState.domElements.customIconUrl = document.getElementById(Constants.ID_CUSTOM_ICON_URL);
        sharedState.domElements.colorMatchCheckbox = document.getElementById(Constants.ID_COLOR_MATCH_CHECKBOX);

        // 创建全局对象暴露事件处理函数
        window.quickReplyMenu = {
            handleQuickReplyClick
        };

        // 确保先加载DOM元素再设置事件监听
        setTimeout(() => {
            // Load settings and apply UI
            loadAndApplySettings();

            // Setup event listeners
            setupEventListeners();
            
            console.log(`[${Constants.EXTENSION_NAME}] Initialization complete.`);
        }, 100);

    } catch (err) {
        console.error(`[${Constants.EXTENSION_NAME}] 初始化失败:`, err);
    }
}

// 导出handleFileUpload函数，供onReady回调使用
export function handleFileUpload(event) {
    // ... 之前的handleFileUpload实现 ...
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const customIconUrl = document.getElementById(Constants.ID_CUSTOM_ICON_URL);
        if (customIconUrl) {
            customIconUrl.value = e.target.result; // 将文件转为base64
            
            // 更新设置
            const settings = window.extension_settings[Constants.EXTENSION_NAME];
            settings.customIconUrl = e.target.result;
            
            // 手动触发输入事件
            const inputEvent = new Event('input', { bubbles: true });
            customIconUrl.dispatchEvent(inputEvent);
            
            console.log(`[${Constants.EXTENSION_NAME}] 图标文件已上传并应用`);
        }
    };
    reader.readAsDataURL(file);
}

// 确保 jQuery 可用 - 使用原生 js 备用
function onReady(callback) {
    if (typeof jQuery !== 'undefined') {
        jQuery(callback);
    } else if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(callback, 1);
    } else {
        document.addEventListener("DOMContentLoaded", callback);
    }
}

onReady(() => {
    try {
        // 确保设置面板存在
        const settingsContainer = document.getElementById('extensions_settings');
        if (!settingsContainer) {
            const div = document.createElement('div');
            div.id = 'extensions_settings';
            div.style.display = 'none';
            document.body.appendChild(div);
        }
        
        // 添加设置面板内容
        document.getElementById('extensions_settings').innerHTML += createSettingsHtml();
        
        // 初始化插件
        initializePlugin();
        
        // 确保DOM完全加载后再次设置文件上传监听器
        setTimeout(() => {
            // 这是一个额外的安全措施，确保文件上传功能正常工作
            const fileButton = document.getElementById('icon-file-button');
            const fileInput = document.getElementById('icon-file-upload');
            
            if (fileButton && fileInput) {
                fileButton.onclick = function(e) {
                    e.preventDefault();
                    console.log(`[${Constants.EXTENSION_NAME}] 文件按钮被点击 (直接onclick)`);
                    fileInput.click();
                };
            }
            
            if (fileInput) {
                fileInput.onchange = function(e) {
                    console.log(`[${Constants.EXTENSION_NAME}] 文件已选择 (直接onchange)`, e.target.files[0]?.name || '无文件');
                    handleFileUpload(e);
                };
            }
            
            console.log(`[${Constants.EXTENSION_NAME}] 额外的文件上传逻辑已设置`);
        }, 500);
    } catch (err) {
        console.error(`[${Constants.EXTENSION_NAME}] 启动失败:`, err);
    }
});
