enum TaskState {
    IDLE = 'IDLE', //静止
    START ='START', //启动,可能需要等待调度，
    RUNNING ='RUNNING', //运行
    FINISHED = 'FINISHED', //运行结束
    RELEASE = 'RELEASE' //释放
};

export default TaskState;