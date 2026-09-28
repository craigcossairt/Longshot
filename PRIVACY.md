# Privacy

Longshot is built to keep captures local.

- Screenshots, annotations, and history are stored in the browser (IndexedDB /
  `chrome.storage`). They are not uploaded to a Longshot server.
- Capture uses the tab you clicked. The extension does not read other sites in
  the background.
- The extension asks for access to all sites (`<all_urls>`) and tabs so it can
  capture whatever page you are on, including frames and scrolling panes inside
  it. It only reads a page after you start a capture on it (toolbar, menu, or
  shortcut). When the editor is skipped and the capture goes to the clipboard,
  Longshot writes the image from that same tab.
- Optional download folders you pick stay on this computer via the File System
  Access API.
- Feedback is sent only if you submit it. The note goes privately to the
  maintainer. No email address is collected from you, and none is shown in
  Settings.
- There are no accounts, analytics pixels, or ad networks.
