# Progress Bar Component (Stub)

## Current Status
Basic inline progress bar stub implemented in `HomeTileApp.tsx`.

## Location
Currently embedded in: `src/ui/course/HomeTileApp.tsx` (lines ~39-64)

## Future Improvements

### 1. Extract to Shared Component
Move ProgressBar to `src/ui/widgets/ProgressBar/index.tsx` when needed elsewhere.

Current usage:
- Hometile generation (only place using it)

Potential future usage:
- Blueprint creation progress
- Bulk validation operations
- File upload progress
- Module migration progress

### 2. Styling
Current: Inline styles (quick stub)
Future: Proper CSS/SCSS module

```scss
// ProgressBar.module.scss
.container {
  margin: 10px 0;
}

.label {
  margin-bottom: 5px;
  font-size: 14px;
}

.track {
  width: 100%;
  height: 20px;
  background-color: var(--progress-bg, #e0e0e0);
  border-radius: 4px;
  overflow: hidden;
}

.bar {
  height: 100%;
  background-color: var(--progress-color, #4CAF50);
  transition: width 0.3s ease;
  // ... etc
}
```

### 3. Features to Add

#### Status Colors
```typescript
type ProgressStatus = 'normal' | 'warning' | 'error' | 'success';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  status?: ProgressStatus;  // Changes color
  showPercentage?: boolean;
  showFraction?: boolean;
  animated?: boolean;       // Striped animation
}
```

#### Indeterminate Mode
For operations where total is unknown:
```tsx
<ProgressBar indeterminate label="Processing..." />
```

#### Size Variants
```typescript
size?: 'small' | 'medium' | 'large'
```

#### Cancel Button
```typescript
onCancel?: () => void;
cancelable?: boolean;
```

### 4. Animation Improvements

Current: Simple CSS transition
Future options:
- Striped animated background (like Bootstrap)
- Pulse effect during processing
- Success checkmark animation on completion
- Smooth easing functions

### 5. Accessibility

Add ARIA attributes:
```tsx
<div
  role="progressbar"
  aria-valuenow={current}
  aria-valuemin={0}
  aria-valuemax={total}
  aria-label={label}
>
```

### 6. Error Handling

Show failed items in progress:
```typescript
interface ProgressBarProps {
  current: number;
  total: number;
  failed?: number;  // Show in different color
  skipped?: number;
}
```

Display like: `"7 of 10 modules (2 failed, 1 skipped)"`

### 7. Time Estimates

```typescript
interface ProgressBarProps {
  // ... existing props
  startTime?: number;
  estimatedTimeRemaining?: number;
}
```

Display: `"Estimated time remaining: 12 seconds"`

### 8. Substeps

For operations with nested progress:
```tsx
<ProgressBar
  current={3}
  total={10}
  label="Processing modules"
  substep="Uploading hometile3.png (2 of 3 files)"
/>
```

## When to Extract

Extract when ANY of these happen:
1. Second component needs progress bar
2. Designer provides specific UI mockup
3. Need for theming/brand colors
4. Accessibility requirements mandate ARIA
5. Need more than 2 style variants

## Example Usage (Future)

```tsx
import ProgressBar from '@/ui/widgets/ProgressBar';

// Basic
<ProgressBar current={5} total={10} />

// With label
<ProgressBar
  current={5}
  total={10}
  label="Processing modules..."
/>

// With status
<ProgressBar
  current={5}
  total={10}
  status="error"
  label="Errors encountered"
/>

// Indeterminate
<ProgressBar
  indeterminate
  label="Loading..."
/>

// With substep and cancel
<ProgressBar
  current={3}
  total={8}
  label="Generating hometiles"
  substep="Module 3: Uploading image..."
  onCancel={() => cancelOperation()}
  cancelable
/>
```

## Don't Over-Engineer

Current inline stub is FINE until we need more than:
- Basic progress (current/total)
- Simple label
- One color scheme
- Used in one place

Only extract and enhance when requirements demand it.
