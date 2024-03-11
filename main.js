const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

const isDev = process.env.NODE_ENV !== 'development';
const isMac = process.platform == 'darwin';
let mainWindow;
let aboutWindow;

// Main Window
function createMainWindow() {
  mainWindow = new BrowserWindow({
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
  aboutWindow = new BrowserWindow({
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

  // remove main window from memory on close
  mainWindow.on('closed', () => (mainWindow = null));

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

// Respond to ipcRenderer resize
ipcMain.on('image:resize', (e, options) => {
  // stuff
  options.dest = path.join(os.homedir(), 'imageresizer');
  resizeImage(options);
});

// Resize image
async function resizeImage({ imgPath, width, height, dest }) {
  try {
    const newPath = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });
    // create filename
    const filename = path.basename(imgPath);

    // create destination folder if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    // write file to destination
    fs.writeFileSync(path.join(dest, filename), newPath);

    // send success to renderer
    mainWindow.webContents.send('image:done');

    // open dest folder
    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
}

// quit on all platforms when all windows are closed
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});
