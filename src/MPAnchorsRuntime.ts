import Task from './task/Task';
import TaskRuntimeInfo from './task/TaskRuntimeInfo';
import log from './log/Logger';
import Constants from './constants';
import utils from './util/Utils';
import { TReportTaskMetrics, TReportTargetToCat, TCodeLogError } from './types';

class AnchorsRuntime {
    public reportTaskMetrics: TReportTaskMetrics = () => {};
    public reportTargetToCat: TReportTargetToCat = () => {};
    public codeLogError: TCodeLogError = () => {};

    public anchorTaskIds: Array<string> = [];

    // 所有 task 运行时信息
    private runtimeInfo: { [key: string]: TaskRuntimeInfo } = {};
    //  debug 标记位
    public debuggable: boolean = false;
    // 构造函数
    constructor() { }

    //Task 比较逻辑
    taskComparator(taskA: Task, taskB: Task) {
        return utils.compareTask(taskA, taskB);
    }

    // 重置
    clear() {
        this.debuggable = false;
        this.anchorTaskIds = [];
        // this.runBlockTask = [];
        this.runtimeInfo = {};
    }

    // 添加锚点任务
    addAnchorTasks(ids: Array<string>) {
        if (Array.isArray(ids) && ids.length) {
            this.anchorTaskIds.push(...ids);
        }
    }

    // 删除锚点任务
    removeAnchorTask(id: String) {
        const taskIndex = this.anchorTaskIds.findIndex(item => item === id);
        if (taskIndex > -1) {
            this.anchorTaskIds.splice(taskIndex, 1);
        }

    }
    // 判断是否有锚点任务
    hasAnchorTasks(): boolean {
        return this.anchorTaskIds.length > 0;
    }
    // 判断任务是否有对应的运行时对象
    hasTaskRuntimeInfo(taskId: string): boolean {
        return this.runtimeInfo[taskId] != null;
    }
    // 获取任务的运行时对象
    getTaskRuntimeInfo(taskId: string): TaskRuntimeInfo {
        return this.runtimeInfo[taskId];
    }
    // 设置任务运行状态信息
    setStateInfo(task: Task) {
        const taskRuntimeInfo = this.runtimeInfo[task.id];
        taskRuntimeInfo?.setStateTime(task.state, Date.now());
    }
    // 调度任务
    executeTask(task: Task) {
        if (task.isAsyncTask) {
            setTimeout(() => {
                task.run();
            }, 0);
        } else {
            task.run();
        }
    }

    /**
     * 遍历依赖树并完成启动前的初始化
     * 1.获取依赖树最大深度
     * 2.遍历初始化运行时数据并打印log
     * 3.如果锚点不存在，则移除
     * 4.提升锚点链的优先级
     *
     * @param task
     */
    traversalDependencies(task: Task) {
        const traversalVisitor: Array<string> = [];
        traversalVisitor.push(task.id);
        this.traversalDependenciesAndInit(task, traversalVisitor);

        this.anchorTaskIds.forEach(taskId => {
            if (!this.hasTaskRuntimeInfo(taskId)) {
                if (this.debuggable) {
                    log.warn(Constants.ANCHORS_INFO_TAG, `anchor ${task.id} no found !`);
                }
            } else {
                const taskRuntimeInfo = this.getTaskRuntimeInfo(taskId);
                this.traversalMaxTaskPriority(taskRuntimeInfo?.task);
            }
        });
    }

    /**
     * 回溯算法遍历依赖树，初始化任务，并记录 log
     *
     * 如果单条依赖线上存在重复依赖将抛出异常（会造成依赖回环）
     */
    traversalDependenciesAndInit(task: Task, traversalVisitor: Array<string>) {
        task.bindRuntime(this);
        let taskRuntimeInfo = this.getTaskRuntimeInfo(task.id);
        if (taskRuntimeInfo == null) {
            // 如果没有初始化则初始化runtimeInfo
            taskRuntimeInfo = new TaskRuntimeInfo(task);

            if (this.anchorTaskIds.indexOf(task.id) > -1) {
                taskRuntimeInfo.isAnchor = true;
            }
            this.runtimeInfo[task.id] = taskRuntimeInfo;
        } else {
            if (!taskRuntimeInfo.isTaskInfo(task)) {
                throw new Error(`Multiple different tasks are not allowed to contain the same id (${task.id})!`)
            }
        }

        task.behindTasks.forEach(nextTask => {
            if (traversalVisitor.indexOf(nextTask.id) === -1) {
                traversalVisitor.push(nextTask.id);
            } else {
                throw new Error(`Do not allow dependency graphs to have a loopback！Related task'id is ${task.id} !`)
            }
            if (this.debuggable && !nextTask.behindTasks.length) {
                let stringBuilder = '';
                traversalVisitor.forEach(taskId => {
                    stringBuilder += taskId;
                    stringBuilder += " --> ";
                });
                log.info(Constants.WRAPPED + Constants.DEPENDENCE_TAG, stringBuilder.substring(0, stringBuilder.length - 5));
            }
            this.traversalDependenciesAndInit(nextTask, traversalVisitor);
            const nextTaskIndex = traversalVisitor.findIndex(item => item === nextTask.id);
            if (nextTaskIndex > -1) {
                traversalVisitor.splice(nextTaskIndex, 1);
            }
        });
    }

    /**
     * 递归向上设置优先级
     *
     * @param task
     */
    traversalMaxTaskPriority(task: Task) {
        if (task == null) {
            return;
        }
        task.priority = Number.MAX_SAFE_INTEGER;
        task.dependTasks.forEach(prevTask => {
            this.traversalMaxTaskPriority(prevTask);
        });
    }
}

export default AnchorsRuntime;
