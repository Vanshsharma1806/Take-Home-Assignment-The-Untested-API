const taskService = require('../src/services/taskService');

// Tests for create()
test('should create a task', () => { 
    taskService._reset();
    const task = taskService.create({
        title: "Learn",
        description: "Write first test case",
        status: "todo",
        priority: "high",
        dueDate: null
    });

    expect(task.id).toBeDefined();
    expect(task.title).toBe('Learn');
    expect(task.description).toBe('Write first test case');
    expect(task.status).toBe('todo');
    expect(task.priority).toBe('high');
    expect(task.dueDate).toBeNull();
    expect(task.createdAt).toBeDefined();
    expect(task.completedAt).toBeNull();
});

test('should intialize the task with default values', () => { 
    taskService._reset();
    const task = taskService.create({
        title: "default test",
    });

    expect(task.title).toBe("default test");
    expect(task.description).toBe('');
    expect(task.status).toBe('todo');
    expect(task.priority).toBe('medium');
    expect(task.dueDate).toBeNull();

});

test('should handle task creation when title is missing', () => {
    taskService._reset();
    const task = taskService.create({});

    expect(task).toBeDefined();
});

test('should handle null title', () => {
    taskService._reset();
    const task = taskService.create({
        title: null
    });

    expect(task).toBeDefined();
});


// tests for findById()

test('should return undefined when task is not found', () => {
    taskService._reset();
    const task = taskService.findById('does-not-exist');
    expect(task).toBeUndefined();
});


test('should return the actual task when found', ()=>{
    taskService._reset();
    const task = taskService.create({
        title: 'find me',
    })

    const foundTask = taskService.findById(task.id);
    
    expect(foundTask).toEqual(task);
});

// tests for getAll()

test('should return all the tasks', () => { 
    taskService._reset();
    
    const task1 = taskService.create({title: "task1"});
    const task2 = taskService.create({title:"task2"});

    const allTasks = taskService.getAll();

    expect(allTasks).toEqual([task1, task2]);
})

test('should return an empty aray when there are no tasks', () => {
    taskService._reset();
    
    const allTasks = taskService.getAll();

    expect(allTasks).toEqual([]);
})


// test for getByStatus()

test('should return tasks with the requested status', () => {
    taskService._reset();
    
    const todoTask = taskService.create({
        title: 'Todo task',
        status: 'todo'
    });

    const inProgressTask = taskService.create({
        title: 'In progress task',
        status: 'in_progress'
    });

    const doneTask = taskService.create({
        title: 'Done task',
        status: 'done'
    });

    const tasks = taskService.getByStatus('done');

    expect(tasks).toEqual([doneTask]);
});

test('should not return tasks when the status is only a partial match', () => {
    taskService._reset();

    taskService.create({
        title: 'in progress task',
        status: 'in_progress'
    });

    const tasks = taskService.getByStatus('in');

    expect(tasks).toEqual([]);
});

// tests for getPaginated()

test("should return the first 2 tasks for page 1 and limit 2", ()=>{
    taskService._reset();
    
    const allTasks = [];
    for(let i=0; i<6; i++){
        allTasks.push(
            taskService.create({
                title: `task ${i}`
            })
        );
    }

    const tasks = taskService.getPaginated(1, 2);
    const expectedTasks = allTasks.slice(0, 2);     

    expect(tasks).toEqual(expectedTasks);
})



test("should return the last task when the last page is incomplete", () => {
    taskService._reset();
    

    const allTasks = [];

    for (let i = 0; i < 5; i++) {
        allTasks.push(
            taskService.create({
                title: `task ${i}`
            })
        );
    }

    const tasks = taskService.getPaginated(3, 2);
    const expectedTasks = allTasks.slice(4, 5);

    expect(tasks).toEqual(expectedTasks);
});


// tests for getStats()

test('should count tasks with all the stats', ()=>{
    taskService._reset();
    

    taskService.create({title: 'todo1', status: 'todo'})
    taskService.create({title: 'todo2', status: 'todo'})
    taskService.create({title: 'todo3', status: 'todo'})

    taskService.create({title: 'in_progress1', status: 'in_progress'})
    taskService.create({title: 'in_progress2', status: 'in_progress'})

    taskService.create({title: 'done1', status: 'done'})
    taskService.create({title: 'done2', status: 'done'})
    taskService.create({title: 'done3', status: 'done'})

    const stats = taskService.getStats();

    expect(stats.todo).toBe(3);
    expect(stats.in_progress).toBe(2);
    expect(stats.done).toBe(3);
});

