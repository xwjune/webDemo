import FilterEngine from './FilterEngine';
import type { IFilter } from './types';

interface GanttAircraftVO {
  /** 飞机注册号 */
  regNo?: string;
  /** 长机型 */
  longType?: string;
}

/** 飞机过滤条件类型 */
export interface AircraftFilterType {
  longTypes?: string[];
  regNos?: string[];
}

// --- 子过滤器 ---

/** 机型过滤 */
const longTypeFilter: IFilter<GanttAircraftVO, AircraftFilterType> = {
  key: 'longTypes',
  hasValue: (filter) => (filter.longTypes?.length ?? 0) > 0,
  match: (aircraft, filter) => filter.longTypes!.includes(aircraft.longType ?? ''),
};

/** 飞机号过滤 */
const regNoFilter: IFilter<GanttAircraftVO, AircraftFilterType> = {
  key: 'regNos',
  hasValue: (filter) => (filter.regNos?.length ?? 0) > 0,
  match: (aircraft, filter) => filter.regNos!.includes(aircraft.regNo ?? ''),
};

// --- 所有子过滤器 ---
const aircraftFilters: IFilter<GanttAircraftVO, AircraftFilterType>[] = [
  longTypeFilter,
  regNoFilter,
];

/** 创建飞机过滤函数 */
function createAircraftFilter() {
  const engine = new FilterEngine<GanttAircraftVO, AircraftFilterType>();
  engine.registerAll(aircraftFilters);

  return (data: GanttAircraftVO[], filter: AircraftFilterType) => engine.filter(data, filter);
}

export default createAircraftFilter;
