import '../r33d-database/r33d-database.js';
import '../r33d-object-editor-column/r33d-object-editor-column.js';
import R33dUiElement from '../r33d-ui-element/r33d-ui-element.js';

const curObject = Symbol('curObject');

class R33dObjectEditorElement extends R33dUiElement {
    async connectedCallback() {
        let columns = Array.from(this.querySelectorAll('r33d-object-editor-column'));

        if (!await super.connectedCallback()) return;

        let fieldSet = this.$('fieldset');
        for (let col of columns) fieldSet.appendChild(col);

        if (this.dataset.mode === 'edit') {
            let objectId = Number(location.hash.substr(1));
            this.value = await this.$('r33d-database').get(this.dataset.objectStoreName, objectId);
        }

        this.$('form').addEventListener('submit', async e => {
            e.preventDefault();
            e.stopPropagation();

            const dbEl = this.$('r33d-database');
            let eventCanceled;

            if (this.dataset.mode === 'create') {
                const obj = this.value;
                const createProps = this.dataset.createProps ? JSON.parse(this.dataset.createProps) : {};
                Object.assign(obj, createProps);
                await dbEl.add(this.dataset.objectStoreName, obj);
                eventCanceled = this.dispatchEvent(new CustomEvent('r33d-created', { detail : obj, bubbles : true, cancelable : true }));
            } else if (this.dataset.mode === 'edit') {
                const obj = this.value;
                await dbEl.put(this.dataset.objectStoreName, obj);
                eventCanceled = this.dispatchEvent(new CustomEvent('r33d-edited', { detail : obj, bubbles : true, cancelable : true }));
            } else {
                throw new Error('data-mode not set');
            }

            if (!eventCanceled && !this.hasAttribute('data-dont-redirect')) history.back();
        });

        this.$('#cancel').addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            location.href = this.dataset.cancelUrl;
        });

        this.$('#delete').addEventListener('click', async e => {
            e.preventDefault();
            e.stopPropagation();

            if (confirm('Are you sure you want to delete this object?')) {
                await this.$('r33d-database').delete(this.dataset.objectStoreName, this.value.id);
                history.back();
            }
        });
    }

    get value() {
        const colValues = this.$$('r33d-object-editor-column').map(col => col.value);
        return Object.assign(this[curObject] || {}, ...colValues);
    }

    set value(book) {
        this[curObject] = book;
        this.$$('r33d-object-editor-column').forEach(col => col.value = book);
    }
};

customElements.define('r33d-object-editor', R33dObjectEditorElement);

export default R33dObjectEditorElement;
