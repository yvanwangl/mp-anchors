import AnchorsRuntime from './MPAnchorsRuntime';
import Task from './task/Task';
import Project from './task/project/Project';
import Constants from './constants';
import log from './log/Logger';
import { TReportTaskMetrics, TReportTargetToCat, TCodeLogError, IMPAnchorsInitParams } from './types';

class MPAnchorsManager {

    static reportTaskMetrics: TReportTaskMetrics = () => { };
    static reportTargetToCat: TReportTargetToCat = () => { };
    static codeLogError: TCodeLogError = () => { };

    private debuggable = false;
    private anchorTaskIds: Array<string> = [];
    private anchorsRuntime: AnchorsRuntime;

    private constructor() {
        this.anchorsRuntime = new AnchorsRuntime();
    }

    static getInstance(): MPAnchorsManager {
        return new MPAnchorsManager();
    }

    // 初始化函数
    static init({ reportTaskMetrics, reportTargetToCat, codeLogError }: IMPAnchorsInitParams) {
        MPAnchorsManager.reportTaskMetrics = reportTaskMetrics;
        MPAnchorsManager.reportTargetToCat = reportTargetToCat;
        MPAnchorsManager.codeLogError = codeLogError;
    }

    // 获取运行时对象
    getAnchorsRuntime(): AnchorsRuntime {
        return this.anchorsRuntime;
    }

    // 配置开启 debug
    debug(debuggable: boolean): MPAnchorsManager {
        this.debuggable = debuggable;
        return this;
    }

    // 添加锚点任务
    addAnchor(taskIds: Array<string>): MPAnchorsManager {
        if (Array.isArray(taskIds) && taskIds.length) {
            this.anchorTaskIds.push(...taskIds);
        }
        return this
    }

    // 任务启动，传入起点任务
    start(task: Task) {
        if (task == null) {
            throw new Error("can no run a task that was null !");
        }
        this.syncConfigInfoToRuntime();
        let startTask = task;
        if (startTask instanceof Project) {
            startTask = startTask.startTask;
        }
        this.anchorsRuntime.traversalDependencies(startTask);
        const logEnd = this.logStartWithAnchorsInfo();
        startTask.start();
        // this.anchorsRuntime.tryRunBlockTask();
        if (logEnd) {
            this.logEndWithAnchorsInfo()
        }
        console.log('MPAnchorsManager End');
    }

    // 同步信息给运行时对象
    private syncConfigInfoToRuntime(): void {
        this.anchorsRuntime.clear();
        this.anchorsRuntime.debuggable = this.debuggable;
        this.anchorsRuntime.addAnchorTasks(this.anchorTaskIds);
        this.anchorsRuntime.reportTaskMetrics = MPAnchorsManager.reportTaskMetrics;
        this.anchorsRuntime.reportTargetToCat = MPAnchorsManager.reportTargetToCat;
        this.anchorsRuntime.codeLogError = MPAnchorsManager.codeLogError;
        this.anchorTaskIds = [];
    }

    // 打印日志
    private logStartWithAnchorsInfo(): boolean {
        if (!this.debuggable) {
            return false;
        }
        const hasAnchorTask = this.anchorsRuntime.hasAnchorTasks();
        let stringAnchorsManagerBuilder = '';
        if (hasAnchorTask) {
            stringAnchorsManagerBuilder += Constants.HAS_ANCHOR;
            stringAnchorsManagerBuilder += "( ";
            for (let taskId in this.anchorsRuntime.anchorTaskIds) {
                stringAnchorsManagerBuilder += "\"$taskId\" ";
            }
            stringAnchorsManagerBuilder += ")";
        } else {
            stringAnchorsManagerBuilder += Constants.NO_ANCHOR;
        }
        if (this.debuggable) {
            log.info(Constants.ANCHORS_INFO_TAG, stringAnchorsManagerBuilder);
        }
        return hasAnchorTask;
    }

    // 打印日志
    private logEndWithAnchorsInfo(): void {
        if (!this.debuggable) {
            return;
        }
        log.info(Constants.ANCHORS_INFO_TAG, Constants.ANCHOR_RELEASE);
    }
}

export default MPAnchorsManager;