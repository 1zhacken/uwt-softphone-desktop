# WebRTC Softphone

Production: https://www.uwtservices.com/webrtc

## Install instructions

* Clone this repo
* Install node (Windows [download](https://nodejs.org/en/download/))
* Install Angular CLI globally `npm install @angular/cli -g`
* Run `npm install`

## Building

* To build project for production `ng build --prod --base-href ./`
* To build exe distributable desktop app `npm run build:electron`
* To build single installable Windows .exe file
  - Install [Inno Setup Compiler](https://jrsoftware.org/isinfo.php) ; [download](https://jrsoftware.org/download.php/is.exe?site=1)
  - Run Inno Setup Compiler
  - Choose `Open an existing script file`
  - Select `More files...`
  - Choose `uwt-softphone\\inno-setup\\webdialer.iss`
  - Click `Open`
  - Modify lines between `; Customize below` and `; Customize above` comments
  - Press `Ctrl-F9` to compile

## Running

* To test locally in browser `ng serve --ssl --open`

## Learning Angular

1. Read the [MAIN CONCEPTS] from angular.io
2. Code [Tour of Heroes] tutorial from angular.io
3. If you need to understand JavaScript in depth - https://www.youtube.com/watch?v=cCOL7MC4Pl0
4. https://www.learnrxjs.io/learn-rxjs/concepts/rxjs-primer
5. Deepen your knowledge in advanced Angular topics (Architecture, Optimization etc.) - https://medium.com/@.gc


## macOS build
1. npm run build
2. yarn dist
