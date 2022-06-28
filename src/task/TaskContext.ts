let currentTaskId = '';
const context = {};

const taskContext = new Proxy(context, {
    get(target, taskId) {
        return target[taskId];
    },
    set(target, prop, nextValue) {
        if (!currentTaskId) {
            throw new Error('useContext params length 0, only read');
        }
        if (!target[currentTaskId]) {
            target[currentTaskId] = {};
        }
        target[currentTaskId][prop] = nextValue;
        return true;
    }
})

const useContext = (taskId) => {
    currentTaskId = taskId;
    return taskContext;
}

export default useContext;