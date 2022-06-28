import Task from '../Task';
import TaskState from '../TaskState';
import TaskRuntimeInfo from '../TaskRuntimeInfo';
import log from '../../log/Logger';
import Constants from '../../constants';
import TaskListener from './TaskListener';

class LogTaskListener extends TaskListener {

    onStart(task: Task) {
        log.info(Constants.TAG, task.id + Constants.START_METHOD);
    }

    onRunning(task: Task) {
        log.info(Constants.TAG, task.id + Constants.RUNNING_METHOD);
    }

    onFinish(task: Task) {
        log.info(Constants.TAG, task.id + Constants.FINISH_METHOD);
        this.logTaskRuntimeInfoString(task);
    }

    onRelease(task: Task) {
        log.info(Constants.TAG, task.id + Constants.RELEASE_METHOD);
    }

    logTaskRuntimeInfoString(task: Task) {
        const taskRuntimeInfo = task.anchorsRuntime.getTaskRuntimeInfo(task.id);
        if (!taskRuntimeInfo) {
            return;
        }
        const stateTimeMap = taskRuntimeInfo.stateTime;
        const startTime = stateTimeMap[TaskState.START];
        const runningTime = stateTimeMap[TaskState.RUNNING];
        const finishedTime = stateTimeMap[TaskState.FINISHED];
        let stringBuilder = '';
        stringBuilder += Constants.TASK_DETAIL_INFO_TAG;
        stringBuilder = this.buildTaskInfoEdge(stringBuilder, taskRuntimeInfo);
        stringBuilder = this.addTaskInfoLineString(stringBuilder, Constants.DEPENDENCIES, this.getDependenceInfo(taskRuntimeInfo), false);
        stringBuilder = this.addTaskInfoLineString(stringBuilder, Constants.IS_ANCHOR, `${taskRuntimeInfo.isAnchor}`, false);
        stringBuilder = this.addTaskInfoLineString(stringBuilder, Constants.THREAD_INFO, '逻辑线程', false);
        stringBuilder = this.addTaskInfoLineString(stringBuilder, Constants.START_TIME, `${startTime}`, false);
        stringBuilder = this.addTaskInfoLineString(stringBuilder, Constants.START_UNTIL_RUNNING, `${(runningTime - startTime)}`, true);
        stringBuilder = this.addTaskInfoLineString(stringBuilder, Constants.RUNNING_CONSUME, `${(finishedTime - runningTime)}`, true);
        stringBuilder = this.addTaskInfoLineString(stringBuilder, Constants.FINISH_TIME, `${finishedTime}`, false);
        stringBuilder = this.buildTaskInfoEdge(stringBuilder, null);
        stringBuilder += Constants.WRAPPED;
        log.info(Constants.TASK_DETAIL_TAG, stringBuilder);
        if (taskRuntimeInfo.isAnchor) {
            log.info(Constants.ANCHORS_INFO_TAG, stringBuilder);
        }
    }

    addTaskInfoLineString(stringBuilder: string, key: string, time: string, addUnit: boolean) {
        if (stringBuilder == null) {
            return '';
        }
        stringBuilder += Constants.WRAPPED;
        stringBuilder += `${Constants.LINE_STRING_FORMAT} ${key} : ${time}`;
        if (addUnit) {
            stringBuilder += Constants.MS_UNIT;
        }
        return stringBuilder;
    }

    buildTaskInfoEdge(stringBuilder: string, taskRuntimeInfo: TaskRuntimeInfo) {
        if (stringBuilder == null) {
            return '';
        }
        stringBuilder += Constants.WRAPPED;
        stringBuilder += Constants.HALF_LINE_STRING;
        if (taskRuntimeInfo != null) {
            stringBuilder += `${taskRuntimeInfo.isProject() ? " project (" : " task ("}${taskRuntimeInfo.getTaskId()} ) `;
        }
        stringBuilder += Constants.HALF_LINE_STRING;
        return stringBuilder;
    }

    getDependenceInfo(taskRuntimeInfo: TaskRuntimeInfo): string {
        let stringBuilder = '';
        taskRuntimeInfo.dependencies.forEach(dependTaskId => {
            stringBuilder += `${dependTaskId} `;
        })
        return stringBuilder;
    }
}

const logTaskListenerInstance = new LogTaskListener();

export { LogTaskListener, logTaskListenerInstance };