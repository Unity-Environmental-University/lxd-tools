import { storage } from 'webextension-polyfill';
import { ChangeRecord } from './ChangeLogApp';

// BRO REALITY CHECK: This whole file is me going overboard with patterns
// Greg - you could start with just 10 lines of code to log Canvas API calls

export class ChangeDetector {
    private static instance: ChangeDetector;
    private originalFetch: typeof fetch;
    private originalXHROpen: typeof XMLHttpRequest.prototype.open;
    private originalXHRSend: typeof XMLHttpRequest.prototype.send;

    constructor() {
        this.originalFetch = window.fetch;
        this.originalXHROpen = XMLHttpRequest.prototype.open;
        this.originalXHRSend = XMLHttpRequest.prototype.send;
    }

    static getInstance(): ChangeDetector {
        if (!ChangeDetector.instance) {
            ChangeDetector.instance = new ChangeDetector();
        }
        return ChangeDetector.instance;
    }

    // TODO: Greg - Initialize the change detection
    init() {
        this.interceptFetch();
        this.interceptXHR();
        console.log('🔍 Change detection initialized');
    }

    // TODO: Greg - Intercept fetch calls
    private interceptFetch() {
        window.fetch = async (...args) => {
            const url = args[0] as string;
            const options = args[1];

            // Check if this is a Canvas API call we care about
            if (this.isCanvasApiCall(url, options?.method)) {
                await this.captureChange(url, options);
            }

            return this.originalFetch.apply(window, args);
        };
    }

    // TODO: Greg - Intercept XMLHttpRequest calls
    private interceptXHR() {
        const detector = this;

        XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
            // Store method and url on the XHR instance for later use
            (this as any)._method = method;
            (this as any)._url = url.toString();

            return detector.originalXHROpen.call(this, method, url, ...args);
        };

        XMLHttpRequest.prototype.send = function(body?: any) {
            const method = (this as any)._method;
            const url = (this as any)._url;

            if (detector.isCanvasApiCall(url, method)) {
                detector.captureChange(url, { method, body });
            }

            return detector.originalXHRSend.call(this, body);
        };
    }

    // TODO: Greg - Determine if this is a Canvas API call we want to track
    private isCanvasApiCall(url: string, method?: string): boolean {
        if (!url.includes('/api/v1/courses/')) {
            return false;
        }

        // Only track PUT/POST methods (changes, not reads)
        if (!method || !['PUT', 'POST', 'DELETE'].includes(method.toUpperCase())) {
            return false;
        }

        // TODO: Add more specific patterns for what you want to track
        const trackableEndpoints = [
            '/pages/',           // Course pages
            '/assignments/',     // Assignments
            '/quizzes/',        // Quizzes
            '/modules/',        // Course modules
            '/discussion_topics/', // Discussions
        ];

        return trackableEndpoints.some(endpoint => url.includes(endpoint));
    }

    // TODO: Greg - Capture the change and store it
    private async captureChange(url: string, options: any) {
        try {
            const courseId = this.extractCourseId(url);
            if (!courseId) return;

            const changeRecord: ChangeRecord = {
                id: this.generateId(),
                courseId: parseInt(courseId),
                timestamp: new Date(),
                userId: await this.getCurrentUserId(),
                userName: await this.getCurrentUserName(),
                changeType: this.determineChangeType(url, options.method),
                pageName: this.extractPageName(url),
                pageUrl: this.buildPageUrl(url, courseId),
                description: this.buildDescription(url, options.method)
            };

            await this.storeChange(changeRecord);
            console.log('📝 Change recorded:', changeRecord);
        } catch (error) {
            console.error('Error capturing change:', error);
        }
    }

    // TODO: Greg - Helper methods to extract data from URLs
    private extractCourseId(url: string): string | null {
        const match = url.match(/\/courses\/(\d+)/);
        return match ? match[1] : null;
    }

    private extractPageName(url: string): string {
        // TODO: Extract meaningful page names from different URL patterns
        if (url.includes('/pages/')) {
            const match = url.match(/\/pages\/([^/?]+)/);
            return match ? decodeURIComponent(match[1]).replace(/-/g, ' ') : 'Unknown Page';
        }
        if (url.includes('/assignments/')) {
            return 'Assignment';
        }
        if (url.includes('/quizzes/')) {
            return 'Quiz';
        }
        return 'Unknown Content';
    }

    private buildPageUrl(url: string, courseId: string): string {
        // TODO: Build the actual Canvas URL to view the content
        return window.location.origin + `/courses/${courseId}/pages`;
    }

    private determineChangeType(url: string, method: string): ChangeRecord['changeType'] {
        // TODO: Map URL patterns to change types
        if (url.includes('/pages/')) {
            return method === 'POST' ? 'page_update' : 'page_update';
        }
        if (url.includes('/assignments/')) {
            return method === 'POST' ? 'assignment_create' : 'assignment_update';
        }
        if (url.includes('/modules/')) {
            return 'module_update';
        }
        if (url.includes('/quizzes/')) {
            return 'quiz_update';
        }
        return 'page_update';
    }

    private buildDescription(url: string, method: string): string {
        // TODO: Create human-readable descriptions
        const action = method === 'POST' ? 'created' : method === 'PUT' ? 'updated' : 'modified';
        const content = url.includes('/pages/') ? 'page' :
                       url.includes('/assignments/') ? 'assignment' :
                       url.includes('/quizzes/') ? 'quiz' : 'content';
        return `${action} ${content}`.charAt(0).toUpperCase() + `${action} ${content}`.slice(1);
    }

    // TODO: Greg - Storage methods
    private async storeChange(change: ChangeRecord) {
        const storageKey = `changes_${change.courseId}`;
        const result = await storage.local.get(storageKey);
        const existingChanges = result[storageKey] || [];

        existingChanges.unshift(change); // Add to beginning

        // Keep only last 100 changes per course to avoid storage bloat
        if (existingChanges.length > 100) {
            existingChanges.splice(100);
        }

        await storage.local.set({ [storageKey]: existingChanges });
    }

    // TODO: Greg - Utility methods
    private async getCurrentUserId(): Promise<number> {
        // TODO: Get current user ID from Canvas API or page
        return 0; // Placeholder
    }

    private async getCurrentUserName(): Promise<string> {
        // TODO: Get current user name from Canvas API or page
        return 'Unknown User'; // Placeholder
    }

    private generateId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
}

// TODO: Greg - Export a function to load changes from storage
export async function loadChangesFromStorage(courseId: number): Promise<ChangeRecord[]> {
    const storageKey = `changes_${courseId}`;
    const result = await storage.local.get(storageKey);
    return result[storageKey] || [];
}

// TODO: Greg - Initialize detection when this module loads
// Uncomment this when you're ready to test:
// ChangeDetector.getInstance().init();