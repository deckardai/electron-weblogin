// Login in webbrowser authenticates Electron as well
//
// Author: Aurélien Nicolas <aurel@deckard.ai>


export default class WebLogin {

  constructor(opts) {
    this.opts = opts
    this.port = opts.port || 33874
    this.protoVersion = "1"

    this.require = opts.require || window.require
    // Detect Electron mode
    this.electron = opts.electron
    var proc = window.process
    if (this.require && !this.electron &&
      typeof proc !== 'undefined' && proc.versions && !!proc.versions.electron
    ) {
      this.electron = this.require("electron")
    }
    this.server = null
  }

  /** Listen for an HTTP GET from the web browser */
  listenFromDesktop(cb) {
    if (!this.electron) return // Electron only

    var http = this.require("http")
    var Url = this.require("url")

    var self = this
    var done = function () {
      self.server && self.server.close()
      self.server = null
    }

    this.server = http.createServer(function (req, res) {
      var creds = JSON.parse(decodeURIComponent(Url.parse(req.url).query))
      if (creds) {
        // Callback
        cb && cb(creds, done);
        // If callback doesn't accept done(), call it now
        cb && cb.length != 2 && done();
      }
      res.end()
    })
    this.server.listen(this.port, "localhost");
    return done
  }

  /** Create a button in the top right corner to open the web browser */
  showExternalButton() {
    if (!this.electron) return // Electron only

    // Style
    var css = `
        #_webLoginContainer {
            display: none;
            z-index: 51000000;
            position: fixed;
            top: 0;
            right: 0;
            width: 118px;
            height: 118px;
        }
        #_webLoginContainer button {
            padding: 0;
            width: 100%;
            height: 100%;
            border-bottom-left-radius: 100%;
            border: none;
            outline: none;
            color: white;
            background-color: #3F51B5;
            transition: background 0.3s;
        }
        #_webLoginContainer button:hover {
          background-color: #303f8e;
          cursor: pointer;
        }
        #_webLoginContainer button:focus {
          background-color: #3F51B5;
          cursor: default;
        }
        #_webLoginContainer button span {
            position:absolute;top:0;right:0;
            padding: 24px 12px 12px 20%;
            text-align: right;
            font-size: 13px;
            font-weight: bold;
        }
    `;
    if(this.opts.extraCss) css += this.opts.extraCss
    var style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet){
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
    document.head.appendChild(style);

    // Expose function to webpage
    //window._webLogin = this

    // Button
    var div = document.createElement('div')
    div.id = "_webLoginContainer"
    div.webLogin = this
    div.innerHTML = `
        <button type="button" onclick="this.parentNode.webLogin.openExternalLogin()">
          <span>
            Do it in Webbrowser &#x1F5D7;
          </span>
        </button>`;
    div.style.display = "block"
    document.body.appendChild(div)

    return div
  }

  /** Open a browser to the web login page */
  openExternalLogin() {
    if (!this.electron) return // Electron only

    // Add parameter
    var url = this.opts.url || window.location.href
    url = url.split("#")[0]
    url += (url.indexOf("?") < 0 ? "?" : "&") +
      "toDesktop=" + this.protoVersion;

    // Open web browser
    this.electron.shell.openExternal(url)
  }

  showDesktopWindow() {
    if (!this.electron) return // Electron only

    var win = this.electron.remote.getCurrentWindow()
    if(win.isVisible()) {
        // Set "always on top" and then restore it
        // That brings the window on top reliably
        var wasOnTop = win.isAlwaysOnTop()
        win.setAlwaysOnTop(true)
        if(!wasOnTop) {
            win.setAlwaysOnTop(false)
        }
        // win.showInactive() // Works only on mac
    }
  }

  shouldSend() {
    return window.location.search.indexOf("toDesktop=") >= 0
  }

  /** Send token from the browser */
  sendToElectron(creds) {
    if (!this.shouldSend()) return // Not requested

    var query = encodeURIComponent(JSON.stringify(creds))

    var img = document.createElement("img");
    img.setAttribute("height", "0");
    img.setAttribute("width", "0");

    img.onload = console.log
    img.onerror = console.error
    img.setAttribute("src",
      `http://localhost:${this.port}/cred?${query}`
    );

    document.body.appendChild(img)
  }


  static demo() {

    var webLogin = new WebLogin({

      // The web login page. Here the same as for Electron.
      url: window.location.href,

      // Customize appearance
      extraCss: `
        #_webLoginContainer button {
            background-color: green;
        }
      `,

      // Provide alternative Electron's require(), if it was renamed.
      require: ELECTRON && ELECTRON.require,
    })

    // All methods are safe to call in all modes.
    // They act if appropriate or do nothing.

    // Start waiting for a token
    webLogin.listenFromDesktop(function (myCredentials) {
      // Focus this window so the user sees the success and next step
      webLogin.showDesktopWindow()
      alert("Logged in from browser! \n\n" + myCredentials.myToken)
    })

    // Show a button in the top right corner to open the browser
    global.div=webLogin.showExternalButton()

    // Perform regular web login, or get cached credentials.
    // You may display the same login page in Electron as well.
    // The user can login in either one.
    var myCredentials = { myToken: "example cookie" }

    // Forward to Electron, if appropriate
    webLogin.sendToElectron(myCredentials)

    return webLogin
  }

}
