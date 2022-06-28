import TaskState from "./TaskState";
import AnchorsRuntime from '../MPAnchorsRuntime';
import TaskListener from './listener/TaskListener';
import { LogTaskListener, logTaskListenerInstance } from './listener/LogTaskListener';
import { reportMetricsListenerInstance } from './listener/ReportMetricsListener';
import utils from '../util/Utils';
import useContext from "./TaskContext";
import Constants from '../constants';

class Task {
    id: string;
    isAsyncTask: boolean = false;
    // TaskState，任务当前的状态
    state: TaskState;
    // 优先级，数值越低，优先级越低
    priority: number = 1;
    // 任务执行时长
    executeTime: number = 0;
    // 被依赖者，当前任务之后的任务
    behindTasks: Array<Task> = [];
    // 依赖者
    dependTasks: Array<Task> = [];
    // 任务执行监听器
    taskListeners: Array<TaskListener> = [];
    // 日志监听器，一种特殊的监听器
    logTaskListener: LogTaskListener =  logTaskListenerInstance;
    // 运行时对象
    anchorsRuntime: AnchorsRuntime;
    public isProject = false;

    //构造函数，接收 1 个参数，taskId
    constructor(taskId: string) {
        this.id = taskId;
        this.init();
    }
    init() {
        if (!this.id) {
            throw new Error("task's mId can't be empty");
        }
        this.priority = 1;
        this.state = TaskState.IDLE;
        this.addTaskListener(reportMetricsListenerInstance);
    }
    // 绑定运行时对象
    bindRuntime(anchorsRuntime: AnchorsRuntime) {
        this.anchorsRuntime = anchorsRuntime;
    }
    // 添加任务执行监听器
    addTaskListener(taskListener: TaskListener) {
        this.taskListeners.push(taskListener);
    }
    // 任务启动
    start() {
        if (this.state != TaskState.IDLE) {
            throw new Error(`can no run task: ${this.id} again!`)
        }
        this.toStart();
        this.executeTime = Date.now();
        this.anchorsRuntime.executeTask(this);
    }
    // 任务运行
    run() {
        const context = useContext(this.id);
        this.toRunning();
        try {
            this.execute(context);
            // 上报任务运行成功
            this.anchorsRuntime.reportTargetToCat({ taskName: `${this.id}`, value: 1, errorCode: 'Task Execute Succeed' });
        } catch (err) {
            this.anchorsRuntime.codeLogError({ tag: Constants.TAG, message: `Task ${this.id} Execute Error: ${err?.message}`});
            // 上报任务运行失败
            this.anchorsRuntime.reportTargetToCat({ taskName: `${this.id}`, value: 0, errorCode: `Task: ${this.id} Execute Failed` });
            this.taskDidCatch(err, context);
        }
        this.toFinish();
        this.notifyBehindTasks();
        this.release();
    }
    // @override 业务逻辑执行，该方法需要被子类重写
    execute(context) { }
    // @override 业务兜底，该方法需要被子类重写
    taskDidCatch(err, context) { }
    // 任务启动逻辑单元
    toStart() {
        this.state = TaskState.START;
        this.anchorsRuntime.setStateInfo(this);
        if (this.anchorsRuntime.debuggable) {
            this.logTaskListener.onStart(this);
        }

        this.taskListeners.forEach(listener => {
            listener?.onStart(this);
        });
    }
    // 任务执行逻辑单元
    toRunning() {
        this.state = TaskState.RUNNING;
        this.anchorsRuntime.setStateInfo(this);
        // this.anchorsRuntime.setThreadName(this, Thread.currentThread().name)
        if (this.anchorsRuntime.debuggable) {
            this.logTaskListener.onRunning(this);
        }
        this.taskListeners.forEach(listener => {
            listener?.onRunning(this);
        });
    }
    // 任务结束逻辑单元
    toFinish() {
        this.state = TaskState.FINISHED;
        this.anchorsRuntime.setStateInfo(this);
        if (this.anchorsRuntime.debuggable) {
            this.logTaskListener.onFinish(this);
        }
        this.taskListeners.forEach(listener => {
            listener?.onFinish(this);
        });
    }
    // 获取当前任务依赖的任务名称
    getDependTaskName(): Array<string> {
        return this.dependTasks.map(dependTask => dependTask.id);
    }

