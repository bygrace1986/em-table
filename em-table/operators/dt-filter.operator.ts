import { Observable, combineLatest, OperatorFunction } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { FilterState } from '../models';
import { DataTableUtil } from '../utils';

export type FilterOverride<T> = (x: T[], filter: FilterState) => T[];

export function dtFilter<T>(
    filterState: Observable<FilterState[]>,
    overrides?: Map<string, FilterOverride<T>>
): OperatorFunction<T[], T[]> {
    return (source: Observable<T[]>) => combineLatest(
        source,
        filterState
    ).pipe(
        map(([data, filters]) => {
            if (filters == null) {
                return data;
            }
            return filters.reduce((filteredData: T[], filter: FilterState) => {
                if (overrides != null && overrides.has(filter.fieldId)) {
                    return overrides.get(filter.fieldId)(filteredData, filter);
                }
                return DataTableUtil.filter<T>(filteredData, filter)
            }, data);
        })
    );
};