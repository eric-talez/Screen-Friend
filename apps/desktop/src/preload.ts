/**
 * Slice 2 preload: intentionally minimal.
 *
 * Exposes a small, read-only bridge so the renderer can detect it is
 * running inside the desktop shell. Future slices will extend this with
 * overlay/tray/settings IPC.
 */
import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("screenFriend", {
  shell: "electron",
  shellVersion: process.versions.electron,
});
