'use strict'

const { writeFile, readFile } = require('fs').promises
const { extractAttribute, replaceElementAsync } = require('./')
const readmePath = require('path').join(__dirname, '..', 'README.md')

// and even do asynchronous replacements
async function main () {
	const source = await readFile(readmePath, 'utf8')
	const result = await replaceElementAsync(
		source,
		'x-example',
		async function (element, attributes) {
			const file = extractAttribute(attributes, 'file')
			const source = await require('fs').promises.readFile(file, 'utf8')
			const result = [
				'``` js',
				source,
				'```'
			].join('\n')
			result.wrap = true
			return result
		}
	)
	await writeFile(readmePath, result)
}
main()