    /**
     *  当前任务后续的任务，后置触发， 和 [Task.dependOn] 方向相反，都可以设置依赖关系
     *
     * @param task
     */
    behind(task: Task) {
        let behindTask = task;
        if (behindTask !== this) {
            if (behindTask.isProject) {
                behindTask = (behindTask as any).startTask;
            }
            this.behindTasks.push(behindTask);
            behindTask.dependOn(this);
        }
    }
    // 删除当前任务的后续依赖
    removeBehind(task: Task) {
        let behindTask = task;
        if (behindTask !== this) {
            if (behindTask.isProject) {
                behindTask = (behindTask as any).startTask;
            }
            const behindTaskIndex = this.behindTasks.findIndex(item => item.id === behindTask.id);
            if (behindTaskIndex > -1) {
                this.behindTasks.splice(behindTaskIndex, 1);
                behindTask.removeDependence(this);
            }
        }
    }
    // 更新当前任务后续的依赖任务
    updateBehind(updateTask: Task, originTask: Task) {
        const originTaskIndex = this.behindTasks.findIndex(item => item.id === originTask.id);
        if (originTaskIndex > -1) {
            this.behindTasks.splice(originTaskIndex, 1);
        }
        this.behindTasks.push(updateTask);
    }

    removeDepend(originTask: Task) {
        const originTaskIndex = this.dependTasks.findIndex(item => item.id === originTask.id);
        if (originTaskIndex > -1) {
            this.dependTasks.splice(originTaskIndex, 1);
        }
    }

    /**
     * 当前任务的前置依赖，前置条件, 和 [Task.behind] 方向相反，都可以设置依赖关系
     *
     * @param task
     */
    dependOn(task: Task) {
        let prevTask = task;
        if (prevTask !== this) {
            if (prevTask.isProject) {
                prevTask = (prevTask as any).endTask;
            }
            this.dependTasks.push(prevTask);
            // 防止外部所有直接调用 dependOn 无法构建完整图
            const index = prevTask.behindTasks.findIndex(item => item.id === this.id);
            if (index === -1) {
                prevTask.behindTasks.push(this);
            }
        }
    }
    // 删除当前任务的前置依赖
    removeDependence(task: Task) {
        let prevTask = task
        if (prevTask !== this) {
            if (prevTask.isProject) {
                prevTask = (prevTask as any).endTask;
            }
            // 当前任务删除对前置任务的依赖
            const prevTaskIndex = this.dependTasks.findIndex(item => item.id === prevTask.id);
            if (prevTaskIndex > -1) {
                this.dependTasks.splice(prevTaskIndex, 1);
            }
            // 前置任务的 behindTasks 中删除当前任务
            const currentTaskIndex = prevTask.behindTasks.findIndex(item => item.id === this.id);
            if (currentTaskIndex > -1) {
                prevTask.behindTasks.splice(currentTaskIndex, 1);
            }
        }
    }
    // 比较目标任务 和 当前任务的优先级
    compareTo(task: Task): number {
        return utils.compareTask(this, task);
    }

    /**
     * 通知后置者自己已经完成了
     */
    notifyBehindTasks() {
        if (this.behindTasks.length) {
            if (this.behindTasks.length > 1) {
                this.behindTasks.sort(this.anchorsRuntime.taskComparator);
            }
            // 遍历接下来的任务，通知它们说存在的前置已经完成
            this.behindTasks.forEach(behindTask => behindTask.dependTaskFinish(this));
        }
    }

    /**
     * 依赖的任务已经完成
     * 比如 B -> A (B 依赖 A)，A 完成之后调用 B 的该方法通知 B "A依赖已经完成了"
     * 当且仅当 B 的所有依赖都已经完成了, B 开始执行
     *
     * @param dependTask
     */
    dependTaskFinish(dependTask: Task) {
        if (!this.dependTasks.length) {
            return;
        }
        const prevTaskIndex = this.dependTasks.findIndex(item => item.id === dependTask.id);
        if (prevTaskIndex > -1) {
            this.dependTasks.splice(prevTaskIndex, 1);
        }
        // 所有前置任务都已经完成了
        if (!this.dependTasks.length) {
            this.start();
        }
    }
    // 任务执行完成，并通知完后续任务后执行
    release() {
        this.state = TaskState.RELEASE;
        this.anchorsRuntime.setStateInfo(this);
        this.anchorsRuntime.removeAnchorTask(this.id);
        this.anchorsRuntime.getTaskRuntimeInfo(this.id)?.clearTask();
        this.dependTasks = [];
        this.behindTasks = [];
        if (this.anchorsRuntime.debuggable) {
            this.logTaskListener.onRelease(this);
            this.logTaskListener = null;
        }
        this.taskListeners.forEach(listener => listener?.onRelease(this));
        this.taskListeners = [];
    }
}

export default Task;