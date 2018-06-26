import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy,
    QueryList, ViewChildren, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject, merge } from 'rxjs';
import { withLatestFrom, takeUntil, debounceTime, map,
    combineLatest, startWith, switchMap, scan } from 'rxjs/operators';

import { DataTableHeaderCellComponent } from '../data-table-header-cell';
import { FilterState, ValueFilterState, FilterType, OptionFilterState,
    RangeFilterState, SortState, SortDirection, HeaderConfig, HeaderState } from '../../models';

@Component({
    selector: '[bgt-data-table-header-row]',
    templateUrl: './data-table-header-row.component.html',
    styleUrls: ['./data-table-header-row.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableHeaderRowComponent implements OnDestroy {
    private configsSubject = new BehaviorSubject<HeaderConfig[]>([]);
    private sortSubject = new BehaviorSubject<SortState>(null);
    private filtersSubject = new BehaviorSubject<FilterState[]>([]);
    private onDestroySubject = new Subject();

    @Input()
    public set configs(value: HeaderConfig[]) {
        this.configsSubject.next(value);
    }

    @Input()
    public set sort(value: SortState) {
        this.sortSubject.next(value);
    }

    @Input()
    public set filters(value: FilterState[]) {
        this.filtersSubject.next(value);
    }

    @Output()
    public sortChange: EventEmitter<SortState> = new EventEmitter<SortState>();

    @Output()
    public filtersChange: EventEmitter<FilterState[]> = new EventEmitter<FilterState[]>();

    @ViewChildren(DataTableHeaderCellComponent)
    public headers: QueryList<DataTableHeaderCellComponent>;

    public headerStates: Observable<HeaderState[]>;

    public childSort = new Subject<SortState>();
    public childFilter = new Subject<FilterState>();

    constructor() {
        this.initStreams();
    }

    public clear(): void {
        this.headers.forEach(header => {
            header.clear();
        });
    }

    public onSort(fieldId: string, direction: SortDirection): void {
        this.childSort.next(<SortState>{ fieldId, direction });
    }

    ngOnDestroy(): void {
        this.onDestroySubject.next();
    }

    private initStreams(): void {
        const sortStream = this.createSortStream();
        const filterStream = this.createFiltersStream();
        this.headerStates = this.createStateStream(sortStream, filterStream);
        this.initSortChange();
        this.initFiltersChange(filterStream);
    }

    /**
     * Setup the sort stream to take the latest of either
     * the sort from the settings or manual sorting.
     */
    private createSortStream(): Observable<SortState> {
        // take the latest of either the sort from the settings or manual sorting
        return merge(this.sortSubject, this.childSort);
    }

    /**
     * Setup the filter stream to overwrite the filter settings with manual overrides
     * but remove all manual overrides are removed when the filter settings are set
     */
    private createFiltersStream(): Observable<FilterState[]> {
        return this.filtersSubject.pipe(
            startWith([]),
            switchMap(m =>
                this.childFilter.pipe(
                    scan<FilterState, any[]>((acc, x) => [...acc.filter(y => y.fieldId !== x.fieldId), x], []),
                    startWith([]),
                    map(s => [...m.filter(y => !s.some(z => z.fieldId === y.fieldId)), ...s])
                )
            ),
            map(x => x.filter(y => this.filterHasValue(y)))
        );
    }

    /**
     * Setup the header state stream to apply the sort and filter settings
     * plus manual overrides on top of the header configs to create the header state.
     * @param sortStream
     * @param filterStream
     */
    private createStateStream(
        sortStream: Observable<SortState>,
        filterStream: Observable<FilterState[]>
    ): Observable<HeaderState[]> {
        return this.configsSubject
            .pipe(
                combineLatest(
                    sortStream.pipe(startWith(null)),
                    filterStream.pipe(startWith(null)),
                    (configs, sort, filters) => { return { configs, sort, filters }; }
                ),
                map(x => {
                    return x.configs.map(config => this.createHeaderState(config, x.sort, x.filters));
                })
            );
    }

    /**
     * Emit a sort change if its source was a manual change
     */
    private initSortChange(): void {
        this.childSort.pipe(
            takeUntil(this.onDestroySubject)
        ).subscribe(sort => {
            this.sortChange.emit(sort);
        });
    }

    /**
     * Emit a filter change if its source was a manual change
     * @param filterStream
     */
    private initFiltersChange(filterStream: Observable<FilterState[]>): void {
        this.childFilter.pipe(
            debounceTime(10), // to handle clearing the filters as one event
            withLatestFrom(filterStream, (_, x) => x),
            takeUntil(this.onDestroySubject)
        ).subscribe(filters => {
            this.filtersChange.emit(filters.filter(x => x != null));
        });
    }

    /**
     * Create a header state by overlaying the sort and filter onto the config.
     * @param config
     * @param sort
     * @param filters
     */
    private createHeaderState(config: HeaderConfig, sort: SortState, filters: FilterState[]): HeaderState {
        const headerState = <HeaderState> {
            config,
            sortDirection: SortDirection.none
        };
        // apply sort if present
        if (sort && sort.fieldId === config.id) {
            headerState.sortDirection = sort.direction;
        }
        // apply filter if present
        if (filters != null) {
            const filter = filters.find(f => f.fieldId === config.id);
            headerState.filter = filter != null && this.filterHasValue(filter) ? filter : null;
        }
        return headerState;
    }

    /**
     * Determine whether the filter has data or not.
     * @param filter
     */
    private filterHasValue(filter: FilterState): boolean {
        switch (filter.type) {
            case FilterType.text:
            case FilterType.dropdown:
            case FilterType.radio:
            case FilterType.date: {
                const valueFilter = (<ValueFilterState<any>>filter);
                return valueFilter.value != null && valueFilter.value !== '';
            }
            case FilterType.checkbox: {
                const optionFilter = (<OptionFilterState<any>>filter);
                return optionFilter.values != null && optionFilter.values.length > 0;
            }
            case FilterType.dateRange: {
                const rangeFilter = (<RangeFilterState<any>>filter);
                return rangeFilter.from != null || rangeFilter.to != null;
            }
        }
    }
}