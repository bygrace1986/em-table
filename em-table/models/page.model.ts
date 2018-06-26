export interface PageState {
    pageSize: number;
    pageNumber: number;
}

export interface PageVm<T> {
    pageSize: number;
    pageNumber: number;
    data: T[];
    itemCount: number;
}