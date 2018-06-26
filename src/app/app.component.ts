import { Component, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';

import { ResizeService, Breakpoint } from './resize.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [NgbPaginationConfig]
})
export class AppComponent {
    private paginationSubscription: Subscription;

    constructor(
        private resizeService: ResizeService,
        private paginationConfig: NgbPaginationConfig
    ) {
        this.paginationSubscription = this.resizeService.breakpoint.subscribe(breakpoint => this.configPagination(breakpoint));
    }

    ngOnDestroy(): void {
        if (this.paginationSubscription) {
            this.paginationSubscription.unsubscribe();
        }
    }

    private configPagination(breakpoint: Breakpoint): void {
        // this wont affect existing pagination controls
        // but it will affect newly configured ones which is sufficient
        this.paginationConfig.rotate = true;
        this.paginationConfig.ellipses = true;
        // break at large so that if any reasonable device can rotate and
        // be below large that the pagination will still fit
        if (breakpoint < Breakpoint.lg) {
            this.paginationConfig.maxSize = 3;
            this.paginationConfig.directionLinks = false;
            this.paginationConfig.boundaryLinks = false;
        } else {
            this.paginationConfig.maxSize = 5;
            this.paginationConfig.directionLinks = true;
            this.paginationConfig.boundaryLinks = true;
        }
    }

    @HostListener('window:resize')
    protected resize() {
        // feed the resize service in once place
        this.resizeService.resize.next();
    }
}
