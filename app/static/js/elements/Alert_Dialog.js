class AlertDialog extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        const res = await fetch('/elements/alert_dialog.html');
        const html = await res.text();
        this.shadowRoot.innerHTML = html;

        this.okButton = this.shadowRoot.querySelector("#ok-button")
        this.textArea = this.shadowRoot.querySelector("#text-area")
    }

    async show(message) {
        this.classList.remove("hidden")
        this.textArea.textContent = message

        return new Promise((resolve, _) => {
            this.okButton.addEventListener("click", () => {
                this.classList.add("hidden");
                resolve();
            }, { once: true });
        })
    }
}

customElements.define('alert-dialog', AlertDialog);