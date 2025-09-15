// Greg - if the ChangeDetector.ts file looks scary, start here instead!
// This is literally all you need to see what Canvas is doing:

console.log('🔍 Simple change detection starting...');

const originalFetch = window.fetch;
window.fetch = function(...args) {
    const url = args[0];
    const method = args[1]?.method || 'GET';

    // Log ANY Canvas API call
    if (url.includes('/api/v1/courses/')) {
        console.log('📝 Canvas API call:', method, url);

        // If it's a save operation, log it specially
        if (['PUT', 'POST'].includes(method)) {
            console.log('💾 CHANGE DETECTED:', url);
        }
    }

    return originalFetch.apply(this, args);
};

// That's it! Now go edit a Canvas page and watch the console.
// Once you see what calls Canvas makes, you can decide what to track.