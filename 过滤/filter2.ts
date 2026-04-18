import moment from 'moment';
import type {
  RosterDutySheetVO,
  RosterTaskSheetVO,
  SchPairingTaskVO,
  PersonRuleInfo0,
} from '@/services/__generated__/data-contracts';
import type { FilterParam } from '@/models/scheduling/interface';
import { yesOrNo, isBetweenTime } from '@/utils/common';

interface TaskFilterContext {
  columnFilter: Record<string, any>;
  airportObj: Record<string, any>;
  firstDeparture?: string;
  lastArrival?: string;
  hasCaptain?: boolean;
  hasCopilot?: boolean;
  layover?: boolean;
  layoverAirport?: string;
  personList?: any[];
}

type DutyFilterType = 'roster' | 'pairing';

type TaskFilterData = RosterTaskSheetVO | SchPairingTaskVO;

type DutyFilterData = RosterDutySheetVO | SchPairingTaskVO;

type FilterFun<T, C> = (item: T, filterParam: FilterParam, context: C) => boolean;

type TaskFilterFun<T> = FilterFun<T, TaskFilterContext>;

type DutyFilterFun<T> = FilterFun<T, DutyFilterType>;

// type TaskFilterFun<T> = (task: T, filterParam: FilterParam, context: TaskFilterContext) => boolean;
// type DutyFilterParams<T> = [data: T, filterParam: FilterParam, type: DutyFilterType];
// type DutyFilterFun<T> = (...args: DutyFilterParams<T>) => boolean;

// 排班列表列搜索-告警
const filterColumnRosterWarnings: TaskFilterFun<TaskFilterData> = (task, filterParam, context: TaskFilterContext) => {
  const { columnFilter, personList } = context;

  if (columnFilter.rosterWarnings && columnFilter.rosterWarnings.length > 0) {
    return (
      personList?.some((person) => {
        return person.personRuleInfos?.some((x: PersonRuleInfo0) => {
          return x.ruleInfos?.some((y) => columnFilter.rosterWarnings.includes(y.ruleId));
        });
      }) ?? false
    );
  }

  return true;
};

// 起落机场相同
const sameAirport: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  const { firstDeparture, lastArrival } = context;
  if (filterParam.departure && filterParam.arrival && filterParam.departure === filterParam.arrival) {
    return firstDeparture === filterParam.departure && lastArrival === filterParam.arrival;
  }
  return true;
};

// 起飞机场
const departureAirport: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  const departure = task.departureAirport ?? '';
  if (filterParam.departure && filterParam.departure !== filterParam.arrival && departure !== filterParam.departure) {
    return false;
  }
  return true;
};

// 落地机场
const arrivalAirport: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  const arrival = task.arrivalAirport ?? '';
  if (filterParam.arrival && filterParam.arrival !== filterParam.departure && arrival !== filterParam.arrival) {
    return false;
  }
  return true;
};

// 过夜机场
const layoverAirport: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  const { layover, layoverAirport } = context;
  if (filterParam.layoverAirport?.length && layover && !filterParam.layoverAirport.includes(layoverAirport ?? '')) {
    return false;
  }
  return true;
};

// 机型
const fleet: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  if (filterParam.fleet?.length) {
    return filterParam.fleet.includes(task.fleetId ?? '');
  }

  return true;
};

// 起飞时间
const stdRange: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  if (
    filterParam.stdRange?.length === 2 &&
    filterParam.stdRange[0] !== '' &&
    filterParam.stdRange[1] !== '' &&
    task.std
  ) {
    return isBetweenTime(filterParam.stdRange, task.std.slice(11));
  }
  return true;
};

// 落地时间
const staRange: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  if (
    filterParam.staRange?.length === 2 &&
    filterParam.staRange[0] !== '' &&
    filterParam.staRange[1] !== '' &&
    task.sta
  ) {
    return isBetweenTime(filterParam.staRange, task.sta.slice(11));
  }
  return true;
};
// 飞时
const flyMinuteRange: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  if (
    filterParam.stdRange?.length === 2 &&
    filterParam.stdRange[0] !== '' &&
    filterParam.stdRange[1] !== '' &&
    task.std
  ) {
    return isBetweenTime(filterParam.stdRange, task.std.slice(11));
  }
  return true;
};
// 部门
const schDept: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  const { personList } = context;

  if (filterParam.schDept?.length) {
    return personList?.some((x) => filterParam.schDept?.includes(x.schDeptId ?? x.personInfo?.schDeptId)) ?? false;
  }
  return true;
};

