import BaseIO from "../modules/BaseIO.js"

export default class GameIO extends BaseIO {
    constructor() {
        super("/game")
    }

    doAction(action, data) {
        this.socket.emit("do_action", {
            token: this.token,
            hub_id: this.hubID,
            action: action,
            data: data
        });
    }
}
