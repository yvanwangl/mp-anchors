import Task from './Task';
import useContext from "./TaskContext";
import Constants from '../constants';

class AsyncTask extends Task {
    isAsyncTask: boolean = true;

    // 任务运行
    async run() {
        const context = useContext(this.id);
        this.toRunning();
        try {
            await this.execute(context);
            // 上报任务运行成功
            this.anchorsRuntime.reportTargetToCat({ taskName: `${this.id}_async`, value: 1, errorCode: 'AsyncTask Execute Succeed' });
        } catch (err) {
            this.anchorsRuntime.codeLogError({ tag: Constants.TAG, message: `AsyncTask ${this.id} Execute Error: ${err?.message}`});
            // 上报任务运行失败
            this.anchorsRuntime.reportTargetToCat({ taskName: `${this.id}_async`, value: 0, errorCode: `AsyncTask: ${this.id} Execute Failed` });
            await this.taskDidCatch(err, context);
        }
        this.toFinish();
        this.notifyBehindTasks();
        this.release();
    }

    // @override 业务逻辑执行，该方法需要被子类重写
    async execute(context) { }
    // @override 业务兜底，该方法需要被子类重写
    async taskDidCatch (err, context) {}
}

export default AsyncTask;