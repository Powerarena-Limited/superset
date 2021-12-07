/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/* eslint-disable camelcase */
// util function to make sure filter is a valid slice in current dashboard
function isValidFilter(getState, chartId) {
  return getState().dashboardState.sliceIds.includes(chartId);
}

export const ADD_FILTER = 'ADD_FILTER';
export function addFilter(chartId, component, form_data) {
  return (dispatch, getState) => {
    if (isValidFilter(getState, chartId)) {
      return dispatch({ type: ADD_FILTER, chartId, component, form_data });
    }
    return getState().dashboardFilters;
  };
}

export const REMOVE_FILTER = 'REMOVE_FILTER';
export function removeFilter(chartId) {
  return (dispatch, getState) => {
    if (isValidFilter(getState, chartId)) {
      return dispatch({ type: REMOVE_FILTER, chartId });
    }
    return getState().dashboardFilters;
  };
}

export const CHANGE_FILTER = 'CHANGE_FILTER';
export function changeFilter(chartId, newSelectedValues, merge) {
  if (newSelectedValues['__time_range'].includes("DATEADD") || newSelectedValues['__time_range'].includes("now")) {
    let since = newSelectedValues['__time_range'].split(" : ")[0];
    let until = newSelectedValues['__time_range'].split(" : ")[1];

    let getUtcTime = (time) => {
      let utcTime = "";
      if (time.includes("now") && !time.includes("DATEADD")) {
        utcTime = new Date(Date.now()).toISOString().split(".")[0];
      } else if (time.includes("DATEADD")) { 
        let relatedUnitMapping = {
          "second": 1, 
          "minute": 60, 
          "hour": 60 * 60, 
          "day": 60 * 60 * 24, 
          "week": 60 * 60 * 24 * 7, 
          "month": 60 * 60 * 24 * 30,
          "quarter": 60 * 60 * 24 * 30 * 3,
          "year": 60 * 60 * 24 * 365
        }
        let related = time.split('DATEADD(DATETIME("')[1].split('")')[0];
        let offset = time.split(", ")[1];
        let unit = time.split(", ")[2].split(")")[0];
        if ("now" === related) {
          related = new Date(Date.now() + 60 * 60 * 8 * 1000).toISOString().split(".")[0];
        }
        let timestamp = Date.parse(related) + offset * relatedUnitMapping[unit] * 1000;
        utcTime = new Date(timestamp).toISOString().split(".")[0];
      } else {
        utcTime = new Date(time).toISOString().split(".")[0];
      }
      return utcTime
    }
    let utcSince = getUtcTime(since);
    let utcUntil = getUtcTime(until);
    
    newSelectedValues['__time_range'] = utcSince + " : " + utcUntil;
  } else {
    if (!isNaN(Date.parse(newSelectedValues['__time_range'].split(" : ")[0]))) {
      const since = Date.parse(newSelectedValues['__time_range'].split(" : ")[0]);
      const until = Date.parse(newSelectedValues['__time_range'].split(" : ")[1]);
      const utcSince = new Date(since).toISOString().split(".")[0];
      const utcUntil = new Date(until).toISOString().split(".")[0];
      newSelectedValues['__time_range'] = utcSince + " : " + utcUntil;
    }
  }
  const mappings = {
    "Last": { "index": 1, "day": 1, "week": 7, "month": 31, "quarter": 91, "year": 365 },
    "previous": { "index": 2, "week": 7, "month": 30, "year": 365 }
  }
  if ("Last" === newSelectedValues['__time_range'].split(" ")[0] || "previous" === newSelectedValues['__time_range'].split(" ")[0]) {
    let type = newSelectedValues['__time_range'].split(" ")[0];
    const utcSince = new Date(
      Date.parse(new Date(Date.now()).toDateString())
      - mappings[type][newSelectedValues['__time_range'].split(" ")[mappings[type]["index"]]] * 24 * 3600 * 1000
    ).toISOString().split(".")[0];
    const utcUntil = new Date(Date.parse(new Date(Date.now()).toDateString())).toISOString().split(".")[0];
    newSelectedValues['__time_range'] = utcSince + " : " + utcUntil;
  }
  console.log("@105", newSelectedValues);
  return (dispatch, getState) => {
    if (isValidFilter(getState, chartId)) {
      const components = getState().dashboardLayout.present;
      return dispatch({
        type: CHANGE_FILTER,
        chartId,
        newSelectedValues,
        merge,
        components,
      });
    }
    return getState().dashboardFilters;
  };
}

export const UPDATE_DIRECT_PATH_TO_FILTER = 'UPDATE_DIRECT_PATH_TO_FILTER';
export function updateDirectPathToFilter(chartId, path) {
  return (dispatch, getState) => {
    if (isValidFilter(getState, chartId)) {
      return dispatch({ type: UPDATE_DIRECT_PATH_TO_FILTER, chartId, path });
    }
    return getState().dashboardFilters;
  };
}

export const UPDATE_LAYOUT_COMPONENTS = 'UPDATE_LAYOUT_COMPONENTS';
export function updateLayoutComponents(components) {
  return dispatch => {
    dispatch({ type: UPDATE_LAYOUT_COMPONENTS, components });
  };
}

export const UPDATE_DASHBOARD_FILTERS_SCOPE = 'UPDATE_DASHBOARD_FILTERS_SCOPE';
export function updateDashboardFiltersScope(scopes) {
  return dispatch => {
    dispatch({ type: UPDATE_DASHBOARD_FILTERS_SCOPE, scopes });
  };
}
