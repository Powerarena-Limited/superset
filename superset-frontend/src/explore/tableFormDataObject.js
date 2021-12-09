export const tableFormDataObject = {
    "viz_type": "table",
    "datasource": "",
    "slice_id": 42,
    "url_params": {},
    "time_range_endpoints": [
        "inclusive",
        "exclusive"
    ],
    "granularity_sqla": "P_EVENT_TS",
    "time_grain_sqla": "PT1H",
    "time_range": "DATEADD(DATETIME(\"2021-09-16T00:00:00\"), -24, hour) : 2021-09-16T00:00:00",
    "query_mode": "raw",
    "groupby": [
        "M_WORKSTATION_NAME",
        "M_TARGET_CT_TIME",
        "P_DATA_TYPE",
        "P_VALUE",
        "M_WORK_ORDER_NO"
    ],
    "all_columns": [
        "M_WORKSTATION_NAME",
        "P_DATA_TYPE",
        "P_VALUE",
        "P_EVENT_TS",
        "M_PRODUCT_NAME",
        "M_PRODUCT_DESCRIPTION",
        "M_TARGET_CT_TIME",
        "M_TARGET_UPH",
        "M_WORK_ORDER_START_TIME",
        "M_WORK_ORDER_END_TIME",
        "M_WORK_ORDER_NO",
        "P_DEVICE_ID",
        "P_POS"
    ],
    "percent_metrics": [],
    "order_by_cols": [],
    "row_limit": 10000,
    "server_page_length": 10,
    "order_desc": true,
    "adhoc_filters": undefined,
    "table_timestamp_format": "smart_date",
    "show_cell_bars": true,
    "color_pn": true,
    "extra_form_data": {}
}

export const flattenTableFormDataObject = {
    "viz_type": "table",
    "datasource": "",
    "slice_id": 42,
    "url_params": {},
    "time_range_endpoints": [
        "inclusive",
        "exclusive"
    ],
    "granularity_sqla": "event_ts",
    "time_grain_sqla": "PT1H",
    "time_range": "DATEADD(DATETIME(\"2021-09-16T00:00:00\"), -24, hour) : 2021-09-16T00:00:00",
    "query_mode": "raw",
    "groupby": [
        "workstation_name"
    ],
    "all_columns": [
        "workstation_name",
        "event_ts",
        "event_ts_timezone",
        "cycle_time",
        "process_time",
        "idle_time",
        "target_ct_time",
        "production_line_code",
        "pos",
        "product_code",
        "device_id",
    ],
    "percent_metrics": [],
    "order_by_cols": [],
    "row_limit": 10000,
    "server_page_length": 10,
    "order_desc": true,
    "adhoc_filters": undefined,
    "table_timestamp_format": "smart_date",
    "show_cell_bars": true,
    "color_pn": true,
    "extra_form_data": {}
}