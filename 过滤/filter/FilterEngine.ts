import type { FilterCondition, IFilter } from './types';

/**
 * 通用过滤引擎
 * T: 数据项类型
 * F: 过滤条件类型
 */
class FilterEngine<T, F extends FilterCondition> {
  private filters: IFilter<T, F>[] = [];

  /** 注册一个过滤器 */
  register(filter: IFilter<T, F>): void {
    this.filters.push(filter);
  }

  /** 注册多个过滤器 */
  registerAll(filters: IFilter<T, F>[]): void {
    filters.forEach((f) => this.register(f));
  }

  /**
   * 执行过滤
   * @param data 待过滤数据数组
   * @param filter 过滤条件
   * @param context 可选的上下文信息
   * @returns 过滤后的数据数组
   */
  filter(data: T[], filter: F, context?: Record<string, any>): T[] {
    const activeFilters = this.filters.filter((f) => f.hasValue(filter));

    if (activeFilters.length === 0) return data;

    return data.filter((item) =>
      activeFilters.every((f) => f.match(item, filter, context)),
    );
  }
}

export default FilterEngine;
