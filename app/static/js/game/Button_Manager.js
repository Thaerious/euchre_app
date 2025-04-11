/**
 * ButtonManager
 * -------------------
 * Manages a set of action buttons within a specified container.
 *
 * This class extends EventEmitter and is responsible for dynamically creating and managing
 * action buttons. When a button is clicked, it emits an event corresponding to the button's
 * "data-action" attribute (for example, "continue", "pass", etc.).
 *
 * Events:
 * - Emits an event with the name defined by the button's data-action attribute when clicked.
 *
 * Usage:
 *   const actionManager = new ActionButtonManager();
 *   actionManager.on("continue", () => {
 *       // Handle the continue action.
 *   });
 */

import EventEmitter from "../modules/Event_Emitter.js";

export default class ButtonManager extends EventEmitter {
    /**
     * Creates an instance of ActionButtonManager.
     * @param {string} elementID - The CSS selector for the container holding the action buttons.
     */
    constructor(elementID) {
        super();
        this.container = document.getElementById(elementID);
        this.buttons = document.querySelectorAll(`#${elementID} > button`)

        for (let button of this.buttons) {
            if (button.getAttribute("selectable") != null) {
                button.addEventListener("click", () => {
                    this.clearSelected();
                    button.classList.add("selected");
                    this.emit(button.dataset.event, button.dataset);
                });
            }
            else {
                // When the button is clicked, emit the event defined in its data-action attribute.
                button.addEventListener("click", () => {
                    this.emit(button.dataset.event, button.dataset);
                });
            }
        }
    }

    /**
     * Sets up the action buttons in the container based on the provided button data.
     * Each button will emit an event when clicked, based on its data-action attribute.
     *
     * @param {Array<Object>} buttonData - Array of button configuration objects.
     * Each object can have the following properties:
     *   - name {string}: The label for the button.
     *   - action {string} (optional): Custom event name to emit; defaults to the lowercased button name.
     *   - disable {boolean} (optional): If true, the button will be disabled upon creation.
     */
    showButtons(buttonNames) {
        // Hide all existing buttons
        for (let button of this.buttons) {     
            const id = button.id ?? button.dataset.event

            if (buttonNames.indexOf(id) == -1) {
                button.classList.add("hidden")
            }
            else {
                button.classList.remove("hidden")
            }
        }

        this.show();
    }

    disable(buttonNames) {
        // Hide all existing buttons
        for (let button of this.buttons) {     
            const id = button.id ?? button.dataset.event            

            if (buttonNames.indexOf(id) == -1) {
                button.classList.remove("disabled")
            }
            else {
                console.log(id)
                button.classList.add("disabled")
            }
        }
    }

    clearSelected() {
        this.buttons.forEach(button => button.classList.remove("selected"));
    }

    /**
     * Hides the action button container by adding the "is-hidden" class.
     */
    hide() {
        this.container.classList.add("is-hidden");
    }

    /**
     * Shows the action button container by removing the "is-hidden" class.
     */
    show() {
        this.clearSelected()
        this.container.classList.remove("is-hidden");        
    }
}
