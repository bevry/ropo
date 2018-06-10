'use strict'

const { writeFile, readFile } = require('fs').promises
const { extractAttribute, replaceElementAsync } = require('./')
const readmePath = require('path').join(__dirname, '..', 'README.md')
const name = require('../package.json').name

// and even do asynchronous replacements
async function main () {
	const source = await readFile(readmePath, 'utf8')
	const result = await replaceElementAsync(
		source,
		/x-example/,
		async function (element, attributes) {
			const file = extractAttribute(attributes, 'file') || 'example.js'
			const source = await require('fs').promises.readFile(file, 'utf8')
			const attr = file === 'example.js' ? '' : ` file="${file}"`
			const result = [
				`<X-EXAMPLE${attr}>`,
				'``` js',
				source.replace("require('./')", `require('${name}')`),
				'```',
				'</X-EXAMPLE>'
			].join('\n')
			return result
		}
	)
	// do -replaced to prevent infinite recursion
	await writeFile(readmePath, result.replace(/X-EXAMPLE/g, 'x-example'))
}
main()
