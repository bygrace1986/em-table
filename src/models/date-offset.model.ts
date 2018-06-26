const minDay = 1;
const minMonth = 1;
const monthsInYear = 12;
const hoursInDay = 24;
const minutesInHour = 60;
const secondsInMinute = 60;
const msInSecond = 1000;
const msInMinute = secondsInMinute * msInSecond;
const msInHour = minutesInHour * msInMinute;
const msInDay = hoursInDay * msInHour;

/**
 * Class for handling date-time offsets.
 */
export class DateOffset {

    /**
     * Create a date offset for the given offset applied to the current date.
     * @static
     * @param {number} offsetMinutes
     * @returns {DateOffset}
     * @memberof DateOffset
     */
    public static now(offsetMinutes: number): DateOffset {
        const now = new Date(Date.now() - (offsetMinutes * msInMinute));
        const offset = new DateOffset();
        offset.year = now.getFullYear();
        offset.month = now.getMonth() + 1;
        offset.day = now.getDay();
        offset.hours = now.getHours();
        offset.minutes = now.getMinutes();
        offset.seconds = now.getSeconds();
        offset.offsetMinutes = offsetMinutes;
        return offset;
    }

    /**
     * Parse an ISO datetime to create a date offset.
     * @param value
     */
    public static parse(value: string): DateOffset {
        const results = /(\d{4})-([01]\d)-([0-3]\d)T([0-2]\d):([0-5]\d):([0-5]\d)(([+-])([0-2]\d):([0-5]\d)|Z)/.exec(value);
        if (results == null) {
            return null;
        }
        const dateOffset = new DateOffset();
        dateOffset.year = parseInt(results[1], 10);
        dateOffset.month = parseInt(results[2], 10);
        dateOffset.day = parseInt(results[3], 10);
        dateOffset.hours = parseInt(results[4], 10);
        dateOffset.minutes = parseInt(results[5], 10);
        dateOffset.seconds = parseInt(results[6], 10);
        if (results[7] !== 'Z') {
            dateOffset.offsetMinutes = (results[8] === '+' ? 1 : -1) * ((parseInt(results[9], 10) * minutesInHour) + parseInt(results[10], 10));
        }
        return dateOffset;
    }

    constructor(
        public year?: number,
        public month?: number,
        public day?: number,
        public hours?: number,
        public minutes?: number,
        public seconds?: number,
        public offsetMinutes?: number
    ) {}

    /**
     * Get a date representing the date without the offset.
     */
    public getDate(): Date {
        return new Date(this.year, this.month - 1, this.day, this.hours, this.minutes, this.seconds);
    }

    /**
     * Get the number of milliseconds since 1970 for the date offset.
     * @returns {number}
     * @memberof DateOffset
     */
    public getTime(): number {
        return Date.UTC(this.year, this.month - 1, this.day,
            this.hours - Math.floor(this.offsetMinutes / minutesInHour), this.minutes - (this.offsetMinutes % minutesInHour), this.seconds);
    }

    /**
     * Set the date offset to represent the given timestamp.
     * For simplicity and practicality, the operation only supports up to +/- 1 day.
     * @param timestamp 
     */
    public toDate(timestamp: number): void {
        this.add(timestamp - this.getTime());
    }

    /**
     * A niave time incrementer that will change the calendar representation
     * without accounting for the nuances of the timezone (like DST).
     * For simplicity and practicality, the operation only supports up to +/- 1 day.
     * 
     * @param {number} time - number of ms to add to the date 
     * @memberof DateOffset
     */
    public add(time: number): void {
        // keep it simple
        if (time > msInDay || time < -msInDay) {
            throw new Error('DateOffset.Add operation only supports adding up to +/- 1 day.')
        }

        // remove ms
        time = Math.trunc(time / msInSecond) * msInSecond;

        // ignore if no effect
        if (time === 0) {
            return;
        }

        const currentTime = (this.seconds * msInSecond) + (this.minutes * msInMinute) + (this.hours * msInHour);
        time += currentTime;

        // deal with day changes
        if (time < 0) {
            time += msInDay;
            this.decrementDay();
        } else if (time > msInDay) {
            this.incrementDay();
        }

        this.seconds = Math.trunc(time / msInSecond) % secondsInMinute;
        this.minutes = Math.trunc(time / msInMinute) % minutesInHour;
        this.hours = Math.trunc(time / msInHour) % hoursInDay;
    }

    /**
     * Decrement by a day and cascade as needed to the month and year.
     */
    private decrementDay(): void {
        this.day--;

        if (this.day < minDay) {
            this.month--;
            if (this.month < minMonth) {
                this.year--;
                this.month = monthsInYear;
            }
            this.day = this.daysInMonth();
        }
    }

    /**
     * Increment by a day and cascade as needed to the month and year.
     */
    private incrementDay(): void {
        this.day++;

        if (this.day > this.daysInMonth()) {
            this.month++;
            if (this.month > monthsInYear) {
                this.year++;
                this.month = minMonth;
            }
            this.day = minDay;
        }
    }

    /**
     * Number of days in the year for the current date.
     */
    public daysInYear(): number {
        return this.isLeapYear ? 366 : 365;
    }

    /**
     * Does the date fall on a leap year?
     */
    public isLeapYear(): boolean {
        if((this.year & 3) != 0) return false;
        return ((this.year % 100) != 0 || (this.year % 400) == 0);
    }

    /**
     * Get the number of days in the month.
     */
    public daysInMonth(): number {
        return new Date(this.year, this.month, 0).getDate();
    }

    /**
     * Print the date-time offset as an ISO datetime.
     */
    public toString(): string {
        return `${this.pad(this.year, 4)}-${this.pad(this.month, 2)}-${this.pad(this.day, 2)}T${this.pad(this.hours, 2)}:${this.pad(this.minutes, 2)}:${this.pad(this.seconds, 2)}${this.offsetMinutes < 0 ? '-' : '+'}${this.pad(Math.floor(this.offsetMinutes / minutesInHour), 2)}:${this.pad((this.offsetMinutes % minutesInHour), 2)}`;
    }

    /**
     * Print the time portion HH:MM:SS.
     */
    public toTimeString(): string {
        return `${this.pad(this.hours, 2)}:${this.pad(this.minutes, 2)}:${this.pad(this.seconds, 2)}`;
    }

    private pad(value: number, length: number): string {
        return `${('0000' + Math.abs(value)).slice(-1 * length)}`;
    }
}