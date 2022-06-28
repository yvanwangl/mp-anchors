import Task from '../task/Task';
declare class Utils {
    insertAfterTask(insertTask: Task, targetTask: Task): void;
    /**
     * 比较两个 task
     * [Task.getPriority] 值高的，优先级高
     * [Task.getExecuteTime] 添加到队列的时间最早，优先级越高
     *
     * @param taskA
     * @param taskB
     * @return
     */
    compareTask(taskA: Task, taskB: Task): number;
}
declare const _default: Utils;
export default _default;
