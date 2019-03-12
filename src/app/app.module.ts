import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { EmTableModule } from '../../em-table/em-table.module';
import { AppComponent } from './app.component';
import { TableDemoComponent } from './table-demo/table-demo.component';
import { DataTableConfig, DATA_TABLE_CONFIG } from '../../em-table/models';
import { ResizeService } from './resize.service';

@NgModule({
  imports: [
    BrowserModule,
    NgbModule.forRoot(),
    EmTableModule,
    FormsModule
  ],
  declarations: [
    AppComponent,
    TableDemoComponent
  ],
  providers: [
    ResizeService,
    { provide: DATA_TABLE_CONFIG, useValue: { containerSelector: 'body' } as DataTableConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