// 排班授权
const schAccredit: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  const { personList } = context;

  if (filterParam.schAccredit?.length) {
    return (
      personList?.some((x) => {
        const accredits = x.accredits ?? x.personInfo?.accredits;
        return accredits
          ?.filter(
            (y: any) => y.fleetTypes === task.fleetSeriesId && y.fleetCrewTypes === task.fleetId && y.type !== 'B',
          )
          ?.map((y: any) => y.accreditCode)
          ?.some((y: string) => filterParam.schAccredit!.includes(y));
      }) ?? false
    );
  }

  return true;
};

// 拓展属性
const extendAttribute: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  if (filterParam.routeAttr?.length || filterParam.airportAttr?.length) {
    if (!task.extendValues?.length) {
      // 如果选择了拓展属性，但是航班拓展属性为空，返回false
      return false;
    }

    // 航线属性
    if (filterParam.routeAttr?.length) {
      const routeAttr = filterParam.routeAttr.flat();
      const flag = task.extendValues.some((item) => {
        return routeAttr.includes(item.extendAttrCode ?? '');
      });
      if (!flag) return false;
    }

    // 机场属性
    if (filterParam.airportAttr?.length) {
      const airportAttr = filterParam.airportAttr.flat();
      const flag = task.extendValues.some((item) => {
        return airportAttr.includes(item.extendAttrCode ?? '');
      });
      if (!flag) {
        return false;
      }
    }
  }

  return true;
};

// 机场性质
const airportProperty: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  const { airportObj } = context;
  const departure = task.departureAirport ?? '';
  const arrival = task.arrivalAirport ?? '';

  if (filterParam.airportProperty?.length) {
    return (
      filterParam.airportProperty.includes(airportObj[departure]?.airportProperty ?? '') ||
      filterParam.airportProperty.includes(airportObj[arrival]?.airportProperty ?? '')
    );
  }

  return true;
};

// 机场类型
const airportType: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  const { airportObj } = context;
  const departure = task.departureAirport ?? '';
  const arrival = task.arrivalAirport ?? '';

  if (filterParam.airportType?.length) {
    return (
      filterParam.airportType.includes(airportObj[departure]?.airportType ?? '') ||
      filterParam.airportType.includes(airportObj[arrival]?.airportType ?? '')
    );
  }
  return true;
};

// 国内国际
const flightType: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  if (filterParam.flightType?.length) {
    return filterParam.flightType.includes(task.dorI ?? '');
  }
  return true;
};

// 要班
const reserved: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  const { personList } = context;

  if (filterParam.reserved?.length === 1) {
    const reservedValue = filterParam.reserved[0];
    return (
      personList?.some((x) => {
        if (reservedValue === '1' && yesOrNo(x.reserved)) {
          return true;
        }
        if (reservedValue === '0' && !yesOrNo(x.reserved)) {
          return true;
        }
        return false;
      }) ?? false
    );
  }

  return true;
};

// 生效
const releaseFlag: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  const { personList } = context;

  if (filterParam.releaseFlag?.length === 1) {
    const releaseFlagValue = filterParam.releaseFlag[0];
    return (
      personList?.some((x) => {
        if (releaseFlagValue === '1' && x.releaseFlag === 1) {
          return true;
        }
        if (releaseFlagValue === '0' && x.releaseFlag !== 1) {
          return true;
        }
        return false;
      }) ?? false
    );
  }
  return true;
};

// 排班告警
const rosterWarnings: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  if (filterParam.rosterWarnings?.length === 1) {
    const hasWarnings = !task.rosterWarnings?.length;
    if (filterParam.rosterWarnings[0] === '1' && !hasWarnings) {
      return false;
    }
    if (filterParam.rosterWarnings[0] === '0' && hasWarnings) {
      return false;
    }
  }

  return true;
};

