import Task from '../Task';
declare class TaskListener {
    onStart(task: Task): void;
    onRunning(task: Task): void;
    onFinish(task: Task): void;
    onRelease(task: Task): void;
}
export default TaskListener;
