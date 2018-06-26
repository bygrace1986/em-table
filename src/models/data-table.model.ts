import { FilterType, FilterState } from './filter.model';
import { SortDirection } from './sort.model';

export interface FilterConfig {
    type: FilterType;
}

export interface OptionFilterConfig<T> extends FilterConfig {
    options: {key: any, value: string}[];
}

export interface HeaderConfig {
    id: any;
    title: string;
    isSortable: boolean;
    filter?: FilterConfig;
    class?: string;
}

export interface HeaderState {
    config: HeaderConfig;
    sortDirection: SortDirection;
    filter: FilterState;
}