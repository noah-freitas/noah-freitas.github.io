import '../r33d-bookshelf-book/r33d-bookshelf-book.js';
import '../r33d-database/r33d-database.js';
import DateHelpers   from '../../lib/date.js';
import R33dUiElement from '../r33d-ui-element/r33d-ui-element.js';

class R33dBookshelfElement extends R33dUiElement {
    async connectedCallback() {
        if (!await super.connectedCallback()) return;

        const db                = this.$('r33d-database');
        const thisYearQuery     = IDBKeyRange.bound(DateHelpers.beginningOfYearDatePicker, DateHelpers.endOfYearDatePicker);
        const thisYearsReadings = await db.fromIndex('readings', 'scheduledDate', thisYearQuery);
        const bookIds           = Array.from(new Set(thisYearsReadings.map(r => r.bookId)));
        const container         = this.$('#books');

        for (const bookId of bookIds) {
            const el = document.createElement('r33d-bookshelf-book');
            el.dataset.bookId = bookId;
            container.appendChild(el);
        }
    }
}

customElements.define('r33d-bookshelf', R33dBookshelfElement);

export default R33dBookshelfElement;
