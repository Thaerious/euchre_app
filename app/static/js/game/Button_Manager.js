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
    constructor(elementID, eventSource, settings = {dataFieldID : "event"}) {
        this.container = document.getElementById(elementID);
        this.buttons = document.querySelectorAll(`#${elementID} > *`)
        this.eventSource = eventSource
        this.dataFieldID = settings.dataFieldID // the data field used to identify the button

        for (let button of this.buttons) {
            if (button.getAttribute("selectable") != null) {
                button.addEventListener("click", () => {
                    this.clearSelected();
                    button.classList.add("selected");
                    this.eventSource.emit(button.dataset.event, button.dataset);
                });
            }
            else {
                // When the button is clicked, emit the event defined in its data-action attribute.
                button.addEventListener("click", () => {
                    this.eventSource.emit(button.dataset.event, button.dataset);
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
    showButtons(...buttonNames) {
        buttonNames = buttonNames.flat()

        // Hide all existing buttons
        for (let button of this.buttons) {     
            let id = button.dataset[this.dataFieldID]  

            if (buttonNames.indexOf(id) == -1) {
                button.classList.add("is-hidden")
            }
            else {
                button.classList.remove("is-hidden")
            }
        }
    }

    hideButtons() {
        for (let button of this.buttons) {
            button.classList.add("is-hidden")
        }
    }

    disable(...buttonNames) {
        buttonNames = buttonNames.flat()

        // Hide all existing buttons
        for (let button of this.buttons) {
            let id = button.dataset[this.dataFieldID]            

            if (buttonNames.indexOf(id) == -1) {
                button.classList.remove("disabled")
            }
            else {
                console.log(id)
                button.classList.add("disabled")
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
     * Hides the action button container by adding the "is-hidden" class.
     */
    hideContainer() {
        this.container.classList.add("is-hidden");
    }

    /**
     * Shows the action button container by removing the "is-hidden" class.
     */
    showContainer() {
        this.container.classList.remove("is-hidden");        
    }
}
