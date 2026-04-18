import moment from 'moment';
import type { PersonInfoWithTotal } from '@/typings';
import { AirportData } from '@/services';

interface FilterType {
  schDept?: string[];
  baseCodeList?: string[];
  timeRange?: { startTime: string; endTime: string };
  noTask?: boolean;
  fleetSeries?: string[];
  fleet?: string[];
  accredit?: string[];
  qualification?: string[][];
  passport?: string[];
  certType?: string[];
  personType?: string[];
  specificAirport?: string[];
  bwAirport?: string[];
  country?: string[];
  isAutoRoster?: string;
}

type FilterFun<T> = (item: T, filter: FilterType, context?: Record<string, any>) => boolean;

type ConditionFun<T> = (item: T) => boolean;

interface FilterConfig {
  key: keyof FilterType;
  filter: FilterFun<PersonInfoWithTotal>;
  requiresContext?: boolean;
}

// 判断 时间区间是否 与 筛选区域有交集
function isDuringDate(beginDateStr: string, endDateStr: string, curDateBegin: string, curDateEnd: string) {
  let beginDate = moment(beginDateStr);
  let endDate = moment(endDateStr);
  let curDateBeginTime = moment(curDateBegin);
  if (!curDateEnd) {
    if (curDateBeginTime.isSameOrAfter(beginDate, 'day') && curDateBeginTime.isSameOrBefore(endDate, 'day')) {
      return true; // 在范围内
    }
    return false; // 不在范围内
  } else {
    let curDateEndTime = moment(curDateEnd);
    if (curDateBeginTime.isSameOrAfter(beginDate, 'day') && curDateBeginTime.isSameOrBefore(endDate, 'day')) {
      return true;
    }
    if (curDateEndTime.isSameOrAfter(beginDate, 'day') && curDateEndTime.isSameOrBefore(endDate, 'day')) {
      return true;
    }
    if (curDateBeginTime.isSameOrBefore(beginDate, 'day') && curDateEndTime.isSameOrAfter(endDate, 'day')) {
      return true;
    }
    return false;
  }
}

// 部门
const schDept: FilterFun<PersonInfoWithTotal> = (item, filter) => {
  if (!filter.schDept?.length) return true;

  return filter.schDept.includes(item.person?.schDeptId ?? '');
};

// 人员基地
const baseCodeList: FilterFun<PersonInfoWithTotal> = (item, filter) => {
  if (!filter.baseCodeList?.length) return true;

  return filter.baseCodeList.includes(item.person?.baseAirport ?? '');
};

// 无任务日期
const timeRange: FilterFun<PersonInfoWithTotal> = (item, filter) => {
  if (!filter.timeRange?.startTime || !filter.timeRange?.endTime) return true;

  return !item.tasks?.some((task) =>
    isDuringDate(task.td ?? '', task.ta ?? '', filter.timeRange!.startTime, filter.timeRange!.endTime),
  );
};

// 无任务
const noTask: FilterFun<PersonInfoWithTotal> = (item, filter, context) => {
  if (!filter.noTask) return true;

  const date = context?.date;
  return !item.tasks?.some((task) => task.flightDate === date);
};

// 机型系列
const fleetSeries: FilterFun<PersonInfoWithTotal> = (item, filter) => {
  if (!filter.fleetSeries?.length) return true;

  return (
    item.accredits?.some((accredit) => accredit.fleetTypes && filter.fleetSeries!.includes(accredit.fleetTypes)) ??
    false
  );
};

// 机型
const fleet: FilterFun<PersonInfoWithTotal> = (item, filter) => {
  if (!filter.fleet?.length) return true;

  return (
    item.accredits?.some((accredit) => accredit.fleetCrewTypes && filter.fleet!.includes(accredit.fleetCrewTypes)) ??
    false
  );
};

// 授权
const accredit: FilterFun<PersonInfoWithTotal> = (item, filter) => {
  if (!filter.accredit?.length) return true;

  return (
    item.accredits?.some((accredit) => accredit.accreditCode && filter.accredit!.includes(accredit.accreditCode)) ??
    false
  );
};

// 资格资质
const qualification: FilterFun<PersonInfoWithTotal> = (item, filter) => {
  if (!filter.qualification?.length) return true;

  return filter.qualification.every((qual) => {
    return (
      item.personQualifications?.some((personQual) => {
        if (qual.length === 1 && qual[0] === personQual.qlfId) {
          return true;
        }
        // 存在子项
        if (qual.length > 1 && qual[0] === personQual.qlfId && qual[1] === personQual.qlfTypeId) {
          return true;
        }
        return false;
      }) ?? false
    );
  });
};

