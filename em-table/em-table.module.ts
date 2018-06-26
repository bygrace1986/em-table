import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

import { DataTableHeaderCellComponent, DataTableHeaderRowComponent,
    DataTableFooterComponent, DataTableRefreshComponent } from './components';

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        FormsModule
    ],
    declarations: [
        DataTableHeaderCellComponent,
        DataTableHeaderRowComponent,
        DataTableFooterComponent,
        DataTableRefreshComponent
    ],
    exports: [
        DataTableHeaderCellComponent,
        DataTableHeaderRowComponent,
        DataTableFooterComponent,
        DataTableRefreshComponent
    ],
    providers: [
    ]
})
export class EmTableModule {
}
