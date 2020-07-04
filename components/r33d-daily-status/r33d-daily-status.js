import '../r33d-database/r33d-database.js';
import DateHelpers   from '../../lib/date.js';
import R33dUiElement from '../r33d-ui-element/r33d-ui-element.js';

class R33dDailyStatusElement extends R33dUiElement {
    async connectedCallback() {
        if (!await super.connectedCallback()) return;

        let db = this.$('r33d-database');
        await this.setTodaysCompletedState(db);
        await this.setCurrentBooksProgress(db);
        await this.setYesterdaysCompletedState(db);
        await this.setStreakCount(db);
        await this.setNextBookState(db);
        await this.setLastYearState(db);
        await this.setNextYearState(db);
    }

    async setCurrentBooksProgress(db) {
        let todaysReading = (await db.fromIndex('readings', 'scheduledDate', DateHelpers.toDatePicker(new Date())))[0];
        if (todaysReading) {
            let book              = await db.get('books', Number(todaysReading.bookId)),
                readingsForBook   = await db.fromIndex('readings', 'bookId', IDBKeyRange.only(book.id)),
                countPages        = (n, reading) => n + Number(reading.totalPages),
                totalPagesForBook = readingsForBook.reduce(countPages, 0),
                pagesRead         = readingsForBook.filter(r => r.completedDate).reduce(countPages, 0),
                progressEl        = this.$('progress');

            progressEl.value = pagesRead;
            progressEl.max   = totalPagesForBook;

            this.$('#current-book-name').textContent = book.name;
            this.$('#current-book-completion-percent').textContent = `${Math.round(pagesRead / totalPagesForBook * 100)}%`;
        }
    }

    async setLastYearState(db) {
        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        const lastYearStr = DateHelpers.toDatePicker(lastYear);

        const reading = (await db.fromIndex('readings', 'scheduledDate', IDBKeyRange.only(lastYearStr)))[0];
        const book    = await db.get('books', reading.bookId);

        this.$('#last-year').textContent      = lastYearStr;
        this.$('#last-year-name').textContent = book.name;
    }

    async setNextBookState(db) {
        const todayAndGreaterQuery = IDBKeyRange.lowerBound(DateHelpers.toDatePicker(new Date())),
              readingsCursor       = db.openIndexCursor('readings', 'scheduledDate', todayAndGreaterQuery, 'next');

        let curBookId;
        for await (const reading of readingsCursor) {
            if (!curBookId) {
                curBookId = reading.bookId;
                continue;
            }

            if (reading.bookId !== curBookId) {
                const nextBook         = await db.get('books', reading.bookId);
                const daysFromNow      = DateHelpers.daysFromNow(new Date(reading.scheduledDate));
                const nameEl           = this.$('#next-book-name');
                const startingEl       = this.$('#next-book-starting');
                nameEl.textContent     = nextBook.name;
                startingEl.textContent = `${daysFromNow} days from now`;
                return;
            }
        }
    }

    async setNextYearState(db) {
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);

        const nextYearStr = DateHelpers.toDatePicker(nextYear),
              reading     = (await db.fromIndex('readings', 'scheduledDate', IDBKeyRange.only(nextYearStr)))[0];

        if (reading) {
            const book = await db.get('books', reading.bookId);
            this.$('#next-year').textContent      = nextYearStr;
            this.$('#next-year-name').textContent = book.name;
        } else {
            this.$('#next-year-container').hidden = true;
        }
    }

    async setStreakCount(db) {
        const todayAndLessQuery = IDBKeyRange.upperBound(DateHelpers.toDatePicker(new Date())),
              readingsCursor    = db.openIndexCursor('readings', 'scheduledDate', todayAndLessQuery, 'prev');

        let streakCount = 0, lastDateCompleted;
        for await (const reading of readingsCursor) {
            if (reading.scheduledDate === reading.completedDate) {
                streakCount++;
                lastDateCompleted = DateHelpers.toDatePicker(new Date(reading.scheduledDate));
                continue;
            } else {
                this.$('#streak-since').textContent = lastDateCompleted;
            }
            break;
        }

        this.$('#streak-number').textContent = streakCount;
    }

    async setTodaysCompletedState(db) {
        let todayStr = DateHelpers.toDatePicker(new Date());
        let todaysCompletedReading = (await db.fromIndex('readings', 'completedDate,scheduledDate', [todayStr, todayStr]))[0];
        this.$('#today').dataset.state = todaysCompletedReading ? 'done' : 'waiting';
    }

    async setYesterdaysCompletedState(db) {
        let yesterDay = new Date();
        yesterDay.setDate(yesterDay.getDate() - 1);
        let yesterDayStr = DateHelpers.toDatePicker(yesterDay);
        let yesterdaysReading = (await db.fromIndex('readings', 'completedDate,scheduledDate', [yesterDayStr, yesterDayStr]))[0];
        this.$('#yesterday').dataset.state = yesterdaysReading ? 'done' : 'missed';
    }
}

customElements.define('r33d-daily-status', R33dDailyStatusElement);

export default R33dDailyStatusElement;
