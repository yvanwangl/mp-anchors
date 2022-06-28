import Task from '../Task';
import CriticalTask from '../CriticalTask';
import TaskCreator from '../TaskCreator';

class Project extends Task {
    public id: string;
    static Builder;
    public endTask;
    public startTask;
    public isProject = true;

    // 结尾处增加任务
    behind(task) {
        this.endTask.behind(task);
    }
    // 头部增加任务
    dependOn(task) {
        this.startTask.dependOn(task);
    }
    // 删除结尾处任务
    removeBehind(task) {
        this.endTask.removeBehind(task);
    }
    // 删除头部任务
    removeDependence(task) {
        this.startTask.removeDependence(task);
    }
    // 运行任务
    start() {
        this.startTask.start();
    }
    // Project 任务链结束
    release() {
        super.release();
        this.endTask.release();
        this.startTask.release();
    }
}

/**
* project 的构建内部，避免了回环的发生。
* 当出现 project 内 task 循环依赖时，循环依赖会自动断开。
*/
class Builder {
    private mProjectName: string;
    private mCurrentAddTask = null;
    private mFinishTask;
    private mStartTask;
    private mCurrentTaskShouldDependOnStartTask = false;
    private mProject: Project;
    private taskFactory: TaskFactory;
    // 默认project优先级为project内所有task的优先级，如果没有设置则取 max(project内所有task的)
    private mPriority = 0;

    constructor(projectName: string, taskFactory: TaskFactory) {
        this.mProjectName = projectName;
        this.mProject = new Project(projectName);
        this.taskFactory = taskFactory;
        this.init();
    }

    build(): Project {
        if (this.mCurrentAddTask != null) {
            if (this.mCurrentTaskShouldDependOnStartTask) {
                this.mStartTask.behind(this.mCurrentAddTask);
            }
        } else {
            this.mStartTask.behind(this.mFinishTask);
        }
        this.mStartTask.priority = this.mPriority;
        this.mFinishTask.priority = this.mPriority;
        this.mProject.startTask = this.mStartTask
        this.mProject.endTask = this.mFinishTask;
        return this.mProject;
    }

    add(taskName: string): Builder {
        const task = this.taskFactory.getTask(taskName);
        if (task.priority > this.mPriority) {
            this.mPriority = task.priority;
        }
        if (this.mCurrentTaskShouldDependOnStartTask && this.mCurrentAddTask != null) {
            this.mStartTask.behind(this.mCurrentAddTask);
        }
        this.mCurrentAddTask = task;
        this.mCurrentTaskShouldDependOnStartTask = true;
        this.mCurrentAddTask.behind(this.mFinishTask);
        return this;
    }

    dependOn(taskName: string): Builder {
        const task = this.taskFactory.getTask(taskName);
        task.behind(this.mCurrentAddTask);
        this.mFinishTask.removeDependence(task);
        this.mCurrentTaskShouldDependOnStartTask = false;
        return this;
    }

    init() {
        const criticalTime = Date.now();
        this.mStartTask = new CriticalTask(`${this.mProjectName}_start(${criticalTime})`);
        this.mFinishTask = new CriticalTask(`${this.mProjectName}_end(${criticalTime})`);
    }
}

export class TaskFactory {
    private mCacheTask = {};
    private mTaskCreator: TaskCreator;

    constructor(taskCreator: TaskCreator) {
        this.mTaskCreator = taskCreator;
    }
    getTask(taskId: string) {
        let task = this.mCacheTask[taskId];
        if (task != null) {
            return task;
        }
        task = this.mTaskCreator.createTask(taskId);
        this.mCacheTask[taskId] = task;
        return task;
    }
}

Project.Builder = Builder;

export default Project;