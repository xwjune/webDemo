import createAircraftFilter, {
  type AircraftFilterType,
} from './aircraftFilter';

/** 飞机过滤函数（已注册所有子过滤器） */
const aircraftFilter = createAircraftFilter();

export { aircraftFilter, AircraftFilterType };
