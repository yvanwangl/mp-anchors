import Task from "./Task";
import TaskState from "./TaskState";
declare class TaskRuntimeInfo {
    task: Task;
    stateTime: {
        [key in TaskState]?: number;
    };
    isAnchor: boolean;
    dependencies: Array<string>;
    constructor(task: Task);
    /**
     * 避免task泄漏
     */
    clearTask(): void;
    isProject(): boolean;
    setStateTime(state: TaskState, time: number): void;
    isTaskInfo(task: Task): boolean;
    getTaskId(): string;
    init(): void;
}
export default TaskRuntimeInfo;
