// constants.js

export const EXTENSION_NAME = "quick-reply-menu";

// --- DOM Element IDs ---
export const ID_BUTTON = 'quick-reply-menu-button'; // 保留用于向后兼容
export const ID_ROCKET_BUTTON = 'quick-reply-rocket-button'; // 新的火箭按钮ID
export const ID_MENU = 'quick-reply-menu';
export const ID_CHAT_LIST_CONTAINER = 'chat-quick-replies';
export const ID_GLOBAL_LIST_CONTAINER = 'global-quick-replies';
export const ID_CHAT_ITEMS = 'chat-qr-items';
export const ID_GLOBAL_ITEMS = 'global-qr-items';
export const ID_SETTINGS_CONTAINER = `${EXTENSION_NAME}-settings`;
export const ID_SETTINGS_ENABLED_DROPDOWN = `${EXTENSION_NAME}-enabled`;

// --- CSS Classes ---
export const CLASS_MENU_CONTAINER = 'quick-reply-menu-container';
export const CLASS_LIST = 'quick-reply-list';
export const CLASS_LIST_TITLE = 'quick-reply-list-title';
export const CLASS_ITEM = 'quick-reply-item';
export const CLASS_EMPTY = 'quick-reply-empty';

// --- ARIA ---
export const ARIA_ROLE_MENU = 'menu';
export const ARIA_ROLE_GROUP = 'group';
export const ARIA_ROLE_MENUITEM = 'menuitem';

// constants.js

export const EXTENSION_NAME = "quick-reply-menu";

// --- DOM Element IDs ---
export const ID_BUTTON = 'quick-reply-menu-button'; // 保留用于向后兼容
export const ID_ROCKET_BUTTON = 'quick-reply-rocket-button'; // 新的火箭按钮ID
export const ID_MENU = 'quick-reply-menu';
export const ID_CHAT_LIST_CONTAINER = 'chat-quick-replies';
export const ID_GLOBAL_LIST_CONTAINER = 'global-quick-replies';
export const ID_CHAT_ITEMS = 'chat-qr-items';
export const ID_GLOBAL_ITEMS = 'global-qr-items';
export const ID_SETTINGS_CONTAINER = `${EXTENSION_NAME}-settings`;
export const ID_SETTINGS_ENABLED_DROPDOWN = `${EXTENSION_NAME}-enabled`;

// --- 新增：设置面板中的图标相关 ID ---
export const ID_SETTINGS_ICON_BUTTON = `${EXTENSION_NAME}-icon-change-button`;
export const ID_SETTINGS_ICON_INPUT = `${EXTENSION_NAME}-icon-file-input`;
export const ID_SETTINGS_ICON_RESET_BUTTON = `${EXTENSION_NAME}-icon-reset-button`;
export const ID_SETTINGS_ICON_PREVIEW = `${EXTENSION_NAME}-icon-preview`;
// --- 新增结束 ---


// --- CSS Classes ---
export const CLASS_MENU_CONTAINER = 'quick-reply-menu-container';
export const CLASS_LIST = 'quick-reply-list';
export const CLASS_LIST_TITLE = 'quick-reply-list-title';
export const CLASS_ITEM = 'quick-reply-item';
export const CLASS_EMPTY = 'quick-reply-empty';

// --- 新增：用于区分图标类型的 CSS 类 (在 index.js 中添加/删除) ---
export const CLASS_ICON_DEFAULT = 'default-icon';
export const CLASS_ICON_SVG = 'custom-svg-icon';
export const CLASS_ICON_PNG = 'custom-png-icon';
