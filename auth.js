/**
 * LearnEnglish Security & Session Module
 * Protects application against DOM XSS and safely manages state.
 */
const SecurityEngine = (() => {
    'use strict';

    // Freeze object configuration to prevent prototype pollution tampering
    const config = Object.freeze({
        maxScore: 100,
        allowedElements: []
    });

    /**
     * Secures and sanitizes strings to prevent XSS (Cross-Site Scripting)
     * @param {string} input 
     * @returns {string} Clean, safe text
     */
    const sanitizeHTML = (input) => {
        if (typeof input !== 'string') return '';
        return input.replace(/[&<>"']/g, (match) => {
            const tempMap = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;'
            };
            return tempMap[match];
        });
    };

    /**
     * Validates quiz data structurally before processing execution
     */
    const validateQuizState = (index, total) => {
        if (typeof index !== 'number' || typeof total !== 'number') {
            console.error("Security Alert: Invalid state data type tracking.");
            return false;
        }
        return index <= total;
    };

    return {
        sanitize: sanitizeHTML,
        validateState: validateQuizState
    };
})();

// Initialize application state safely when window loads
window.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const mainContent = document.getElementById('main-content');

    startBtn.addEventListener('click', () => {
        // Smooth visual transition out
        welcomeOverlay.style.opacity = '0';
        setTimeout(() => {
            welcomeOverlay.classList.add('hidden');
            mainContent.classList.remove('hidden');
            mainContent.style.opacity = '1';
        }, 500);
    });
});
