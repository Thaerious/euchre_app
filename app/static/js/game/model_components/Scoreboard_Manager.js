import registerButtons from "../register_buttons.js"

export default class ScoreboardManager {
    constructor(eventSource) {
        this.scoreboard = document.getElementById("scoreboard")
        registerButtons(this.scoreboard, eventSource)
    }

    setSnapshot(snapshot) {
        if (snapshot.state !== 8) return;

        this.scoreboard.querySelector("[team='0'] .score").textContent = snapshot.score[0]
        this.scoreboard.querySelector("[team='0'] .name0").textContent = snapshot.players[0].name
        this.scoreboard.querySelector("[team='0'] .name1").textContent = snapshot.players[2].name
        this.scoreboard.querySelector("[team='1'] .score").textContent = snapshot.score[1]
        this.scoreboard.querySelector("[team='1'] .name0").textContent = snapshot.players[1].name
        this.scoreboard.querySelector("[team='1'] .name1").textContent = snapshot.players[3].name        

        this.show()
    }

    show() {
        this.scoreboard.classList.remove("is_hidden");
    }
    
    hide() {
        this.scoreboard.classList.add("is_hidden");
    }        
}

