import Task from '../Task';
import TaskState from '../TaskState';
import TaskListener from './TaskListener';

class ReportMetricsListener extends TaskListener {
    onStart(task: Task) {
    }

    onRunning(task: Task) {
    }

    onFinish(task: Task) {
        const anchorsRuntime = task.anchorsRuntime;
        const taskName = task.id;
        const taskRuntimeInfo = anchorsRuntime.getTaskRuntimeInfo(taskName);
        if (!taskRuntimeInfo) {
            return;
        }
        // 过滤掉 project 的 start 任务和 end 任务
        const pattern = /_(start|end)\(\d+\)$/;
        if (pattern.test(taskName)) {
            return;
        }
        const stateTimeMap = taskRuntimeInfo.stateTime;
        const startTime = stateTimeMap[TaskState.START];
        const runningTime = stateTimeMap[TaskState.RUNNING];
        const finishedTime = stateTimeMap[TaskState.FINISHED];
        setTimeout(() => {
            anchorsRuntime.reportTaskMetrics({
                taskName,
                waitTimeCost: runningTime - startTime,
                executeTimeCost: finishedTime - runningTime
            });
        }, 10);
    }


    onRelease(task: Task) {
    }
}

const reportMetricsListenerInstance = new ReportMetricsListener();

export { ReportMetricsListener, reportMetricsListenerInstance };