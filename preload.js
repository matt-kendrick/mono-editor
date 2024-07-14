// this is node
const { app, contextBridge, ipcRenderer } = require("electron");
const fs = require("node:fs");

contextBridge.exposeInMainWorld("electronAPI", {
  onLoadFile: (callback) => ipcRenderer.on("loadFile", (_event, filePath, value) => callback(filePath, value)),
  onSaveFile: (callback) => ipcRenderer.on("saveFile", (_event, value) => callback(value)),
  onSaveAsFile: (callback) => ipcRenderer.on("saveAsFile", (_event, value) => callback(value)),
  onNewFile: (callback) => ipcRenderer.on("newFile", (_event, value) => callback(value)),
  setAppName: (callback) => ipcRenderer.on("setAppName", (_event, text) => callback(text)),
  dialog: (method, config) => ipcRenderer.invoke("dialog", method, config),
  notification: (title, body) => ipcRenderer.invoke("notification", title, body),
  saveFile: (filepath, data) => saveFile(filepath, data)
});

saveFile = (filepath, data) => {
    fs.writeFile(filepath, data, (err) => {
        if (err) {
          console.error(err);
          return;
        } else {
            ipcRenderer.invoke("notification", "File Saved", `Saved To: ${filepath}`);
        }
      });
};
