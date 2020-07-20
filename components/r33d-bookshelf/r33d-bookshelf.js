import '../r33d-bookshelf-book/r33d-bookshelf-book.js';
import '../r33d-database/r33d-database.js';
import DateHelpers   from '../../lib/date.js';
import R33dUiElement from '../r33d-ui-element/r33d-ui-element.js';

const curYear = Symbol('curYear');

class R33dBookshelfElement extends R33dUiElement {
    async connectedCallback() {
        if (!await super.connectedCallback()) return;

        this[curYear] = new Date().getFullYear();

        this.$('#prev').addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            this.showBooksForYear(Number(this[curYear]) - 1);
        });

        this.$('#next').addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            this.showBooksForYear(Number(this[curYear]) + 1);
        });

        await this.showBooksForYear(this[curYear]);
    }

    // showBooks :: String, String -> Promise<undefined>
    async showBooks(startDateDatePicker, endDateDatePicker) {
        const db        = this.$('r33d-database');
        const query     = IDBKeyRange.bound(startDateDatePicker, endDateDatePicker);
        const readings  = await db.fromIndex('readings', 'scheduledDate', query);
        const bookIds   = Array.from(new Set(readings.map(r => r.bookId)));
        const container = this.$('#books');

        this.empty.call(container);
        for (const bookId of bookIds) {
            const el = document.createElement('r33d-bookshelf-book');
            el.dataset.bookId = bookId;
            container.appendChild(el);
        }

        this[curYear] = Number(startDateDatePicker.substr(0, 4));
        this.$('#year').textContent = String(this[curYear]);
    }

    // showBooksForYear :: Number -> Promise<undefined>
    async showBooksForYear(year) {
        const d = new Date(year, 0, 1, 0, 0, 0, 0);
        return await this.showBooks(DateHelpers.beginningOfYearDatePicker(d), DateHelpers.endOfYearDatePicker(d));
    }
}

customElements.define('r33d-bookshelf', R33dBookshelfElement);

export default R33dBookshelfElement;
