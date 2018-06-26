import { Component } from '@angular/core';
import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import { publishReplay, refCount, delay, startWith } from 'rxjs/operators';

import { HeaderConfig, SortState, FilterState, SortDirection, PageState, PageVm } from 'em-table/models';
import { dtFilter, dtSort, dtPaginate } from 'em-table/operators';
import { User } from './table-demo.model';
import { tableDemoHeader } from './table-demo-header';
import { users } from './table-demo-data';


const defaultFilter = [] as FilterState[];

const defaultSort = {
    fieldId: 'name',
    direction: SortDirection.ascending
} as SortState;

const defaultPage = {
    pageSize: 10,
    pageNumber: 1
} as PageState;

@Component({
  selector: 'em-table-demo',
  templateUrl: './table-demo.component.html',
  styleUrls: ['./table-demo.component.scss']
})
export class TableDemoComponent {
    public readonly headers: HeaderConfig[] = tableDemoHeader;
    
    public readonly filterState = new BehaviorSubject<FilterState[]>(defaultFilter);
    public readonly sortState = new BehaviorSubject<SortState>(defaultSort);
    public readonly pageState = new BehaviorSubject<PageState>(defaultPage);
    
    public readonly page: Observable<PageVm<User>>;
    public readonly lastUpdated = new ReplaySubject<Date>(1);
    public readonly isFetching = new BehaviorSubject<boolean>(false);


    constructor() {
        this.page = this.createPageStream();
        this.refresh();
    }

    private createPageStream(): Observable<PageVm<User>> {
        return of(users).pipe(
            delay(2000),
            startWith([]),
            dtFilter(this.filterState),
            dtSort(this.sortState),
            dtPaginate(this.pageState),
            publishReplay(1),
            refCount()
        );
    }

    public trackUser(index: number, user: User): number {
        return user.id;
    }

    /**
     * Get the circuit data from the server.
     */
    public refresh(): void {
        this.isFetching.next(true);
        setTimeout(() => {
            this.isFetching.next(false);
            this.lastUpdated.next(new Date());
        }, 2000);
    }

    /**
     * Change the page index.
     * @param pageIndex
     */
    public onPageChange(pageNumber: number): void {
        const pageState = {
            ...this.pageState.value,
            pageNumber
        } as PageState;
        this.pageState.next(pageState);
    }

    /**
     * When a sort update is available, apply it.
     * @param state
     */
    public onSort(state: SortState): void {
        this.sortState.next(state);
    }

    /**
     * When a filter update is available, apply it.
     * @param state
     */
    public onFilter(state: FilterState[]): void {
        this.filterState.next(state);
    }
}
