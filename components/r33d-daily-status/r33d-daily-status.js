import '../r33d-book-progress/r33d-book-progress.js';
import '../r33d-database/r33d-database.js';
import DateHelpers   from '../../lib/date.js';
import R33dUiElement from '../r33d-ui-element/r33d-ui-element.js';

const todaysReadingDone = Symbol('todaysReadingDone');

class R33dDailyStatusElement extends R33dUiElement {
    async connectedCallback() {
        if (!await super.connectedCallback()) return;

        const db = this.$('r33d-database');
        await this.setTodaysCompletedState(db);
        await this.setCurrentBooksProgress(db);
        await this.setYesterdaysCompletedState(db);
        await this.setStreakCount(db);
        await this.setNextBookState(db);
        await this.setLastYearState(db);
        await this.setNextYearState(db);

        document.addEventListener('r33d-reading:updated', async e => {
            if (e.detail.scheduledDate === DateHelpers.toDatePicker(new Date()) && e.detail.completedDate && !this[todaysReadingDone]) {
                await this.setTodaysCompletedState(db);
                await this.setCurrentBooksProgress(db);
                await this.setStreakCount(db);
            }
        });
    }

    async setCurrentBooksProgress(db) {
        const todaysReading = (await db.fromIndex('readings', 'scheduledDate', DateHelpers.toDatePicker(new Date())))[0];
        if (todaysReading) {
            const book = await db.get('books', Number(todaysReading.bookId));

            this.$('r33d-book-progress').dataset.bookId = book.id;
            this.$('#current-book-name').textContent    = book.name;
        } else {
            this.$('#current-book-container').hidden = true;
        }
    }

    async setLastYearState(db) {
        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        const lastYearStr = DateHelpers.toDatePicker(lastYear);

        const reading = (await db.fromIndex('readings', 'scheduledDate', IDBKeyRange.only(lastYearStr)))[0];

        if (reading) {
            const book = await db.get('books', reading.bookId);
            this.$('#last-year').textContent      = lastYearStr;
            this.$('#last-year-name').textContent = book.name;
        } else {
            this.$('#last-year-container').hidden = true;
        }
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

        if (!curBookId) this.$('#next-book-container').hidden = true;
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
        if (!streakCount) this.$('#streak-container').hidden = true;
    }

    async setTodaysCompletedState(db) {
        const todayStr               = DateHelpers.toDatePicker(new Date()),
              todaysCompletedReading = (await db.fromIndex('readings', 'completedDate,scheduledDate', [todayStr, todayStr]))[0];

        this.$('#today').dataset.state = todaysCompletedReading ? 'done' : 'waiting';
        this[todaysReadingDone] = Boolean(todaysCompletedReading);
    }

    async setYesterdaysCompletedState(db) {
        const yesterDay = new Date();
        yesterDay.setDate(yesterDay.getDate() - 1);

        const yesterDayStr      = DateHelpers.toDatePicker(yesterDay),
              yesterdaysReading = (await db.fromIndex('readings', 'completedDate,scheduledDate', [yesterDayStr, yesterDayStr]))[0];

        this.$('#yesterday').dataset.state = yesterdaysReading ? 'done' : 'missed';
    }
}

customElements.define('r33d-daily-status', R33dDailyStatusElement);

export default R33dDailyStatusElement;
