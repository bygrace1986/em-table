import { DateOffset } from '../models';

/**
 * Assorted helpers for arrays.
 * @export
 * @class ArrayUtil
 */
export class ArrayUtil {
    /**
     * Sort using a selector.
     * In-place and returns.
     * @param items
     * @param selector
     */
    public static sort<Ti, Tv>(items: Ti[], selector: (item: Ti) => Tv, isAscending: boolean = true): Ti[] {
        return items.sort((a, b) => this.compare(a, b, selector, isAscending));
    }

    /**
     * Compare using a selector.
     * @param a 
     * @param b 
     * @param selector 
     * @param isAscending 
     */
    public static compare<Ti, Tv>(a: Ti, b: Ti, selector: (item: Ti) => Tv, isAscending: boolean = true): number {
        let aValue = selector(a);
        let bValue = selector(b);

        if (aValue == null && bValue == null) {
            return 0;
        } else if (aValue == null) {
            return isAscending ? -1 : 1;
        } else if (bValue == null) {
            return isAscending ? 1 : -1;
        }

        // because lowercase is greater than uppercase in standard gt/lt
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return aValue.localeCompare(bValue) * (isAscending ? 1 : -1);
        }

        // handle custom date
        if (aValue instanceof DateOffset && bValue instanceof DateOffset) {
            return (aValue.getTime() - bValue.getTime()) * (isAscending ? 1 : -1);
        }
        
        if (aValue < bValue) {
            return isAscending ? -1 : 1;
        }
        if (aValue > bValue) {
            return isAscending ? 1 : -1;
        }

        return 0;
    }

    /**
     * Group items in an array by a given key on the entities inside of it.
     * @static
     * @template Tk Type of the key.
     * @template Tv Type of the value.
     * @param {Tv[]} collection Array of values.
     * @param {Tk} groupKey Key to index the value on.
     * @returns {Map<Tk, Tv[]>}
     * @memberof ArrayUtil
     */
    public static groupBy<Tk extends (number | string), Tv extends object>(
        collection: Tv[],
        keySelector: (entity: Tv) => Tk
    ): Map<Tk, Tv[]> {
        return collection.reduce((groupMap: Map<Tk, Tv[]>, entity: Tv) => {
            const groupId = keySelector(<any>entity);
            let group = groupMap.get(groupId);
            if (!group) {
                group = new Array<Tv>();
            }
            group.push(entity);
            groupMap.set(groupId, group);
            return groupMap;
        }, new Map<Tk, Tv[]>())
    }

    /**
     * Get the range between the min and max of the array.
     * @static
     * @param {number[]} collection
     * @returns {number}
     * @memberof ArrayUtil
     */
    public static getSpread(collection: number[]): number {
        return Math.max(...collection) - Math.min(...collection);
    }

    /**
     * Get the distinct list of values.
     * @static
     * @template T
     * @param {T[]} collection
     * @returns {T[]}
     * @memberof ArrayUtil
     */
    public static distinct<T>(collection: T[]): T[] {
        // alt: [...new Set(collection)];
        return collection.reduce((pv, cv) => {
            if (pv.indexOf(cv) < 0) {
                pv.push(cv);
            }
            return pv;
        }, []);
    }

    /**
     * Flatten an array of arrays to a single array.
     * @param collections 
     */
    public static flatten<T>(collections: T[][]): T[] {
        return [].concat(...collections);
    }
}