'use strict'

const { writeFile, readFile } = require('fs').promises
const { extractAttribute, replaceCommentElementsAsync } = require('./')
const readmePath = require('path').join(__dirname, '..', 'README.md')
const name = require('../package.json').name

// and even do asynchronous replacements
async function main () {
	const source = await readFile(readmePath, 'utf8')
	const result = await replaceCommentElementsAsync(
		source,
		async function ({ element, attributes }) {
			console.log(element)
			if (element !== 'x-example') return null
			const file = extractAttribute(attributes, 'file') || 'example.js'
			const source = await require('fs').promises.readFile(file, 'utf8')
			const attr = file === 'example.js' ? '' : ` file="${file}"`
			const result = [
				`<!-- <${element.toUpperCase() + attr}> -->`,
				'``` js',
				source.replace("require('./')", `require('${name}')`).trim(),
				'```',
				`<!-- </${element.toUpperCase()}> -->`
			].join('\n')
			return result
		}
	)
	// do -replaced to prevent infinite recursion
	await writeFile(readmePath, result.replace(/X-EXAMPLE/g, 'x-example'))
}
main()
