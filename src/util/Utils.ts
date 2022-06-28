import Task from '../task/Task';

class Utils {
    insertAfterTask(insertTask: Task, targetTask: Task) {
        targetTask.behindTasks.forEach(behindTask => {
            behindTask.removeDepend(targetTask);
            insertTask.behind(behindTask);
        });
        targetTask.behindTasks = [];
        insertTask.dependOn(targetTask);
    }

    /**
     * 比较两个 task
     * [Task.getPriority] 值高的，优先级高
     * [Task.getExecuteTime] 添加到队列的时间最早，优先级越高
     *
     * @param taskA
     * @param taskB
     * @return
     */
    compareTask(taskA: Task, taskB: Task): number {
        if (taskA.priority < taskB.priority) {
            return 1;
        }
        if (taskA.priority > taskB.priority) {
            return -1;
        }
        if (taskA.executeTime < taskB.executeTime) {
            return -1;
        }
        if (taskA.executeTime > taskB.executeTime) {
            return 1;
        }
        return 0;
    }
}

export default new Utils();