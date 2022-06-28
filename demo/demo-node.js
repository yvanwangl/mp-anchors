// import MPAnchors, { Task, Project, TaskFactory, TaskCreator } from '../dist/index';
const moduleAnchors = require('../dist/index');
const MPAnchors = moduleAnchors.default;
const { Task, AsyncTask, Project, TaskFactory, TaskCreator, TaskListener } = moduleAnchors;


const Datas = {
    TASK_1: 'TASK_1',
    TASK_2: 'TASK_2',
    TASK_3: 'TASK_3',
    TASK_4: 'TASK_4',
    TASK_5: 'TASK_5',
    TASK_6: 'TASK_6',
    TASK_7: 'TASK_7',
    TASK_8: 'TASK_8',
};

class Task1 extends AsyncTask {
    async execute(context) {
        // 业务逻辑
        // 业务逻辑
        // console.log('@@@Task1 execute');
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('@@@Task1 execute');
                context['a'] = 11;
                context['b'] = 22;
                console.log('@@@Task1 execute end', context.TASK_1.a, context.TASK_1.b);
                resolve('@@@Task1 execute Error!!!');
            }, 500);
        });
    }
    async taskDidCatch(err) {
        // console.log('@@@Task1 execute retry !!!');
        // throw new Error(err);
    }
}

class Task2 extends Task {
    execute(context) {
        // 业务逻辑
        if (this.id === 'TASK_2') {
            console.log('Task2 execute', context.TASK_1.a, context.TASK_1.b);
        }
        if (this.id === 'TASK_22') {
            console.log('Task2 execute', context.TASK_1.a, context.TASK_1.b);
        }
        throw new Error('Task2 execute Error!!!');
    }
    // taskDidCatch(err) {
    //     throw new Error(err);
    //     // console.log('Task2 execute retry !!!');
    // }
}

class Task3 extends Task {
    execute() {
        // 业务逻辑
        console.log('Task3 execute');
    }
}

class Task4 extends Task {
    execute() {
        // 业务逻辑
        console.log('Task4 execute');
    }
}

class Task5 extends Task {
    execute() {
        // 业务逻辑
        console.log('Task5 execute');
    }
}

class Task6 extends Task {
    execute() {
        // 业务逻辑
        console.log('Task6 execute');
    }
}

class Task7 extends Task {
    execute() {
        // 业务逻辑
        console.log('Task7 execute');
    }
}

class Task8 extends Task {
    execute() {
        // 业务逻辑
        console.log('Task8 execute');
    }
}

class TestTaskCreator extends TaskCreator {
    createTask(taskName) {
        switch (taskName) {
            case Datas.TASK_1:
                const task1 = new Task1(taskName);
                task1.priority = 10;
                return task1;
            case Datas.TASK_2:
                const task2 = new Task2(taskName);
                return task2;
            case Datas.TASK_3:
                const task3 = new Task3(taskName);
                return task3;
            case Datas.TASK_4:
                const task4 = new Task4(taskName);
                return task4;
            case Datas.TASK_5:
                const task5 = new Task5(taskName);
                return task5;
            case Datas.TASK_6:
                const task6 = new Task6(taskName);
                return task6;
            case Datas.TASK_7:
                const task7 = new Task7(taskName);
                return task7;
            case Datas.TASK_8:
                const task8 = new Task8(taskName);
                return task8;
        }
        return new Task(taskName);
    }
}

const testTaskFactory = new TaskFactory(new TestTaskCreator());

class TaskArrange {
    startFromApplicationInit() {
        const builder = new Project.Builder('PROJECT_1', testTaskFactory);
        builder.add(Datas.TASK_1);
        builder.add(Datas.TASK_2).dependOn(Datas.TASK_1);
        const project = builder.build();
        const startTask = new Task('START_TASK');
        project.dependOn(startTask);
        MPAnchors.getInstance().debug(true).start(startTask);
    }
    startFromApplicationLaunch(runnable) {
        // app onLaunch 时机的任务编排
        const endTask = testTaskFactory.getTask(Datas.TASK_6);
        class TestTaskLinstener extends TaskListener {
            onFinish() {
                runnable.run();
            }
        }
        endTask.addTaskListener(new TestTaskLinstener());
        const builder = new Project.Builder('PROJECT_2', testTaskFactory);
        builder.add(Datas.TASK_3);
        builder.add(Datas.TASK_4).dependOn(Datas.TASK_3);
        builder.add(Datas.TASK_5).dependOn(Datas.TASK_3);
        builder.add(Datas.TASK_6).dependOn(Datas.TASK_5);
        const project = builder.build();
        const startTask = new Task('START_TASK_1');
        project.dependOn(startTask);
        MPAnchors.getInstance().debug(true).start(startTask);
    }
    startFromApplicationShow() {
        // app onShow 时机的任务编排
        const builder = new Project.Builder('PROJECT_3', testTaskFactory);
        builder.add(Datas.TASK_7);
        builder.add(Datas.TASK_8).dependOn(Datas.TASK_7);
        const project = builder.build();
        const startTask = new Task('START_TASK_2');
        project.dependOn(startTask);
        MPAnchors.getInstance().debug(true).start(startTask);
    }
    startFromPageLoad() {
        // 首页 onLoad 时机的任务编排
    }
}

const taskArrange = new TaskArrange();

taskArrange.startFromApplicationInit();
const appLifetimes = {
    onLaunch(options) {
        taskArrange.startFromApplicationLaunch({
            run() {
                taskArrange.startFromPageLoad();
            }
        });
    },
    onShow(options) {
        taskArrange.startFromApplicationShow();
    }
};

appLifetimes.onLaunch();
appLifetimes.onShow();

