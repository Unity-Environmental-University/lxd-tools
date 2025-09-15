# Greg's Change Tracking Reference & Learning Notes
*Real talk from BRO - take what's useful, ignore what's not*

## What's Here & Why

Hey Greg! 🍻 I built some example files to show patterns in the codebase. **Fair warning**: I might be going full golden retriever here with fancy architecture when you probably just need to get something working first.

### The Files I Made
- `ChangeLogApp.tsx` - Example React component (probably overcomplicated)
- `ChangeDetector.ts` - XHR interception ideas (definitely overthought)
- `index.tsx` - How to mount a React app (this one's actually useful)

**Real talk**: You might want to start WAY simpler than what I built. Like, just get a "Hello World" component showing up in Canvas first.

## Learning Strategy Suggestions

### Start Here (Seriously Simple)
1. Get a basic React component rendering somewhere in Canvas
2. Make it show some hardcoded fake changes
3. Then worry about real change detection

### My Golden Retriever Moments to Ignore
- All the TypeScript interfaces - you can add those later
- The fancy storage abstraction - `chrome.storage.local.set()` works fine
- The complex URL parsing - start with just logging when ANY Canvas API call happens

## How Other Apps Work (Actually Useful)

### Check Out These Files
- `src/publish/index.tsx` - See how it mounts? Copy that pattern
- `src/popup/PopUpApp.tsx` - Simple React component example
- `manifest.source.json` - See how content scripts get wired up

### Webpack Pattern
Look at `webpack.config.js` around line 16-30. Every app needs an entry point like:
```javascript
'js/yourapp': './src/yourapp',
```

## XHR Interception (The Fun Part!)

Canvas makes API calls when you save stuff. You can catch them like:
```javascript
const originalFetch = window.fetch;
window.fetch = function(...args) {
    console.log('Canvas called:', args[0]); // Log everything first!
    return originalFetch.apply(this, args);
};
```

**BRO CONFESSION**: I built a whole class for this, but you could literally just put that code snippet in a content script and start logging what Canvas does. Way simpler.

## Where I Probably Went Overboard

- **Change records interface**: Just use a plain object first
- **Storage abstraction**: Chrome storage API is like 2 lines
- **Complex change detection**: Start by just logging ALL requests, see what's interesting

## Canvas API Patterns (Actually Useful)

When you edit a page, Canvas does something like:
- `PUT /api/v1/courses/12345/pages/some-page-name`

When you create an assignment:
- `POST /api/v1/courses/12345/assignments`

Just intercept those and you're 80% done!

## Real Learning Path

1. **Get React working** - mount a component, show "Hello Greg"
2. **Intercept ONE thing** - just log when Canvas saves a page
3. **Store ONE thing** - save that log to Chrome storage
4. **Display it** - show the saved logs in your React component

Everything else is fancy stuff you can add later.

## When to Ask for Help

- **React questions**: How do hooks work? How to manage state?
- **Extension questions**: Why isn't my content script loading?
- **Canvas questions**: What API calls should I watch for?

**Don't ask**: "How do I implement this exact architecture?" - because honestly, you probably don't need it!

## BRO's Honest Assessment

I built you a Ferrari when you probably need a bicycle. The patterns are solid, but feel free to strip out 80% of what I did and build your own simpler version. That's actually better learning!

The real value is understanding how the lxd-tools codebase works, not copying my overengineered examples. 🤜🤛

---

*Add your own notes as you figure things out! Teaching BRO where he went overboard helps everyone.*