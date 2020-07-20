import '../r33d-database/r33d-database.js';
import R33dUiElement from '../r33d-ui-element/r33d-ui-element.js';

class R33dBookProgressElement extends R33dUiElement {
    static get observedAttributes() {
        return ['data-book-id'];
    }

    async attributeChangedCallback(attrName, oldVal, val) {
        switch (attrName) {
            case 'data-book-id':
                const n = Number(val);
                if (n) await this.setProgress(n);
                break;
        }
    }

    async connectedCallback() {
        if (!await super.connectedCallback()) return;

        if (this.dataset.bookId) await this.setProgress(Number(this.dataset.bookId));
    }

    async setProgress(bookId) {
        const db                = this.$('r33d-database'),
              book              = await db.get('books', Number(bookId)),
              readingsForBook   = await db.fromIndex('readings', 'bookId', IDBKeyRange.only(book.id)),
              countPages        = (n, reading) => n + Number(reading.totalPages),
              totalPagesForBook = readingsForBook.reduce(countPages, 0),
              pagesRead         = readingsForBook.filter(r => r.completedDate).reduce(countPages, 0),
              progressEl        = this.$('progress');

        progressEl.value = pagesRead;
        progressEl.max   = totalPagesForBook;

        this.$('#completion-percent').textContent = `${Math.round(pagesRead / totalPagesForBook * 100)}%`;
    }
}

customElements.define('r33d-book-progress', R33dBookProgressElement);

export default R33dBookProgressElement;
