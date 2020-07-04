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

            let dbEl = this.$('r33d-database');

            if (this.dataset.mode === 'create') {
                await dbEl.add(this.dataset.objectStoreName, this.value);
            } else if (this.dataset.mode === 'edit') {
                await dbEl.put(this.dataset.objectStoreName, this.value);
            } else {
                throw new Error('data-mode not set');
            }

            history.back();
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
        let colValues = this.$$('r33d-object-editor-column').map(col => col.value);
        return Object.assign(this[curObject] || {}, ...colValues);
    }

    set value(book) {
        this[curObject] = book;
        this.$$('r33d-object-editor-column').forEach(col => col.value = book);
    }
};

customElements.define('r33d-object-editor', R33dObjectEditorElement);

export default R33dObjectEditorElement;
