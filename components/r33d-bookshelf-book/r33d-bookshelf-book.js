import '../r33d-book-progress/r33d-book-progress.js';
import '../r33d-database/r33d-database.js';
import DateHelpers   from '../../lib/date.js';
import R33dUiElement from '../r33d-ui-element/r33d-ui-element.js';

class R33dBookshelfBookElement extends R33dUiElement {
    async connectedCallback() {
        if (!await super.connectedCallback()) return;

        const db       = this.$('r33d-database');
        const book     = await db.get('books', Number(this.dataset.bookId));
        const author   = await db.get('authors', book.authorId);
        const readings = await db.fromIndex('readings', 'bookId', IDBKeyRange.only(Number(this.dataset.bookId)));

        readings.sort((r1, r2) => r1.scheduledDate < r2.scheduledDate ? -1 : r1.scheduledDate === r2.scheduledDate ? 0 : 1);

        const firstReadingDate = readings[0].scheduledDate,
              lastReadingDate  = readings[readings.length - 1].scheduledDate;

        this.$('#title').textContent     = book.name;
        this.$('#author').textContent    = author.name;
        this.$('#from-date').textContent = firstReadingDate;
        this.$('#to-date').textContent   = lastReadingDate;

        if (book.cover) {
            const reader  = new FileReader();
            reader.onload = _ => this.$('#cover').src = reader.result;
            reader.readAsDataURL(book.cover);
        }


        const today = DateHelpers.toDatePicker(new Date());
        if (firstReadingDate <= today && lastReadingDate >= today) {
            this.$('#book').classList.add('active');
            this.$('r33d-book-progress').dataset.bookId = book.id;
        }

        this.$('#book').addEventListener('click', e => {
            e.preventDefault();
            location.href = `book.html#${book.id}`;
        });
    }
}

customElements.define('r33d-bookshelf-book', R33dBookshelfBookElement);

export default R33dBookshelfBookElement;
