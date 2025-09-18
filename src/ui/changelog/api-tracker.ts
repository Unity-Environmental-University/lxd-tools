const originalFetch = window.fetch;

window.fetch = function(...args) {
    const url = args[0].toString();
    const method = args[1]?.method || 'GET';

    // Log ANY Canvas API call
    if (url.includes('/api/v1/courses/')) {
        console.log('📝 Canvas API call:', method, url);

        // If it's a save operation, log it specially
        if (['PUT', 'POST', "PUSH"].includes(method)) {
            console.log('💾 CHANGE DETECTED:', url);
        }
    }

    return originalFetch.apply(this, args);
};

const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method: string, url: string | URL) {
    (this as any)._method = method;
    (this as any)._url = url.toString();

    return originalXHROpen.prototype.open(this, method, url);
}

XMLHttpRequest.prototype.send = function(body) {
    const method = (this as any)._method;
    const url = (this as any)._url;

    if(typeof url === 'string'  && url.includes('/api/vi/courses/')) {
        console.log(`Canvas XHR API Call: ${method} ${url}`);
        if(['PUT', 'POST', 'PUSH'].includes(method)) {
            console.log(`XHR CHANGE DETECTED: ${url}`);
        }
    }

    return originalXHRSend.call(this, body);
}