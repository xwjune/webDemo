/**
 * 高级过滤，根据选择条件过滤数据
 */

type DataType = Record<string, any>;

interface FilterType {
  schDept?: string[]
  accredit?: string[];
  specificAirport?: string[];
  country?: string[];
}

type FilterFun<T> = (item: T, filter: FilterType, context?: Record<string, any>) => boolean;

type ConditionFun<T> = (item: T) => boolean;

interface FilterConfig {
  key: keyof FilterType;
  filter: FilterFun<DataType>;
  requiresContext?: boolean;
}

// 部门
const schDept: FilterFun<DataType> = (item, filter) => {
  if (!filter.schDept?.length) return true;

  return filter.schDept.includes(item.person?.schDeptId ?? '');
};


// 授权
const accredit: FilterFun<DataType> = (item, filter) => {
  if (!filter.accredit?.length) return true;

  return (
    item.accredits?.some((accredit) => accredit.accreditCode && filter.accredit!.includes(accredit.accreditCode)) ??
    false
  );
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
  { key: 'accredit', filter: accredit },
  { key: 'specificAirport', filter: specificAirport, requiresContext: true },
  { key: 'country', filter: country },
];

// 创建过滤条件
const createFilterConditions = (filter: FilterType, context: Record<string, any>) => {
  const conditions: ConditionFun<DataType>[] = [];

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
  dataSource: Array<DataType>,
  filter: FilterType,
  date: string,
  airportMap: Record<string, any>,
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
