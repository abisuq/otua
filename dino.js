const fs = require('fs')

const fetch = async (browser) => {
  const page = await browser.newPage()
  await page.goto('https://dinoswap.exchange/jurassicpools')
  const result = await new Promise((resolve, reject) => {
    page.on('console', async (msg) => {
      try {
        const [a1, a2] = msg.args()
        const name = await a1.jsonValue()
        const pools = await a2.jsonValue()
        if (
          name === 'POOLS' &&
          pools.find((p) => p.sousId === 1 && p.contractAddress['137'] === '0x52e7b0C6fB33D3d404b07006b006c8A8D6049C55')
        ) {
          resolve(pools)
        }
      } catch (err) {}
    })
    setTimeout(() => {
      reject('timeout')
    }, 10000)
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

  const newContractAddressList = newPools.map((p) => p.contractAddress['137']).filter(Boolean)

  for (const pool of currentPools.filter((p) => p.contractAddress['137'])) {
    if (newContractAddressList.includes(pool.contractAddress['137'])) continue
    newPools.push({ ...pool, isFinished: true })
  }

  fs.writeFileSync('./pools-dino.json', JSON.stringify(newPools, null, 2))
}
