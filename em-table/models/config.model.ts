import { InjectionToken } from '@angular/core';

export const DATA_TABLE_CONFIG = new InjectionToken('DATA_TABLE_CONFIG');

export interface DataTableConfig {
    containerSelector: string;
}