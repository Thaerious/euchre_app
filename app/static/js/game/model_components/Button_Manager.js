import registerButtons from "../register_buttons.js"

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
 *   const actionManager = new ButtonManager();
 *   actionManager.on("continue", () => {
 *       // Handle the continue action.
 *   });
 */

export default class ButtonManager {
    /**
     * Creates an instance of ButtonManager.
     * @param {string} elementID - The CSS selector for the container holding the action buttons.
     */
    constructor(elementID, eventSource, settings = { dataFieldID: "event" }) {
        this.container = document.getElementById(elementID);
        this.buttons = document.querySelectorAll(`#${elementID} > *`)
        this.eventSource = eventSource
        this.dataFieldID = settings.dataFieldID // the data field used to identify the button
        registerButtons(this.container, eventSource)
    }

    /**
     * Sets up the action buttons in the container based on the provided button data.
     * Each button will emit an event when clicked, based on its data-action attribute.
     *
     * @param {Array<Object>} buttonData - Array of button configuration objects.
     * Each object can have the following properties:
     *   - name {string}: The label for the button.
     *   - action {string} (optional): Custom event name to emit; defaults to the lowercased button name.
     *   - disable {boolean} (optional): If true, the button will be is-disabled upon creation.
     */
    showButtons(...buttonNames) {
        buttonNames = buttonNames.flat()

        // Hide all existing buttons
        for (let button of this.buttons) {
            let id = button.dataset[this.dataFieldID]

            if (buttonNames.indexOf(id) == -1) {
                button.classList.add("is_hidden")
            }
            else {
                button.classList.remove("is_hidden")
            }
        }
    }

    hideButtons() {
        for (let button of this.buttons) {
            button.classList.add("is_hidden")
        }
    }

    enableAll() {
        this.disable([])
    }

    disable(...buttonNames) {
        buttonNames = buttonNames.flat()

        // Hide all existing buttons
        for (let button of this.buttons) {
            let id = button.dataset[this.dataFieldID]

            if (buttonNames.indexOf(id) == -1) {
                button.classList.remove("is-disabled")
            }
            else {
                button.classList.add("is-disabled")
            }
        }
    }

    get selected() {
        const selected = []
        this.buttons.forEach(button => {
            if (button.classList.contains("selected")) {
                selected.push(button)
            }
        });
        return selected
    }

    clearSelected() {
        this.buttons.forEach(button => button.classList.remove("selected"));
    }

    /**
     * Hides the action button container by adding the "is_hidden" class.
     */
    hideContainer() {
        this.container.classList.add("is_hidden");
    }

    /**
     * Shows the action button container by removing the "is_hidden" class.
     */
    showContainer() {
        this.container.classList.remove("is_hidden");
    }
}