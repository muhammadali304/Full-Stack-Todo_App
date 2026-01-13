# Backend API Verification Checklist

This document provides step-by-step verification procedures for tasks T032-T036.

## Prerequisites

Before running these verifications:
1. ✅ Update `DATABASE_URL` in `.env` with valid Neon PostgreSQL credentials
2. ✅ Install dependencies: `pip install -r requirements.txt`
3. ✅ Run migrations: `alembic upgrade head`
4. ✅ Start server: `uvicorn src.main:app --reload --port 8000`

---

## T032: Verify Consistent JSON Structure

**Objective**: Ensure all endpoints return TaskResponse schema with consistent field names and data types.

### Verification Steps

1. **Create a task and capture response**:
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Verification Task","description":"Testing JSON structure"}' \
  | jq '.'
```

**Expected fields**:
- `id` (string, UUID format)
- `title` (string)
- `description` (string or null)
- `completed` (boolean)
- `user_id` (string or null)
- `created_at` (string, ISO 8601 timestamp)
- `updated_at` (string, ISO 8601 timestamp)

2. **List tasks and verify array structure**:
```bash
curl http://localhost:8000/api/tasks | jq '.'
```

**Expected**: Array of TaskResponse objects with same fields as above.

3. **Get specific task**:
```bash
curl http://localhost:8000/api/tasks/{task_id} | jq '.'
```

**Expected**: Single TaskResponse object with same fields.

4. **Update task and verify response**:
```bash
curl -X PATCH http://localhost:8000/api/tasks/{task_id} \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated"}' \
  | jq '.'
```

**Expected**: TaskResponse with updated fields, same structure.

5. **Toggle task and verify response**:
```bash
curl -X POST http://localhost:8000/api/tasks/{task_id}/toggle | jq '.'
```

**Expected**: TaskResponse with flipped `completed` field, same structure.

### Success Criteria
- ✅ All endpoints return consistent field names
- ✅ All timestamps in ISO 8601 format
- ✅ All UUIDs in standard format
- ✅ Boolean fields are true/false (not 1/0)
- ✅ Null values represented as `null` (not empty strings)

---

## T033: Verify RFC 7807 Error Format

**Objective**: Ensure all error responses follow RFC 7807 Problem Details standard.

### Verification Steps

1. **Test validation error (400)**:
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"   "}' \
  | jq '.'
```

**Expected response**:
```json
{
  "type": "validation_error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Title cannot be empty or whitespace-only",
  "instance": "/api/tasks"
}
```

2. **Test not found error (404)**:
```bash
curl http://localhost:8000/api/tasks/550e8400-e29b-41d4-a716-446655440000 | jq '.'
```

**Expected response**:
```json
{
  "type": "not_found",
  "title": "Not Found",
  "status": 404,
  "detail": "Task with id 550e8400-e29b-41d4-a716-446655440000 not found",
  "instance": "/api/tasks/550e8400-e29b-41d4-a716-446655440000"
}
```

3. **Test title too long (400)**:
```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"$(python -c 'print("A"*201)')\"}" \
  | jq '.'
```

**Expected**: RFC 7807 error with status 400.

4. **Test invalid UUID format (422)**:
```bash
curl http://localhost:8000/api/tasks/invalid-uuid | jq '.'
```

**Expected**: RFC 7807 error with status 422 (FastAPI validation).

### Success Criteria
- ✅ All error responses have required fields: type, title, status, detail, instance
- ✅ Status codes match HTTP response codes
- ✅ Detail messages are clear and actionable
- ✅ Instance field contains request path
- ✅ No stack traces or internal details exposed

---

## T034: Verify Database Indexes

**Objective**: Ensure database indexes exist for optimal query performance.

### Verification Steps

1. **Connect to Neon PostgreSQL**:
```bash
psql "postgresql://neondb_owner:password@host.neon.tech/neondb?sslmode=require"
```

