import {createAsyncThunk} from '@reduxjs/toolkit';
import {LoadStatus} from "@/reporting/data/loadStatus";

export interface DataThunkOptions<ConfigParams, Params, Item> {
  name: string;
  defaultConfig: Record<string, any>;
  getDataGenerator: (config: ConfigParams, params: Params) => AsyncGenerator<Item>;
  statusAction: (status: LoadStatus) => any;
  addItemAction: (item: Item) => any;
}

