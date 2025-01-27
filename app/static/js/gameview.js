import { getSocket, requestSnapshot, doAction } from "./gameio.js"
import suitButtons from "./suit_buttons.js"
import actionButtons from "./action_buttons.js"
import viewManager from "./view_manager.js"

(() => {
    window.snapshots = {}
    window.addEventListener("load", () => requestSnapshot());

    getSocket().on("snapshot", (data) => {
        const snap = JSON.parse(data)
        window.snapshots[snap.hash.substring(0, 3)] = snap
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
        doAction("alone", null)
    });
})()