import '../r33d-database/r33d-database.js';
import R33dUiElement from '../r33d-ui-element/r33d-ui-element.js';

const columns = Symbol('columns')

class R33ddObjectImporterElement extends R33dUiElement {
    async connectedCallback() {
        if (!await super.connectedCallback()) return;

        this[columns] = this.$$_('r33d-object-importer-column');

        let colsList = this.$('#columns');
        for (let col of this[columns]) {
            let li = document.createElement('li');
            li.textContent = col.dataset.label;
            colsList.appendChild(li);
        }

        this.$('#object-name').textContent = this.dataset.objectStoreName;

        this.$('#import').addEventListener('click', async e => {
            e.preventDefault();

            let vals = this.$('textarea').value.split('\n').map(line => line.split('\t'));
            let formatedVals = vals.map(line => line.map((v, i) => this[columns][i].format(v)));
            let keys = this[columns].map(c => c.dataset.prop);
            let objs = formatedVals.map(v => keys.reduce((obj, k, i) => {
                obj[k] = v[i];
                return obj;
            }, {}));

            let db = this.$('r33d-database');
            for (let obj of objs) {
                await db.add(this.dataset.objectStoreName, obj);
            }
        });
    }
}

customElements.define('r33d-object-importer', R33ddObjectImporterElement);

export default R33ddObjectImporterElement;
