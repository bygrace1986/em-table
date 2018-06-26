import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy,
    ElementRef, OnChanges, SimpleChanges, SimpleChange, ViewChild, InjectionToken, Inject, Renderer2 } from '@angular/core';
import { NgbDropdown, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';

import { Day, SortDirection, FilterState, FilterType, ValueFilterState,
    OptionFilterState, RangeFilterState, HeaderConfig, OptionFilterConfig } from '../../models';
import { DatePickerUtil } from '../../utils';

export const DATA_TABLE_CONFIG = new InjectionToken('DATA_TABLE_CONFIG');
export interface DataTableConfig {
    containerSelector: string;
}

@Component({
    selector: '[bgt-data-table-header-cell]',
    templateUrl: './data-table-header-cell.component.html',
    styleUrls: ['./data-table-header-cell.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableHeaderCellComponent implements OnChanges {
    @Input()
    public config: HeaderConfig;

    @Input()
    public sort: SortDirection = SortDirection.none;

    @Input()
    public filter: FilterState;

    @Output()
    public sortChange: EventEmitter<SortDirection> = new EventEmitter<SortDirection>();

    @Output()
    public filterChange: EventEmitter<FilterState> = new EventEmitter<FilterState>();

    @ViewChild('text')
    text: ElementRef;

    @ViewChild('select')
    select: ElementRef;

    @ViewChild('datePicker')
    datePicker: NgbDatepicker;

    @ViewChild('fromPicker')
    fromPicker: NgbDatepicker;

    @ViewChild('toPicker')
    toPicker: NgbDatepicker;

    @ViewChild('dropDown')
    dropdown: ElementRef;

    public placement = new BehaviorSubject<string>('bottom-right');

    public inputText: any;
    public dropdownOption: any;
    public checkboxOptions: any[] = [];
    public radioOption: any;
    public date: Day;
    public from: Day;
    public to: Day;

    public hasFilter: boolean;
    public hasDateRangeError: boolean;
    public value: string;

    constructor(
        @Inject(DATA_TABLE_CONFIG) private dtConfig: DataTableConfig,
        private renderer: Renderer2
    ) {
    }

    /**
     * Setup default values when the config is updated.
     * @param changes
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.sort) {
            this.sort = <SortDirection>(<SimpleChange>changes.sort).currentValue;
        }
        if (changes.filter) {
            this.setFilter(<FilterState>(<SimpleChange>changes.filter).currentValue);
        }
    }

    /**
     * When the dropdown opens prep the view.
     * @param isOpen
     */
    public onDropdownOpenChange(isOpen: boolean): void {
        if (!isOpen) {
            return;
        }
        switch (this.config.filter.type) {
            case FilterType.text:
                setTimeout(() => {
                    const textEl = this.renderer.selectRootElement(this.text.nativeElement);
                    textEl.focus();
                }, 0);
                break;
            case FilterType.dropdown:
                setTimeout(() => {
                    const selectEl = this.renderer.selectRootElement(this.select.nativeElement);
                    selectEl.focus();
                }, 0);
                break;
            case FilterType.date:
                this.datePicker.navigateTo(this.date);
                break;
            case FilterType.dateRange:
                this.fromPicker.navigateTo(this.from);
                this.toPicker.navigateTo(this.to);
                break;
        }
        
        const placement = this.calculatePlacement();
        this.placement.next(placement);
    }

    /**
     * Calculate the orientation of the dropdown.
     * Dirty calculation that just determins if the dropdown origin is in the left
     * or right half of the content area.
     */
    private calculatePlacement(): string {
        const { left: dLeft } = (this.dropdown.nativeElement as Element).getBoundingClientRect();
        const containerSelector = this.dtConfig.containerSelector != null ? this.dtConfig.containerSelector : 'body';
        const container = document.querySelector(containerSelector);
        const containerStyles = window.getComputedStyle(container);
        const cPaddingLeft = parseFloat(containerStyles.paddingLeft);
        const cPaddingRight = parseFloat(containerStyles.paddingRight);
        const cLeft = container.clientLeft + cPaddingLeft;
        const cWidth = container.clientWidth - cPaddingLeft - cPaddingRight;
        const placement = dLeft - cLeft <= (cWidth / 2) ? 'bottom-left' : 'bottom-right';
        return placement;
    }

    /**
     * Toggle the state of a checkbox.
     * @param value
     */
    public toggleCheckbox(value: any): void {
        const index = this.checkboxOptions.indexOf(value);
        if (index > -1) {
            this.checkboxOptions.splice(index, 1);
        } else {
            this.checkboxOptions.push(value);
        }
    }

    /**
     * Toggle the sort state of the column.
     */
    public toggleSort(): void {
        if (!this.config.isSortable) {
            return;
        }
        switch (this.sort) {
            case SortDirection.none:
                this.sort = SortDirection.ascending;
                break;
            case SortDirection.ascending:
                this.sort = SortDirection.descending;
                break;
            case SortDirection.descending:
                this.sort = SortDirection.none;
                break;
        }
        this.sortChange.emit(this.sort);
    }

    /**
     * Clear the filter and emit.
     */
    public clear(dropdown?: NgbDropdown): void {
        if (!this.config.filter) {
            return;
        }
        this.inputText = null;
        this.dropdownOption = null;
        this.checkboxOptions.length = 0;
        this.radioOption = null;
        this.date = null;
        this.from = null;
        this.to = null;
        this.apply(dropdown);
    }

    /**
     * Apply the filter and emit.
     */
    public apply(dropdown?: NgbDropdown): void {
        if (this.applyFilter()) {
            this.emitFilter();
        }
        if (dropdown) {
            dropdown.close();
        }
    }

    /**
     * Update the internal filter state based on the inputs.
     */
    private applyFilter(): boolean {
        switch (this.config.filter.type) {
            case FilterType.text:
                return this.applyTextFilter();
            case FilterType.dropdown:
                return this.applyDropdownFilter();
            case FilterType.radio:
                return this.applyRadioFilter();
            case FilterType.checkbox:
                return this.applyCheckboxFilter();
            case FilterType.date:
                return this.applyDateFilter();
            case FilterType.dateRange:
                return this.applyDateRangeFilter();
        }
    }

    /**
     * Emit the filter change.
     */
    private emitFilter() {
        switch (this.config.filter.type) {
            case FilterType.text:
                this.filterChange.emit(<ValueFilterState<string>> {
                    fieldId: this.config.id, type: FilterType.text, value: this.inputText
                });
                break;
            case FilterType.dropdown:
                this.filterChange.emit(<ValueFilterState<any>> {
                    fieldId: this.config.id, type: FilterType.dropdown, value: this.dropdownOption
                });
                break;
            case FilterType.radio:
                this.filterChange.emit(<ValueFilterState<any>> {
                    fieldId: this.config.id, type: FilterType.radio, value: this.radioOption
                });
                break;
            case FilterType.checkbox:
                this.filterChange.emit(<OptionFilterState<any>> {
                    fieldId: this.config.id, type: FilterType.checkbox, values: this.checkboxOptions
                });
                break;
            case FilterType.date:
                this.filterChange.emit(<ValueFilterState<any>>
                    { fieldId: this.config.id, type: FilterType.date, value: this.date }
                );
                break;
            case FilterType.dateRange:
                this.filterChange.emit(<RangeFilterState<Day>>{
                    fieldId: this.config.id, type: FilterType.dateRange, from: this.from, to: this.to
                });
                break;
        }
    }

    /**
     * Set the filter state.
     * Do not emit the change.
     * @param state
     */
    private setFilter(state: FilterState): void {
        if (state == null) {
            return;
        }
        switch (state.type) {
            case FilterType.text:
                this.inputText = (<ValueFilterState<string>>state).value;
                break;
            case FilterType.dropdown:
                this.dropdownOption = (<ValueFilterState<any>>state).value;
                break;
            case FilterType.radio:
                this.radioOption = (<ValueFilterState<any>>state).value;
                break;
            case FilterType.checkbox:
                this.checkboxOptions = [...(<OptionFilterState<any>>state).values];
                break;
            case FilterType.date:
                this.date = (<ValueFilterState<Day>>state).value;
                break;
            case FilterType.dateRange:
                this.from = (<RangeFilterState<Day>>state).from;
                this.to = (<RangeFilterState<Day>>state).to;
                break;
        }
        this.applyFilter();
    }

    private applyTextFilter(): boolean {
        this.hasFilter = this.inputText != null && this.inputText.length > 0;
        this.value = this.inputText;
        return true;
    }

    private applyDropdownFilter(): boolean {
        this.hasFilter = this.dropdownOption != null && this.dropdownOption.length > 0;
        const option = (<OptionFilterConfig<any>>this.config.filter).options.find(x => x.key == this.dropdownOption);
        this.value = option ? option.value : null;
        return true;
    }

    private applyRadioFilter(): boolean {
        this.hasFilter = this.radioOption != null && this.radioOption.length > 0;
        const option = (<OptionFilterConfig<any>>this.config.filter).options.find(x => x.key == this.radioOption);
        this.value = option ? option.value : null;
        return true;
    }

    private applyCheckboxFilter(): boolean {
        this.hasFilter = this.checkboxOptions != null && this.checkboxOptions.length > 0;
        this.value = (<OptionFilterConfig<any>>this.config.filter).options
            .filter(x => this.checkboxOptions.includes(x.key))
            .map(x => x.value)
            .join(', ');
        return true;
    }

    private applyDateFilter(): boolean {
        this.hasFilter = this.date != null;
        if (this.date) {
            this.value = `${this.date.month}/${this.date.day}/${this.date.year}`;
        }
        return true;
    }

    private applyDateRangeFilter(): boolean {
        this.hasFilter = this.from != null || this.to != null;
        // validate
        if (this.from && this.to && DatePickerUtil.compare(this.from, this.to) > 0) {
            this.hasDateRangeError = true;
            return false;
        }
        // format label
        if (this.from && this.to) {
            this.value = `${this.from.month}/${this.from.day}/${this.from.year} - ${this.to.month}/${this.to.day}/${this.to.year}`;
        } else if (this.from) {
            this.value = `>= ${this.from.month}/${this.from.day}/${this.from.year}`;
        } else if (this.to) {
            this.value = `<= ${this.to.month}/${this.to.day}/${this.to.year}`;
        }
        return true;
    }
}