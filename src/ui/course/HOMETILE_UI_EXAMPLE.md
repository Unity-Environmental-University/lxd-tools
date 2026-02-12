# Hometile Generation UI Flow

## What Users See Now (With Progress Bar)

### Before Clicking "Generate Home Tiles"
```
┌─────────────────────────────────────┐
│ [Generate Home Tiles]               │
│ [Salesforce Image Download]         │
└─────────────────────────────────────┘
```

### Step 1: Click Button
Modal appears immediately:
```
┌───────────────────────────────────────┐
│  Initializing...                      │
│                                       │
│  ⏳                                    │
└───────────────────────────────────────┘
```

### Step 2: Processing Begins
```
┌───────────────────────────────────────┐
│  Processing module 1 of 8...          │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │████░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  │
│  │    1/8                          │  │
│  └─────────────────────────────────┘  │
│  1 of 8 modules (12%)                 │
│                                       │
│  Current: Week 1 Overview             │
└───────────────────────────────────────┘
```

### Step 3: Mid-Progress
```
┌───────────────────────────────────────┐
│  Processing module 4 of 8...          │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │████████████████░░░░░░░░░░░░░░░░│  │
│  │         4/8                     │  │
│  └─────────────────────────────────┘  │
│  4 of 8 modules (50%)                 │
│                                       │
│  Current: Module 4 - Risk Management  │
└───────────────────────────────────────┘
```

### Step 4: Complete (Success)
```
┌───────────────────────────────────────┐
│  Finished: Successfully generated     │
│  8 tiles. Refreshing...               │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │████████████████████████████████│  │
│  │         8/8                     │  │
│  └─────────────────────────────────┘  │
│  8 of 8 modules (100%)                │
│                                       │
│  [Close]                              │
└───────────────────────────────────────┘
```

### Step 4b: Complete (With Failures)
```
┌───────────────────────────────────────┐
│  Finished: Generated 6 tiles.         │
│  2 failed (check console).            │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │████████████████████████████████│  │
│  │         8/8                     │  │
│  └─────────────────────────────────┘  │
│  8 of 8 modules (100%)                │
│                                       │
│  [Close]                              │
└───────────────────────────────────────┘
```

Console shows:
```
Module 3: Module does not have an overview
Module 7: No banner image on page
Hometile generation complete: 6 succeeded, 2 failed
Errors: [
  "Module 3: Module does not have an overview",
  "Module 7: No banner image on page"
]
```

## Timing Breakdown (Example: 8 modules)

```
0s    - Button clicked, modal opens "Initializing..."
0.5s  - Module 1: "Processing module 1 of 8... (Week 1 Overview)"
1.5s  - Module 1 complete (delete 500ms + upload 500ms)
1.5s  - Module 2: "Processing module 2 of 8... (Module 2)"
3s    - Module 2 complete
3s    - Module 3: "Processing module 3 of 8... (Module 3)"
...   - Continue pattern
12s   - Module 8 complete
12s   - "Successfully generated 8 tiles. Refreshing..."
14s   - Cache refresh complete, images update
14s   - Modal shows [Close] button
```

## Visual Design

### Progress Bar Colors
- **Track** (background): `#e0e0e0` (light gray)
- **Bar** (fill): `#4CAF50` (green)
- **Text on bar**: White when percentage > 10%

### Transitions
- Bar width: `0.3s ease` - smooth animation as progress updates
- Prevents jumpy/flickering appearance

### Typography
- Modal text: 14px
- Progress fraction in bar: 12px bold white
- Stats below bar: 12px gray (#666)
- Current module name: 12px gray (#666)

## Implementation Notes

### Progress Callback
```typescript
const onProgress = (current: number, total: number, moduleName: string) => {
  setProgressCurrent(current);
  setProgressTotal(total);
  setCurrentModuleName(moduleName);
  setModalText(`Processing module ${current} of ${total}...`);
};

await course.regenerateHomeTiles(onProgress);
```

### State Updates
- `progressCurrent`: Updated before each module starts
- `progressTotal`: Set once when modules list is retrieved
- `currentModuleName`: Shows `module.name || "Module N"`
- `modalText`: Changes throughout process

### Why Sequential Display Works
Progress bar shows module count, not time:
- Each module gets 1 unit (8 modules = 8 units)
- Bar advances 12.5% per module
- User sees steady progress even if some modules are slower

Time-based progress would be harder:
- Some modules fast (small images)
- Some slow (large images)
- Unpredictable completion times
- Would need complex estimation

## Future Enhancements (Not Implemented)

See `src/ui/widgets/ProgressBar/README.md` for:
- Extraction to shared component
- Status colors (warning/error variants)
- Indeterminate mode
- Time estimates
- Substep display ("Deleting old file...")
- Cancel button
- Animation options
