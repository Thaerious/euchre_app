class InfoButton extends HTMLElement {
    constructor() {
        super()

        this.infoText = this.parentElement.querySelector(".info-text")
        this.gameBoard = document.querySelector("#game-board")

        this.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        this.addEventListener('mousedown', (e) => {
            this.parentElement.classList.add('no-active');
        });

        this.addEventListener('mouseup', () => {
            this.parentElement.classList.remove('no-active');
        });

        this.addEventListener('click', (e) => {
            e.stopPropagation();

            // Position text based on the info button's position.
            const rect = this.getBoundingClientRect();
            this.infoText.style.position = 'fixed';
            this.infoText.style.left = `${rect.right}px`;
            this.infoText.style.top = `${rect.bottom}px`;
            this.infoText.style.transform = 'translate(-100%, -100%)';        

            this.infoText?.classList.add("show")
            this.gameBoard.appendChild(this.infoText);
        });

        this.infoText?.addEventListener("mouseleave", ()=> {
            this.infoText?.classList.remove("show")
        });

        this.infoText?.addEventListener("click", ()=> {
            this.infoText?.classList.remove("show")
        });        
    }
}

customElements.define('info-button', InfoButton);