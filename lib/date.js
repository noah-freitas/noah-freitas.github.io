export default {
    // beginningOfDay :: Date -> Date
    beginningOfDay(d) {
        d.setHours(0, 0, 0, 0);
        return d;
    },

    beginningOfYear(d = new Date()) {
        d.setMonth(0);
        d.setDate(1);
        this.beginningOfDay(d);
        return d;
    },

    beginningOfYearDatePicker(d = new Date()) {
        return this.toDatePicker(this.beginningOfYear(d));
    },

    // endOfDay :: Date -> Date
    endOfDay(d) {
        d.setHours(23, 59, 59, 999);
        return d;
    },

    endOfYear(d = new Date()) {
        d.setMonth(11);
        d.setDate(31);
        this.endOfDay(d);
        return d;
    },

    endOfYearDatePicker(d = new Date()) {
        return this.toDatePicker(this.endOfYear(d));
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

    get lastYear() {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        return d;
    },

    get lastYearDatePicker() {
        return this.toDatePicker(this.lastYear);
    }
};
