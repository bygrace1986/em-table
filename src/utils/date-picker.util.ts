import { Day, DateOffset } from '../models';

/**
 * Helper for interfacing with the date picker.
 * @export
 * @class DatePickerUtil
 */
export class DatePickerUtil {

    /**
     * Compare two days.
     * @static
     * @param {Day} a
     * @param {Day} b
     * @returns {number} 0 = equal, -1 = a < b, 1 = a > b
     * @memberof DatePickerUtil
     */
    public static compare(a: Day, b: Day): number {
        if (a == null && b == null) {
            return 0;
        } else if (a == null) {
            return -1;
        } else if (b == null) {
            return 1;
        }

        // year
        if (a.year < b.year) {
            return -1;
        }
        if (a.year > b.year) {
            return 1;
        }

        // month
        if (a.month < b.month) {
            return -1;
        }
        if (a.month > b.month) {
            return 1;
        }

        // day
        if (a.day < b.day) {
            return -1;
        }
        if (a.day > b.day) {
            return 1;
        }

        return 0;
    }

    /**
     * Translate from the day to a date.
     * @static
     * @param {Day} value
     * @returns {Date}
     * @memberof DatePickerUtil
     */
    public static toDate(value: Day): Date {
        if (!value) {
            return null;
        }
        return new Date(value.year, value.month - 1, value.day);
    }

    /**
     * Translate from a date to a day.
     * @static
     * @param {Date} value
     * @returns {Day}
     * @memberof DatePickerUtil
     */
    public static fromDate(value: Date): Day {
        if (!value) {
            return null;
        }
        return <Day> {
            year: value.getFullYear(),
            month: value.getMonth() + 1,
            day: value.getDate()
        };
    }

    /**
     * Translate from a date offset to a day.
     * @static
     * @param {DateOffset} value
     * @returns {Day}
     * @memberof DatePickerUtil
     */
    public static fromDateOffset(value: DateOffset): Day {
        if (!value) {
            return null;
        }
        return <Day> {
            year: value.year,
            month: value.month,
            day: value.day
        };
    }
}