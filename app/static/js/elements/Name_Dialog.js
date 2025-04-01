class NameDialog extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' });        
    }

    async connectedCallback() {
        const res = await fetch('/elements/name_dialog.html');
        const html = await res.text();
        this.shadowRoot.innerHTML = html;

        this.usernameText = this.shadowRoot.querySelector("#username_txt")
        this.okButton = this.shadowRoot.querySelector("#ok-button")

        // Set focus to start button when enter is pressed on name textbox
        this.usernameText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.okButton.focus()
            }
        });

        // Enable the ok button when there is text in the username input
        this.usernameText.addEventListener("input", () => {
            const username = this.usernameText.value.trim()
            if (username === "") this.okButton.classList.add("disabled")
            else this.okButton.classList.remove("disabled")
        });           
        
        // Hide dialog when OK is pressed
        this.okButton.addEventListener("click", () => {
            this.classList.add("hidden");
        })

        this.updateControls()
    }

    updateControls() {
        if (this.usernameText.value !== "") {
            this.okButton.classList.remove("disabled")            
        }
        else {
            this.okButton.classList.add("disabled")
        }        
    }

    async show(current = "") {
        this.classList.remove("hidden")
        this.usernameText.value = current
        this.updateControls()

        return new Promise((resolve, _) => {
            this.okButton.addEventListener("click", () => {
                resolve(this.usernameText.value); // Resolving with the entered username.
            }, { once: true });            
        })
    }
}

customElements.define('name-dialog', NameDialog);