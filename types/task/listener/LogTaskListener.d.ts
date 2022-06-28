import Task from '../Task';
import TaskRuntimeInfo from '../TaskRuntimeInfo';
import TaskListener from './TaskListener';
declare class LogTaskListener extends TaskListener {
    onStart(task: Task): void;
    onRunning(task: Task): void;
    onFinish(task: Task): void;
    onRelease(task: Task): void;
    logTaskRuntimeInfoString(task: Task): void;
    addTaskInfoLineString(stringBuilder: string, key: string, time: string, addUnit: boolean): string;
    buildTaskInfoEdge(stringBuilder: string, taskRuntimeInfo: TaskRuntimeInfo): string;
    getDependenceInfo(taskRuntimeInfo: TaskRuntimeInfo): string;
}
declare const logTaskListenerInstance: LogTaskListener;
export { LogTaskListener, logTaskListenerInstance };
