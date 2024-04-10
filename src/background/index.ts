// drawing from https://hackernoon.com/how-to-create-a-chrome-extension-with-react

import {runtime, action, scripting, Runtime, Downloads, tabs} from 'webextension-polyfill'
import {ResizeImageMessage, backgroundDownloadImage} from "../canvas/image";

type MessageHandler<T, Output> = (
      params: T,
      sender: Runtime.MessageSender,
      sendResponse: (output: Output) => void
  ) => void | boolean | Promise<boolean | void>

const messageHandlers: Record<string, MessageHandler<any, any>> = {
  async searchForCourse (queryString:string) {
    console.log("trying to open message " + queryString)
    const activeTab = await getActiveTab();
    if(!activeTab?.id) {
      return;
    }
    await scripting.executeScript({
      target: {tabId: activeTab.id},
      files: ['./js/content.js']
    });
    await tabs.sendMessage(activeTab.id, {'queryString': queryString});
  },
}

runtime.onMessage.addListener((
    message: Record<string, any>,
    sender,
    sendResponse
) => {
  for(let messageKey in messageHandlers) {
    console.log('looking for')
    if(message.hasOwnProperty(messageKey)) {
      const handler = messageHandlers[messageKey];
      const params = message[messageKey];
      handler(params, sender, sendResponse);
    }
  }
})

runtime.onMessage.addListener((message: { downloadImage : string }, sender, sendResponse:(value:any) => void) => {
  if (message.downloadImage) {
    (async () => {
      let resized = await backgroundDownloadImage(message.downloadImage);
      sendResponse(resized);

    })();
    return true;
  }
});

action.onClicked.addListener(async (tab) => {
  console.log('click');
  const id = tab.id;
  if (!id) { return }

});

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab
}

