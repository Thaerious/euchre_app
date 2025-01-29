import { getSocket, requestSnapshot, doAction } from "./gameio.js"
import suitButtons from "./suit_buttons.js"
import actionButtons from "./action_buttons.js"
import viewManager from "./view_manager.js"
import hand from "./hand.js"

window.loadSnap = function (hash) {
    viewManager.enqueue(window.snapshots[hash])
};

window.updateSnap = function (hash) {
    viewManager.updateView(window.snapshots[hash])
};

(() => {
    let snapshots = localStorage.getItem("snapshots")
    snapshots ??= "{}"
    window.snapshots = JSON.parse(snapshots)

    window.addEventListener("load", () => requestSnapshot());

    getSocket().on("snapshot", (data) => {
        const snap = JSON.parse(data)
        window.snapshots[snap.hash.substring(0, 3)] = snap
        localStorage.setItem("snapshots", JSON.stringify(window.snapshots))
        viewManager.enqueue(snap)
    });

    suitButtons.on("change", () => {
        actionButtons.enableAll()
    });

    actionButtons.on("start", () => {
        doAction("start", null)
    });

    actionButtons.on("pass", () => {
        doAction("pass", suitButtons.getSuit())
    });

    actionButtons.on("make", () => {
        doAction("make", suitButtons.getSuit())
    });

    actionButtons.on("alone", () => {
        doAction("alone", suitButtons.getSuit())
    });

    actionButtons.on("order", () => {
        doAction("order", null)
    });

    hand.on("selected", (card) => {
        switch (viewManager.snapshot.state) {
            case 2:
                doAction("up", card)
                break;
            case 5:
                doAction("play", card)
                break;
        }
    });
})()