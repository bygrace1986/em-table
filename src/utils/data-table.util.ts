import { DatePickerUtil } from './date-picker.util';
import { ArrayUtil } from './array.util';
import { Day, DateOffset } from '../models';
import { FilterType, FilterState, ValueFilterState, OptionFilterState, RangeFilterState } from '../models/filter.model';
import { SortDirection, SortState } from '../models/sort.model';

export class DataTableUtil {

    /**
     * Apply the sort to the data.
     * @param data
     * @param sortState
     */
    public static sort<T>(data: T[], sortState: SortState): T[] {
        if (sortState.direction === SortDirection.none) {
            return data;
        }
        // copy the array since the sort is in-place
        return ArrayUtil.sort([...data], x => x[sortState.fieldId], sortState.direction === SortDirection.ascending);
    }

    /**
     * Apply the filter to the data.
     * @param data
     * @param filter
     */
    public static filter<T>(data: T[], filter: FilterState): T[] {
        switch (filter.type) {
            case FilterType.text: {
                const filterValue = (<ValueFilterState<string>>filter).value;
                if (filterValue == null) {
                    return data;
                }
                const text = filterValue.toLowerCase();
                return data.filter(x => {
                    const fieldValue = x[filter.fieldId];
                    return fieldValue != null && fieldValue.toLowerCase().includes(text)
                });
            }
            case FilterType.dropdown: {
                const filterValue = (<ValueFilterState<any>>filter).value;
                if (filterValue == null) {
                    return data;
                }
                // intentional type coercion
                return data.filter(x => {
                    const fieldValue = x[filter.fieldId];
                    return fieldValue != null && fieldValue == filterValue;
                });
            }
            case FilterType.checkbox: {
                const filterValues = (<OptionFilterState<any>>filter).values;
                if (filterValues == null || filterValues.length === 0) {
                    return data;
                }
                return data.filter(x => {
                    const fieldValue = x[filter.fieldId];
                    return fieldValue != null && filterValues.includes(fieldValue);
                });
            }
            case FilterType.radio: {
                const filterValue = (<ValueFilterState<any>>filter).value;
                if (filterValue == null) {
                    return data;
                }
                // intentional type coercion
                return data.filter(x => {
                    const fieldValue = x[filter.fieldId];
                    return fieldValue != null && fieldValue == filterValue;
                });
            }
            case FilterType.date: {
                const filterValue = (<ValueFilterState<Day>>filter).value;
                if (filterValue == null) {
                    return data;
                }
                return data.filter(x => {
                    const value = DatePickerUtil.fromDate(x[filter.fieldId]);
                    return DatePickerUtil.compare(filterValue, value) === 0;
                });
            }
            case FilterType.dateRange: {
                const rangeFilter = (<RangeFilterState<Day>>filter);
                if (rangeFilter.from == null && rangeFilter.to == null) {
                    return data;
                }
                return data.filter(x => {
                    let value;
                    const field = x[filter.fieldId];
                    if (field instanceof Date) {
                        value = DatePickerUtil.fromDate(field);
                    } else if (field instanceof DateOffset) {
                        value = DatePickerUtil.fromDateOffset(field);
                    } else if (field != null) {
                        throw new Error(`Field "${filter.fieldId}" is not of type Date or DateOffset.`);
                    }
                    return (!rangeFilter.from || DatePickerUtil.compare(rangeFilter.from, value) <= 0)
                        && (!rangeFilter.to || DatePickerUtil.compare(rangeFilter.to, value) >= 0);
                });
            }
        }
    }
}