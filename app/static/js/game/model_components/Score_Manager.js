export default class ScoreManager {
    setSnapshot(snapshot) {
        if ([0, 2].has(snapshot.for_player)) {
            this.setScore(0, snapshot.score[0])
            this.setScore(1, snapshot.score[1])
        } else {
            this.setScore(1, snapshot.score[0])
            this.setScore(0, snapshot.score[1])
        }
    }

    setScore(team, value) {
        if (value < 5) {
            document.querySelector(`#score_${team} .top`).setAttribute("face", "back")
        }
        else if (team == 0) {
            document.querySelector(`#score_${team} .top`).setAttribute("face", "5♥")
        }
        else if (team == 1) {
            document.querySelector(`#score_${team} .top`).setAttribute("face", "5♠")
        }

        document.querySelector(`#score_${team}`).setAttribute("score", value)
    }
}