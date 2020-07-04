import R33dElement from '../r33d-element/r33d-element.js';

class R33dServiceWorkerElement extends R33dElement {
    connectedCallback() {
        navigator.serviceWorker.register('/service-worker.js', { scope : '/' });
    }
}

customElements.define('r33d-service-worker', R33dServiceWorkerElement);

export default R33dServiceWorkerElement;
