import Task from './Task';

class TaskCreator {
    createTask(taskName: string): Task {
        return new Task(taskName);
    }
}

export default TaskCreator;