class CountdownButton extends HTMLElement {
    constructor() {
        super()
        this.time = 0
        this.attachShadow({ mode: 'open' });
        this._ready = this.load() // store the promise from load
    }

    async load() {
        const wrapper = document.createElement("div");
        wrapper.classList.add("countdown-wrapper");

        // Content div
        const slot = document.createElement("slot");

        // Timer div
        this.timer = document.createElement("div");
        this.timer.classList.add("countdown-timer");
        this.timer.textContent = this.getAttribute("timeout")

        wrapper.appendChild(slot);
        wrapper.appendChild(this.timer);

        this.shadowRoot.appendChild(wrapper);
        this.appendStyle()
        this.addObserver()
    }

    countdown() {
        const tick = () => {
            this.timer.textContent = this.time;

            if (this.time <= 0) {
                this.dispatchEvent(new Event("click"));
                return;
            }            

            this.time -= 1;
            this._timeout = setTimeout(tick, 1000);
        };
    
        clearTimeout(this._timeout);
        tick();
    }
    
    connectedCallback() {
        this.addEventListener("click", () => {
            clearTimeout(this._timeout);
        });
    }

    addObserver() {
        const observer = new MutationObserver(mutations => {
            for (const m of mutations) {
                if (m.attributeName === "class") {
                    const wasHidden = m.oldValue?.includes("hidden");
                    const isNowHidden = m.target.classList.contains("hidden");
                    
                    if (wasHidden && !isNowHidden) {
                        this.time = parseInt(this.getAttribute("timeout"))
                        this.timer.textContent = this.getAttribute("timeout")
                        this.countdown()
                    }
                    if (!wasHidden && isNowHidden) {
                        clearTimeout(this._timeout);
                    }                    
                }
            }
        });

        observer.observe(this, {
            attributes: true,
            attributeFilter: ["class"],
            attributeOldValue: true
        });
    }

    appendStyle() {
        const link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", "/static/css/countdown_button.css"); // adjust path
        this.shadowRoot.appendChild(link);
    }
}

customElements.define('countdown-button', CountdownButton);