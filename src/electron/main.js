const { Menu, app, BrowserWindow, nativeImage} = require('electron');
const path = require('path');

const { createServer } = require("http");
const { Server } = require("socket.io");

// Get rid of default menubar
Menu.setApplicationMenu(null);
let win = null;
function createWindow() {

  let webPref = {
    contextIsolation: true,
    nodeIntegration: true,
    enableRemoteModule: false,
  }

  if (process.platform == 'darwin'){
    webPref.preload = path.join(__dirname, 'preload.js');
  }
 
  //starting local websocket server for messaging with clict to dial chrome-extension
  const httpServer = createServer();
  const io = new Server(httpServer, { 
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      transports: ['websocket', 'polling'],
      credentials: false
    },
    allowEIO3: true 
  });
  io.on("connection", (socket) => {
    socket.on('callTo', (data) => {
      win.webContents.send('callTo', data.target);
    });
  });
  httpServer.listen(4867);

  // Create the browser window.
  win = new BrowserWindow({
    width: 480,
    height: 860,    
    icon: nativeImage.createFromPath('/assets/favicon-gold.ico'),
    //icon: __dirname + './assets/favicon-gold.ico',
    webPreferences: webPref,
  });

  // and load the index.html of the app.
  win.loadFile('index.html');

  //Dev tools
  //win.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