2. **Check table structure**:
```sql
\d tasks
```

**Expected output should include**:
```
Indexes:
    "tasks_pkey" PRIMARY KEY, btree (id)
    "idx_tasks_created_at" btree (created_at DESC)
    "idx_tasks_user_id" btree (user_id)
```

3. **Verify index usage for list query**:
```sql
EXPLAIN ANALYZE SELECT * FROM tasks ORDER BY created_at DESC LIMIT 100;
```

**Expected**: Query plan should show "Index Scan using idx_tasks_created_at".

4. **Verify index usage for user_id query** (future multi-user):
```sql
EXPLAIN ANALYZE SELECT * FROM tasks WHERE user_id = 'some-uuid';
```

**Expected**: Query plan should show "Index Scan using idx_tasks_user_id".

### Success Criteria
- ✅ Primary key index on `id` exists
- ✅ Index on `created_at DESC` exists (for ordering)
- ✅ Index on `user_id` exists (for future multi-user queries)
- ✅ Query plans show index usage (not sequential scans)

---

## T035: Run Manual API Tests

**Objective**: Execute complete workflow to verify all functionality works end-to-end.

### Test Workflow

#### 1. Create Tasks
```bash
# Create task 1
TASK1=$(curl -s -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Complete project documentation","description":"Write comprehensive API docs"}' \
  | jq -r '.id')

echo "Created task 1: $TASK1"

# Create task 2
TASK2=$(curl -s -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Review pull requests"}' \
  | jq -r '.id')

echo "Created task 2: $TASK2"

# Create task 3
TASK3=$(curl -s -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Fix bug in authentication"}' \
  | jq -r '.id')

echo "Created task 3: $TASK3"
```

#### 2. List Tasks (Verify Ordering)
```bash
curl http://localhost:8000/api/tasks | jq '.[] | {title, created_at}'
```

**Expected**: Tasks listed newest first (TASK3, TASK2, TASK1).

#### 3. Get Specific Task
```bash
curl http://localhost:8000/api/tasks/$TASK1 | jq '.'
```

**Expected**: Full task details for TASK1.

#### 4. Update Task
```bash
curl -X PATCH http://localhost:8000/api/tasks/$TASK1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated: Complete project documentation"}' \
  | jq '.'
```

**Expected**: Task with updated title, changed `updated_at` timestamp.

#### 5. Toggle Completion
```bash
# Toggle to completed
curl -X POST http://localhost:8000/api/tasks/$TASK2/toggle | jq '.completed'

# Toggle back to incomplete
curl -X POST http://localhost:8000/api/tasks/$TASK2/toggle | jq '.completed'
```

**Expected**: First toggle returns `true`, second returns `false`.

#### 6. Delete Task
```bash
curl -X DELETE http://localhost:8000/api/tasks/$TASK3

# Verify deletion
curl http://localhost:8000/api/tasks/$TASK3
```

**Expected**: 204 No Content, then 404 Not Found.

#### 7. Test Error Cases
```bash
# Empty title
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"   "}'

# Non-existent task
curl http://localhost:8000/api/tasks/550e8400-e29b-41d4-a716-446655440000

# Title too long
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"$(python -c 'print("A"*201)')\"}"
```

**Expected**: All return appropriate error responses with RFC 7807 format.

### Success Criteria
- ✅ All CRUD operations work correctly
- ✅ Tasks persist across requests
- ✅ Ordering is newest first
- ✅ Partial updates work (only provided fields change)
- ✅ Toggle flips state correctly
- ✅ Deletion removes task permanently
- ✅ Error cases return appropriate status codes and messages

---

## T036: Verify Performance Targets

**Objective**: Ensure API meets performance requirements from spec.md.

### Performance Requirements
- Task retrieval: <500ms for databases with up to 10,000 tasks
- Error responses: <1 second
- Concurrent operations: 100+ without data corruption

### Verification Steps

