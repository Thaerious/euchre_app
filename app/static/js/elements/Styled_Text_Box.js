
class StyledTextBox extends HTMLElement {
    constructor() {
        super()

        // Style the outer text box
        this.classList.add('ui-panel', 'default');

        // Create inner editable div
        this.innerDiv = document.createElement('input');
        const type = this.getAttribute('type') ?? "text"        
        this.innerDiv.setAttribute('type', type);
        const placeholder = this.getAttribute('placeholder') ?? "";
        this.innerDiv.setAttribute('placeholder', placeholder);
        this.innerDiv.classList.add('ui-textbox');
        this.innerDiv.setAttribute('contenteditable', 'true');

        // Attach inner and hint to outer
        this.appendChild(this.innerDiv)
    }
}

customElements.define('styled-textbox', StyledTextBox);