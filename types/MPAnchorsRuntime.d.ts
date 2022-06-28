import Task from './task/Task';
import TaskRuntimeInfo from './task/TaskRuntimeInfo';
import { TReportTaskMetrics, TReportTargetToCat, TCodeLogError } from './types';
declare class AnchorsRuntime {
    reportTaskMetrics: TReportTaskMetrics;
    reportTargetToCat: TReportTargetToCat;
    codeLogError: TCodeLogError;
    anchorTaskIds: Array<string>;
    private runtimeInfo;
    debuggable: boolean;
    constructor();
    taskComparator(taskA: Task, taskB: Task): number;
    clear(): void;
    addAnchorTasks(ids: Array<string>): void;
    removeAnchorTask(id: String): void;
    hasAnchorTasks(): boolean;
    hasTaskRuntimeInfo(taskId: string): boolean;
    getTaskRuntimeInfo(taskId: string): TaskRuntimeInfo;
    setStateInfo(task: Task): void;
    executeTask(task: Task): void;
    /**
     * 遍历依赖树并完成启动前的初始化
     * 1.获取依赖树最大深度
     * 2.遍历初始化运行时数据并打印log
     * 3.如果锚点不存在，则移除
     * 4.提升锚点链的优先级
     *
     * @param task
     */
    traversalDependencies(task: Task): void;
    /**
     * 回溯算法遍历依赖树，初始化任务，并记录 log
     *
     * 如果单条依赖线上存在重复依赖将抛出异常（会造成依赖回环）
     */
    traversalDependenciesAndInit(task: Task, traversalVisitor: Array<string>): void;
    /**
     * 递归向上设置优先级
     *
     * @param task
     */
    traversalMaxTaskPriority(task: Task): void;
}
export default AnchorsRuntime;
