import '../r33d-database/r33d-database.js';
import R33dUiElement from '../r33d-ui-element/r33d-ui-element.js';

class R33dBookshelfBookElement extends R33dUiElement {
    async connectedCallback() {
        if (!await super.connectedCallback()) return;

        const db     = this.$('r33d-database');
        const book   = await db.get('books', Number(this.dataset.bookId));
        const author = await db.get('authors', book.authorId);

        this.$('#title').textContent  = book.name;
        this.$('#author').textContent = author.name;

        if (book.cover) {
            const reader  = new FileReader();
            reader.onload = _ => this.$('#cover').src = reader.result;
            reader.readAsDataURL(book.cover);
        }

        this.$('#book').addEventListener('click', e => {
            e.preventDefault();
            location.href = `book.html#${book.id}`;
        });
    }
}

customElements.define('r33d-bookshelf-book', R33dBookshelfBookElement);

export default R33dBookshelfBookElement;
