import '../r33d-database/r33d-database.js';
import R33dUiElement from '../r33d-ui-element/r33d-ui-element.js';

class R33ddObjectListElement extends R33dUiElement {
    async connectedCallback() {
        if (!await super.connectedCallback()) return;

        this.$('#title').textContent = this.dataset.headerTitle || this.dataset.objectName;

        if (this.dataset.addNewLink) {
            let linkEl         = this.$('#add-new-link');
            linkEl.href        = this.dataset.addNewLink;
            linkEl.textContent = `Add New ${this.dataset.objectName}`;
        } else {
            this.$('#add-new-link').hidden = true;
        }

        if (this.dataset.importLink) {
            let linkEl         = this.$('#import-link');
            linkEl.href        = this.dataset.importLink;
            linkEl.textContent = `Import ${this.dataset.objectName}s`;
        } else {
            this.$('#import-link').hidden = true;
        }

        let val = await this.$('r33d-database').getAll(this.dataset.objectStoreName);
        if (this.dataset.orderBy) val = val.sort((x, y) => {
            if (x[this.dataset.orderBy] < y[this.dataset.orderBy]) return -1;
            if (x[this.dataset.orderBy] > y[this.dataset.orderBy]) return 1;
            return 0;
        });
        this.value = val;
    }

    set value(objects) {
        let headEl = this.$('#header'),
            listEl = this.$('#object-list');

        this.empty.call(headEl);
        this.empty.call(listEl);

        let firstObject = true;
        for (let object of objects) {
            let obDivEl = document.createElement('div');

            let colValues = [];
            for (let col of this.querySelectorAll('r33d-object-list-column')) {
                if (firstObject) headEl.appendChild(col.getHeaderElement(object));
                colValues.push(col.getRowElement(object));
            }

            Promise.all(colValues).then(cells => {
                for (let cell of cells) {
                    obDivEl.appendChild(cell);
                }
            });

            listEl.appendChild(obDivEl);
            firstObject = false;
        }
    }
}

customElements.define('r33d-object-list', R33ddObjectListElement);

export default R33ddObjectListElement;
