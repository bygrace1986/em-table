export enum FilterType {
    text,
    dropdown,
    checkbox,
    radio,
    date,
    dateRange
}

export interface FilterState {
    fieldId: any;
    type: FilterType;
}

export interface ValueFilterState<T> extends FilterState {
    value: T;
}

export interface OptionFilterState<T> extends FilterState {
    values: T[];
}

export interface RangeFilterState<T> extends FilterState {
    from: T;
    to: T;
}