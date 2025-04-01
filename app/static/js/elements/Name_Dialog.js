class NameDialog extends HTMLElement {
    constructor() {
        super()
        this.usernameText = document.querySelector("#username_txt")
        this.okButton = document.querySelector("#ok_button")

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
    }

    async show(current = "") {
        this.classList.remove("hidden")
        this.usernameText.value = current

        if (current !== "") {
            this.okButton.classList.remove("disabled")            
        }
        else {
            this.okButton.classList.add("disabled")
        }

        return new Promise((resolve, _) => {
            this.okButton.addEventListener("click", () => {
                this.classList.add("hidden");
                resolve(this.usernameText.value); // Resolving with the entered username.
            }, { once: true });            
        })
    }
}

customElements.define('name-dialog', NameDialog);