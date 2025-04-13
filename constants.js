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

// --- New IDs for Icon Settings ---
export const ID_CUSTOMIZE_ICON_BUTTON = `${EXTENSION_NAME}-customize-icon-button`;
export const ID_ICON_SETTINGS_MODAL = `${EXTENSION_NAME}-icon-settings-modal`;
export const ID_ICON_TYPE_SELECT = `${EXTENSION_NAME}-icon-type`;
export const ID_ICON_SVG_INPUT_CONTAINER = `${EXTENSION_NAME}-icon-svg-container`;
export const ID_ICON_SVG_INPUT = `${EXTENSION_NAME}-icon-svg`;
export const ID_ICON_URL_INPUT_CONTAINER = `${EXTENSION_NAME}-icon-url-container`;
export const ID_ICON_URL_INPUT = `${EXTENSION_NAME}-icon-url`;
export const ID_ICON_SETTINGS_SAVE = `${EXTENSION_NAME}-icon-settings-save`;
export const ID_ICON_SETTINGS_CLOSE = `${EXTENSION_NAME}-icon-settings-close`;
export const ID_ICON_PREVIEW = `${EXTENSION_NAME}-icon-preview`; // 新增预览区域 ID
export const ID_ICON_COLOR_PICKER = `${EXTENSION_NAME}-icon-color`; // 新增颜色选择器 ID
export const ID_ICON_HOVER_COLOR_PICKER = `${EXTENSION_NAME}-icon-hover-color`; // 新增悬停颜色选择器 ID
export const ID_ICON_ACTIVE_COLOR_PICKER = `${EXTENSION_NAME}-icon-active-color`; // 新增激活颜色选择器 ID

// --- CSS Classes ---
export const CLASS_MENU_CONTAINER = 'quick-reply-menu-container';
export const CLASS_LIST = 'quick-reply-list';
export const CLASS_LIST_TITLE = 'quick-reply-list-title';
export const CLASS_ITEM = 'quick-reply-item';
export const CLASS_EMPTY = 'quick-reply-empty';
// --- New Classes for Icon Settings ---
export const CLASS_ICON_SETTINGS_MODAL = 'qs-icon-settings-modal'; // 使用前缀避免冲突
export const CLASS_ICON_SETTINGS_BACKDROP = 'qs-icon-settings-backdrop';
export const CLASS_ICON_SETTINGS_CONTENT = 'qs-icon-settings-content';
export const CLASS_ICON_SETTINGS_FIELD = 'qs-icon-settings-field';
export const CLASS_ICON_SETTINGS_PREVIEW = 'qs-icon-settings-preview'; // 预览区域样式

// --- ARIA ---
export const ARIA_ROLE_MENU = 'menu';
export const ARIA_ROLE_GROUP = 'group';
export const ARIA_ROLE_MENUITEM = 'menuitem';
export const ARIA_ROLE_DIALOG = 'dialog';
