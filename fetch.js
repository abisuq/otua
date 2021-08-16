const fetchDinoPools = require('./dino')
const fetchAdaPools = require('./adamant')
const playwright = require('playwright')

const main = async ()=> {
	const browser = await playwright.chromium.launch({ args: ['--no-sandbox'] })
	await Promise.all([
		fetchDinoPools(browser),
		fetchAdaPools(browser)
	])
	await browser.close()
}
main()