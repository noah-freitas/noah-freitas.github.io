import '../r33d-database/r33d-database.js';
import DateHelpers   from '../../lib/date.js';
import R33dUiElement from '../r33d-ui-element/r33d-ui-element.js';

class R33dTodayElement extends R33dUiElement {
    async connectedCallback() {
        if (!await super.connectedCallback()) return;

        const db = this.$('r33d-database')
        const today = DateHelpers.toDatePicker(new Date());
        const todaysReading = (await db.fromIndex('readings', 'scheduledDate', today))[0];

        if (todaysReading) {
            const book = await db.get('books', IDBKeyRange.only(todaysReading.bookId));

            this.$('#book-name').textContent  = book.name;
            this.$('#start-page').textContent = todaysReading.startPage;
            this.$('#end-page').textContent   = todaysReading.endPage;

            if (todaysReading.completedDate === todaysReading.scheduledDate) {
                this.$('[data-active]').dataset.active = 'done';
            } else {
                this.$('#complete').addEventListener('click', async e => {
                    e.preventDefault();
                    e.stopPropagation();

                    todaysReading.completedDate = DateHelpers.toDatePicker(new Date());
                    await db.put('readings', todaysReading);
                    this.$('[data-active]').dataset.active = 'done';
                    this.dispatchEvent(new CustomEvent('r33d-reading:updated', { detail : todaysReading, bubbles : true, composed : true }));
                });
            }
        } else {
            this.$('[data-active]').dataset.active = 'no-reading';
        }
    }
}

customElements.define('r33d-today', R33dTodayElement);

export default R33dTodayElement;
