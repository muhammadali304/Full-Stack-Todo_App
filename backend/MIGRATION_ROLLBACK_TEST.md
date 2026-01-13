# Migration Rollback Testing Procedure (T010b)

## Overview
This document provides instructions for testing the database migration rollback functionality to ensure safe schema changes.

## Prerequisites
- Valid Neon PostgreSQL database credentials in `.env` file
- Alembic installed (`pip install alembic`)
- Database connection accessible from your environment

## Testing Procedure

### Step 1: Verify Current Migration Status
```bash
cd backend
python -m alembic current
```
**Expected Output:** Should show no current revision (empty database)

### Step 2: Apply Initial Migration
```bash
python -m alembic upgrade head
```
**Expected Output:**
- Migration `001_initial` applied successfully
- Tasks table created with all fields and indexes
- No errors in output

**Verification:**
```bash
python -m alembic current
```
Should show: `001_initial (head)`

### Step 3: Verify Database Schema
Connect to your Neon database and verify:
```sql
-- Check table exists
SELECT table_name FROM information_schema.tables WHERE table_name = 'tasks';

-- Check columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks';

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'tasks';
```

**Expected Results:**
- Table `tasks` exists
- Columns: id, title, description, completed, user_id, created_at, updated_at
- Indexes: tasks_pkey, idx_tasks_user_id, idx_tasks_created_at

### Step 4: Test Rollback (Downgrade)
```bash
python -m alembic downgrade -1
```
**Expected Output:**
- Migration `001_initial` rolled back successfully
- Tasks table dropped
- Indexes dropped
- No errors in output

**Verification:**
```bash
python -m alembic current
```
Should show: (empty - no current revision)

### Step 5: Verify Schema Reverted
Connect to your Neon database and verify:
```sql
-- Check table does not exist
SELECT table_name FROM information_schema.tables WHERE table_name = 'tasks';
```
**Expected Result:** No rows returned (table dropped)

### Step 6: Re-apply Migration
```bash
python -m alembic upgrade head
```
**Expected Output:**
- Migration `001_initial` applied successfully
- Tasks table recreated with all fields and indexes
- No errors in output

**Verification:**
```bash
python -m alembic current
```
Should show: `001_initial (head)`

### Step 7: Final Verification
Verify the schema is identical to Step 3:
```sql
-- Check table exists
SELECT table_name FROM information_schema.tables WHERE table_name = 'tasks';

-- Check columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'tasks';
```

## Success Criteria
- ✅ Migration applies successfully (upgrade)
- ✅ Schema matches specification (all fields, constraints, indexes)
- ✅ Migration rolls back successfully (downgrade)
- ✅ Schema reverts completely (table and indexes dropped)
- ✅ Migration re-applies successfully (upgrade again)
- ✅ Schema is identical after re-application

## Common Issues and Solutions

### Issue 1: Database Connection Failed
**Error:** `asyncpg.exceptions.InvalidPasswordError` or connection timeout

**Solution:**
1. Verify DATABASE_URL in `.env` file
2. Check Neon database is active (not suspended)
3. Verify network connectivity to Neon
4. Ensure SSL parameter is correct (`ssl=require` for asyncpg)

### Issue 2: Migration Already Applied
**Error:** `Target database is not up to date`

**Solution:**
```bash
# Check current version
python -m alembic current

# If already at head, downgrade first
python -m alembic downgrade -1

# Then re-test
python -m alembic upgrade head
```

### Issue 3: Alembic Version Table Missing
**Error:** `alembic_version table does not exist`

**Solution:**
```bash
# Stamp the database with the current version
python -m alembic stamp head
```

## Rollback Safety Notes

### Data Loss Warning
⚠️ **CRITICAL:** Downgrading migrations will **permanently delete all data** in the tasks table.

**Production Rollback Strategy:**
1. **Backup First:** Always backup data before rollback
2. **Test on Branch:** Use Neon database branching to test rollback on a copy
3. **Data Migration:** If rollback is needed in production, export data first
4. **Staged Rollback:** Consider multi-step migrations for zero-downtime rollback

### Zero-Downtime Migration Strategy
For production environments, use this approach:

**Phase 1: Additive Changes**
- Add new columns as nullable
- Add new indexes
- Deploy application code that works with both old and new schema

**Phase 2: Data Migration**
- Backfill data for new columns
- Verify data integrity

**Phase 3: Constraints**
- Add NOT NULL constraints
- Add CHECK constraints
- Remove old columns (if any)

**Rollback:** Each phase can be rolled back independently without data loss

## Testing with Neon Database Branching

Neon provides database branching for safe migration testing:

```bash
# Create a branch from production
neon branches create --name migration-test --parent main

# Update DATABASE_URL to point to branch
# Test migration on branch
python -m alembic upgrade head

# Verify schema
# Test rollback
python -m alembic downgrade -1

# If successful, apply to main database
# If failed, delete branch and fix migration
```

## Documentation
- Migration file: `backend/alembic/versions/001_initial_create_tasks_table.py`
- Data model spec: `specs/001-backend-api-foundation/data-model.md`
- Implementation plan: `specs/001-backend-api-foundation/plan.md`

## Status
- **Created:** 2026-01-11
- **Status:** Documented (requires valid DB credentials to execute)
- **Next Steps:** Update .env with valid Neon credentials and execute testing procedure
