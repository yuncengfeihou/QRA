// ui.js
import * as Constants from './constants.js';
import { handleQuickReplyClick } from './events.js';
import { fetchQuickReplies } from './api.js';
import { sharedState } from './state.js';

// createMenuButton (legacy) remains unchanged...

// createMenuElement remains unchanged...

// createQuickReplyItem remains unchanged...

// createEmptyPlaceholder remains unchanged...

// renderQuickReplies remains unchanged...

/**
 * Updates the visibility of the menu UI and related ARIA attributes based on sharedState.
 */
export function updateMenuVisibilityUI() {
    const { menu, rocketButton } = sharedState.domElements;
    const show = sharedState.menuVisible;

    if (!menu || !rocketButton) return;

    // Apply active class based on visibility BEFORE potentially hiding the menu
    if (show) {
        rocketButton.classList.add('active');
        rocketButton.setAttribute('aria-expanded', 'true');
    } else {
        rocketButton.classList.remove('active');
        rocketButton.setAttribute('aria-expanded', 'false');
    }

    if (show) {
        // Check if core QR is enabled before fetching/showing
        const qrApi = window.quickReplyApi;
        const isQrCoreEnabled = !qrApi || !qrApi.settings || qrApi.settings.isEnabled !== false;

        if (!isQrCoreEnabled) {
            console.log(`[${Constants.EXTENSION_NAME}] Core Quick Reply v2 is disabled. Menu will not show content.`);
            renderQuickReplies([], []); // Show empty lists
            // Optional: display a message in the menu itself
            const emptyMsg = createEmptyPlaceholder('核心 Quick Reply V2 已禁用');
            sharedState.domElements.chatItemsContainer.innerHTML = '';
            sharedState.domElements.globalItemsContainer.innerHTML = '';
            sharedState.domElements.chatItemsContainer.appendChild(emptyMsg);
        } else {
            // Update content before showing
            const { chat, global } = fetchQuickReplies();
            renderQuickReplies(chat, global);
        }


        menu.style.display = 'block';

        // Optional: Focus the first item in the menu for keyboard navigation
        // Wait a tick for display changes to apply before focusing
        setTimeout(() => {
            const firstItem = menu.querySelector(`.${Constants.CLASS_ITEM}`);
            firstItem?.focus();
        }, 0);

    } else {
        menu.style.display = 'none';
    }
}


/**
 * Updates the rocket button's icon and style based on settings.
 * @param {object} settings - The icon settings object { type, value, color, hoverColor, activeColor, size }.
 */
export function updateRocketButtonIcon(settings) {
    const { rocketButton } = sharedState.domElements;
    if (!rocketButton) return;

    // Clear existing content (icons/images)
    rocketButton.innerHTML = '';
    // Remove potentially conflicting classes like fa-solid/fa-rocket if custom icon is used
    rocketButton.classList.remove('fa-solid', 'fa-rocket');

    // --- Apply Icon ---
    try {
        if (settings.type === 'default' || !settings.type) {
            // Add back Font Awesome classes for the default icon
            rocketButton.classList.add('fa-solid', 'fa-rocket');
            // Font Awesome icon size is controlled by font-size property in CSS
        } else if (settings.type === 'svg' && settings.value) {
            // Directly set innerHTML. Be aware of potential XSS if SVG source is untrusted.
            rocketButton.innerHTML = settings.value;
            const svgElement = rocketButton.querySelector('svg');
            if (svgElement) {
                svgElement.style.width = '100%'; // Let button size control SVG via CSS
                svgElement.style.height = '100%';
                svgElement.style.fill = 'currentColor'; // Crucial for color inheritance
                svgElement.setAttribute('aria-hidden', 'true'); // Decorative SVG
            } else {
                 console.warn(`[${Constants.EXTENSION_NAME}] Provided SVG string did not contain a valid <svg> element.`);
                 rocketButton.classList.add('fa-solid', 'fa-question'); // Fallback icon
            }
        } else if (settings.type === 'url' && settings.value) {
            const img = document.createElement('img');
            img.src = settings.value;
            img.alt = 'Quick Reply Menu'; // Accessibility
            img.style.width = '100%'; // Let button size control image via CSS
            img.style.height = '100%';
            img.style.objectFit = 'contain'; // Or 'cover', depending on desired look
             img.onerror = () => {
                 console.warn(`[${Constants.EXTENSION_NAME}] Failed to load image URL: ${settings.value}`);
                 rocketButton.innerHTML = ''; // Clear broken image
                 rocketButton.classList.add('fa-solid', 'fa-image-slash'); // Fallback icon
             };
            rocketButton.appendChild(img);
        } else {
            // Fallback if type is unknown or value is empty for svg/url
            rocketButton.classList.add('fa-solid', 'fa-rocket');
        }
    } catch (error) {
        console.error(`[${Constants.EXTENSION_NAME}] Error applying icon:`, error);
        rocketButton.innerHTML = ''; // Clear potentially broken content
        rocketButton.classList.add('fa-solid', 'fa-circle-exclamation'); // Error fallback icon
    }

    // --- Apply Colors and Size using CSS Variables ---
    // We use CSS variables scoped to the button itself.
    rocketButton.style.setProperty('--qs-icon-color', settings.color || '#a0a0a0');
    rocketButton.style.setProperty('--qs-icon-hover-color', settings.hoverColor || '#ffffff');
    rocketButton.style.setProperty('--qs-icon-active-color', settings.activeColor || '#55aaff');
    rocketButton.style.setProperty('--qs-icon-size', settings.size || '1.2em'); // Apply size

    // Force redraw if needed (might not be necessary)
    // void rocketButton.offsetWidth;
}
