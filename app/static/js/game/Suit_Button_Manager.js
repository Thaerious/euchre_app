/**
 * SuitButtonManager
 * -----------------
 * Manages a set of suit selection buttons.
 *
 * This class extends EventEmitter and is responsible for handling UI
 * interactions with suit buttons in the container element.
 *
 * Events:
 * - "change": Emitted when a suit button is clicked. The event payload is the selected suit.
 * 
 * Usage:
 *   const suitManager = new SuitButtonManager();
 *   suitManager.on("change", suit => {
 *       console.log("Selected suit:", suit);
 *   });
 */

import EventEmitter from "../modules/Event_Emitter.js";

export default class SuitButtonManager extends EventEmitter {
    /**
     * Creates an instance of SuitButtonManager.
     * @param {string} elementID - The CSS selector for the container holding the suit buttons.
     */
    constructor(elementID = "suit-button-container") {
        super();
        this.container = document.getElementById(elementID)

        if (!this.container) {
            console.error(`SuitButtonManager: Container with ID '${elementID}' not found.`);
            return;
        }

        const buttons = this.container.querySelectorAll("button");
    
        // Attach click event listeners to all suit buttons.
        for (const button of buttons) {
            button.addEventListener("click", () => {
                this.clear();
                button.classList.add("selected");
                this.emit("change", this.getSuit());
            });
        }        
    }

    /**
     * Retrieves the currently selected suit.
     * @returns {string|null} The inner text of the selected suit button, or null if none is selected.
     */
    getSuit() {
        const buttons = this.container.querySelectorAll("button");
        for (const button of buttons) {
            if (button.classList.contains("selected")) {
                return button.innerText;
            }            
        }
        return null;
    }

    /**
     * Clears the selection from all suit buttons.
     */
    clear() {
        const buttons = this.container.querySelectorAll("button");
        buttons.forEach(button => button.classList.remove("selected"));
    }

    /**
     * Disables the suit button corresponding to the specified suit.
     * @param {string} suit - The suit to disable (should match the button's ID suffix, e.g., "hearts").
     */
    disable(suit) {
        const button = this.container.querySelector(`#suit_${suit}`);
        if (button) {
            button.classList.add("disabled");
        }
    }

    /**
     * Hides the suit button container.
     */
    hide() {
        this.container.classList.add("is-hidden");
    }

    /**
     * Clears any selection and shows the suit button container.
     */
    show() {
        this.clear();
        this.container.classList.remove("is-hidden");
    }    
}
