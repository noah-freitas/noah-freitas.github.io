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
    }
};
