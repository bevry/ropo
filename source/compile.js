'use strict'

const { writeFile, readFile } = require('fs').promises
const { extractAttribute, replaceElementAsync } = require('./')
const readmePath = require('path').join(__dirname, '..', 'README.md')

// and even do asynchronous replacements
async function main () {
	const result = await replaceElementAsync(
		await readFile(readmePath),
		'x-example',
		async function (element, attributes) {
			const file = extractAttribute(attributes, 'file')
			const result = require('fs').promises.readFile(file, 'utf8')
			return [
				`<x-example file="${file}>`,
				'``` js',
				result,
				'```',
				'</x-example>'
			].join('\n')
		}
	)
	await writeFile(readmePath, result)
}
main()
