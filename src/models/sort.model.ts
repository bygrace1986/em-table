export enum SortDirection {
    none,
    ascending,
    descending,
}

export interface SortState {
    fieldId: any;
    direction: SortDirection;
}