// 出入境证件
const passport: FilterFun<PersonInfoWithTotal> = (item, filter) => {
  if (!filter.passport?.length) return true;

  return (
    item.passportAndVisaDTOS?.some(
      (passport) => passport.certTypeId && filter.passport!.includes(passport.certTypeId),
    ) ?? false
  );
};

// 证照
const certType: FilterFun<PersonInfoWithTotal> = (item, filter) => {
  if (!filter.certType?.length) return true;

  return (
    item.passportAndVisaDTOS?.some((cert) => cert.certTypeId && filter.certType!.includes(cert.certTypeId)) ?? false
  );
};

// 人员类型
const personType: FilterFun<PersonInfoWithTotal> = (item, filter) => {
  if (!filter.personType?.length) return true;

  return (
    item.extendValues?.some(
      (extend) => extend.extendAttrValue && extend.extendAttrCode && filter.personType!.includes(extend.extendAttrCode),
    ) ?? false
  );
};

// 机场放单
const specificAirport: FilterFun<PersonInfoWithTotal> = (item, filter, context) => {
  if (!filter.specificAirport?.length) return true;

  const airportMap = context?.airportMap;
  if (!airportMap) return false;

  const airports = item.person?.specificAirport ? item.person.specificAirport.split(',') : [];
  return filter.specificAirport.every((code) => airports.includes(airportMap[code]?.cityName));
};

// 报务放单
const bwAirport: FilterFun<PersonInfoWithTotal> = (item, filter, context) => {
  if (!filter.bwAirport?.length) return true;

  const airportMap = context?.airportMap;
  if (!airportMap) return false;

  const airports = item.person?.bwAirport ? item.person.bwAirport.split(',') : [];
  return filter.bwAirport.every((code) => airports.includes(airportMap[code]?.cityName));
};

// 国籍
const country: FilterFun<PersonInfoWithTotal> = (item, filter) => {
  if (!filter.country?.length) return true;

  return filter.country.includes(item.person?.country ?? '');
};

// 参与自动排班
const isAutoRoster: FilterFun<PersonInfoWithTotal> = (item, filter) => {
  if (!filter.isAutoRoster) return true;

  const isAutoRoster = item.isAutoRoster ?? item.person?.isAutoRoster;
  return filter.isAutoRoster === isAutoRoster;
};

// 过滤条件注册表
const filterConfigs: FilterConfig[] = [
  { key: 'schDept', filter: schDept },
  { key: 'baseCodeList', filter: baseCodeList },
  { key: 'timeRange', filter: timeRange },
  { key: 'noTask', filter: noTask, requiresContext: true },
  { key: 'fleetSeries', filter: fleetSeries },
  { key: 'fleet', filter: fleet },
  { key: 'accredit', filter: accredit },
  { key: 'qualification', filter: qualification },
  { key: 'passport', filter: passport },
  { key: 'certType', filter: certType },
  { key: 'personType', filter: personType },
  { key: 'specificAirport', filter: specificAirport, requiresContext: true },
  { key: 'bwAirport', filter: bwAirport, requiresContext: true },
  { key: 'country', filter: country },
  { key: 'isAutoRoster', filter: isAutoRoster },
];

// 创建过滤条件
const createFilterConditions = (filter: FilterType, context: Record<string, any>) => {
  const conditions: ConditionFun<PersonInfoWithTotal>[] = [];

  filterConfigs.forEach((config) => {
    // 检查参数是否存在且不为空
    const filterValue = filter[config.key];
    const hasValue = Array.isArray(filterValue)
      ? filterValue.length > 0
      : filterValue !== undefined && filterValue !== null && filterValue !== '' && filterValue !== false;

    // 检查是否需要上下文
    const isRequiredContext = config.requiresContext;

    if (hasValue) {
      if (isRequiredContext) {
        conditions.push((item) => config.filter(item, filter, context));
      } else {
        conditions.push((item) => config.filter(item, filter));
      }
    }
  });

  return conditions;
};

export default function filterData(
  dataSource: Array<PersonInfoWithTotal>,
  filter: FilterType,
  date: string,
  airportMap: Record<string, AirportData>,
) {
  // 创建上下文
  const context = { date, airportMap };

  // 创建过滤条件
  const conditions = createFilterConditions(filter, context);

  // 应用所有过滤条件
  const filterList =
    conditions.length > 0 ? dataSource.filter((item) => conditions.every((condition) => condition(item))) : dataSource;

  return filterList;
}
