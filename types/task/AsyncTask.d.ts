import Task from './Task';
declare class AsyncTask extends Task {
    isAsyncTask: boolean;
    run(): Promise<void>;
    execute(context: any): Promise<void>;
    taskDidCatch(err: any, context: any): Promise<void>;
}
export default AsyncTask;
