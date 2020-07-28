"use strict";

const fs = require('fs')
const puppeteer = require('puppeteer-core')

const executablePath = "/usr/bin/google-chrome-unstable"
const headless = process.env.HEADLESS==='true' /* @type {boolean} */
const url = process.env.URL || "https://googlechrome.github.io/samples/quictransport/client.html"


const run = async () => {
  const spkiList = fs.readFileSync( __dirname + "/fingerprints.txt", "utf8")

  console.log(`spki-list: ${spkiList}`)
  const args = [
      "--enable-experimental-web-platform-features",
      "--origin-to-force-quic-on=localhost:4433",
      `--ignore-certificate-errors-spki-list=${spkiList}`,
      "--window-size=1280,950"
    ]
  console.log( args )
  const browser = await puppeteer.launch({
    executablePath,
    headless,
    devtools: false,
    ignoreHTTPSErrors: true,
    args
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({width: 1280, height: 950})
    await page.goto(url)

    page.on("console", async mesg => {
      console.log( `[INFO] BROWSER: ${mesg._text}` )
    })

    page.on("pageerror", mesg => {
      console.error( `[PAGEERROR] PAGEERROR: ${mesg}` )
    })

    page.on("error", mesg => {
      console.error( `[ERROR]: ${mesg}` )
    })

  } catch(err) {
    console.error(err.message);
  }
}

run()