// 机长未排【A001或B001未排人】
const captainUnRoster: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  const { hasCaptain } = context;

  if (filterParam.captainUnRoster?.length === 1) {
    const captainUnRosterValue = filterParam.captainUnRoster[0];
    if (['SET', 'DDH'].includes(task.taskTypeCode ?? '')) {
      return false;
    }
    if (captainUnRosterValue === '1' && hasCaptain) {
      return false;
    }
    if (captainUnRosterValue === '0' && !hasCaptain) {
      return false;
    }
  }

  return true;
};

// 副驾未排【A001和B001之外的岗位未排人】
const copilotUnRoster: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  const { hasCopilot } = context;
  if (filterParam.copilotUnRoster?.length === 1) {
    const copilotUnRosterValue = filterParam.copilotUnRoster[0];
    if (['SET', 'DDH'].includes(task.taskTypeCode ?? '')) {
      return false;
    }
    if (copilotUnRosterValue === '1' && hasCopilot) {
      return false;
    }
    if (copilotUnRosterValue === '0' && !hasCopilot) {
      return false;
    }
  }

  return true;
};

// 置位方式
const setType: TaskFilterFun<TaskFilterData> = (task, filterParam, context) => {
  if (filterParam.setType?.length) {
    return !!task.setType && filterParam.setType.includes(task.setType.toString());
  }
  return true;
};

// 手动
const evaluateClass: DutyFilterFun<DutyFilterData> = (data, filterParam, type) => {
  if (filterParam.evaluateClass?.length === 1) {
    const evaluateClass = filterParam.evaluateClass[0];
    if (evaluateClass === '1' && !yesOrNo(data.evaluateClass)) {
      return false;
    }
    if (evaluateClass === '0' && yesOrNo(data.evaluateClass)) {
      return false;
    }
  }

  return true;
};

// ICAO
const icao: DutyFilterFun<DutyFilterData> = (data, filterParam, type) => {
  if (filterParam.icao?.length === 1) {
    const icao = filterParam.icao[0];
    if (icao === '1' && !yesOrNo(data.icao)) {
      return false;
    }
    if (icao === '0' && yesOrNo(data.icao)) {
      return false;
    }
  }

  return true;
};

// 外籍可飞
const foreignFlag: DutyFilterFun<DutyFilterData> = (data, filterParam, type) => {
  if (filterParam.foreignFlag?.length === 1) {
    const foreignFlag = filterParam.foreignFlag[0];
    if (foreignFlag === '1' && !yesOrNo(data.foreignFlag)) {
      return false;
    }
    if (foreignFlag === '0' && yesOrNo(data.foreignFlag)) {
      return false;
    }
  }

  return true;
};

// 算法结果过滤
const algorithmResult: DutyFilterFun<DutyFilterData> = (data, filterParam, type) => {
  if (filterParam.algorithmResult?.length) {
    const personList: any[] = [];
    if (type === 'roster') {
      Object.values((data as RosterDutySheetVO).schRankVOInfoList ?? {}).forEach((x) => {
        x.personInfoList?.forEach((y) => {
          personList.push({
            rankCode: x.rankCode,
            algType: y.algType,
          });
        });
      });
    } else {
      (data as SchPairingTaskVO).schRosterPersonVOList?.forEach((x) => {
        personList.push({
          rankCode: x.rankCode,
          algType: x.algType,
        });
      });
    }
    const hasCaptain = personList.some((x) => {
      return x.algType === 1 && ['A001', 'B001'].includes(x.rankCode ?? '');
    });
    const hasCopilot = personList.some((x) => {
      return x.algType === 1 && !['A001', 'B001'].includes(x.rankCode ?? '');
    });
    const flag =
      (filterParam.algorithmResult.includes('1') && hasCaptain) ||
      (filterParam.algorithmResult.includes('0') && hasCopilot);
    if (!flag) {
      return false;
    }
  }

  return true;
};

const createCombinedFilter = <T, C>(filters: FilterFun<T, C>[]) => {
  return (item: T, filterParam: FilterParam, context: C) =>
    filters.every((filter) => filter(item, filterParam, context));
};

