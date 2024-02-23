// drawing from https://hackernoon.com/how-to-create-a-chrome-extension-with-react

import { runtime, action, scripting} from 'webextension-polyfill'

runtime.onInstalled.addListener(() => {
    console.log('[background] loaded')
})

action.onClicked.addListener(async (tab) => {
  console.log('click');
  const id = tab.id;
  if (!id) { return }
  return scripting.executeScript({
    target: {tabId: id},
    files: ['./js/content.js']
  });
});