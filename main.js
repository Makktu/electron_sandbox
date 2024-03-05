const path = require('path');

const { app, BrowserWindow, Menu } = require('electron');

const isDev = process.env.NODE_ENV !== 'development';
const isMac = process.platform == 'darwin';

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: 'Image Resizer',
    width: isDev ? 1000 : 500,
    height: 600,
  });

  // open devtools if in dev environment
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

app.whenReady().then(() => {
  createMainWindow();

  // Implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

const menu = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        click: () => {
          app.quit();
        },
        accelerator: 'CMD/CTRL+W',
      },
    ],
  },
];

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});
