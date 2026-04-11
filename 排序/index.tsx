import { GanttChart } from '@/components';
import { FlightGanttRequest, FlightGanttResponse } from '@/services/protos/FlightGantt';
import { GridRowType, RowLoadData, RowSortConfig, TaskInteractionMode, TaskLoadData } from '@/components/ganttX/types/types';
import { useSize } from 'ahooks';
import { useState, useEffect, useRef, useMemo } from 'react';
import { GanttChartProps } from '@/components/ganttX/app/GanttChart';
import { timestampToTime } from '@/utils/TimeUtils'
import arrowsDownImage from '@/assets/arrowsDown.png';

const SCROLL_SIZE = 17;

const fetchData = async () => {
  const url = '/api/flightGantt/getFlightGanttProto';
  const params = {
    startDate: '2025-01-01',
    endDate: '2025-02-01'
  };
  // 重新获取数据的逻辑
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${url}?${qs}`, {
      headers: { 'Accept': 'application/x-protobuf' }
    });

    const buffer = await res.arrayBuffer();
    const data = FlightGanttResponse.decode(new Uint8Array(buffer)) as FlightGanttResponse;
    // 处理获取到的数据
    return data;
  } catch (error) {
    console.error('刷新数据失败:', error);
    return null;
  }
};



export default function HomePage() {
  const wrapperRef = useRef(null);
  const ganttRef = useRef<React.ElementRef<typeof GanttChart>>(null);
  const size = useSize(wrapperRef);
  const dataRef = useRef<FlightGanttResponse | null>(null);
  const [dataTimeStamp, setDataTimeStamp] = useState(Date.now());
  const [scale, setScale] = useState(50);
  const [rowHeight, setRowHeight] = useState(52)
  const [pinnedRowIds, setPinnedRowIds] = useState<string[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [checkedRowIds, setCheckedRowIds] = useState<string[]>([]);
  const [scrool1Height, setScrool1Height] = useState(200);
  const [scrool2Height, setScrool2Height] = useState(200);
  const [rowSortConfig, setRowSortConfig] = useState<RowSortConfig | undefined>(undefined);
  const [currentTime, setCurrentTime] = useState(new Date('2025-01-01 10:00').getTime())

  const data = dataRef.current;

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleRefresh = async () => {
    fetchData().then(data => {
      // setData(data);
      dataRef.current = null
      dataRef.current = data;
      setDataTimeStamp(Date.now());
    });
  };

  const taskLoadData: TaskLoadData[] = useMemo(() => {
    const tasks: TaskLoadData[] = [];
    data?.flights?.forEach((task, i) => {
      const t: TaskLoadData =
      {
        id: task.id,
        scheduleStartTimestamp: task.std.toNumber() - 3600 * 1000, //传这个触发延误线绘制
        startTimestamp: task.std.toNumber(),
        endTimestamp: task.sta.toNumber(),
        areaId: 'main',
        rowId: task.aircraftNo,
        type: 1,
        height: 46,
        top: 2,
        styleId: Math.round(Math.random() * 3) + 1,
        propLeftTop: { type: 'text', value: '00:00', styleId: "default" }, //延误时间
        propLeft: { type: 'text', value: 'CTU', styleId: "default" },
        propRight: { type: 'text', value: 'CTU', styleId: "default" },
        prop1: {
          type: 'list',
          value: [
            { type: 'icon', value: 'arrowsDown' },      // 图标
            { type: 'icon', value: 'arrowsDown' },      // 图标
            { type: 'text', value: '延误', styleId: 'default' }, // 文字
          ]
        },
        prop2: { type: 'text', value: timestampToTime(task.std.toNumber()), styleId: "default" },
        prop3: { type: 'text', value: timestampToTime(task.std.toNumber()), styleId: "default" },
        prop4: { type: 'text', value: timestampToTime(task.std.toNumber()), styleId: "default" },
        prop5: { type: 'text', value: task.flightNo, styleId: "task_flight_no" },
        prop6: { type: 'text', value: timestampToTime(task.std.toNumber()), styleId: "default" },
        prop7: { type: 'text', value: timestampToTime(task.std.toNumber()), styleId: "default" },
        prop8: { type: 'text', value: timestampToTime(task.std.toNumber()), styleId: "default" },
        prop9: { type: 'text', value: timestampToTime(task.std.toNumber()), styleId: "default" },
      }
      tasks.push(t);
    });
    data?.overNightAirports?.forEach((task, i) => {
      const t: TaskLoadData =
      {
        id: task.id,
        startTimestamp: task.st.toNumber(),
        endTimestamp: task.et.toNumber(),
        areaId: 'main',
        rowId: task.acNo,
        type: 2,
        height: 46,
        top: 2,
        styleId: 100,
        prop5: { type: 'text', value: 'CTU', styleId: "default" },
        interactionMode: TaskInteractionMode.None,
      }
      tasks.push(t);
    })
    data?.turnarounds?.forEach((task, i) => {
      const t: TaskLoadData =
      {
        id: task.id,
        startTimestamp: task.st.toNumber(),
        endTimestamp: task.et.toNumber(),
        areaId: 'main',
        rowId: task.acNo,
        type: 3,
        height: 13,
        top: 33,
        topEnd: 0,
        styleId: 50,
        prop5: { type: 'text', value: timestampToTime(task.et.toNumber() - task.st.toNumber()), styleId: "default" },
        interactionMode: TaskInteractionMode.None,
      }
      tasks.push(t);
    })


    console.log("task count:", tasks.length, data?.flights.length, data?.overNightAirports.length, data?.turnarounds.length)

    return tasks;
  }, [dataTimeStamp]);

  const rowLoadData: RowLoadData[] = useMemo(() => {
    return dataRef.current?.aircrafts?.map((a, i) => {
      const d: RowLoadData =
      {
        id: a.acNo,
        headerColor: 0xFF0000,
        groupId: a.acType,
        groupTitle: { type: 'text', value: a.acType + "title", styleId: "ac_title" },
        rowCount: 1,
        areaId: 'main',
        prop1: { type: 'text', value: a.acNo, styleId: "ac_title" },
        prop2: { type: 'text', value: '90', styleId: "ac_layout" },
        prop3: {
          type: 'list',
          value: [
            { type: 'icon', value: 'arrowsDown' },      // 图标
            { type: 'icon', value: 'arrowsDown' },      // 图标
          ]
        },
      }
      return d;
    }) || [];
  }, [dataTimeStamp]);



  const timeConfig = useMemo(() => ({
    startTime: new Date('2025-01-01 00:00').getTime(),
    endTime: new Date('2025-02-01 00:00').getTime(),
    currentTime,
    timeLines: [
      {
        id: 'now',
        timestamp: currentTime,
        color: 0xFF0000,
        withTag: true
      },
    ]
  }), [currentTime]);

  const focusRandomTask = () => {
    const ids = dataRef.current?.flights?.map(f => f.id).slice(0, 1000);
    if (ids) {
      ganttRef.current?.focusTask(ids?.[Math.floor(Math.random() * ids.length)] || ids[0]);
    }
  }

  const focusRandomTime = () => {
    const time = timeConfig.startTime + Math.floor(Math.random() * 24 * 60 * 60 * 1000 * 10)
    console.log("focus time ", new Date(time))
    ganttRef.current?.focusTime(time);
  }

  const focusRowRandom = () => {
    const aircrafts = dataRef.current?.aircrafts;
    if (aircrafts && aircrafts.length > 0) {
      // 随机选择一个飞机ID（飞机是行）
      const randomAircraft = aircrafts[Math.floor(Math.random() * aircrafts.length)];
      console.log("随机定位行:", randomAircraft.acNo, randomAircraft.acType);
      ganttRef.current?.focusRow(randomAircraft.acNo);
    }
  }

  const updateScaleAdd = () => {
    setScale((s) => s + 10);
  }

  const updateScaleMin = () => {
    setScale((s) => Math.max(10, (s - 10)));
  }

  const updateRowHeight = () => {
    setRowHeight(46 + Math.floor(Math.random() * 100))
  }

  const collapseSection1 = () => {
    ganttRef.current?.collapseSection("scroll1");
  }
  const collapseSection2 = () => {
    ganttRef.current?.collapseSection("scroll2");
  }

  const expandSection1 = () => {
    ganttRef.current?.expandSection("scroll1");
  }
  const expandSection2 = () => {
    ganttRef.current?.expandSection("scroll2");
  }


  // 随机分组排序
  const randomGroupSort = () => {
    const isAscending = Math.random() > 0.5;
    console.log(`随机分组排序: ${isAscending ? '升序' : '降序'}`);

    setRowSortConfig({
      groupComparator: (a, b) => {
        const result = String(a).localeCompare(String(b), undefined, {
          numeric: true,
          sensitivity: 'base'
        });
        return isAscending ? result : -result;
      }
    });
  };

  // 随机行排序
  const randomRowSort = () => {
    const isAscending = Math.random() > 0.5;
    console.log(`随机行排序: ${isAscending ? '升序' : '降序'}`);

    setRowSortConfig({
      rowComparator: (a, b) => {
        const result = String(a.id).localeCompare(String(b.id), undefined, {
          numeric: true,
          sensitivity: 'base'
        });
        return isAscending ? result : -result;
      }
    });
  };

  const addCurrentTime = () => {
    setCurrentTime(t => t + 60 * 1000)
  }

  const batchUpdateRows = () => {
    if (!dataRef.current?.aircrafts || !dataRef.current?.flights || !ganttRef.current) return;

    // 1. 随机选取行
    const allRows = dataRef.current.aircrafts;
    const updateCount = Math.floor(Math.random() * 3) + 10;
    const selectedRows: any[] = [];
    const indices = new Set<number>();
    while (indices.size < updateCount && indices.size < allRows.length) {
      indices.add(Math.floor(Math.random() * allRows.length));
    }
    indices.forEach(idx => selectedRows.push(allRows[idx]));

    // 2. 构造更新包
    const updates = selectedRows.map(row => {
      // 获取该行原有航班
      let rowFlights = dataRef.current?.flights.filter(f => f.aircraftNo === row.acNo) || [];

      // ★★★ 关键步骤 1: 必须按时间排序，否则无法计算级联延误 ★★★
      rowFlights.sort((a, b) => a.std.toNumber() - b.std.toNumber());

      const newTasks: TaskLoadData[] = [];

      // 用于记录上一个航班的结束时间，防止碰撞
      let lastEndTime = 0;
      // 最小间隔时间 (比如 30分钟过站)
      const minGap = 30 * 60 * 1000;

      rowFlights.forEach(flight => {
        // A. 模拟删除 (20% 概率)
        if (Math.random() < 0.2) return;

        let newStd = flight.std.toNumber();
        let newSta = flight.sta.toNumber();
        const duration = newSta - newStd;
        let isDelayed = false;

        // B. 模拟随机延误 (30% 概率)
        if (Math.random() < 0.3) {
          isDelayed = true;
          const delay = (Math.random() * 2 + 0.5) * 3600 * 1000;
          newStd += delay;
          newSta += delay;
        }

        // ★★★ 关键步骤 2: 碰撞检测与顺延 ★★★
        // 如果当前航班的开始时间 < 上一个航班的结束时间 + 最小间隔
        // 则强制推迟当前航班
        if (newStd < lastEndTime + minGap) {
          newStd = lastEndTime + minGap;
          newSta = newStd + duration;
          // 如果是被迫顺延，通常也算延误
          isDelayed = true;
        }

        // 更新 lastEndTime
        lastEndTime = newSta;

        // 构造 TaskLoadData
        const t: TaskLoadData = {
          id: flight.id,
          startTimestamp: newStd,
          endTimestamp: newSta,
          areaId: 'main',
          rowId: row.acNo,
          type: 1,
          height: 46,
          top: 2,
          styleId: isDelayed ? 3 : 1, // 简化的样式逻辑
          propLeft: { type: 'text', value: isDelayed ? 'DLY' : 'CTU', styleId: "default" },
          propRight: { type: 'text', value: 'CTU', styleId: "default" },
          prop1: {
            type: 'list',
            value: [
              { type: 'icon', value: 'arrowsDown' },      // 图标
              { type: 'icon', value: 'arrowsDown' },      // 图标
              { type: 'text', value: '延误', styleId: 'default' }, // 文字
            ]
          },
          prop2: { type: 'text', value: timestampToTime(flight.std.toNumber()), styleId: "default" },
          prop3: { type: 'text', value: timestampToTime(flight.std.toNumber()), styleId: "default" },
          prop4: { type: 'text', value: timestampToTime(flight.std.toNumber()), styleId: "default" },
          prop5: { type: 'text', value: flight.flightNo, styleId: "task_flight_no" },
          prop6: { type: 'text', value: timestampToTime(flight.std.toNumber()), styleId: "default" },
          prop7: { type: 'text', value: timestampToTime(flight.std.toNumber()), styleId: "default" },
          prop8: { type: 'text', value: timestampToTime(flight.std.toNumber()), styleId: "default" },
          prop9: { type: 'text', value: timestampToTime(flight.std.toNumber()), styleId: "default" },
        };
        newTasks.push(t);
      });

      return {
        rowId: row.acNo,
        rowCount: Math.random() > 0.7 ? 2 : 1,
        tasks: newTasks
      };
    });

    // 3. 调用更新
    if ((ganttRef.current as any).batchUpdateRows) {
      (ganttRef.current as any).batchUpdateRows(updates);
    }
  }



  if (!size || size?.width === 0) {
    return <div ref={wrapperRef} style={{ height: '100vh', boxSizing: 'border-box' }}></div>
  }

  const minVisibleWidths = {
    prop2: 50,
    prop5: 80,
    prop8: 50,

    prop1: 100,
    prop4: 100,
    prop7: 100,

    prop3: 150,
    prop6: 150,
    prop9: 150,
  }


  const props: GanttChartProps = {
    timeConfig,
    layoutConfig: {
      width: size.width,
      gridWidth: 200,
      height: size.height,
      timeHeaderHeight: 36,
      scrollSize: SCROLL_SIZE,
      rowHeight: rowHeight,
      borderColor: '#999',
      scale: scale,
      resolution: 2,
      sectionConfigs: [
        { id: 'main', height: size.height - scrool1Height - scrool2Height, canPin: true, maxPinnedHeight: 300, resizer: true, gridRow: GridRowType.Double, },
        {
          id: 'scroll1', height: scrool1Height, canPin: false, resizer: true, gridRow: GridRowType.Single,
          header: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: 35, marginLeft: 10, background: '#DBE3EE' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>待排区</span>
              <span style={{ color: '#666', fontSize: '12px' }}>(0/101)</span>
            </div>
          )
        },
        {
          id: 'scroll2', height: scrool2Height, canPin: false, resizer: false, gridRow: GridRowType.Single,
          header: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: 35, marginLeft: 10, background: '#DBE3EE' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>取消区</span>
              <span style={{ color: '#666', fontSize: '12px' }}>(0/101)</span>
            </div>
          )

        },
      ]
    },
    interactionConfig: {
      pinnedRowIds,
      onRowsPinned: (newRowIds: (string | number)[], isPinned: boolean) => {
        setPinnedRowIds((rowIds) => {
          let newPinnedRowIds;
          if (isPinned) {
            newPinnedRowIds = [...rowIds, ...newRowIds]
          } else {
            newPinnedRowIds = rowIds.filter(id => newRowIds.filter(newId => newId === id).length === 0);
          }
          return newPinnedRowIds as string[];
        });
      },
      selectedTaskIds, //选中的任务
      checkedRowIds,  //选中的行
      onTasksSelected: (taskIds) => {
        console.log('selectedTaskIds:', taskIds);
        setSelectedTaskIds(taskIds as string[]);
      },
      onTaskClick: (taskId: string) => {
        console.log('taskClicked taskId:', taskId);
      },
      onTaskDbClick: (taskId: string) => {
        console.log('task Double Clicked taskId:', taskId);
      },
      onBeforeDragStart(axis, leader, selection) {
        console.log('beforeDragStart axis:', axis, 'leader:', leader, 'selection:', selection);
        let allowedIds: string[] = []
        if (axis === 'x') {
          allowedIds = selection
            .filter(item => item.rowId === leader.rowId) // 只保留同行任务
            .map(item => item.id);
        } else {
          allowedIds = selection.map(item => item.id);
        }
        console.log(`[DragFilter] Leader Row: ${leader.rowId}. Allowed tasks: ${allowedIds.length}/${selection.length}`);
        return allowedIds;
      },
      onTaskDrop: (items) => {
        console.table(items);
      },
      onTaskContextMenu: (taskId: string | number, x: number, y: number) => {
        console.log('taskContextMenu taskId:', taskId, x, y);
      },
      onTaskHover: (taskId: string | number, x: number, y: number, propIndex: number | null) => {
        // console.log('onTaskHover - TaskId:', taskId, 'Position:', { x, y }, 'PropIndex:', propIndex);
      },
      onRowContextMenu: (rowId: string | number, time: number, x: number, y: number) => {
        console.log('rowContextMenu rowId:', rowId, new Date(time), x, y);
      },
      onGridContextMenu: (sectionId: string, rowId: string | number | undefined, x: number, y: number) => {
        console.log('gridContextMenu sectionId:', sectionId, rowId, x, y);
      },
      onRowsChecked: (rowIds: string[]) => {
        console.log('rowsChecked:', rowIds);
      },
      onTimeRangeSelected(startTimestamp: number, endTimestamp: number) {
        console.log('timeRangeSelected:', timestampToTime(startTimestamp), timestampToTime(endTimestamp));
      },
      onLayoutChange: (layoutConfig) => {
        console.log('onLayoutChange:', layoutConfig);
      },
    },
    rowSortConfig,
    resourceConfig: {
      icons: {
        "arrowsDown": arrowsDownImage,
      },
      textStyles: {
        "task_flight_no": { fill: 0x374553, fontWeight: 'bold', fontSize: 14 },
        "default": { fill: 0x000000, fontSize: 11 },
        "ac_title": { fill: 0x0000000, fontSize: 15, fontWeight: 'bold' },
        "ac_layout": { fill: 0x374553, fontSize: 11 }
      },
      taskStyles: [
        //正常航班
        {
          id: 1, backgroundColor: 0xD2E6FF, borderColor: 0x3190FF, borderWidth: 2,
          processBgColor: 0xEBA6ED,
          processBorderColor: 0xD679D9,
          stripeColor: undefined, redX: false,
          titleColor: 0xED7227,
          minVisibleWidths
        },
        //机务条
        {
          id: 2, backgroundColor: 0xFFCACD, borderColor: 0x3190FF, borderWidth: 2, stripeColor: 0xFAB6BA, redX: false
        },
        //取消航班
        {
          id: 3, backgroundColor: 0xD2E6FF, borderColor: 0x3190FF, borderWidth: 2, stripeColor: undefined, redX: true,
          minVisibleWidths
        },
        {
          id: 4, backgroundColor: 0xD2E6FF, borderColor: 0x3190FF, borderWidth: 2,
          processBgColor: 0xEBA6ED,
          processBorderColor: 0xD679D9,
          stripeColor: undefined, redX: false,
          opacity: 0.5,
          minVisibleWidths
        },
        {
          id: 50, backgroundColor: 0xEDE0E6, borderColor: 0xEDE0E6, borderWidth: 10
        },

        //过夜机场
        {
          id: 100,
        },

      ]
    },
    data: {
      taskLoadData,
      rowLoadData
    }
  };
  return (
    <div style={{ height: '100vh', boxSizing: 'border-box' }}>
      <div style={{ height: 50, borderBottom: '1px solid #999', boxSizing: 'border-box' }}>
        <button onClick={() => handleRefresh()}>刷新</button>
        <button onClick={() => {
          setPinnedRowIds(['737-121']);
        }}>固定</button>
        <button onClick={() => {
          setPinnedRowIds([]);
        }}>取消固定</button>
        <button onClick={() => {
          const ids = data?.flights?.map(f => f.id).slice(0, 1000);
          setSelectedTaskIds(ids ?? []);
        }}>选中任务</button>
        <button onClick={() => {
          setSelectedTaskIds([]);
        }}>取消选中任务</button>
        <button onClick={() => {
          const ids = data?.aircrafts?.map(a => a.acNo).slice(0, 10);
          setCheckedRowIds(ids ?? []);
        }}>选中行</button>
        <button onClick={() => {
          setCheckedRowIds([]);
        }}>取消选中</button>
        <button onClick={() => {
          focusRandomTask();
        }}>随机定位</button>
        <button onClick={() => {
          focusRandomTime();
        }}>随机时间定位</button>
        <button onClick={() => {
          focusRowRandom();
        }}>随机定位行</button>
        <button onClick={() => {
          batchUpdateRows();
        }}>增量更新</button>
        <button onClick={() => {
          updateScaleAdd();
        }}>增加scale</button>
        <button onClick={() => {
          updateScaleMin();
        }}>减少scale</button>
        <button onClick={() => {
          updateRowHeight();
        }}>改变rowHeight</button>
        <button onClick={() => {
          collapseSection1();
        }}>收起待排区</button>
        <button onClick={() => {
          collapseSection2();
        }}>收起取消区</button>
        <button onClick={() => {
          expandSection1();
        }}>打开待排区</button>
        <button onClick={() => {
          expandSection2();
        }}>打开取消区</button>
        <button onClick={() => {
          randomGroupSort();
        }}>随机分组排序</button>
        <button onClick={() => {
          randomRowSort();
        }}>随机行排序</button>

        <button onClick={() => {
          addCurrentTime();
        }}>推进时间</button>
      </div>
      <div ref={wrapperRef} style={{ height: 'calc(100vh - 50px)', boxSizing: 'border-box' }}>
        <GanttChart ref={ganttRef} {...props} />
      </div>
    </div>
  );
}