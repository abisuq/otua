const fs = require('fs')

const fetch = async (browser) => {
  const page = await browser.newPage()
  await page.setRequestInterception(true)
  page.on('request', (request) => {
    if (/main.*\.js/.test(request.url())) {
      request.respond({
        status: 200,
        contentType: 'application/javascript; charset=utf-8',
        body: fs.readFileSync(path.resolve(__dirname, 'dino.main.js'), 'utf8').toString(),
      })
    } else {
      request.continue()
    }
  })
  await page.goto('https://dinoswap.exchange/jurassicpools?t=l')
  await page.waitForSelector('#wtf')
  const result = await page.$eval('#wtf', (div) => {
    return JSON.parse(div.innerText)
  })

  await page.close()
  if (result.length > 1) return result
  return null
}
module.exports = async (browser) => {
  const newPools = await fetch(browser)
  if (!newPools) return
  let currentPools = []
  try {
    currentPools = JSON.parse(fs.readFileSync('./pools-dino.json').toString())
  } catch (e) {}

  const newContractAddressList = newPools.map((p) => p.contractAddress).filter(Boolean)

  for (const pool of currentPools.filter((p) => p.contractAddress)) {
    if (newContractAddressList.includes(pool.contractAddress)) continue
    newPools.push({ ...pool, isFinished: true })
  }

  fs.writeFileSync('./pools-dino.json', JSON.stringify(newPools, null, 2))
}