#### 1. Seed Database with Test Data
```bash
# Create 10,000 test tasks
for i in {1..10000}; do
  curl -s -X POST http://localhost:8000/api/tasks \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Test task $i\",\"description\":\"Performance test task\"}" \
    > /dev/null

  if [ $((i % 100)) -eq 0 ]; then
    echo "Created $i tasks..."
  fi
done
```

#### 2. Test List Endpoint Performance
```bash
# Measure response time
time curl -s http://localhost:8000/api/tasks > /dev/null

# Or use Apache Bench
ab -n 100 -c 10 http://localhost:8000/api/tasks
```

**Expected**: Average response time <500ms.

#### 3. Test Get Endpoint Performance
```bash
# Get a specific task
TASK_ID=$(curl -s http://localhost:8000/api/tasks | jq -r '.[0].id')

ab -n 100 -c 10 http://localhost:8000/api/tasks/$TASK_ID
```

**Expected**: Average response time <500ms.

#### 4. Test Error Response Performance
```bash
ab -n 100 -c 10 http://localhost:8000/api/tasks/550e8400-e29b-41d4-a716-446655440000
```

**Expected**: Average response time <1 second.

#### 5. Test Concurrent Operations
```bash
# Create 100 tasks concurrently
ab -n 100 -c 100 -p task.json -T application/json http://localhost:8000/api/tasks
```

Where `task.json` contains:
```json
{"title":"Concurrent test task","description":"Testing concurrency"}
```

**Expected**:
- All 100 requests succeed (no 500 errors)
- No data corruption (verify with database query)
- Connection pool handles load without exhaustion

#### 6. Verify Database Query Performance
```sql
-- Connect to database
psql "postgresql://neondb_owner:password@host.neon.tech/neondb?sslmode=require"

-- Check query execution time
EXPLAIN ANALYZE SELECT * FROM tasks ORDER BY created_at DESC LIMIT 100;
```

**Expected**: Execution time <100ms (should use index).

### Success Criteria
- ✅ List endpoint: <500ms average for 10K tasks
- ✅ Get endpoint: <500ms average
- ✅ Error responses: <1s average
- ✅ 100 concurrent operations: All succeed, no corruption
- ✅ Database queries use indexes efficiently
- ✅ Connection pool handles concurrent load

---

## Verification Summary

After completing all verification steps, check off each item:

### T032: Consistent JSON Structure
- [ ] All endpoints return TaskResponse schema
- [ ] Field names consistent across all endpoints
- [ ] Data types correct (UUID, boolean, timestamp)
- [ ] Null values handled correctly

### T033: RFC 7807 Error Format
- [ ] All error responses have required fields
- [ ] Status codes match HTTP response codes
- [ ] Error messages are clear and actionable
- [ ] No internal details exposed

### T034: Database Indexes
- [ ] Primary key index exists
- [ ] created_at DESC index exists
- [ ] user_id index exists
- [ ] Query plans show index usage

### T035: Manual API Tests
- [ ] Create tasks works
- [ ] List tasks works (newest first)
- [ ] Get task works
- [ ] Update task works (partial updates)
- [ ] Toggle completion works
- [ ] Delete task works
- [ ] Error cases return correct responses

### T036: Performance Targets
- [ ] Task retrieval <500ms for 10K tasks
- [ ] Error responses <1s
- [ ] 100 concurrent operations succeed
- [ ] No data corruption under load
- [ ] Database queries use indexes

---

## Known Issues

### Database Connection Error
The server currently fails to start due to invalid PostgreSQL credentials:
```
asyncpg.exceptions.InvalidPasswordError: password authentication failed for user 'neondb_owner'
```

**Resolution**: Update `DATABASE_URL` in `.env` with valid Neon PostgreSQL credentials before running verifications.

---

## Next Steps After Verification

1. Document any issues found during verification
2. Fix any bugs or performance issues
3. Update implementation summary with verification results
4. Proceed to deployment or next feature phase
