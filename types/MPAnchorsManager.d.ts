import AnchorsRuntime from './MPAnchorsRuntime';
import Task from './task/Task';
import { TReportTaskMetrics, TReportTargetToCat, TCodeLogError, IMPAnchorsInitParams } from './types';
declare class MPAnchorsManager {
    static reportTaskMetrics: TReportTaskMetrics;
    static reportTargetToCat: TReportTargetToCat;
    static codeLogError: TCodeLogError;
    private debuggable;
    private anchorTaskIds;
    private anchorsRuntime;
    private constructor();
    static getInstance(): MPAnchorsManager;
    static init({ reportTaskMetrics, reportTargetToCat, codeLogError }: IMPAnchorsInitParams): void;
    getAnchorsRuntime(): AnchorsRuntime;
    debug(debuggable: boolean): MPAnchorsManager;
    addAnchor(taskIds: Array<string>): MPAnchorsManager;
    start(task: Task): void;
    private syncConfigInfoToRuntime;
    private logStartWithAnchorsInfo;
    private logEndWithAnchorsInfo;
}
export default MPAnchorsManager;
