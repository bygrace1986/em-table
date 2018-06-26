import { Component, Input, Output, EventEmitter } from '@angular/core';

import { PageVm } from '../../models';

@Component({
    selector: 'bgt-data-table-footer',
    templateUrl: './data-table-footer.component.html'
})
export class DataTableFooterComponent {
    @Input()
    public page: PageVm<any>;

    @Input()
    public lastUpdatedOn: Date;

    @Output()
    public pageChange = new EventEmitter<number>();

    @Output()
    public refresh = new EventEmitter<any>();
}
