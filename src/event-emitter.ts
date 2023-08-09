export default class EventEmitter {
    private readonly target: EventTarget = new EventTarget();

    constructor(private eventName: string) {}

    next(): void {
        this.target.dispatchEvent(new Event(this.eventName));
    }

    subscribe(listener: () => void): { unsubscribe: () => void } {
        this.target.addEventListener(this.eventName, listener);

        return {
            unsubscribe: () => {
                this.target.removeEventListener(this.eventName, listener);
            }
        }
    }
}
