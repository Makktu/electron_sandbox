const path = require('path');

const { app, BrowserWindow, Menu } = require('electron');

const isDev = process.env.NODE_ENV !== 'development';
const isMac = process.platform == 'darwin';

// Main Window
function createMainWindow() {
  const mainWindow = new BrowserWindow({
    title: 'Image Resizer',
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // open devtools automatically if in dev environment
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// create About window

function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: 'About Image Resizer',
    width: 300,
    height: 300,
    resizable: false,
  });

  // check About window already open & if so close it
  // if (aboutWindow) {
  //   aboutWindow.close();
  // }

  aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

app.whenReady().then(() => {
  createMainWindow();

  // Implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // when the app is ready, create the window
  // and open when none are open on MacOS
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: 'fileMenu',
  },
  ...(!isMac
    ? [
        {
          label: 'Help',
          submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
];

// quit on all platforms when all windows are closed
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});
