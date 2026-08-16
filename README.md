# Take-Home Assignment — The Untested API

A 2-day take-home assignment focused on reading unfamiliar code, writing tests, finding bugs, fixing issues, and adding a small feature.

Read **[ASSIGNMENT.md](./ASSIGNMENT.md)** for the full brief.

---

## A note on AI tools

AI tools were used as a support tool during development. The implementation, test cases, debugging, and decisions were reviewed and understood while working through the codebase.

For each reported bug, the repository includes the affected behavior, how it was discovered, and the proposed fix. Design decisions and ambiguous behaviors are also documented where relevant.

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
cd task-api
npm install
npm start        # runs on http://localhost:3000
```

### Tests

```bash
npm test           # run test suite
npm run coverage   # run with coverage report
```

---

## Project Structure

```text
task-api/
  src/
    app.js
    routes/tasks.js
    services/taskService.js
    utils/validators.js
  tests/
    taskService.test.js
    taskRoutes.test.js
  package.json
  jest.config.js
  ASSIGNMENT.md
  BUGS.md
```

> The data store is in-memory. It resets when the application is restarted or when `_reset()` is used by the tests.

---

## API Reference

| Method   | Path                     | Description                        |
| -------- | ------------------------ | ---------------------------------- |
| `GET`    | `/tasks`                 | List all tasks                     |
| `GET`    | `/tasks?status=todo`     | Filter tasks by status             |
| `GET`    | `/tasks?page=1&limit=10` | Paginated task list                |
| `POST`   | `/tasks`                 | Create a new task                  |
| `PUT`    | `/tasks/:id`             | Update a task                      |
| `DELETE` | `/tasks/:id`             | Delete a task                      |
| `PATCH`  | `/tasks/:id/complete`    | Mark a task as complete            |
| `GET`    | `/tasks/stats`           | Counts by status and overdue tasks |
| `PATCH`  | `/tasks/:id/assign`      | Assign a task to a user            |

### Task shape

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "todo | in_progress | done",
  "priority": "low | medium | high",
  "dueDate": "ISO 8601 or null",
  "completedAt": "ISO 8601 or null",
  "createdAt": "ISO 8601"
}
```

### Sample requests

**Create a task**

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Write tests", "priority": "high"}'
```

**List tasks with a status filter**

```bash
curl "http://localhost:3000/tasks?status=todo"
```

**List tasks with pagination**

```bash
curl "http://localhost:3000/tasks?page=1&limit=10"
```

**Mark a task complete**

```bash
curl -X PATCH http://localhost:3000/tasks/<id>/complete
```

**Assign a task**

```bash
curl -X PATCH http://localhost:3000/tasks/<id>/assign \
  -H "Content-Type: application/json" \
  -d '{"assignee":"John"}'
```

---

## Testing

The project includes both **unit tests** and **integration tests**.

### Unit tests

`tests/taskService.test.js` directly tests the service layer, including:

* task creation and default values
* task lookup
* retrieving all tasks
* status filtering
* pagination
* task statistics
* task updates
* task deletion
* task completion
* task assignment

### Integration tests

`tests/taskRoutes.test.js` uses **Supertest** to test the API through Express, including:

* task listing
* status filtering
* pagination
* task creation
* validation failures
* task updates
* task deletion
* task completion
* task statistics
* task assignment

### Final test result

```text
Test Suites: 2 passed, 2 total
Tests:       54 passed, 54 total
```

Run the test suite with:

```bash
npm test
```

### Coverage

Final coverage:

```text
Statements: 97.35%
Branches:   95.18%
Functions:  93.10%
Lines:      97.08%
```

The result is above the assignment's required 80%+ coverage target.

Run coverage with:

```bash
npm run coverage
```

---

## Bugs Found

Detailed findings are documented in [BUGS.md](./BUGS.md).

### 1. Status filtering used partial matching

`getByStatus()` used `includes()` instead of exact equality, which allowed partial values such as `in` to match `in_progress`.

**Fix:** status filtering now uses strict equality.

### 2. Pagination skipped the first page

`getPaginated()` calculated the offset using `page * limit`, which caused page 1 to skip the first set of tasks.

**Fix:** the offset now uses:

```js
const offset = (page - 1) * limit;
```

### 3. Status filtering ignores pagination when combined with `page` and `limit`

When `status`, `page`, and `limit` are supplied together, the route returns after applying the status filter, so pagination is skipped.

This behavior was reproduced during integration testing and documented as a potential issue because the assignment does not explicitly define whether filtering and pagination must be combined. No implementation change was made for this behavior.

### 4. Completing a task changed its priority to `medium`

Completing a task previously changed its priority to `medium`, even when the task had a different priority.

**Fix:** completing a task now preserves its existing priority while changing the status to `done` and setting `completedAt`.

---

## New Feature

Added:

```http
PATCH /tasks/:id/assign
```

Request body:

```json
{
  "assignee": "string"
}
```

### Design decisions

* A valid, non-empty string is accepted as the assignee.
* Missing, empty, whitespace-only, or non-string assignee values return `400`.
* A non-existent task returns `404`.
* Reassignment is allowed; assigning a new name replaces the existing assignee.
* Whitespace around the assignee name is trimmed before storing it.

The endpoint and its unit/integration tests are included in the final implementation.

---

## Submission Notes

### What I would test next

I would add tests for additional pagination validation, more combinations of filtering and pagination once the expected contract is clarified, and additional edge cases around repeated task completion and assignment.

### What surprised me

I was surprised that the API initially had no automated tests despite containing multiple routes, validation rules, pagination logic, and task state transitions. The testing process also exposed differences between the project documentation and the assignment requirements.

### Questions I would ask before shipping to production

I would clarify whether status filtering and pagination are expected to work together, define valid ranges for pagination parameters, and confirm any business rules around task priority after completion.

---

## What to Submit

See [ASSIGNMENT.md](./ASSIGNMENT.md) for the complete submission requirements.

The repository includes:

* unit and integration test files
* bug report in `BUGS.md`
* bug fixes with regression tests
* `PATCH /tasks/:id/assign` implementation and tests
* test and coverage results
* submission notes
