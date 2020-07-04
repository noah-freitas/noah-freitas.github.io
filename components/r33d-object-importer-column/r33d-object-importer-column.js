import DateHelpers from '../../lib/date.js';
import R33dUiElement from '../r33d-ui-element/r33d-ui-element.js';

class R33ddObjectImporterColumnElement extends R33dUiElement {
    format(val) {
        switch (this.dataset.type) {
            case 'date'   : return val ? DateHelpers.toDatePicker(new Date(val)) : null;
            case 'id'     : return Number(val);
            case 'number' : return Number(val);
            case 'text'   : return val;
            case 'texts'  : return val.split('~').filter(Boolean);
            default       : return val;
        }
    }
}

customElements.define('r33d-object-importer-column', R33ddObjectImporterColumnElement);

export default R33ddObjectImporterColumnElement;
