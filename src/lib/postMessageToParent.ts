import type { IframeToParentMessage } from "./parent-rpc-types-autogen";

export function postMessageToParent(message: IframeToParentMessage) {
  window.parent.postMessage(message, "*");
}
