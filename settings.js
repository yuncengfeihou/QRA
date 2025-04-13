// settings.js
import * as Constants from './constants.js';
import { sharedState, setMenuVisible } from './state.js';
import { updateMenuVisibilityUI } from './ui.js';

// 在settings.js中添加自己的updateIconDisplay实现，避免循环依赖
function updateIconDisplay() {
    const button = sharedState.domElements.rocketButton;
    if (!button) return;
    
    const settings = window.extension_settings[Constants.EXTENSION_NAME];
    const iconType = settings.iconType || Constants.ICON_TYPES.ROCKET;
    
    // 清除按钮内容
    button.innerHTML = '';
    button.className = 'interactable secondary-button';
    
    // 如果是自定义图标
    if (iconType === Constants.ICON_TYPES.CUSTOM && settings.customIconUrl) {
        const customContent = settings.customIconUrl.trim();
        
        // 检测内容类型
        if (customContent.startsWith('<svg') && customContent.includes('</svg>')) {
            // 使用DOMParser安全解析SVG
            const parser = new DOMParser();
            const doc = parser.parseFromString(customContent, 'image/svg+xml');
            const svgElement = doc.documentElement;
            
            if (svgElement && svgElement.tagName === 'svg') {
                // 设置SVG属性确保正确显示
                svgElement.setAttribute('width', '20px');
                svgElement.setAttribute('height', '20px');
                if (!svgElement.getAttribute('viewBox')) {
                    svgElement.setAttribute('viewBox', '0 0 24 24');
                }
                
                // 确保SVG可见
                svgElement.style.width = '20px';
                svgElement.style.height = '20px';
                svgElement.style.display = 'inline-block';
                
                // 将解析后的SVG添加到按钮
                button.appendChild(svgElement);
                console.log(`[${Constants.EXTENSION_NAME}] SVG已成功解析并应用`);
            } else {
                console.warn(`[${Constants.EXTENSION_NAME}] SVG解析失败`);
                button.textContent = '?'; // 显示错误指示
            }
        } 
        else if (customContent.startsWith('data:') || 
                customContent.startsWith('http') || 
                customContent.endsWith('.png') || 
                customContent.endsWith('.jpg') || 
                customContent.endsWith('.svg') ||
                customContent.endsWith('.gif')) {
            // URL或Base64编码的图片
            const img = document.createElement('img');
            img.src = customContent;
            img.alt = '快速回复';
            img.style.maxHeight = '20px';
            img.style.maxWidth = '20px';
            
            // 添加加载错误处理
            img.onerror = () => {
                console.error(`[${Constants.EXTENSION_NAME}] 图片加载失败:`, customContent.substring(0, 30) + '...');
                button.textContent = '!';
            };
            
            button.appendChild(img);
        } 
        else {
            // 检查是否是base64编码的图片
            if (customContent.includes('base64,')) {
                try {
                    // 提取或组装完整的base64 URL
                    let imgSrc = customContent;
                    
                    // 如果没有data:前缀，尝试添加
                    if (!customContent.startsWith('data:')) {
                        // 尝试检测图片类型
                        let mimeType = 'image/png'; // 默认类型
                        
                        // 尝试从base64字符串推断类型
                        if (customContent.includes('/9j/')) {
                            mimeType = 'image/jpeg';
                        } else if (customContent.includes('iVBOR')) {
                            mimeType = 'image/png';
                        } else if (customContent.includes('PHN2Z')) {
                            mimeType = 'image/svg+xml';
                        }
                        
                        // 如果字符串已包含base64,则提取后半部分
                        if (customContent.includes('base64,')) {
                            imgSrc = 'data:' + mimeType + ';base64,' + customContent.split('base64,')[1];
                        } else {
                            imgSrc = 'data:' + mimeType + ';base64,' + customContent;
                        }
                    }
                    
                    // 创建并设置图像
                    const img = document.createElement('img');
                    img.alt = '快速回复';
                    img.style.maxHeight = '20px';
                    img.style.maxWidth = '20px';
                    
                    // 添加加载错误处理
                    img.onerror = () => {
                        console.error(`[${Constants.EXTENSION_NAME}] 图片加载失败:`, imgSrc.substring(0, 30) + '...');
                        button.textContent = '!';
                    };
                    
                    // 添加加载成功处理
                    img.onload = () => {
                        console.log(`[${Constants.EXTENSION_NAME}] base64图片加载成功`);
                    };
                    
                    img.src = imgSrc;
                    button.appendChild(img);
                } catch (err) {
                    console.error(`[${Constants.EXTENSION_NAME}] base64处理错误:`, err);
                    button.textContent = '!';
                }
            } else {
                // 不是可识别的格式，使用文本显示
                button.textContent = '?';
                console.warn(`[${Constants.EXTENSION_NAME}] 无法识别的图标格式`);
            }
        }
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
                    <label for="${Constants.ID_CUSTOM_ICON_URL}">自定义图标:</label>
                    <div style="display:flex; flex-grow:1; gap:5px;">
                        <input type="text" id="${Constants.ID_CUSTOM_ICON_URL}" class="text_pole" style="flex-grow:1;"
                               placeholder="支持URL、base64编码图片或SVG代码" />
                        <input type="file" id="icon-file-upload" accept="image/*" style="display:none" />
                        <button id="icon-file-button" class="menu_button" style="width:auto;padding:0 10px;">
                            选择文件
                        </button>
                    </div>
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
        const customContent = window.extension_settings[Constants.EXTENSION_NAME].customIconUrl?.trim() || '';
        
        if (!customContent) {
            previewContainer.innerHTML = '<span>(无预览)</span>';
            return;
        }
        
        // 检测内容类型
        if (customContent.startsWith('<svg') && customContent.includes('</svg>')) {
            // 使用DOMParser解析SVG
            const parser = new DOMParser();
            const doc = parser.parseFromString(customContent, 'image/svg+xml');
            const svgElement = doc.documentElement;
            
            if (svgElement && svgElement.tagName === 'svg') {
                // 设置SVG属性
                svgElement.setAttribute('width', '20px');
                svgElement.setAttribute('height', '20px');
                if (!svgElement.getAttribute('viewBox')) {
                    svgElement.setAttribute('viewBox', '0 0 24 24');
                }
                
                // 确保SVG可见
                svgElement.style.width = '20px';
                svgElement.style.height = '20px';
                svgElement.style.display = 'inline-block';
                
                // 添加到预览容器
                previewContainer.appendChild(svgElement);
                console.log(`[${Constants.EXTENSION_NAME}] SVG预览已成功应用`);
            } else {
                previewContainer.innerHTML = '<span>(SVG解析失败)</span>';
                console.warn(`[${Constants.EXTENSION_NAME}] SVG预览解析失败`);
            }
        } 
        else if (customContent.startsWith('data:') || 
                customContent.startsWith('http') || 
                customContent.endsWith('.png') || 
                customContent.endsWith('.jpg') || 
                customContent.endsWith('.svg') ||
                customContent.endsWith('.gif')) {
            // URL或Base64编码的图片
            const img = document.createElement('img');
            img.src = customContent;
            img.style.maxHeight = '20px';
            
            // 添加错误处理
            img.onerror = () => {
                previewContainer.innerHTML = '<span>(图片加载失败)</span>';
            };
            
            previewContainer.appendChild(img);
        } 
        else {
            // 可能是不完整的base64
            if (customContent.includes('base64,')) {
                try {
                    // 提取或组装完整的base64 URL
                    let imgSrc = customContent;
                    
                    // 如果没有data:前缀，尝试添加
                    if (!customContent.startsWith('data:')) {
                        // 尝试检测图片类型
                        let mimeType = 'image/png'; // 默认类型
                        
                        // 尝试从base64字符串推断类型
                        if (customContent.includes('/9j/')) {
                            mimeType = 'image/jpeg';
                        } else if (customContent.includes('iVBOR')) {
                            mimeType = 'image/png';
                        } else if (customContent.includes('PHN2Z')) {
                            mimeType = 'image/svg+xml';
                        }
                        
                        // 如果字符串已包含base64,则提取后半部分
                        if (customContent.includes('base64,')) {
                            imgSrc = 'data:' + mimeType + ';base64,' + customContent.split('base64,')[1];
                        } else {
                            imgSrc = 'data:' + mimeType + ';base64,' + customContent;
                        }
                    }
                    
                    const img = document.createElement('img');
                    img.style.maxHeight = '20px';
                    
                    img.onerror = () => {
                        previewContainer.innerHTML = '<span>(base64格式错误)</span>';
                    };
                    
                    img.onload = () => {
                        console.log(`[${Constants.EXTENSION_NAME}] base64预览加载成功`);
                    };
                    
                    img.src = imgSrc;
                    previewContainer.appendChild(img);
                } catch (err) {
                    console.error(`[${Constants.EXTENSION_NAME}] base64预览错误:`, err);
                    previewContainer.innerHTML = '<span>(格式处理错误)</span>';
                }
            } else {
                previewContainer.innerHTML = '<span>(格式不支持)</span>';
            }
        }
    } else {
        const iconClass = Constants.ICON_CLASS_MAP[iconType] || Constants.ICON_CLASS_MAP[Constants.ICON_TYPES.ROCKET];
        previewContainer.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
    }
}

