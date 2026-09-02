# Privacy

Longshot is built to keep captures local.

- Screenshots, annotations, and history are stored in the browser (IndexedDB /
  `chrome.storage`). They are not uploaded to a Longshot server.
- Capture uses the tab you clicked. The extension does not read other sites in
  the background.
- Optional download folders you pick stay on this computer via the File System
  Access API.
- Feedback is sent only if you submit it. The note goes privately to the
  maintainer. No email address is collected from you, and none is shown in
  Settings.
- There are no accounts, analytics pixels, or ad networks.
