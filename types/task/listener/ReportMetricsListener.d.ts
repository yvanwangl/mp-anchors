import Task from '../Task';
import TaskListener from './TaskListener';
declare class ReportMetricsListener extends TaskListener {
    onStart(task: Task): void;
    onRunning(task: Task): void;
    onFinish(task: Task): void;
    onRelease(task: Task): void;
}
declare const reportMetricsListenerInstance: ReportMetricsListener;
export { ReportMetricsListener, reportMetricsListenerInstance };
