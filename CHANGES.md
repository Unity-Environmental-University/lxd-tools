# Recent Changes

## 2026-02-10: Hometile Generation Fix

### Summary
Fixed unreliable hometile regeneration that was "a giant pain in the ass for people."

### Changes
1. **New file management functions** (`src/canvas/files.ts`):
   - `getFolderByPath()` - resolve folder ID from path
   - `listFilesInFolder()` - list all files in a folder
   - `deleteFile()` - delete file by ID
   - `deleteExistingFile()` - find and delete old file before upload

2. **Enhanced uploadFile()** with explicit replacement mode:
   - Added optional `options: {courseId, replaceExisting}` parameter
   - When `replaceExisting: true`, deletes old file before uploading new one
   - Adds delays for Canvas to propagate changes

3. **Improved regenerateHomeTiles()** (`src/canvas/course/Course.ts`):
   - Sequential processing instead of parallel (prevents race conditions)
   - Returns `{success, failed, errors}` instead of void
   - Better error tracking and logging
   - **NEW**: Progress callback support `onProgress(current, total, moduleName)`

4. **Better UI feedback** (`src/ui/course/HomeTileApp.tsx`):
   - Shows success/failure counts in modal
   - Waits 2 seconds for Canvas CDN propagation
   - More aggressive cache busting
   - **NEW**: Progress bar with current module name
   - **NEW**: Visual percentage indicator

5. **Progress Bar Stub** (`src/ui/widgets/ProgressBar/`):
   - Added inline progress bar component (stub)
   - Shows "N of M modules (X%)"
   - Displays current module being processed
   - Smooth CSS animation
   - Future extraction plan documented in README

### Impact
- **Reliability**: Should now work consistently (was ~50% before)
- **Speed**: Slower (~15s vs ~5s for 8 modules) due to sequential processing
- **UX**: Much better feedback - users see exactly what's happening
- **Transparency**: No more wondering if it worked or not

### Documentation
- `HOMETILE_FIX.md` - detailed explanation of problem and solution
- `FRAGILITY_MARKERS.md` - updated to reflect fix

### Testing
- Build: ✅ Successful
- TypeScript: ✅ No errors
- Tests: ✅ All 546 tests passing

---

## 2026-02-10: Fragility Documentation

### Summary
Added inline warnings and documentation for brittle code patterns.

### Changes
1. **Created `FRAGILITY_MARKERS.md`**:
   - Documents all brittle features
   - Explains why they can't be fully fixed
   - Provides guidance for junior developers

2. **Added inline warnings** to:
   - Syllabus import feature (disabled)
   - Banner resize feature (50% reliable)
   - Hometile generation (now fixed)

3. **Removed debug output**:
   - Cleaned up `console.log("hi")` in doubleProfileLanguageIntro.ts

### Purpose
Prevent junior developers from wasting time on impossible fixes by:
- Marking where code depends on external structures we don't control
- Explaining attempted fixes that didn't work
- Showing constraints that prevent proper solutions

---

## Dependencies Updated

### 2026-02-10
- `@ueu/ueu-canvas` upgraded from 0.0.3 to 0.0.4 (npm install)
- Fixed TypeScript compilation errors related to missing exports
