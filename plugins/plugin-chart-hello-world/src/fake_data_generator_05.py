# %%
import pandas as pd
import numpy as np
import json
from collections import Counter

np.random.seed(4444)
# %% core dataˇ
activity_name_1 = {
    "Step 1": "01_waiting",
    "Step 2": "02_pick up",
    "Step 3": "03_place on fixture",
    "Step 4": "04_pick up tool",
    "Step 5": "05_pick up screw",
    "Step 6": "06_place scew",
    "Step 7": "07_screw operation",
    "Step 8": "08_put back tool",
    "Step 9": "09_remove from fixture",
    "Step 10": "10_inspection",
    "Step 11": "11_return item"
}

lean_cat_1 = {
    "Step 1": "NVA",
    "Step 2": "RNVA",
    "Step 3": "RNVA",
    "Step 4": "RNVA",
    "Step 5": "RNVA",
    "Step 6": "VA",
    "Step 7": "VA",
    "Step 8": "RNVA",
    "Step 9": "RNVA",
    "Step 10": "RNVA",
    "Step 11": "RNVA",
}

target_time_1 = {
    "Step 1": 10,
    "Step 2": 1,
    "Step 3": 2.5,
    "Step 4": 2.5,
    "Step 5": 1,
    "Step 6": 5,
    "Step 7": 10,
    "Step 8": 1,
    "Step 9": 3,
    "Step 10": 3,
    "Step 11": 1,
}

var_data_1 = {
    # core-lab data (3 columns)

    "act_target": target_time_1,
    "act_name": activity_name_1,
    "act_lean": lean_cat_1,
}

constant_data_1 = {
    # core-lab data (5 columns)
    "workstation_id": 1,
    "workstation_name": "AE-33",
    "camera_id": "2",
    "camera_name": "CAM_001",
    "pos": 1,
    "target_cycle_time": sum(target_time_1.values()),
    "batch_size": 1,
    "device_id": "0123",
    "product_code": "phone2022",
    "product_description": "phone2022-description",
    "workstation_description": "LXKS_C02-2FT-02_2_A_AE-33_0700-1800",
    # External data (6 columns)
    "cm_site": "LXKS",
    "building_floor_line": "C02-2FT-02",
    "qpl": "2",
    "line_side": "A",
    "shift": "0700-1800",
}

# missing stepts probability
prob_1 = {
    "Step 1": 1,
    "Step 2": 1,
    "Step 3": 0.98,
    "Step 4": 1,
    "Step 5": 0.92,
    "Step 6": 1,
    "Step 7": 1,
    "Step 8": 0.92,
    "Step 9": 0.97,
    "Step 10": 0.85,
    "Step 11": 1,
}

# %% generate table (total 21 columns)
TABLE = {
    # inference outputs (5 columns)
    "event_ts": [],
    "event_ts_timezone": [],
    "cycle_time": [],
    "missing_activity": [],
    "wrong_sequence": [],
    "missed_activities": [],
    "total_activities": [],
    "activities": [],
    # core data (9 columns)
    "worker_presence": [],
    "worker_absent": [],
    "process_time": [],
    "idle_time": [],
    "target_cycle_time": [],
    "batch_size": [],
    "device_id": [],
    "product_code": [],
    "product_description": [],

    # External data (6+1 columns)
    "workstation_id": [],
    "workstation_name": [],
    "workstation_description": [],
    "camera_id": [],
    "camera_name": [],
    "pos": [],
    "cm_site": [],
    "building_floor_line": [],
    "qpl": [],
    "line_side": [],
    "shift": [],
    "op_id": [],
}
# content list
content = [
    "event_ts",
    "event_ts_timezone",
    "time",
    "name",
    "sequence",
    "lean",
    "target_time"
]

# %% functions


def generate_activity_data(var_data, prob, target_time, timestamp):
    act_dic = {}
    for i in range(len(var_data["act_target"].keys())):
        act_dic[f"Step {i+1}"] = {}
    CT = 0
    seq = 0
    for p in act_dic.keys():
        if np.random.binomial(1, prob[p]) == 1:
            seq += 1
            act_time = round(target_time[p]*0.8*(1+np.random.gamma(1, 0.5)), 2)
            CT += act_time
            timestamp += act_time
            act_dic[p]["event_ts"] = int(timestamp)
            act_dic[p]["event_ts_timezone"] = int(timestamp)
            act_dic[p]["time"] = act_time
            act_dic[p]["sequence"] = seq
        else:
            for j in content:
                act_dic[p][j] = "null" 
                if "sequence" == j:
                    act_dic[p][j] = -1
                elif "time" == j:
                    act_dic[p][j] = 0
                elif "event_ts" == j:
                    act_dic[p][j] = -1
                elif "event_ts_timezone" == j:
                    act_dic[p][j] = -1
                
        act_dic[p]["name"] = var_data["act_name"][p]
        act_dic[p]["lean"] = var_data["act_lean"][p]
        act_dic[p]["target_time"] = var_data["act_target"][p]
    return CT, timestamp, act_dic


def fill_in_data(activity_data, table, constant_data):
    CT, timestamp, act_dic = activity_data
    for i in list(constant_data.keys()):
        table[i].append(constant_data[i])
    table["event_ts"].append(int(timestamp))
    table["event_ts_timezone"].append(int(timestamp))
    table["cycle_time"].append(CT)
    missed_count = Counter([act_dic[i]['sequence'] for i in act_dic.keys()])['null']
    table['missing_activity'].append("missing" if missed_count > 0 else "complete")
    table['wrong_sequence'].append("wrong" if False in [int(
        i.split(" ")[-1]) == act_dic[i]['sequence'] for i in act_dic.keys()] else "correct")
    table["activities"].append(json.dumps(act_dic))
    table["missed_activities"].append(missed_count)
    table["total_activities"].append(11)
    table["worker_presence"].append(CT)
    table["worker_absent"].append(0)
    table["process_time"].append(-1)
    table["idle_time"].append(-1)
    table["op_id"].append(constant_data["qpl"] + "-" + constant_data["shift"])
    return timestamp


# %% generate data
# Initialization
table_1 = TABLE.copy()
cycle_observed = 255
loop = 0
timestamp = int(1649922530)
# execute generating process
while loop < cycle_observed:
    CT, timestamp, act_dict = generate_activity_data(var_data_1, prob_1, target_time_1, timestamp)
    timestamp = fill_in_data((CT, timestamp, act_dict), table_1, constant_data_1)
    loop += 1
df = pd.DataFrame(table_1)
df["event_ts"] = pd.to_datetime(df["event_ts"], unit='s')
df["event_ts_timezone"] = pd.to_datetime(df["event_ts_timezone"], unit='s')
df.to_csv("./fake_data_json.csv", index=False)