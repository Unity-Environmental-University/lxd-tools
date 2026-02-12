# Hometile Generation Fix (2026-02-10)

## Problem
Users reported hometile regeneration was unreliable - "a giant pain in the ass."

Clicking "Generate Home Tiles" would sometimes work, sometimes not. Old images would persist even after regeneration.

## Root Cause
**Canvas file `on_duplicate: 'overwrite'` is unreliable in practice.**

The code was using Canvas's built-in overwrite mechanism:
```typescript
uploadFile(file, "Images/hometile", url)
// internally sets: on_duplicate: 'overwrite'
```

While Canvas documentation claims this should replace files with the same name, in practice:
- File IDs change on each upload
- CDN caching causes old files to persist
- Race conditions when multiple modules upload simultaneously
- No guarantee old file is actually deleted

## Solution
**Explicit file replacement: delete old, upload new, wait for propagation.**

### Changes Made

#### 1. New File Management Functions (`src/canvas/files.ts`)
```typescript
// Find folder by path
getFolderByPath(folderPath, courseId)

// List files in folder
listFilesInFolder(folderId)

// Delete file by ID
deleteFile(fileId, courseId)

// Find and delete existing file by name
deleteExistingFile(fileName, folder, courseId)
```

#### 2. Enhanced uploadFile() Function
Added optional `options` parameter:
```typescript
uploadFile(file, folder, url, {
  courseId: number,        // Required for file lookup
  replaceExisting: boolean // If true, deletes old file first
})
```

When `replaceExisting: true`:
1. Find old file with same name in folder
2. Delete it explicitly
3. Wait 500ms for Canvas to process deletion
4. Upload new file
5. Wait 500ms for Canvas to process upload

#### 3. Improved regenerateHomeTiles() (`src/canvas/course/Course.ts`)
**Before**: Parallel execution with silent failures
```typescript
await Promise.all(modules.map(m => generateHomeTile(m)))
```

**After**: Sequential execution with error tracking
```typescript
for (const module of modules) {
  try {
    await this.generateHomeTile(module);
    results.success++;
  } catch (e) {
    results.failed++;
    results.errors.push(errorMessage);
  }
}
return { success, failed, errors }
```

**Why sequential?** Prevents race conditions. Each module waits for previous upload to complete.

#### 4. Updated generateHomeTile()
Now uses explicit replacement:
```typescript
await uploadFile(file, "Images/hometile", this.fileUploadUrl, {
  courseId: this.id,
  replaceExisting: true  // Explicit delete-before-upload
});
```

#### 5. Better UI Feedback (`src/ui/course/HomeTileApp.tsx`)
**Before**:
- Silent failures
- No indication if tiles actually regenerated
- Immediate cache bust (didn't wait for Canvas)

**After**:
- Shows success/failure counts
- Logs errors to console
- Waits 2 seconds for Canvas CDN propagation before cache busting
- More aggressive cache busting (strips old query params)

```typescript
setModalText(`Generated ${results.success} tiles. ${results.failed} failed.`);
await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for CDN
// Then cache bust
```

## Testing

### Manual Test Steps
1. Open a course with module cards
2. Click "Generate Home Tiles"
3. Wait for completion message
4. Verify:
   - Modal shows "Successfully generated N tiles"
   - Module card images update to new versions
   - Console shows no errors

### Edge Cases to Test
- Module with no overview page (should fail gracefully)
- Module with no banner image (should fail gracefully)
- First-time generation (no old files to delete)
- Re-generation (old files should be deleted)
- Career Institute courses (different page selection logic)

## Expected Behavior

### Success Case
```
[Modal shows progress bar: 1 of 8 modules (12%)]
Processing module 1 of 8...
Current: Week 1 Overview

[Progress bar animates to 2 of 8...]
[... continues through all modules ...]

[Progress bar: 8 of 8 modules (100%)]
Successfully generated 8 tiles. Refreshing...
[2 second pause]
[Images refresh with new content]
```

### Partial Failure Case
```
[Progress bar: 3 of 8 modules (37%)]
Processing module 3 of 8...
Current: Module 3

[Error in console: Module 3: Module does not have an overview]
[Progress continues to next module...]

[Progress bar: 8 of 8 modules (100%)]
Generated 6 tiles. 2 failed (check console).
```

## Progress Bar Feature (NEW)

Added basic progress tracking:
- Shows current/total modules
- Displays percentage
- Shows current module name
- Visual progress bar with animation

**Location**: Inline stub in `HomeTileApp.tsx`
**Future**: See `src/ui/widgets/ProgressBar/README.md` for extraction plan

## Performance Impact

**Before**: ~3-5 seconds (parallel, no delays)
**After**: ~10-15 seconds for 8 modules

Why slower?
- Sequential instead of parallel (+4-6s)
- Explicit file deletion (+0.5s per module)
- CDN propagation wait (+2s)
- Per-upload delays (+0.5s per module)

**Trade-off accepted**: Reliability > Speed for this operation.

## Limitations Still Present

### Cannot Fix
1. **Theme dependency**: Still relies on CBT theme's `.cbt-module-card-img img` selector
2. **Filename conventions**: Theme expects `Images/hometile/hometileN.png`
3. **No progress indicator**: User sees modal, doesn't know which module is processing

### Could Improve Later
1. Add progress bar (1 of 8 modules...)
2. Retry failed uploads
3. Verify uploaded file dimensions
4. Add manual "refresh cache" button
5. Check if banner images actually changed before re-uploading

## Rollback Plan

If this causes issues, revert these commits:
1. `src/canvas/files.ts` - remove new functions, restore original uploadFile signature
2. `src/canvas/course/Course.ts` - restore parallel execution, remove results tracking
3. `src/ui/course/HomeTileApp.tsx` - restore simple modal text, remove delays

Or use git:
```bash
git revert <commit-hash>
```

## Success Metrics

Monitor for:
- ✅ User reports: "Hometiles now regenerate correctly"
- ✅ No more complaints about old images persisting
- ⚠️ Watch for: Increased complaints about slowness (trade-off)
- ⚠️ Watch for: Canvas rate limiting (too many API calls)

## Related Issues
- Banner resize has similar problem but harder to fix (page HTML references by ID)
- See `FRAGILITY_MARKERS.md` for details on file ID mismatch issues
