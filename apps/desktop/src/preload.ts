/**
 * Preload bridge: intentionally minimal.
 *
 * Exposes a small, read-only bridge so the renderer can detect it is
 * running inside the desktop shell, plus a single subscription for tray
 * interactive-mode changes (Slice 6). The channel name stays private to
 * this file — the renderer cannot reach arbitrary IPC channels.
 */
import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";

const INTERACTIVE_CHANGED_CHANNEL = "screen-friend:interactive-changed";
const GET_SELECTED_CHARACTER_ID_CHANNEL = "screen-friend:get-selected-character-id";
const SET_SELECTED_CHARACTER_ID_CHANNEL = "screen-friend:set-selected-character-id";

contextBridge.exposeInMainWorld("screenFriend", {
  shell: "electron",
  shellVersion: process.versions.electron,
  onInteractiveChanged(callback: (interactive: boolean) => void): () => void {
    const listener = (_event: IpcRendererEvent, interactive: boolean) => {
      callback(interactive);
    };
    ipcRenderer.on(INTERACTIVE_CHANGED_CHANNEL, listener);
    return () => {
      ipcRenderer.removeListener(INTERACTIVE_CHANGED_CHANNEL, listener);
    };
  },
  getSelectedCharacterId(): Promise<string> {
    return ipcRenderer.invoke(GET_SELECTED_CHARACTER_ID_CHANNEL);
  },
  setSelectedCharacterId(id: string): Promise<void> {
    return ipcRenderer.invoke(SET_SELECTED_CHARACTER_ID_CHANNEL, id);
  },
});
