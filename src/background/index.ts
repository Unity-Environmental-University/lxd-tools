// drawing from https://hackernoon.com/how-to-create-a-chrome-extension-with-react

import browser, {runtime, action, scripting, Runtime, tabs} from 'webextension-polyfill'
import {backgroundDownloadImage} from "../canvas/image";


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