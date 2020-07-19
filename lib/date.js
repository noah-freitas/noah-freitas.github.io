export default {
    // beginningOfDay :: Date -> Date
    beginningOfDay(d) {
        d.setHours(0, 0, 0, 0);
        return d;
    },

    // endOfDay :: Date -> Date
    endOfDay(d) {
        d.setHours(23, 59, 59, 999);
        return d;
    },

    // daysFromNow :: Date -> Number
    daysFromNow(d) {
        return Math.ceil((this.beginningOfDay(d).getTime() - this.beginningOfDay(new Date()).getTime()) / 86400000);
    },

    // toDatePicker :: Date -> String
    toDatePicker(d) {
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    },

    get today() {
        return new Date();
    },

    get todayDatePicker() {
        return this.toDatePicker(this.today);
    },

    get yesterDay() {
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        return yesterdayDate;
    },

    get yesterDayDatePicker() {
        return this.toDatePicker(this.yesterDay);
    },

    get beginningOfYear() {
        const d = new Date();
        d.setMonth(0);
        d.setDate(0);
        this.beginningOfDay(d);
        return d;
    },

    get beginningOfYearDatePicker() {
        return this.toDatePicker(this.beginningOfYear);
    },

    get endOfYear() {
        const d = new Date();
        d.setMonth(11);
        d.setDate(31);
        this.endOfDay(d);
        return d;
    },

    get endOfYearDatePicker() {
        return this.toDatePicker(this.endOfYear);
    },

    get lastYear() {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        return d;
    },

    get lastYearDatePicker() {
        return this.toDatePicker(this.lastYear);
    }
};
