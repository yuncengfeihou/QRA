// public/extensions/third-party/my-favorites-plugin/index.js
import { getContext, renderExtensionTemplateAsync } from "../../../extensions.js"; // 确保导入了需要的函数

// 定义插件文件夹名称 (!!! 确保这个名称与你的实际文件夹名称完全一致 !!!)
const pluginFolderName = 'my-favorites-plugin';
const logPrefix = `[${pluginFolderName}]`; // 日志前缀，方便过滤

// --- 消息按钮 HTML 定义 ---
// 给按钮一个更具体的类名，避免与其他插件冲突
const messageButtonHtml = `
    <div class="mes_button ${pluginFolderName}-favorite-icon" title="消息操作 (来自 ${pluginFolderName})">
        <i class="fa-solid fa-flag"></i> <!-- 示例：使用 Font Awesome 图标 -->
    </div>
`;

// --- 主入口函数 ---
jQuery(async () => {
    console.log(`${logPrefix} DOM Ready. 开始初始化插件...`);

    // --- 1. 注入到扩展页面 ---
    try {
        console.log(`${logPrefix} [Settings UI] 开始注入设置 UI...`);
        const settingsTemplateName = 'settings_display'; // 模板名称，不带 .html
        console.log(`${logPrefix} [Settings UI] 准备加载模板: third-party/${pluginFolderName}/${settingsTemplateName}`);

        // 加载 HTML 模板内容
        const settingsHtml = await renderExtensionTemplateAsync(`third-party/${pluginFolderName}`, settingsTemplateName);
        console.log(`${logPrefix} [Settings UI] 模板加载成功.`);

        // 检查目标容器是否存在
        const settingsTargetSelector = '#extensions_settings'; // '#translation_container' 或 '#extensions_settings' - 根据你的 ST 版本调整
        const $settingsTarget = $(settingsTargetSelector);

        if ($settingsTarget.length > 0) {
            console.log(`${logPrefix} [Settings UI] 找到目标容器: ${settingsTargetSelector}`);
            $settingsTarget.append(settingsHtml);
            console.log(`${logPrefix} [Settings UI] 已将设置 UI 追加到 ${settingsTargetSelector}`);

            // 为设置 UI 中的按钮添加事件监听器
            const actionButtonSelector = '#my-plugin-action-button';
            $(document).on('click', actionButtonSelector, () => { // 使用事件委托更安全
                console.log(`${logPrefix} [Settings UI] Action button clicked!`);
                alert('您点击了插件设置中的按钮！');
                try {
                    // 尝试获取上下文，只在需要时调用
                    // const context = getContext();
                    // console.log(`${logPrefix} [Settings UI] 当前角色 ID:`, context.characterId);
                } catch (contextError) {
                    console.error(`${logPrefix} [Settings UI] 获取上下文时出错:`, contextError);
                }
            });
            console.log(`${logPrefix} [Settings UI] 已为按钮 ${actionButtonSelector} 设置点击监听器.`);

        } else {
            console.warn(`${logPrefix} [Settings UI] 未找到目标容器: ${settingsTargetSelector}. 设置 UI 未注入.`);
        }

    } catch (error) {
        console.error(`${logPrefix} [Settings UI] 注入设置 UI 时发生错误:`, error);
        // 检查是否是模板加载错误
        if (error.message.includes('Error rendering template')) {
             console.error(`${logPrefix} [Settings UI] **模板加载失败!** 请检查:`);
             console.error(`  1. 文件夹名称 '${pluginFolderName}' 是否正确?`);
             console.error(`  2. 模板文件 'public/extensions/third-party/${pluginFolderName}/settings_display.html' 是否存在?`);
             console.error(`  3. 调用 renderExtensionTemplateAsync 时模板名称是否写成了 'settings_display.html' (错误) 而不是 'settings_display' (正确)?`);
        }
    }
    console.log(`${logPrefix} [Settings UI] 设置 UI 注入流程结束.`);
    // --- 设置注入结束 ---


    // --- 2. 注入到输入区域右侧 ---
    try {
        console.log(`${logPrefix} [Input Button] 开始注入输入区按钮...`);
        const inputButtonTemplateName = 'input_button';
        console.log(`${logPrefix} [Input Button] 准备加载模板: third-party/${pluginFolderName}/${inputButtonTemplateName}`);

        // 加载按钮 HTML
        const inputButtonHtml = await renderExtensionTemplateAsync(`third-party/${pluginFolderName}`, inputButtonTemplateName);
        console.log(`${logPrefix} [Input Button] 模板加载成功.`);

        // 检查目标容器是否存在
        const inputTargetSelector = '#data_bank_wand_container';
        const $inputTarget = $(inputTargetSelector);

        if ($inputTarget.length > 0) {
            console.log(`${logPrefix} [Input Button] 找到目标容器: ${inputTargetSelector}`);
            $inputTarget.append(inputButtonHtml);
            console.log(`${logPrefix} [Input Button] 已将按钮追加到 ${inputTargetSelector}`);

            // 为按钮绑定点击事件 (使用 ID 选择器，确保 ID 唯一)
            const inputButtonId = '#my_plugin_input_button'; // HTML 中的 ID
            $(document).on('click', inputButtonId, () => { // 使用事件委托
                console.log(`${logPrefix} [Input Button] Input area button clicked!`);
                alert('您点击了输入框旁边的插件按钮！');
            });
            console.log(`${logPrefix} [Input Button] 已为按钮 ${inputButtonId} 设置点击监听器.`);

        } else {
            console.warn(`${logPrefix} [Input Button] 未找到目标容器: ${inputTargetSelector}. 输入区按钮未注入.`);
        }

    } catch (error) {
        console.error(`${logPrefix} [Input Button] 注入输入区按钮时发生错误:`, error);
        // 检查是否是模板加载错误 (与上面类似)
        if (error.message.includes('Error rendering template')) {
             console.error(`${logPrefix} [Input Button] **模板加载失败!** 请检查路径、文件名和调用参数。`);
        }
    }
    console.log(`${logPrefix} [Input Button] 输入区按钮注入流程结束.`);
    // --- 输入按钮注入结束 ---


    // --- 3. 向每条消息注入按钮 ---
    try {
        console.log(`${logPrefix} [Message Button] 开始处理消息按钮...`);
        const messageButtonTargetSelector = '.extraMesButtons'; // 目标容器的类名
        const messageButtonClass = `${pluginFolderName}-favorite-icon`; // 我们按钮的特定类名

        // 将按钮追加到所有 *当前* 存在的消息额外按钮容器中
        const $existingTargets = $(messageButtonTargetSelector);
        if ($existingTargets.length > 0) {
            $existingTargets.append(messageButtonHtml);
            console.log(`${logPrefix} [Message Button] 已将按钮添加到 ${$existingTargets.length} 个现有的 ${messageButtonTargetSelector} 容器中.`);
        } else {
            console.log(`${logPrefix} [Message Button] 加载时未找到现有的 ${messageButtonTargetSelector} 容器 (这可能是正常的).`);
        }

        // 使用事件委托为 *所有* 消息按钮（包括未来的）绑定点击事件
        // 在 document 上监听点击事件，但只处理源自我们特定类名的点击
        $(document).on('click', `.${messageButtonClass}`, function(event) {
            // 'this' 指向被点击的按钮元素 (是 DOM 元素，不是 jQuery 对象)
            console.log(`${logPrefix} [Message Button] Message button clicked!`);
            alert('您点击了消息上的插件按钮！');

            try {
                // 获取这条消息的 ID
                const $messageContainer = $(this).closest('.mes'); // 查找最近的祖先消息容器元素
                if ($messageContainer.length > 0) {
                    const messageId = $messageContainer.attr('mesid');
                    if (messageId) {
                        console.log(`${logPrefix} [Message Button] 点击了消息 ID: ${messageId} 上的按钮`);
                        // const context = getContext();
                        // const message = context.chat.find(msg => String(msg.id) === messageId); // ID 可能是字符串
                        // if (message) console.log(`${logPrefix} [Message Button] 消息内容片段:`, message.mes.substring(0, 50) + '...');
                    } else {
                        console.warn(`${logPrefix} [Message Button] 找到了 .mes 容器，但未能读取 mesid 属性.`);
                    }
                } else {
                    console.warn(`${logPrefix} [Message Button] 未能找到包含按钮的 .mes 父容器.`);
                }
            } catch (error) {
                console.error(`${logPrefix} [Message Button] 在处理消息按钮点击时出错:`, error);
            }

            // (可选) 阻止事件进一步冒泡 (通常不需要，除非有冲突)
            // event.stopPropagation();
        });
        console.log(`${logPrefix} [Message Button] 已为 .${messageButtonClass} 设置事件委托.`);

    } catch(error) {
        console.error(`${logPrefix} [Message Button] 添加消息按钮或设置事件委托时失败:`, error);
    }
    console.log(`${logPrefix} [Message Button] 消息按钮处理流程结束.`);
    // --- 消息按钮注入结束 ---

    console.log(`${logPrefix} 插件初始化流程完成.`);
});

// --- 确保在 jQuery 外没有执行依赖 DOM 的代码 ---
console.log(`${logPrefix} index.js 文件已加载.`);
