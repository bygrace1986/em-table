import { HeaderConfig, FilterConfig, FilterType, OptionFilterConfig } from 'em-table/models';
import { Role, Status, Color } from './table-demo.model';

export const tableDemoHeader = [
    <HeaderConfig> {
        id: 'name',
        title: 'Name',
        isSortable: true,
        filter: <FilterConfig> {
            type: FilterType.text
        },
        class: 'name'
    },
    <HeaderConfig> {
        id: 'role',
        title: 'Role',
        isSortable: false,
        filter: <OptionFilterConfig<Role>> {
            type: FilterType.dropdown,
            options: [
                { key: Role.admin, value: 'Admin' },
                { key: Role.editor, value: 'Editor' },
                { key: Role.reader, value: 'Reader' }
            ]
        },
        class: null
    },
    <HeaderConfig> {
        id: 'status',
        title: 'Status',
        isSortable: true,
        filter: <OptionFilterConfig<Status>> {
            type: FilterType.checkbox,
            options: [
                { key: Status.locked, value: 'Locked' },
                { key: Status.disabled, value: 'Disabled' }
            ]
        },
        class: null
    },
    <HeaderConfig> {
        id: 'color',
        title: 'Favorite Color',
        isSortable: false,
        filter: <OptionFilterConfig<string>> {
            type: FilterType.radio,
            options: [
                { key: Color.red, value: 'Red' },
                { key: Color.yellow, value: 'Yellow' },
                { key: Color.blue, value: 'Blue' }
            ]
        },
        class: null
    },
    <HeaderConfig> {
        id: 'creationDate',
        title: 'Creation Date',
        isSortable: true,
        filter: <FilterConfig> {
            type: FilterType.date
        },
        class: null
    },
    <HeaderConfig> {
        id: 'lastLoginDate',
        title: 'Last Login Date',
        isSortable: true,
        filter: <FilterConfig> {
            type: FilterType.dateRange
        },
        class: null
    },
    <HeaderConfig> {
        id: 'action',
        title: null,
        isSortable: false,
        filter: null,
        class: null
    }
];