/// <reference lib="dom" />

try {
    // Monkeypatching dom cos of tests
    if (!(process as unknown as { browser: boolean }).browser) {
        var document = {
            createElement: (tag: string) => ({ firstElementChild: { style: { display: '' } } as unknown as HTMLDivElement } as unknown as HTMLDivElement),
            getElementsByTagName: (tag: string) => [{} as Element],
            body: { appendChild: (node) => undefined } as Element,
        };

        var window = {
            navigator: { onLine: false },
            addEventListener: (event: string, a: () => void) => { }
        } as Window & typeof globalThis;
    }
} catch (e) { }

import EventEmitter from "./event-emitter";

export default class OfflineNotification {
    private static instance: OfflineNotification;
    private static notificationElement: HTMLDivElement;
    private static styleElement: HTMLStyleElement | Element;
    private isInit: boolean = false;
    private readonly onlineEvent: EventEmitter = new EventEmitter('online');
    private readonly offlineEvent: EventEmitter = new EventEmitter('offline');
    private static readonly html: string = `<div class="w-full md:max-w-sm"
    style="display:none; padding-top: 0.75rem;padding-bottom: 0.75rem;color:#ffffff;background-color: rgb(217 119 6); border-color: rgb(180 83 9); border-width: 1px;padding-left: 1.5rem/* 24px */;padding-right: 1.5rem/* 24px */;right: 0px;bottom: 0px;position: fixed;">
      <div
      style="display: flex;justify-content: space-between;column-gap: 1.5rem;">
        <div>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="40" height="40" viewBox="0 0 256 256" xml:space="preserve">
    
        <defs>
        </defs>
        <g style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;" transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
          <path d="M 85.429 85.078 H 4.571 c -1.832 0 -3.471 -0.947 -4.387 -2.533 c -0.916 -1.586 -0.916 -3.479 0 -5.065 L 40.613 7.455 C 41.529 5.869 43.169 4.922 45 4.922 c 0 0 0 0 0 0 c 1.832 0 3.471 0.947 4.386 2.533 l 40.429 70.025 c 0.916 1.586 0.916 3.479 0.001 5.065 C 88.901 84.131 87.261 85.078 85.429 85.078 z M 45 7.922 c -0.747 0 -1.416 0.386 -1.79 1.033 L 2.782 78.979 c -0.373 0.646 -0.373 1.419 0 2.065 c 0.374 0.647 1.042 1.033 1.789 1.033 h 80.858 c 0.747 0 1.416 -0.387 1.789 -1.033 s 0.373 -1.419 0 -2.065 L 46.789 8.955 C 46.416 8.308 45.747 7.922 45 7.922 L 45 7.922 z M 45 75.325 c -4.105 0 -7.446 -3.34 -7.446 -7.445 s 3.34 -7.445 7.446 -7.445 s 7.445 3.34 7.445 7.445 S 49.106 75.325 45 75.325 z M 45 63.435 c -2.451 0 -4.446 1.994 -4.446 4.445 s 1.995 4.445 4.446 4.445 s 4.445 -1.994 4.445 -4.445 S 47.451 63.435 45 63.435 z M 45 57.146 c -3.794 0 -6.882 -3.087 -6.882 -6.882 V 34.121 c 0 -3.794 3.087 -6.882 6.882 -6.882 c 3.794 0 6.881 3.087 6.881 6.882 v 16.144 C 51.881 54.06 48.794 57.146 45 57.146 z M 45 30.239 c -2.141 0 -3.882 1.741 -3.882 3.882 v 16.144 c 0 2.141 1.741 3.882 3.882 3.882 c 2.14 0 3.881 -1.741 3.881 -3.882 V 34.121 C 48.881 31.98 47.14 30.239 45 30.239 z" style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: #ffffff; fill-rule: nonzero; opacity: 1;" transform=" matrix(1 0 0 1 0 0) " stroke-linecap="round" />
        </g>
        </svg>
        </div>
        <p style="line-height: 40px;font-weight:300;">You are offline, check your network</p>
      </div>
    </div>`;
    private static readonly style: string = `
    .w-full {
      width: 100%;
    }
    @media (min-width: 768px) {
      .md:max-w-sm {
          max-width: 24rem/* 384px */;
      }
  `;

    private constructor() {
        this.addHTML();
        this.addStyle();

        OfflineNotification.notificationElement.style.display = this.isOnline ? 'none' : 'block';

        this.addListeners();

        this.isInit = true;
    }

    private onlineEventHandler(): void {
        this.onlineEvent.next();

        OfflineNotification.notificationElement.style.display = 'none';
    }

    private offlineEventHandler(): void {
        this.offlineEvent.next();

        OfflineNotification.notificationElement.style.display = 'block';
    }

    private addListeners(): void {
        if (this.isInit) {
            return;
        }

        window.addEventListener(
            'online',
            this.onlineEventHandler,
        );

        window.addEventListener(
            'offline',
            this.offlineEventHandler,
        );
    }

    /**
     * Call this method only once per object instantiation
     */
    private addHTML(): void {
        if (this.isInit) {
            return;
        }

        const rootDiv: HTMLDivElement = document.createElement('div') as HTMLDivElement;

        rootDiv.innerHTML = OfflineNotification.html;

        OfflineNotification.notificationElement = rootDiv.firstElementChild as HTMLDivElement;

        document.body.appendChild(OfflineNotification.notificationElement);
    }

    /**
     * Call this method only once per object instantiation
     */
    private addStyle(): void {
        if (this.isInit) {
            return;
        }

        const newStyle: HTMLDivElement = document.createElement('style') as HTMLDivElement;
        newStyle.innerHTML = OfflineNotification.style;

        const existingLink = document.getElementsByTagName("link")[0];

        existingLink.parentNode?.insertBefore(newStyle, existingLink);

        OfflineNotification.styleElement = newStyle;
    }

    public subscribe(event: 'online' | 'offline', handler: () => void): { unsubscribe: () => void } {
        switch (event) {
            case 'offline':
                return this.onlineEvent.subscribe(handler);
            case 'online':
                return this.offlineEvent.subscribe(handler);
        }
    }

    public destroy(): void {
        // remove listeners
        window.removeEventListener(
            'online',
            this.onlineEventHandler,
        );

        window.removeEventListener(
            'offline',
            this.offlineEventHandler,
        );

        // remove elements
        OfflineNotification.notificationElement.parentNode?.removeChild(OfflineNotification.notificationElement);
        OfflineNotification.styleElement.parentNode?.removeChild(OfflineNotification.styleElement);
    }

    static getInstance(): OfflineNotification {
        if (!OfflineNotification.instance) {
            OfflineNotification.instance = new OfflineNotification();
        }

        return OfflineNotification.instance;
    }

    public get isOnline(): boolean {
        return window.navigator.onLine;
    }
}