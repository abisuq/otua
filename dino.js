const fs = require('fs')

const fetch = async (browser) => {
  const page = await browser.newPage()
  await page.goto('https://dinoswap.exchange/jurassicpools?t=l')
  await page.waitForFunction(() => document.querySelectorAll('img').length > 10)
  const result = await page.$$eval('div', (divs) => {
    return divs 
      .map(div => {
				try {
					const rkey = Object.keys(div).find((k) => k.startsWith('__reactProps'))
					const pool = div[rkey].children[2].props
					if (!pool.contractAddress) return false
					return pool
				} catch (err) {
					return false
				}
      })
      .filter(Boolean)
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
