import '../r33d-database/r33d-database.js';
import R33dUiElement from '../r33d-ui-element/r33d-ui-element.js';

const columns = Symbol('columns')

class R33ddObjectImporterElement extends R33dUiElement {
    async connectedCallback() {
        if (!await super.connectedCallback()) return;

        this[columns] = this.$$_('r33d-object-importer-column');

        let colsList = this.$('#columns');
        for (const col of this[columns]) {
            let li = document.createElement('li');
            li.textContent = col.dataset.label;
            colsList.appendChild(li);
        }

        this.$('#object-name').textContent = this.dataset.objectStoreName;

        this.$('#import').addEventListener('click', async e => {
            e.preventDefault();
            e.stopPropagation();

            const textAreaVal = this.$('textarea').value,
                  firstFile   = this.$('input[type="file"]').files[0];

            if (!textAreaVal && !firstFile) {
                this.$('textarea').setCustomValidity('Please paste or upload TSV text.');
                this.$('form').reportValidity();
                return;
            }

            const db           = this.$('r33d-database'),
                  tsvText      = firstFile ? await firstFile.text() : textAreaVal,
                  vals         = tsvText.split('\n').map(line => line.split('\t')),
                  formatedVals = vals.map(line => line.map((v, i) => this[columns][i].format(v))),
                  keys         = this[columns].map(c => c.dataset.prop),
                  gatherObject = v => keys.reduce((obj, k, i) => {
                      obj[k] = v[i];
                      return obj;
                  }, {});

            for (const obj of formatedVals.map(gatherObject)) {
                await db.add(this.dataset.objectStoreName, obj);
            }
        });
    }
}

customElements.define('r33d-object-importer', R33ddObjectImporterElement);

export default R33ddObjectImporterElement;
