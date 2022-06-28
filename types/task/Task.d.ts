import TaskState from "./TaskState";
import AnchorsRuntime from '../MPAnchorsRuntime';
import TaskListener from './listener/TaskListener';
import { LogTaskListener } from './listener/LogTaskListener';
declare class Task {
    id: string;
    isAsyncTask: boolean;
    state: TaskState;
    priority: number;
    executeTime: number;
    behindTasks: Array<Task>;
    dependTasks: Array<Task>;
    taskListeners: Array<TaskListener>;
    logTaskListener: LogTaskListener;
    anchorsRuntime: AnchorsRuntime;
    isProject: boolean;
    constructor(taskId: string);
    init(): void;
    bindRuntime(anchorsRuntime: AnchorsRuntime): void;
    addTaskListener(taskListener: TaskListener): void;
    start(): void;
    run(): void;
    execute(context: any): void;
    taskDidCatch(err: any, context: any): void;
    toStart(): void;
    toRunning(): void;
    toFinish(): void;
    getDependTaskName(): Array<string>;
    /**
     *  当前任务后续的任务，后置触发， 和 [Task.dependOn] 方向相反，都可以设置依赖关系
     *
     * @param task
     */
    behind(task: Task): void;
    removeBehind(task: Task): void;
    updateBehind(updateTask: Task, originTask: Task): void;
    removeDepend(originTask: Task): void;
    /**
     * 当前任务的前置依赖，前置条件, 和 [Task.behind] 方向相反，都可以设置依赖关系
     *
     * @param task
     */
    dependOn(task: Task): void;
    removeDependence(task: Task): void;
    compareTo(task: Task): number;
    /**
     * 通知后置者自己已经完成了
     */
    notifyBehindTasks(): void;
    /**
     * 依赖的任务已经完成
     * 比如 B -> A (B 依赖 A)，A 完成之后调用 B 的该方法通知 B "A依赖已经完成了"
     * 当且仅当 B 的所有依赖都已经完成了, B 开始执行
     *
     * @param dependTask
     */
    dependTaskFinish(dependTask: Task): void;
    release(): void;
}
export default Task;
