/**
 * 通用过滤器接口
 * T: 待过滤的数据项类型
 * F: 过滤条件类型
 */
export interface IFilter<T, F> {
  /** 过滤器对应的条件字段 key */
  key: keyof F & string;

  /** 判断条件是否有值（有值时才加入过滤链） */
  hasValue: (filter: F) => boolean;

  /** 执行过滤，返回 true 表示该项通过 */
  match: (item: T, filter: F, context?: Record<string, any>) => boolean;
}

/** 过滤条件类型约束 */
export type FilterCondition = Record<string, any>;
