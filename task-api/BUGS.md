# Bug Report

## 1. Status filtering uses '.includes()' instead of '==='

### Expected behavior

The `status` filter should match the task's status value exactly.

For example, requesting `in` should not match a task whose status is `in_progress`. The task status values defined by the assignment are `todo`, `in_progress`, and `done`.

### Actual behavior

`getByStatus()` uses `includes()`:

```js
const getByStatus = (status) => tasks.filter((t) => t.status.includes(status));
```

This allows partial matches.

For example:

```js
'in_progress'.includes('in') // true
```

So requesting `in` incorrectly returns tasks with status `in_progress`.

### How it was discovered

A unit test created a task with:

```js
status: 'in_progress'
```

and called:

```js
taskService.getByStatus('in');
```

The test expected an empty array because `in` is not an actual task status, but the `in_progress` task was returned.

### Suggested fix

Use strict equality instead of substring matching:

```js
const getByStatus = (status) => tasks.filter((t) => t.status === status);
```

---

## 2. Pagination returns wrong page

### Expected behavior

The API documents pagination using a `page` parameter beginning with `page=1`. Page 1 with a limit of 2 should therefore return the first two tasks.

### Actual behavior

`getPaginated()` calculates the offset as:

```js
const offset = page * limit;
```

For:

```text
page = 1
limit = 2
```

the offset becomes `2`, so the first two tasks are skipped.

### How it was discovered

A unit test created six tasks and called:

```js
taskService.getPaginated(1, 2);
```

The test expected the first two tasks, but the function returned the third and fourth tasks.

A second test for the last incomplete page also failed because the calculated offset went beyond the available tasks.

### Suggested fix

Calculate the offset using a 1-based page number:

```js
const offset = (page - 1) * limit;
```

---

## 3. Status filtering ignores pagination when both are provided

### Expected behavior

The assignment documents status filtering and pagination as supported query parameters. A reasonable interpretation would be that they should be combinable, so a request such as:

```text
/tasks?status=todo&page=2&limit=1
```

could filter the tasks by status and then return the requested page.

However, the assignment does not explicitly define the behavior when these parameters are combined.

### Actual behavior

The route checks `status` first:

```js
if (status) {
  const tasks = taskService.getByStatus(status);
  return res.json(tasks);
}
```

Because of the `return`, the pagination logic is skipped whenever `status` is supplied.

### How it was discovered

An integration test sent:

```text
GET /tasks?status=todo&page=2&limit=1
```

with three `todo` tasks.

The test expected one task for page 2 with a limit of 1, but the API returned all three `todo` tasks.

### Suggested fix

Clarify the intended API behavior before changing the implementation.

If combined filtering and pagination are intended, apply the status filter and pagination together instead of returning immediately after the status filter.

---

## 4. Completing a task changes its priority to medium

### Expected behavior

The `PATCH /tasks/:id/complete` endpoint should mark the task as completed by changing its status to `done` and setting `completedAt`.

The task's existing priority should remain unchanged. Completing a high-priority task should not silently change its priority to `medium`.

### Actual behavior

`completeTask()` explicitly sets the priority to `medium`:

```js
const updated = {
  ...task,
  priority: 'medium',
  status: 'done',
  completedAt: new Date().toISOString(),
};
```

As a result, completing a task with priority `high` changes its priority from `high` to `medium`.

### How it was discovered

A unit test created a task with:

```js
{
  title: 'Complete me',
  priority: 'high',
  status: 'todo'
}
```

After calling `completeTask()`, the test expected the priority to remain `high`, but the returned task had priority `medium`.

The same behavior was also observed through the `PATCH /tasks/:id/complete` integration test.

### Fix

The explicit priority assignment was removed from `completeTask()` so that the existing priority is preserved:

```js
const updated = {
  ...task,
  status: 'done',
  completedAt: new Date().toISOString(),
};
```
