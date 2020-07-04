import '../r33d-service-worker/r33d-service-worker.js';
import R33dUiElement from '../r33d-ui-element/r33d-ui-element.js';

class R33ddPageElement extends R33dUiElement {}

customElements.define('r33d-page', R33ddPageElement);

export default R33ddPageElement;
