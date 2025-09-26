// drawing from https://hackernoon.com/how-to-create-a-chrome-extension-with-react

import browser, {runtime, action, scripting, Runtime, Downloads, tabs} from 'webextension-polyfill'
import {backgroundDownloadImage} from "../canvas/image";
import {ResizeImageMessage} from "@canvas/type";
import getCourseIdFromUrl from "@canvas/course/getCourseIdFromUrl";


type MessageHandler<T, Output> = (
      params: T,
      sender: Runtime.MessageSender,
      sendResponse: (output: Output) => void
  ) => void | boolean | Promise<void> | Promise<boolean>;

const messageHandlers: Record<string, MessageHandler<any, any>> = {
  searchForCourse: async ( params: { queryString:string, subAccount: number}, _sender, sendResponse ) => {
    const {queryString, subAccount} = params;
    const activeTab = await getActiveTab();
    if(!activeTab?.id) {
      sendResponse({ success: false, error: "Please open a new tab and try again."});
      return true;
    }
    try {
      await scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ['./js/content.js'],
      });
      const contentResult = await tabs.sendMessage(activeTab.id, { queryString, subAccount });
      
      sendResponse(contentResult);
    } catch (e: any) {
      sendResponse({
      success: false,
      error: e.message === "Cannot access a chrome:// URL"
        ? "Please open a new tab and try again."
        : e.message || "Unknown error",
    });

    }

    return true;
  },


}

runtime.onMessage.addListener((
  message: Record<string, any>,
  sender,
  sendResponse
) => {
  for (const messageKey in messageHandlers) {
    if (message.hasOwnProperty(messageKey)) {
      // fire off the handler; it will call sendResponse(...) when it's done
      messageHandlers[messageKey](message[messageKey], sender, sendResponse);
      // return the *literal* true here so the channel stays open
      return true;
    }
  }
  // if no handler matched, we simply return void
});

runtime.onMessage.addListener((message: { downloadImage : string }, sender, sendResponse:(value:any) => void) => {
  if (message.downloadImage) {
    (async () => {
      const resized = await backgroundDownloadImage(message.downloadImage);
      sendResponse(resized);

    })();
    return true;
  }
});

action.onClicked.addListener(async (tab) => {

  const id = tab.id;
  if (!id) { return }

});


async function getActiveTab() {
  const windowTabs = await tabs.query({lastFocusedWindow: true})
  const activeTabs = await tabs.query({active:true});
  const activeLastWindow = await tabs.query({ active: true, lastFocusedWindow: true });

  const [tab] = windowTabs.filter(tab => tab.active)
  return tab
}

const url = "https://*.instructure.com/*";

console.log("API Tracker is running.")

browser.webRequest.onBeforeRequest.addListener(
    (details: any) => {
        // TODO: Switch the if and else if positioning because the else if is currently catching more
        // TODO: Pull course id from url
        let courseID: number | undefined;
        console.log(details.method);
        if(["POST", "PUT", "PUSH"].includes(details.method)) {
            //console.log("Change detected.");
            try {
                let bodyText: string | undefined;

                if(details.requestBody?.formData) {
                    // Check if the request body is a form data object
                    bodyText = JSON.stringify(details.requestBody.formData);
                    if(bodyText) {
                        const payload = JSON.parse(bodyText);
                        console.log("Form Data:")
                        console.log(payload);
                        if(payload.includes("syllabus_body")) {
                            // Syllabus Edited
                            // TODO: Get this pulling the data we want to save
                            console.log("Syllabus Body Detected");
                        }
                    }
                } else if (details.requestBody?.raw && details.requestBody.raw.length > 0) {
                    // Check if the request body is a raw object
                    const decoder = new TextDecoder("utf-8");
                    bodyText = decoder.decode(details.requestBody.raw[0].bytes);
                    if(bodyText) {
                        const payload = JSON.parse(bodyText);
                        console.log("Request Body:")
                        console.log(payload);
                        if(payload.operationName) {
                            if(!["GetDiscussionTopic", "Selective_Release_GetStudentsQuery", "GetDiscussionQuery", "GetCourseQuery"].includes(payload.operationName)) {
                                // Discussion/Announcement Edited
                                // TODO: Save this to local storage, with course id as key
                                console.log(`Operation Name: ${payload.operationName}, Title: ${payload.variables.title}, URL: /courses/${courseID}/discussion_topics/${payload.variables.discussionTopicId}`);
                            }
                        } else if(payload.assignment) {
                            // Assignment Edited
                            // TODO: Get all below pulling the right data to save
                            console.log("Assignment:", payload.assignment);
                        } else if(payload.wiki_body) {
                            // Home Page/Other pages? edited
                            console.log("Wiki Body Detected");
                        } else if(payload.context_module) {
                            // Module edited
                            console.log("context_module");
                        } else if(payload.quiz_type) {
                            // Quiz Edited
                            console.log("Quiz Edited");
                        }
                    }
                } else {
                    console.warn("No request body detected.");
                }
            } catch (e) {
                console.error("Error parsing request body:", e);
            }
        }
    },
    { urls: [url] },
    ["requestBody"]
);