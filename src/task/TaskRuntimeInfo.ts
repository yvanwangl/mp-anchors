import Task from "./Task";
import TaskState from "./TaskState";
import Project from "./project/Project";

const EmptyTask = new Task("inner_default_empty_task");
const DEFAULT_TIME =  0;

class TaskRuntimeInfo {
    public task: Task;
    public stateTime: { [key in TaskState]?: number } = {};
    public isAnchor = false;
    public dependencies: Array<string> = [];

    constructor(task: Task) {
        this.task = task;
        this.init();
    }

    /**
     * 避免task泄漏
     */
    clearTask() {
        this.task = EmptyTask;
    }

    isProject(){
        return this.task.isProject;
    }

    setStateTime(state: TaskState, time: number) {
        this.stateTime[state] = time;
    }

    isTaskInfo(task: Task): boolean {
        return task != null && this.task === task;
    }

    getTaskId(): string {
        return this.task.id;
    }

    init() {
        this.setStateTime(TaskState.START, DEFAULT_TIME)
        this.setStateTime(TaskState.RUNNING, DEFAULT_TIME)
        this.setStateTime(TaskState.FINISHED, DEFAULT_TIME)
        this.dependencies = this.task.getDependTaskName();
    }
}

export default TaskRuntimeInfo;