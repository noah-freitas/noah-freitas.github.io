import '../r33d-database/r33d-database.js';
import R33dUiElement from '../r33d-ui-element/r33d-ui-element.js';

const curVal     = Symbol('curVal'),
      editorEl   = Symbol('editorEl'),
      hasOpts    = Symbol('hasOpts'),
      optsError  = Symbol('optsError'),
      optsWaiter = Symbol('optsWaiter');

class R33dObjectEditorColumnElement extends R33dUiElement {
    async connectedCallback() {
        if (!await super.connectedCallback()) return;

        let label = this.$('.label-text');
        label.innerText = this.dataset.label || this.dataset.prop;

        if (this[editorEl]) return;
        this[hasOpts] = true;

        switch (this.dataset.type) {
            case 'date':
                this[editorEl] = document.createElement('input');
                this[editorEl].type = 'date';
                break;
            case 'number':
                this[editorEl] = document.createElement('input');
                this[editorEl].type = 'number';
                break;
            case 'object-picker':
                this[hasOpts] = false;
                this[editorEl] = document.createElement('select');
                for (let obj of await this.$('r33d-database').getAll(this.dataset.objectStoreName)) {
                    let opt = new Option(obj[this.dataset.labelProp], obj.id);
                    this[editorEl].appendChild(opt);
                }
                if (this[curVal]) this.value = this[curVal];
                this[hasOpts] = true;
                break;
            case 'text':
                this[editorEl] = document.createElement('input');
                break;
            case 'texts':
                this[editorEl] = document.createElement('textarea');
                break;
        }

        label.insertAdjacentElement('afterend', this[editorEl]);
    }

    // hasOptions :: undefined -> Promise<undefined, undefined>
    get hasOptions() {
        if (this[hasOpts]) return this[hasOpts];

        return this[hasOpts] = new Promise((res, rej) => {
            this[optsWaiter] = res;
            this[optsError]  = rej;
        });
    }

    get value() {
        let editorEl = this.$('.label-text + *'), val;

        switch (this.dataset.type) {
            case 'number':
                val = Number(editorEl.value);
                break;
            case 'object-picker':
                val = Number(editorEl.value);
                break;
            case 'texts':
                val = (editorEl.value || '').split('\n').filter(Boolean).map(s => s.trim());
                break;
            default :
                val = editorEl.value;
                break;
        }

        return { [this.dataset.prop] : val };
    }

    set value(val) {
        this[curVal] = val;

        Promise.all([this.templateReady, this.hasOptions])
            .then(_ => {
                let editorEl = this.$('.label-text + *');

                switch (this.dataset.type) {
                    case 'object-picker':
                        if (!this[hasOpts]) return;
                        return editorEl.value = val[this.dataset.prop];
                    case 'texts':
                        return editorEl.value = (val[this.dataset.prop] || []).join('\n');
                    default :
                        return editorEl.value = val[this.dataset.prop];
                }
            });
    }
}

customElements.define('r33d-object-editor-column', R33dObjectEditorColumnElement);

export default R33dObjectEditorColumnElement;
