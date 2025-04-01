class AlertDialog extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' });
        this._ready = this.load() // store the promise from load
    }

    async load() {
        const res = await fetch('/elements/alert_dialog.html');
        const html = await res.text();
        const template = document.createElement('template');
        template.innerHTML = html;
        this.shadowRoot.appendChild(template.content.cloneNode(true));
      
        this.okButton = this.shadowRoot.querySelector("#ok-button");
        this.textArea = this.shadowRoot.querySelector("#text-area");
      }

    async show(message) {
        await this._ready; // ensures DOM is ready before using it
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