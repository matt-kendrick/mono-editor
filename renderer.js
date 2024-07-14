let appName = electronAPI.appName;
let currentFilePath = "";
let meditor;

require.config({ paths: { vs: 'https://unpkg.com/monaco-editor/min/vs' } });
require(['vs/editor/editor.main'], function () {
 meditor = monaco.editor.create(document.getElementById('container'), {
  value: '',
  language: 'javascript',
  theme: 'vs-dark'
 });
 newFile();
 meditor.focus();
});

newFile = () => {
  meditor.setValue("");
  currentFilePath = "";
  document.title = `${appName} - New File`;
}

electronAPI.onNewFile((value) => {
  newFile();
});

electronAPI.onLoadFile((filePath, data) => {
  currentFilePath = filePath;
  meditor.setValue(data);
  document.title = `${appName} - ${currentFilePath}`;
});

electronAPI.onSaveFile((value) => {
  saveFile();
});

electronAPI.onSaveAsFile(() => {
  saveFile(true);
});

saveFile = (saveAs = false) => {
  // is there a file open, if not then show dialog otherwise overrite open file
  if(!currentFilePath || saveAs) {
    const dialogConfig = {
      buttonLabel: 'Save',
      properties: ['saveFile']
    };

    electronAPI.dialog('showSaveDialog', dialogConfig)
    .then(result => {
      if(!result.canceled) {
        electronAPI.saveFile(result.filePath, meditor.getValue());
        currentFilePath = result.filePath;
        document.title = `${appName} - ${currentFilePath}`;
      }
    });
  } else {
    electronAPI.saveFile(currentFilePath, meditor.getValue());
    document.title = `${appName} - ${currentFilePath}`;
  }
}

electronAPI.setAppName((text) => {
  appName = text;
});