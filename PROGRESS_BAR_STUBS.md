# Progress Bar Stubs - Implementation Summary

## What Was Added

### 1. Basic Progress Bar Component (Inline Stub)
**Location**: `src/ui/course/HomeTileApp.tsx` (lines ~39-64)

A simple, functional progress bar showing:
- Current/Total count with visual bar
- Percentage display
- Module name being processed

**Why inline?** Only used in one place. Extract to shared component when needed elsewhere.

### 2. Progress Callback in regenerateHomeTiles()
**Location**: `src/canvas/course/Course.ts`

```typescript
async regenerateHomeTiles(
  onProgress?: (current: number, total: number, moduleName: string) => void
)
```

Calls `onProgress(3, 8, "Module 3 - Risk Management")` before processing each module.

### 3. State Management in HomeTileApp
Added progress tracking state:
- `progressCurrent` - which module we're on
- `progressTotal` - total modules to process
- `currentModuleName` - name of current module

### 4. Modal UI Updates
Modal now shows:
- Progress bar during processing
- Current module name below bar
- "N of M modules (X%)" stats

## Files Modified

1. **src/ui/course/HomeTileApp.tsx**
   - Added `ProgressBar` component (inline)
   - Added progress state
   - Updated modal to display progress
   - Created progress callback

2. **src/canvas/course/Course.ts**
   - Added optional `onProgress` parameter to `regenerateHomeTiles()`
   - Calls callback before processing each module
   - Passes module name to callback

## Files Created (Documentation)

1. **src/ui/widgets/ProgressBar/README.md**
   - Future extraction plan
   - Feature wishlist (colors, animations, sizes)
   - When to extract guidelines
   - API design proposals

2. **src/ui/course/HOMETILE_UI_EXAMPLE.md**
   - Visual mockup of user flow
   - Timing breakdown
   - Design specifications
   - Implementation notes

3. **PROGRESS_BAR_STUBS.md** (this file)
   - Summary of changes
   - Quick reference

## Testing Status

✅ TypeScript: No errors
✅ Build: Successful compilation
✅ Tests: All 546 passing
✅ Manual: Not yet tested (requires Canvas instance)

## How It Works

### Flow
```
1. User clicks "Generate Home Tiles"
2. Modal opens, shows "Initializing..."
3. regenerateHomeTiles() called with progress callback
4. For each module:
   a. Callback fires with (current, total, name)
   b. UI updates progress bar
   c. Module processing happens
   d. Repeat
5. All modules done
6. Final message: "Generated N tiles. M failed."
7. 2-second CDN wait
8. Cache refresh
9. Close button enabled
```

### Progress Callback Pattern
```typescript
// In HomeTileApp.tsx
const onProgress = (current: number, total: number, moduleName: string) => {
  setProgressCurrent(current);
  setProgressTotal(total);
  setCurrentModuleName(moduleName);
  setModalText(`Processing module ${current} of ${total}...`);
};

await course.regenerateHomeTiles(onProgress);

// In Course.ts
for (let i = 0; i < modules.length; i++) {
  const module = modules[i];
  const current = i + 1;
  const moduleName = module.name || `Module ${module.position}`;

  if (onProgress) {
    onProgress(current, total, moduleName);
  }

  await this.generateHomeTile(module);
}
```

## What This Solves

### Before
- User clicks button
- Modal says "Updating Home Tiles..."
- Nothing visible happens for 15 seconds
- Modal says "Finished Updating Home Tiles"
- User doesn't know:
  - If it's working
  - How long it will take
  - Which modules succeeded/failed
  - If it's frozen

### After
- User clicks button
- Modal says "Processing module 1 of 8..."
- Progress bar: 12% (green)
- "Current: Week 1 Overview"
- [Bar animates to 25%]
- "Processing module 2 of 8..."
- [User sees steady progress]
- "Generated 8 tiles. Refreshing..."
- [2 second pause - user knows why]
- "Finished" + [Close] button

## Why Stubs Instead of Full Implementation

Following the principle: **Don't over-engineer until you need it.**

Current stub has:
- ✅ Visual progress indication
- ✅ Percentage display
- ✅ Current item label
- ✅ Smooth animation
- ✅ Inline implementation (no new dependencies)

Future full component would add:
- ❌ Status colors (normal/warning/error) - not needed yet
- ❌ Size variants - only one size needed
- ❌ Indeterminate mode - we always know total
- ❌ Time estimates - hard to predict, not worth complexity
- ❌ Cancel button - operation can't be safely cancelled
- ❌ Substeps - too granular for this use case
- ❌ ARIA attributes - should add, but works without for now

Extract when:
1. Second component needs progress bar (not yet)
2. Designer provides specific mockup (not yet)
3. Accessibility audit requires ARIA (not yet)
4. Need more than current features (not yet)

## Future Work (Not Urgent)

### Nice to Have
1. Show "Deleting old file..." / "Uploading new file..." substeps
2. Retry button for failed modules
3. Pause/Resume capability
4. Estimated time remaining

### Should Eventually Do
1. Add ARIA attributes for screen readers
2. Extract to shared component when needed elsewhere
3. Add error state color (red) for failures
4. Add success checkmark animation

### Maybe Never
1. Time estimates (too unpredictable)
2. Cancel button (can't safely cancel mid-module)
3. Multiple style themes (one is enough)

## Related Documentation

- `HOMETILE_FIX.md` - Full context on file replacement fix
- `src/ui/widgets/ProgressBar/README.md` - Future extraction plan
- `src/ui/course/HOMETILE_UI_EXAMPLE.md` - Visual mockup
- `CHANGES.md` - Change log

## Quick Reference: How to Use This Pattern Elsewhere

If you need progress in another operation:

```typescript
// 1. Add progress state
const [current, setCurrent] = useState(0);
const [total, setTotal] = useState(0);

// 2. Create callback
const onProgress = (current: number, total: number, name: string) => {
  setCurrent(current);
  setTotal(total);
  setStatus(`Processing ${name}...`);
};

// 3. Pass to async operation
await someOperation(onProgress);

// 4. Display in modal
{total > 0 && (
  <ProgressBar current={current} total={total} />
)}
```

That's it. Copy the ProgressBar component from HomeTileApp.tsx or extract it first.
