export default class EventEmitter {
    constructor() {
        this.events = {};
    }

    once(event, listener) {
        const onceListener = (...args) => {
            listener(...args);
            this.removeListener(event, onceListener);
        };
        this.on(event, onceListener);
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    off(event, listener) {
        this.removeListener(event, listener);
    }

    removeListener(event, listener) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(l => l !== listener);
    }

    emit(event, ...args) {
        if (this.events[event]) {
            const listeners = [...this.events[event]];
            listeners.forEach(listener => listener(...args));
        }
    }
}