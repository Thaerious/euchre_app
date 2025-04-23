import getSeat from "../getSeat.js"

export default class NameManager {
    setSnapshot(snapshot) {
        for (const player of snapshot.players) {
            const seat = getSeat(player.index, snapshot.for_player)
            const ele = document.querySelector(`.player-icon[seat='${seat}']`)
            ele.innerText = player.name
        }
    }
}