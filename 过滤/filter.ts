/**
 * 高级过滤，根据选择条件过滤数据
 */

type DataType = Record<string, any>;

interface FilterType {
  schDept?: string[]
  specificAirport?: string[];
  country?: string[];
}

type FilterFun<T> = (item: T, filter: FilterType, context?: Record<string, any>) => boolean;

type ConditionFun<T> = (item: T) => boolean;

interface FilterConfig {
  key: keyof FilterType;
  filter: FilterFun<DataType>;
}

// 部门
const schDept: FilterFun<DataType> = (item, filter) => {
  if (!filter.schDept?.length) return true;

  return filter.schDept.includes(item.person?.schDeptId ?? '');
};

// 机场放单
const specificAirport: FilterFun<DataType> = (item, filter, context) => {
  if (!filter.specificAirport?.length) return true;

  const airportMap = context?.airportMap;
  if (!airportMap) return false;

  const airports = item.person?.specificAirport ? item.person.specificAirport.split(',') : [];
  return filter.specificAirport.every((code) => airports.includes(airportMap[code]?.cityName));
};

// 国籍
const country: FilterFun<DataType> = (item, filter) => {
  if (!filter.country?.length) return true;

  return filter.country.includes(item.person?.country ?? '');
};

// 过滤条件注册表
const filterConfigs: FilterConfig[] = [
  { key: 'schDept', filter: schDept },
  { key: 'specificAirport', filter: specificAirport },
  { key: 'country', filter: country },
];

// 创建过滤条件
const createFilterConditions = (filter: FilterType, context?: Record<string, any>) => {
  const conditions: ConditionFun<DataType>[] = [];

  filterConfigs.forEach((config) => {
    // 检查参数是否存在且不为空
    const filterValue = filter[config.key];
    const hasValue = Array.isArray(filterValue)
      ? filterValue.length > 0
      : filterValue !== undefined &&
        filterValue !== null &&
        filterValue !== '' &&
        filterValue !== false;

    if (hasValue) {
      conditions.push((item) => config.filter(item, filter, context));
    }
  });

  return conditions;
};

export default function filterData(
  dataSource: DataType[],
  filter: FilterType,
  airportMap: Record<string, any>,
) {
  // 创建上下文
  const context = { airportMap };

  // 创建过滤条件
  const conditions = createFilterConditions(filter, context);

  if (conditions.length === 0) return dataSource;

  return dataSource.filter((item) =>
    conditions.every((condition) => condition(item)),
  );
}
