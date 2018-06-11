'use strict'

const { writeFile, readFile } = require('fs').promises
const { extractAttribute, replaceCommentElementAsync } = require('./')

const spawn = require('await-spawn')
const pathUtil = require('path')
const root = pathUtil.join(__dirname, '..')
const readmePath = pathUtil.join(root, 'README.md')
const name = require('../package.json').name

// and even do asynchronous replacements
async function main () {
	const source = await readFile(readmePath, 'utf8')
	const result = await replaceCommentElementAsync(
		source,
		/x-example/,
		async function ({ element, attributes }) {
			const file = extractAttribute(attributes, 'file') || 'example.js'
			const source = await require('fs').promises.readFile(file, 'utf8')
			const attr = file === 'example.js' ? '' : ` file="${file}"`
			const path = pathUtil.join(root, file)
			const output = (await spawn('node', [path], { cwd: root })).toString()
			const result = [
				`<!-- <${element.toUpperCase() + attr}> -->`,
				'``` js',
				source.replace("require('./')", `require('${name}')`).trim().replace(/\t/g, '    '),
				'```',
				'',
				'Which results in:',
				'',
				'```',
				output.trim().replace(/\t/g, '    '),
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
