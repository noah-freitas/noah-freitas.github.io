import '../r33d-database/r33d-database.js';
import R33dUiElement from '../r33d-ui-element/r33d-ui-element.js';

class R33ddObjectListColumnElement extends R33dUiElement {
    getHeaderElement(object) {
        let span         = document.createElement('span');
        span.textContent = this.dataset.label || this.dataset.prop;
        return span;
    }

    async getRowElement(object) {
        await this.templateReady;

        if (this.dataset.type === 'related-object-prop') {
            let span = document.createElement('span');

            if (this.dataset.objectStoreName && this.dataset.objectPropPath && object[this.dataset.prop]) {
                let relatedObj = await this.$('r33d-database').get(this.dataset.objectStoreName, Number(object[this.dataset.prop]));
                if (relatedObj) span.textContent = relatedObj[this.dataset.objectPropPath];
            }

            return span;
        }

        if (this.dataset.type === 'link') {
            let a         = document.createElement('a');
            a.href        = this.dataset.route.replace('$$', object[this.dataset.prop]);
            a.textContent = object[this.dataset.linkLabel];
            return a;
        }

        let span         = document.createElement('span');
        span.textContent = object[this.dataset.prop];
        return span;
    }
}

customElements.define('r33d-object-list-column', R33ddObjectListColumnElement);

export default R33ddObjectListColumnElement;
