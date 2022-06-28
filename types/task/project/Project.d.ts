import Task from '../Task';
import TaskCreator from '../TaskCreator';
declare class Project extends Task {
    id: string;
    static Builder: any;
    endTask: any;
    startTask: any;
    isProject: boolean;
    behind(task: any): void;
    dependOn(task: any): void;
    removeBehind(task: any): void;
    removeDependence(task: any): void;
    start(): void;
    release(): void;
}
export declare class TaskFactory {
    private mCacheTask;
    private mTaskCreator;
    constructor(taskCreator: TaskCreator);
    getTask(taskId: string): any;
}
export default Project;