test('should return zero for all in case of no tasks', () => {
    taskService._reset();
    

    const stats = taskService.getStats();

    expect(stats.todo).toBe(0);
    expect(stats.in_progress).toBe(0);
    expect(stats.done).toBe(0);
})

test('should count unfinished overdue tasks', ()=>{
    taskService._reset();
    

    taskService.create({
        title: 'overdue todo',
        status: 'todo',
        dueDate: '2026-01-01'
    });

    taskService.create({
        title: 'overdue progress',
        status: 'in_progress',
        dueDate: '2026-01-01'
    });

    // should not count it as it has status : done
    taskService.create({
        title: 'overdue done',
        status: 'done',
        dueDate: '2020-01-01'
    });

    // future due date -> not counted as overdue
    taskService.create({
        title: 'todo',
        status: 'todo',
        dueDate: '2027-01-01'
    });

    // due date null -> not counted
    taskService.create({
        title: 'no due date',
        status: 'todo',
        dueDate: null
    });

    const stats = taskService.getStats();

    expect(stats.overdue).toBe(2);

})


//  tests for update()

test('should update the task', () => {
    taskService._reset();


    const task = taskService.create({
        title: 'original title',
        status: 'todo',
    });
    const updatedTask = taskService.update(task.id, {title: 'updated title', status: 'done'});

    expect(updatedTask.title).toEqual('updated title');
    expect(updatedTask.status).toEqual('done');
});


test('should return the same task if update field is empty', ()=>{
    taskService._reset();
    const task = taskService.create({
        title: 'original title',
        status: 'todo',
    });

    const updatedTask = taskService.update(task.id, {});
    expect(updatedTask).toEqual(task);
});

test('should not update anything if upadte field is missing', ()=>{
    taskService._reset();
    const task = taskService.create({
        title: 'original title',
        status: 'todo',
    });

    const updatedTask = taskService.update(task.id);
    expect(updatedTask).toEqual(task);
})

test('should return null if id does not exist', ()=>{
    taskService._reset();
    const updatedTask = taskService.update('does-not-exist', {title:'nothing'});
    expect(updatedTask).toBeNull();
})


// tests for remove()

test('should remove a existing task and return true', () => { 
    taskService._reset();
    const task1 = taskService.create({title: 'task1'});
    taskService.create({title: 'task2'});

    const removed = taskService.remove(task1.id);
    expect(removed).toBe(true);
})


test('should return false when id does not exist', () => { 
    taskService._reset();
    taskService.create({title: 'task1'});
    taskService.create({title: 'task2'});

    const removed = taskService.remove('no-id');
    expect(removed).toBe(false);
})

// test for complete()

test('should complete a task', () => {
    taskService._reset();

    const task = taskService.create({
        title: 'Complete me',
        priority: 'high',
        status: 'todo'
    });

    const completedTask = taskService.completeTask(task.id);

    expect(completedTask.title).toBe('Complete me');
    expect(completedTask.status).toBe('done');
    expect(completedTask.priority).toBe('high');
    expect(completedTask.completedAt).toBeDefined();
});

test('should return null when task does not exist', () => {
    taskService._reset();

    const completedTask = taskService.completeTask('does-not-exist');

    expect(completedTask).toBeNull();
});


// tests for assign()

test('should assign a task to a user', () => {
    taskService._reset();

    const task = taskService.create({
        title: 'Task to assign'
    });

    const updatedTask = taskService.assign(task.id, 'Vansh');

    expect(updatedTask).toBeDefined();
    expect(updatedTask.id).toBe(task.id);
    expect(updatedTask.assignee).toBe('Vansh');
});


test('should return null when assigning a non-existent task', () => {
    taskService._reset();

    const updatedTask = taskService.assign('does-not-exist', 'Vansh');

    expect(updatedTask).toBeNull();
});

test('should allow reassigning a task', () => {
    taskService._reset();

    const task = taskService.create({
        title: 'Task to reassign'
    });

    taskService.assign(task.id, 'Rahul');

    const updatedTask = taskService.assign(task.id, 'Vansh');

    expect(updatedTask.assignee).toBe('Vansh');
});