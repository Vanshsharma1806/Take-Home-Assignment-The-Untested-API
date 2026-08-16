const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');


// tests for GET /tasks

test('should return all the tasks', async () => {
    taskService._reset();

    taskService.create({title: 'task1'});
    taskService.create({title: 'task2'});

    const response = await request(app).get('/tasks');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
})

test('should return an empty array when there are no tasks', async () => {
    taskService._reset();

    const response = await request(app).get('/tasks');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(0);
});


test('should return tasks with requested status', async () => {
    taskService._reset();

    taskService.create({title: 'task1', status: 'todo'});
    taskService.create({title: 'task2', status: 'done'});
    taskService.create({title: 'task3', status: 'in_progress'});

    const response = await request(app)
        .get('/tasks')
        .query({status: 'done'})
    
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('task2');
    expect(response.body[0].status).toBe('done');

});

test('should return paginated tasks', async () => {
    taskService._reset();

    taskService.create({ title: 'task 1' });
    taskService.create({ title: 'task 2' });
    taskService.create({ title: 'task 3' });
    taskService.create({ title: 'task 4' });

    const response = await request(app)
        .get('/tasks')
        .query({ page: 1, limit: 2 });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBe('task 1');
    expect(response.body[1].title).toBe('task 2');
});

// tests for POST /tasks

test('should create a task', async () => {
    taskService._reset();

    const response = await request(app)
        .post('/tasks')
        .send({
            title: 'new task',
            description: 'creating a new task',
            status: 'todo',
            priority: 'high'
        });
    
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe('new task');
    expect(response.body.description).toBe('creating a new task')
    expect(response.body.status).toBe('todo');
    expect(response.body.priority).toBe('high');
    expect(response.body.id).toBeDefined();
})

test('should return 400 when title is missing', async () => {
    taskService._reset();

    const response = await request(app)
        .post('/tasks')
        .send({
            description: 'Task without title'
        });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeDefined();
});

test('should return 400 when status is invalid', async () => {
    taskService._reset();

    const response = await request(app)
        .post('/tasks')
        .send({
            title: 'Invalid status task',
            status: 'invalid_status'
        });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeDefined();
});

test('should return 400 when priority is invalid', async () => {
    taskService._reset();

    const response = await request(app)
        .post('/tasks')
        .send({
            title: 'Invalid priority task',
            priority: 'urgent'
        });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeDefined();
});


test('should return 400 when dueDate is invalid', async () => {
    taskService._reset();

    const response = await request(app)
        .post('/tasks')
        .send({
            title: 'Invalid date task',
            dueDate: 'not-a-date'
        });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeDefined();
});

// tests for PUT /tasks/:id

test('should update an existing task', async () => {
    taskService._reset();

    const task = taskService.create({
        title: 'original task',
        status: 'todo'
    });

    const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send({
            title: 'updated task',
            status: 'done'
        });

    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe('updated task');
    expect(response.body.status).toBe('done');
    expect(response.body.id).toBe(task.id);
});


test('should return 404 when task does not exist', async () => {
    taskService._reset();

    const response = await request(app)
        .put('/tasks/does-not-exist')
        .send({
            title: 'updated task'
        });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Task not found');
});


test('should return 400 when update contains invalid status', async () => {
    taskService._reset();

    const task = taskService.create({
        title: 'original task',
        status: 'todo'
    });

    const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send({
            status: 'invalid_status'
        });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeDefined();
});


test('should return 400 when update contains invalid priority', async () => {
    taskService._reset();

    const task = taskService.create({
        title: 'original task',
        priority: 'medium'
    });

    const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send({
            priority: 'urgent'
        });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeDefined();
});


test('should return 400 when update contains an invalid dueDate', async () => {
    taskService._reset();

    const task = taskService.create({
        title: 'original task'
    });

    const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send({
            dueDate: 'not-a-date'
        });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeDefined();
});


test('should return 400 when update contains an empty title', async () => {
    taskService._reset();

    const task = taskService.create({
        title: 'original task'
    });

    const response = await request(app)
        .put(`/tasks/${task.id}`)
        .send({
            title: ''
        });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeDefined();
});


