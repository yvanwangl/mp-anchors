import Task from '../Task';

class TaskListener {
    onStart(task: Task) { };
    onRunning(task: Task) { };
    onFinish(task: Task) { };
    onRelease(task: Task) { };
}

export default TaskListener;