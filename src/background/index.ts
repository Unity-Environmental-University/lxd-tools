// drawing from https://hackernoon.com/how-to-create-a-chrome-extension-with-react

import {runtime, action, scripting, Runtime, extension, tabs} from 'webextension-polyfill'
import {Dict, ICanvasData, ModuleItemType} from "../canvas/canvasDataDefs";
import {Course} from "../canvas/index";
import {run} from "jest";

type MessageHandler<T> = (
      params: T,
      sender: Runtime.MessageSender,
      sendResponse: () => void
  ) => void | Promise<void>


const messageHandlers: Record<string, MessageHandler<any>> = {
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
  }
}

runtime.onMessage.addListener((
    message: Record<string, any>,
    sender,
    sendResponse
) => {
  for(let messageKey in messageHandlers) {
    if(message.hasOwnProperty(messageKey)) {
      const handler = messageHandlers[messageKey];
      const params = message[messageKey];
      handler(params, sender, sendResponse);
    }
  }

})


action.onClicked.addListener(async (tab) => {
  console.log('click');
  const id = tab.id;
  if (!id) { return }

});

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab
}

/**
 * Gets the course to navigate to. First, looks for exact code matches. Then sorts by ID. Returns null if
 * the maxMatches number is set and there are more results than the maxMatches number.
 * @param searchCode The code or string to search
 * @param courses The lost of courses
 * @param maxMatches{Number|null} If courses is longer than this, return null
 * @returns {*|null} The best matching course
 */
function getCourseToNavTo(searchCode: string, courses: ICanvasData[], maxMatches: number | null = null): any | null {
    if (typeof courses === 'undefined' || courses.length === 0 || (maxMatches && courses.length < maxMatches)) {
        return null;
    } else if (courses.length === 1) {
        return new Course(courses[0]);
    } else {
        let exact_code_search = /[A-Za-z-_.]+_?[a-zA-Z]{3}\d{4}/
        for (let course of courses) {
            let match_code = course.course_code.search(exact_code_search);
            console.log(match_code);
            if (typeof match_code !== 'string') continue;
            if (match_code && match_code.toLowerCase() === searchCode.toLowerCase()) {
                return course;
            }
        }
        courses.sort((a, b) => b.id - a.id);
        return new Course(courses[0]);
    }
}

    async function getJson(url: string) {
    console.log(url);
    const response = await fetch(url);
    console.log(response);

    const data = await response.json();
    console.log(data);
    return data;
}