// const createCombinedTaskFilter = <T>(filters: TaskFilterFun<T>[]) => {
//   const combinedFilter: TaskFilterFun<T> = (task, filterParam, context) =>
//     filters.every((filter) => filter(task, filterParam, context));
//   return combinedFilter;
// };

const createCombinedTaskFilter = <T>(filters: TaskFilterFun<T>[]) => {
  return createCombinedFilter<T, TaskFilterContext>(filters);
};

// const createCombinedDutyFilter = <T>(filters: DutyFilterFun<T>[]) => {
//   return (...args: DutyFilterParams<T>) => {
//     return filters.every((filter) => filter(...args));
//   }
// };

const createCombinedDutyFilter = <T>(filters: DutyFilterFun<T>[]) => {
  return createCombinedFilter<T, DutyFilterType>(filters);
};

const taskFilter = createCombinedTaskFilter<TaskFilterData>([
  filterColumnRosterWarnings,
  sameAirport,
  departureAirport,
  arrivalAirport,
  layoverAirport,
  fleet,
  stdRange,
  staRange,
  flyMinuteRange,
  schDept,
  extendAttribute,
  schAccredit,
  airportProperty,
  airportType,
  flightType,
  reserved,
  releaseFlag,
  rosterWarnings,
  captainUnRoster,
  copilotUnRoster,
  setType,
]);

const dutyFilter = createCombinedDutyFilter<DutyFilterData>([evaluateClass, icao, foreignFlag, algorithmResult]);

// 排班列表过滤
export const rosterDutySheetFilter = (
  duty: RosterDutySheetVO,
  filterParam: FilterParam,
  columnFilter: { [name: string]: any },
  airportObj: Record<string, any>,
) => {
  const fourCodes: string[] | undefined = duty.unitInfo?.fourCode?.split('-');

  if (!dutyFilter(duty, filterParam, 'roster')) {
    return false;
  }
  const ranks = (duty.ranks ?? []) as { code: string; name: string }[];
  const hasCaptain = ranks
    .filter((x) => ['A001', 'B001'].includes(x.code))
    .every((x) => !!duty.schRankVOInfoList?.[x.code]?.personInfoList?.length);
  const hasCopilot = ranks
    .filter((x) => !['A001', 'B001'].includes(x.code))
    .every((x) => !!duty.schRankVOInfoList?.[x.code]?.personInfoList?.length);

  const filterTasks = (duty.taskSheetVOS ?? []).filter((task) => {
    return taskFilter(task, filterParam, {
      columnFilter,
      airportObj,
      firstDeparture: fourCodes?.[0],
      lastArrival: fourCodes?.at(-1),
      hasCaptain,
      hasCopilot,
      layover: true,
      layoverAirport: fourCodes?.at(-1),
      personList: Object.values(task.schRankVOInfoList ?? {}).reduce((total: any[], cur) => {
        return total.concat(cur.personInfoList ?? []);
      }, []),
    });
  });

  return filterTasks.length > 0;
};

// 排班环甘特图过滤
export const schPairingTaskFilter = (
  tasks: SchPairingTaskVO[] | undefined,
  filterParam: FilterParam,
  airportObj: Record<string, any>,
) => {
  const filterTasks = tasks?.filter((task) => {
    // 航班时间
    if (filterParam.rangeDate?.length === 2) {
      const flag = moment(task.flightDate).isBetween(filterParam.rangeDate[0], filterParam.rangeDate[1], null, '[]');
      if (!flag) {
        return false;
      }
    }

    const taskFlag = taskFilter(task, filterParam, {
      columnFilter: {},
      airportObj,
      firstDeparture: tasks[0]?.departureAirport,
      lastArrival: tasks.at(-1)?.arrivalAirport,
      hasCaptain: task.schRosterPersonVOList?.some((x: any) => ['A001', 'B001'].includes(x.rankCode)),
      hasCopilot: !!task.schRosterPersonVOList?.filter((x: any) => !['A001', 'B001'].includes(x.rankCode))?.length,
      layover: task.layover,
      layoverAirport: task.arrivalAirport,
      personList: task.schRosterPersonVOList,
    });
    if (!taskFlag) {
      return false;
    }

    if (!dutyFilter(task, filterParam, 'pairing')) {
      return false;
    }

    return true;
  });

  return filterTasks;
};
