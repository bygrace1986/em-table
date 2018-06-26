import { Observable, combineLatest, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

import { PageState, PageVm } from '../models';

export function dtPaginate<T>(
    pageState: Observable<PageState>
): OperatorFunction<T[], PageVm<T>> {
    return (source: Observable<T[]>) => combineLatest(
        source,
        pageState
    ).pipe(
        map(([data, { pageSize, pageNumber }]) => (<PageVm<T>>{
            pageSize,
            pageNumber,
            itemCount: data.length,
            data: data.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
        }))
    );
};