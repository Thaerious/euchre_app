
export default function registerButtons(element, eventSource) {
    const buttons = element.querySelectorAll(".ui-button")

    for (let button of buttons) {
        if (button.getAttribute("selectable") != null) {
            button.addEventListener("click", () => {
                buttons.forEach(button => button.classList.remove("selected"));
                button.classList.add("selected");
                eventSource.emit(button.dataset.event, button.dataset);
            });
        }
        else {
            // When the button is clicked, emit the event defined in its data-action attribute.
            button.addEventListener("click", () => {
                eventSource.emit(button.dataset.event, button.dataset);
            });
        }
    }
}