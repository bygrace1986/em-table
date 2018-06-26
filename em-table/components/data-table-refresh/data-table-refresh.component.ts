import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'bgt-data-table-refresh',
    templateUrl: './data-table-refresh.component.html'
})
export class DataTableRefreshComponent {
    @Input()
    public lastUpdatedOn: Date;

    @Output()
    public refresh = new EventEmitter();

    constructor() { }
}
