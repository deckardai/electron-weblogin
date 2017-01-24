# Electron WebLogin

Login to an Electron app using the webbrowser. Avoid unnecessary password prompts, since webbrowsers are typically already authenticated.

WebLogin was built for a painless login to [Deckard.AI](https://www.deckard.ai/), which has both a web and a desktop versions. You can try both there; you might have to type no password at all.


## Installation

    npm install --save electron-weblogin


## Usage

Read the comments in `demo.html` and adapt the example to your app.

Try:

	git clone https://github.com/deckardai/electron-weblogin.git
	cd electron-weblogin

	npm install
    npm run build
	# npm install -g electron

    python -m SimpleHTTPServer 1234 &
    electron http://localhost:1234/demo.html
