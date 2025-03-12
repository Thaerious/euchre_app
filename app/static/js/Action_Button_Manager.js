/**
 * ActionButtonManager
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

import EventEmitter from "./modules/Event_Emitter.js";

export default class ActionButtonManager extends EventEmitter {
    /**
     * Creates an instance of ActionButtonManager.
     * @param {string} elementID - The CSS selector for the container holding the action buttons.
     */
    constructor(elementID = "action-button-container") {
        super();
        this.container = document.getElementById(elementID);
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
     * 
     * Usage:
     *   this.actionButtons.setButtons([
     *      { "name": "Pass" },
     *      { "name": "Make", "action": "do_make", "disable": true },
     *      { "name": "Alone", "disable": true },
     *   ])
     */
    setButtons(buttonData) {
        // Clear any existing buttons
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }

        // Create and set up new buttons
        for (const data of buttonData) {
            const button = document.createElement('button');
            button.id = `button_${data.name}`;
            button.classList.add("default-button", "action_button", "normal-font");
            button.innerText = data.name;
            data.action = data.action ?? data.name.toLowerCase();
            button.setAttribute("data-action", data.action);
            this.container.appendChild(button);

            if (data.disable) {
                this.disable(data.name);
            }

            // When the button is clicked, emit the event defined in its data-action attribute.
            button.addEventListener("click", () => {
                this.emit(button.getAttribute("data-action"));
            });
        }

        this.show();
    }

    /**
     * Disables the button with the given name by adding a "disabled" class.
     * @param {string} name - The name of the button to disable.
     */
    disable(name) {
        this.container.querySelector(`#button_${name}`)?.classList.add("disabled");
    }

    /**
     * Enables all buttons in the container by removing the "disabled" class from each.
     */
    enableAll() {
        const buttons = this.container.querySelectorAll("button");
        for (const button of buttons) {
            button.classList.remove("disabled");
        }        
    }

    /**
     * Enables the button with the given name by removing its "disabled" class.
     * @param {string} name - The name of the button to enable.
     */
    enable(name) {
        this.container.querySelector(`#button_${name}`)?.classList.remove("disabled");
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
        this.container.classList.remove("is-hidden");
    }
}
