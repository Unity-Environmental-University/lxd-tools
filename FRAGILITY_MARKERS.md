# Fragility Markers in LXD Tools

## Purpose
This codebase contains inline warnings marking **brittle code that breaks when external dependencies change**. These markers help developers understand:
- Where failures are likely to occur
- Why certain features are unreliable
- What constraints prevent proper fixes

## Marked Features

### 1. Syllabus Week 1 Materials Import ~~(DISABLED)~~ **RE-ENABLED 2026-02-10**
**Status**: ✅ Partially Fixed - Re-enabled after bug fix
**Location**: `src/ui/syllabus/ImportButton.tsx`

**What Was Fixed** (mvirgin, 2026-02-10 8:03 PM):
- Missing `<p>` tag bug: Now ensures `<p>` exists as insertion point
- Sections no longer delete themselves without importing content
- Feature re-bundled and active in extension

**Remaining Fragility**:
- Text search and CSS selectors still break when syllabus templates change
- No semantic hooks (data attributes, stable IDs)
- Templates vary by course type and version
- Silent failures (console.error but no user notification)

**Marked Points**:
- Line ~8: `extractContentFromHTML()` - theme selector dependency
- Line ~68: `clearMatsSection()` - text search for section (NOW with <p> safety check)
- Line ~87: `importContentIntoSyllabus()` - duplicated text search logic
- Line ~137: `handleImportClick()` - hardcoded page slug + silent failures
- Line ~207: `ImportButton` - reload masks errors

**Progress**: More reliable, but still brittle. Won't break as often, but can still break.

---

### 2. Banner Image Resize ("Works About Half the Time")
**Status**: Active but unreliable
**Location**: `src/ui/course/HighlightBigImages.tsx`, `src/canvas/content/BaseContentItem.ts`

**Problem**: Canvas creates new file ID on upload, page HTML still references old ID.

**Marked Points**:
- `HighlightBigImages.tsx` line ~20: File header explains 50% success rate
- `HighlightBigImages.tsx` line ~36: `resizeBanner()` function warning
- `BaseContentItem.ts` line ~167: `resizeBanner()` method with detailed explanation

**Why We Can't Fix It**:
- Canvas file API doesn't have atomic "replace file content" operation
- Uploading new file creates new ID
- Page HTML still references old ID
- Would need to: (1) delete old file, AND (2) update page HTML, AND (3) ensure atomic
- Cache busting helps but doesn't solve root cause

**Potential Approaches**:
1. Delete old file before uploading new one
2. Update page content to reference new file ID
3. Research Canvas file API for content update endpoint
4. Convert to manual workflow (download link instead of auto-upload)

---

### 3. Hometile Generation ~~(Same File ID Issue)~~ **FIXED 2026-02-10**
**Status**: ✅ Improved - Now reliable
**Location**: `src/canvas/course/Course.ts`, `src/ui/course/HomeTileApp.tsx`, `src/canvas/course/modules.ts`, `src/canvas/files.ts`

**What Was Fixed**:
- Explicit file deletion before upload (no more relying on Canvas's `on_duplicate`)
- Sequential processing to avoid race conditions
- 2-second CDN propagation delay before cache bust
- Better error reporting (shows success/failure counts)
- More aggressive cache busting

**See**: `HOMETILE_FIX.md` for full details

**Remaining Limitations** (can't fix):
- CBT theme displays hometiles by file path convention (`Images/hometile/hometile{N}.png`)
- We don't control theme architecture
- Theme selector `.cbt-module-card-img img` (breaks if theme changes)
- Text search for pages titled "overview" (breaks if renamed)
- Career Institute assumes first page is banner source (may not be)

**Trade-off**: Now slower (~15s vs ~5s for 8 modules) but reliable

---

## Pattern Recognition

All three features share the same root cause:
```
We're automating workflows that Canvas/theme assume are manual.
No stable API contracts. No semantic hooks. Structure-based guessing.
```

### Common Fragility Types:

1. **Text Search Brittleness**
   - Searching for "Week 1 Learning Materials"
   - Searching for "overview" in page titles
   - Breaks with: renaming, localization, template changes

2. **CSS Selector Brittleness**
   - `.cbt-module-card-img img`
   - `.cbt-video-container`
   - `div.scaffold-media-box.cbt-content.cbt-accordion-container`
   - Breaks when: theme updates, template changes

3. **File ID Mismatch**
   - Upload creates new ID
   - References still point to old ID
   - Canvas behavior varies (caching, CDN)
   - ~50% success rate

4. **Silent Failures**
   - console.error() but no user notification
   - Operations return undefined or unchanged data
   - User sees success UI even when nothing happened

---

## For Junior Developers

When you encounter `FRAGILITY WARNING` or `BRITTLE` comments:

1. **Understand the constraint** - Why can't we fix it properly?
2. **Don't just patch** - Adding another selector won't solve selector brittleness
3. **Consider alternatives**:
   - Can this be a manual-assist tool instead of automation?
   - Can we validate before attempting (fail fast vs silent fail)?
   - Can we give clear error feedback to users?
4. **Document your attempts** - If you try a fix, mark what you tried and why it didn't work

---

## Marking New Fragility

When you write code that depends on unstable external structure:

```typescript
// FRAGILITY WARNING: <What this depends on>
// This breaks when: <Specific change scenarios>
// Failure mode: <What user experiences when it breaks>
function brittle Thing() {
    // Implementation
}
```

Be specific:
- ✅ "Theme selector `.module-card` - breaks if theme updates"
- ❌ "This might break sometimes"

---

## Why We Mark Instead of Fix

Sometimes the honest answer is: **"This can't be fixed without control we don't have."**

Marking it:
- Saves future developers from wasting time trying impossible fixes
- Makes the constraints visible for planning
- Helps decide when to abandon automation in favor of manual workflows
- Provides context when features get removed

The marks ARE the documentation of the pipe's shape.
