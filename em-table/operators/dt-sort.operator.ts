import { Observable, combineLatest, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

import { SortState } from '../models';
import { DataTableUtil } from '../utils';

export type SortOverride<T> = (x: T[], filter: SortState) => T[];

export function dtSort<T>(
    sortState: Observable<SortState>,
    overrides?: Map<string, SortOverride<T>>
): OperatorFunction<T[], T[]> {
    return (source: Observable<T[]>) => combineLatest(
        source,
        sortState
    ).pipe(
        map(([data, sort]) => {
            if (overrides != null && overrides.has(sort.fieldId)) {
                return overrides.get(sort.fieldId)(data, sort);
            }
            return DataTableUtil.sort<T>(data, sort);
        })
    );
};