/**
 * 处理文件上传事件
 * @param {Event} event 文件上传事件
 */
export function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log(`[${Constants.EXTENSION_NAME}] 文件已选择:`, file.name);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const customIconUrl = document.getElementById(Constants.ID_CUSTOM_ICON_URL);
        if (customIconUrl) {
            customIconUrl.value = e.target.result; // 将文件转为base64
            
            // 手动触发输入事件，确保值被正确更新
            const inputEvent = new Event('input', { bubbles: true });
            customIconUrl.dispatchEvent(inputEvent);
            
            // 更新设置
            const settings = window.extension_settings[Constants.EXTENSION_NAME];
            settings.customIconUrl = e.target.result;
            
            // 更新预览
            if (settings.iconType === Constants.ICON_TYPES.CUSTOM) {
                updateIconPreview(Constants.ICON_TYPES.CUSTOM);
            }
            
            // 更新图标显示
            updateIconDisplay();
            
            // 保存设置
            saveSettings();
            
            console.log(`[${Constants.EXTENSION_NAME}] 图标文件已上传并应用`);
        }
    };
    reader.readAsDataURL(file);
}

// 统一处理设置变更的函数
export function handleSettingsChange(event) {
    const target = event.target;
    const settings = window.extension_settings[Constants.EXTENSION_NAME];
    
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
        
        console.log(`[${Constants.EXTENSION_NAME}] 图标类型已更改为: ${iconType}`);
    } 
    else if (target.id === Constants.ID_CUSTOM_ICON_URL) {
        const url = target.value;
        settings.customIconUrl = url;
        
        // 添加调试信息
        console.log(`[${Constants.EXTENSION_NAME}] 自定义图标URL已更新: ${url.substring(0, 30)}...`);
        
        // 检测内容类型并输出调试信息
        if (url.startsWith('<svg')) {
            console.log(`[${Constants.EXTENSION_NAME}] 检测到SVG代码`);
        } else if (url.includes('base64')) {
            console.log(`[${Constants.EXTENSION_NAME}] 检测到base64编码`);
        }
        
        // 如果当前是自定义图标模式，更新预览
        if (settings.iconType === Constants.ICON_TYPES.CUSTOM) {
            updateIconPreview(Constants.ICON_TYPES.CUSTOM);
        }
    } 
    else if (target.id === Constants.ID_COLOR_MATCH_CHECKBOX) {
        const isMatched = target.checked;
        settings.matchButtonColors = isMatched;
    }
    else if (target.id === 'icon-file-upload') {
        // 文件上传由单独函数处理
        return;
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
 * 设置事件监听器
 */
export function setupSettingsEventListeners() {
    console.log(`[${Constants.EXTENSION_NAME}] 设置事件监听器...`);

    // 文件上传监听器
    const fileUpload = document.getElementById('icon-file-upload');
    if (fileUpload) {
        // 移除先前的监听器（如果有）
        fileUpload.removeEventListener('change', handleFileUpload);
        // 添加新的监听器
        fileUpload.addEventListener('change', handleFileUpload);
        // 直接设置onchange属性（备用方案）
        fileUpload.onchange = handleFileUpload;
        console.log(`[${Constants.EXTENSION_NAME}] 文件上传监听器已设置`);
    } else {
        console.warn(`[${Constants.EXTENSION_NAME}] 找不到文件上传元素`);
    }
    
    // 文件选择按钮点击事件
    const fileButton = document.getElementById('icon-file-button');
    if (fileButton) {
        // 添加新的监听器
        fileButton.addEventListener('click', function(event) {
            event.preventDefault();
            console.log(`[${Constants.EXTENSION_NAME}] 文件按钮被点击`);
            const fileInput = document.getElementById('icon-file-upload');
            if (fileInput) {
                fileInput.click();
            } else {
                console.warn(`[${Constants.EXTENSION_NAME}] 找不到文件上传元素`);
            }
        });
        
        // 直接设置onclick属性（备用方案）
        fileButton.onclick = function(e) {
            if (e) e.preventDefault();
            console.log(`[${Constants.EXTENSION_NAME}] 文件按钮被点击 (onclick)`);
            document.getElementById('icon-file-upload')?.click();
        };
        
        console.log(`[${Constants.EXTENSION_NAME}] 文件按钮监听器已设置`);
    } else {
        console.warn(`[${Constants.EXTENSION_NAME}] 找不到文件按钮元素`);
    }
    
    // 自定义图标URL输入框事件
    const customIconUrl = document.getElementById(Constants.ID_CUSTOM_ICON_URL);
    if (customIconUrl) {
        // 移除先前的监听器
        customIconUrl.removeEventListener('input', handleSettingsChange);
        // 添加新的监听器
        customIconUrl.addEventListener('input', handleSettingsChange);
        console.log(`[${Constants.EXTENSION_NAME}] 自定义图标URL输入框监听器已设置`);
    }
}

/**
 * Loads initial settings and applies them.
 */
export function loadAndApplySettings() {
    // 确保设置对象存在并设置默认值
    const settings = window.extension_settings[Constants.EXTENSION_NAME] = window.extension_settings[Constants.EXTENSION_NAME] || {};
    
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
    
    // 设置文件上传事件监听器
    setupSettingsEventListeners();
    
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