// tests for DELETE /tasks/:id

test('should delete the task with given id', async () => {
    taskService._reset();

    const task = taskService.create({title: 'task to be deleted'});

    const response = await request(app)
        .delete(`/tasks/${task.id}`);
    
    expect(response.statusCode).toBe(204);
    expect(taskService.findById(task.id)).toBeUndefined();
});


test('should return status 404 for a not existing id', async () => {
    taskService._reset();

    const response = await request(app)
        .delete('/tasks/not-existing-id');
    
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Task not found');
});

// tests for PATCH /tasks/:id/completed

test('should complete a task', async () => {
    taskService._reset();

    const task = taskService.create({
        title: 'task to complete',
        status: 'todo',
        priority: 'high'
    });

    const response = await request(app)
        .patch(`/tasks/${task.id}/complete`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('done');
    expect(response.body.priority).toBe('high');
    expect(response.body.completedAt).toBeDefined();
});

test('should return 404 when completing a task that does not exist', async () => {
    taskService._reset();

    const response = await request(app)
        .patch('/tasks/does-not-exist/complete');

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Task not found');
});


test('should handle completing an already completed task', async () => {
    taskService._reset();

    const task = taskService.create({
        title: 'already completed',
        status: 'done'
    });

    const response = await request(app)
        .patch(`/tasks/${task.id}/complete`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('done');
    expect(response.body.completedAt).toBeDefined();
});

// tests for GET /tasks/stats

test('should return task statistics', async () => {
    taskService._reset();

    taskService.create({
        title: 'todo task',
        status: 'todo'
    });

    taskService.create({
        title: 'progress task',
        status: 'in_progress'
    });

    taskService.create({
        title: 'done task',
        status: 'done'
    });

    const response = await request(app)
        .get('/tasks/stats');

    expect(response.statusCode).toBe(200);
    expect(response.body.todo).toBe(1);
    expect(response.body.in_progress).toBe(1);
    expect(response.body.done).toBe(1);
    expect(response.body.overdue).toBe(0);
});


// tests for PATCH /tasks/:id/assign

test('should assign a task to a user', async () => {
    taskService._reset();

    const task = taskService.create({
        title: 'Task to assign'
    });

    const response = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({
            assignee: 'Vansh'
        });

    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(task.id);
    expect(response.body.assignee).toBe('Vansh');
});

test('should return 404 when assigning a non-existent task', async () => {
    taskService._reset();

    const response = await request(app)
        .patch('/tasks/does-not-exist/assign')
        .send({
            assignee: 'Vansh'
        });

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Task not found');
});

test('should return 400 when assignee is missing', async () => {
    taskService._reset();

    const task = taskService.create({
        title: 'Task to assign'
    });

    const response = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeDefined();
});

test('should return 400 when assignee is an empty string', async () => {
    taskService._reset();

    const task = taskService.create({
        title: 'Task to assign'
    });

    const response = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({
            assignee: ''
        });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeDefined();
});

test('should return 400 when assignee contains only whitespace', async () => {
    taskService._reset();

    const task = taskService.create({
        title: 'Task to assign'
    });

    const response = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({
            assignee: '   '
        });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeDefined();
});

test('should return 400 when assignee is not a string', async () => {
    taskService._reset();

    const task = taskService.create({
        title: 'Task to assign'
    });

    const response = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({
            assignee: 123
        });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeDefined();
});



test('should allow reassigning an already assigned task', async () => {
    taskService._reset();

    const task = taskService.create({
        title: 'Task to reassign'
    });

    const firstResponse = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({
            assignee: 'Rahul'
        });

    expect(firstResponse.statusCode).toBe(200);
    expect(firstResponse.body.assignee).toBe('Rahul');

    const secondResponse = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({
            assignee: 'Vansh'
        });

    expect(secondResponse.statusCode).toBe(200);
    expect(secondResponse.body.assignee).toBe('Vansh');
});