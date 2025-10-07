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
    (details) => {
        console.log(details.method);
        if(["POST", "PUT", "PUSH"].includes(details.method)) {
            //console.log("Change detected.");
            try {
                let bodyText: string | undefined;

                if (details.requestBody?.raw && details.requestBody.raw.length > 0) {
                    // Check if the request body is a raw object
                    const decoder = new TextDecoder("utf-8");
                    bodyText = decoder.decode(details.requestBody.raw[0].bytes);
                    if(bodyText) {
                        const payload = JSON.parse(bodyText);
                        console.log("Request Body:")
                        console.log(payload);
                        if(payload.operationName) {
                            if(!["GetDiscussionTopic", "Selective_Release_GetStudentsQuery", "GetDiscussionQuery", "GetCourseQuery", "GetCourseName"].includes(payload.operationName)) {
                                // Discussion/Announcement Edited, working, pulling the information as expected
                                // This is a GraphQL operation
                                console.log(`Operation Name: ${payload.operationName}, Title: ${payload.variables.title}, ID:${payload.variables.discussionTopicId}`);
                            }
                        } else if(payload.assignment) {
                            // Assignment Edited, working, pulling the information as expected
                            console.log(`Course ID: ${payload.assignment.course_id}, Title: ${payload.assignment.name}, URL: ${payload.assignment.html_url}`)
                            console.log(payload.assignment.description);
                        } else if(payload.wiki_page) {
                            // Pages edited, working, pulling the information as expected
                            console.log(`Title: ${payload.wiki_page.title}, URL: ${payload.wiki_page.html_url}`);
                            console.log(payload.wiki_page.body);
                        } else if(payload.context_module) {
                            // Module edited
                            // The context_module object doesn't give us any useful information
                            // TODO: Figure out what to pass when a module is edited
                            console.log("Module Edited");
                        }
                    }
                } else if(details.requestBody?.formData) {
                    // Check if the request body is a form data object
                    bodyText = JSON.stringify(details.requestBody.formData);
                    if(bodyText) {
                        const payload = JSON.parse(bodyText);
                        console.log("Form Data:")
                        console.log(payload);
                        if(payload.syllabus_body) {
                            // Syllabus Edited
                            // TODO: The syllabus information comes in the response, not in the payload
                            // console.log(`Course: ${payload.course_id}, id: ${payload.id}`);
                            // console.log(payload.syllabus_body);
                        } else if(payload.quiz_type) {
                            // Quiz Edited, working, pulling the information as expected
                            console.log(`Title: ${payload.title}`);
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

//Is this what we need to do to get the syllabus information?
browser.webRequest.onBeforeRequest.addListener(
    (details: any) => {
        if(details.method === "POST") {
            const filter = browser.webRequest.filterResponseData(details.requestId);
            const decoder = new TextDecoder("utf-8");
            let responseData = "";

            filter.ondata = (event: any) => {
                responseData += decoder.decode(event.data, { stream: true });
                filter.write(event.data);
            };

            filter.onstop = () => {
                responseData += decoder.decode();

                try {
                    const jsonResponse = JSON.parse(responseData);
                    console.log(`Parsed Response Body: ${jsonResponse}`);
                } catch (e) {
                    console.error("Error parsing response body:", e);
                }

                filter.disconnect();
            };
        }
    },
    { urls: [url] },
    ["blocking"]
);