const { app, BrowserWindow, Menu, MenuItem, dialog, ipcMain, Notification } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

app.setAppUserModelId(app.getName());

let win;

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true
    },
    title: app.getName()
  })

  win.loadFile("html/index.html");

  win.webContents.once('dom-ready', (e) => {
    win.webContents.send("setAppName", app.getName());
  })

  win.reload()
}

const template = [
  {
    label: "File",
    submenu: [
      {
        label: "New",
        click: () => { win.webContents.send("newFile"); },
        accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N'
      },
      {
        label: "Open",
        click: () => {
          dialog.showOpenDialog(win, {
            properties: ["openFile"],
            defaultPath: path.join(__dirname, "data")
          }).then((e) => {
            if(!e.canceled) {
              const path = e.filePaths[0];
              fs.readFile(path, "utf8", (err, data) => {
                if (err) {
                  console.error(err);
                  return;
                }
                win.webContents.send("loadFile", e.filePaths[0], data);
              });
            }
          });
        },
        accelerator: process.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O'
      },
      {
        label: "Save",
        click: () => { win.webContents.send("saveFile"); },
        accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S'
      },
      {
        label: "Save As",
        click: () => { win.webContents.send("saveAsFile"); },
        accelerator: process.platform === 'darwin' ? 'Cmd+Alt+S' : 'Ctrl+Alt+S'
      },
      {
        label: "Exit",
        role: "quit",
        accelerator: 'Alt+F4'
      }
    ]
  },
  {
    label: "Dev",
    submenu: [
      {
        label: "Toggle Tools",
        role: "toggleDevTools"
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    // On macOS it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })

  ipcMain.handle("dialog", (event, method, params) => {       
    return dialog[method](params);
  });

  ipcMain.handle("notification", (event, title, body) => {       
    return new Notification({title, body}).show();
  });

  console.log(app.getName(), "Loaded.")
})

// Quit when all windows are closed, except on macOS. There, it"s common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})