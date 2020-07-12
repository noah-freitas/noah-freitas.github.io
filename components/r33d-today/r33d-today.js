import '../r33d-database/r33d-database.js';
import '../r33d-object-editor/r33d-object-editor.js';
import '../r33d-object-editor-column/r33d-object-editor-column.js';
import DateHelpers   from '../../lib/date.js';
import R33dUiElement from '../r33d-ui-element/r33d-ui-element.js';

class R33dTodayElement extends R33dUiElement {
    async connectedCallback() {
        if (!await super.connectedCallback()) return;

        this.$('#create-skimming r33d-object-editor').addEventListener('r33d-created', _ => this.resetTodaysSkimming());

        const db = this.$('r33d-database')
        const todaysReading = (await db.fromIndex('readings', 'scheduledDate', DateHelpers.todayDatePicker))[0];

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

        await this.resetTodaysSkimming();
    }

    async resetTodaysSkimming() {
        this.setTodaysSkimming((await this.$('r33d-database').fromIndex('skimmings', 'completedDate', DateHelpers.todayDatePicker))[0]);
    }

    async setTodaysSkimming(s) {
        this.$('#skimming-container').dataset.hasSkimming = String(Boolean(s));

        const db = this.$('r33d-database');

        if (s) {
            const startBook = await db.get('books', IDBKeyRange.only(s.startBookId));
            const endBook   = s.startBookId === s.endBookId ? startBook : await db.get('books', IDBKeyRange.only(s.endBookId));

            this.$('#skimming-start-book-name').textContent    = startBook.name;
            this.$('#skimming-end-book-name').textContent      = endBook.name;
            this.$('#skimming-start-page').textContent         = s.startPage;
            this.$('#skimming-end-page').textContent           = s.endPage;
            this.$('#skimming-end-book-name-container').hidden = startBook === endBook;
        } else {
            const yesterdaysSkimming = (await db.fromIndex('skimmings', 'completedDate', DateHelpers.yesterDayDatePicker))[0];
            const skimmingEditor     = this.$('#create-skimming r33d-object-editor');

            skimmingEditor.dataset.createProps = JSON.stringify({ completedDate : DateHelpers.todayDatePicker });

            if (yesterdaysSkimming) {
                skimmingEditor.value = {
                    startBookId : yesterdaysSkimming.endBookId,
                    endBookId   : yesterdaysSkimming.endBookId,
                    startPage   : yesterdaysSkimming.endPage,
                    endPage     : null
                };
            }
        }
    }
}

customElements.define('r33d-today', R33dTodayElement);

export default R33dTodayElement;
