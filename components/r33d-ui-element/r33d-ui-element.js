import R33dElement from '../r33d-element/r33d-element.js';

const dateFormatter  = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const numberFomatter = new Intl.NumberFormat();

const inited     = Symbol('inited'),
      tempReady  = Symbol('tempReady'),
      tempWaiter = Symbol('tempWaiter'),
      tempError  = Symbol('tempError');

class R33dUiElement extends R33dElement {
    // connectedCallback :: undefined -> Promise<Boolean>
    // returns true if this is the first time the element was connected.
    async connectedCallback() {
        if (this[inited]) return false;

        let tmpl = await this.template;
        if (!this.shadowRoot) this.attachShadow({ mode : 'open' }).appendChild(tmpl.content.cloneNode(true));
        return this[inited] = true;
    }

    // template :: Promise<HTMLTemplateElement>
    get template() {
        let name = this.nodeName.toLowerCase();

        return new Promise(async (res, rej) => {
            try {
                let resp   = await fetch(`/components/${name}/${name}.html`),
                    html   = await resp.text(),
                    parser = new DOMParser(),
                    doc    = parser.parseFromString(html, 'text/html'),
                    tmpl   = doc.querySelector('template');

                tmpl.remove();
                res(tmpl);

                if (this[tempWaiter]) {
                    this[tempWaiter]();
                    delete this[tempWaiter];
                }
            } catch (err) {
                rej(err);

                if (this[tempError]) {
                    this[tempError]();
                    delete this[tempError];
                }
            }
        });
    }

    // $_ :: String -> HtmlElement
    $(sel) {
        return this.shadowRoot.querySelector(sel);
    }

    // $$_ :: String -> [HtmlElement]
    $$(sel) {
        return Array.from(this.shadowRoot.querySelectorAll(sel));
    }

    // $_ :: String -> HtmlElement
    $_(sel) {
        return this.querySelector(sel);
    }

    // $$_ :: String -> [HtmlElement]
    $$_(sel) {
        return Array.from(this.querySelectorAll(sel));
    }

    // empty :: undefined -> undefined
    empty() {
        while (this.firstElementChild) this.firstElementChild.remove();
    }

    // formatDate :: Date -> String
    formatDate(d) {
        return dateFormatter.format(d);
    }

    // formatNumber :: Number -> String
    formatNumber(n) {
        return numberFomatter.format(n);
    }

    // templateReady :: undefined -> Promise<undefined, undefined>
    get templateReady() {
        if (this[tempReady]) return this[tempReady];
        if (this[inited]) return this[tempReady] = Promise.resolve();

        return this[tempReady] = new Promise((res, rej) => {
            this[tempWaiter] = res;
            this[tempError]  = rej;
        });
    }
}

export default R33dUiElement;
