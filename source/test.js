/* eslint max-params:0 */
'use strict'

const { equal } = require('assert-helpers')
const joe = require('joe')
const { extractAttribute, replaceElementSync, replaceElementAsync } = require('./')

const spawn = require('await-spawn')
const pathUtil = require('path')
const root = pathUtil.join(__dirname, '..')

// ------------------------------------
// Helpers

function trimIndentation (input) {
	const source = input.replace(/^\n+|\s+$/g, '')
	const match = source.match(/^[\x20\t]+/)
	if (!match) return source
	const indentation = match[0]
	const result = source.split('\n').map((line) => {
		if (line.indexOf(indentation) === 0) {
			return line.substring(indentation.length)
		}
		else {
			throw new Error('inconsitent indentation')
		}
	}).join('\n')
	return result
}

// ------------------------------------
// Tests

const powerResult = Math.pow(
	Math.pow(1.1,
		Math.pow(2.1, 2.2)
	),
	1.2
)

const powerAttributesResult = Math.pow(
	Math.pow(
		Math.pow(
			2.1,
			Math.pow(
				3.2,
				3.1
			)
		),
		2.2
	),
	1.1
)

const replaceElementTests = [
	{
		name: 'uppercase',
		element: /uc|uppercase/,
		source: `
			breakfast
			<title>blah</title>
			brunch
			<uc>
				one
					<uppercase>
						two
					</uppercase>
				three
			</uc>
			lunch
			<uc>
				four
					<uppercase>
						five
					</uppercase>
				six
			</uc>
			dinner`.replace(/^\t{3}/gm, '').trim(),
		expected: `
			breakfast
			<title>blah</title>
			brunch
			ONE
				TWO
			THREE
			lunch
			FOUR
				FIVE
			SIX
			dinner`.replace(/^\t{3}/gm, '').trim(),
		replace (content) {
			return trimIndentation(content).toUpperCase()
		}
	},
	{
		name: 'invert',
		element: /in|invert/,
		source: `
			begin
			<in>
				one
					<invert>
						two
					</invert>
				three
			</in>
			end`.replace(/^\t{3}/gm, '').trim(),
		expected: `
			begin
			eno
			two\t
			eerht
			end`.replace(/^\t{3}/gm, '').trim(),
		replace (content) {
			return trimIndentation(content).split('\n').map((line) => line.split('').reverse().join('')).join('\n')
		}
	},
	{
		name: 'power',
		element: /pow|power/,
		source: `
			<pow>
				1.1
					<power>
						2.1
						2.2
					</power>
				1.2
			</pow>`.replace(/^\t{3}/gm, '').trim(),
		expected: powerResult,
		replace (content) {
			return trimIndentation(content).split(/[\n\s]+/).reduce((a, b) => Math.pow(a, b))
		}
	},
	{
		name: 'power with attributes',
		element: /pow|power/,
		source: `
			<pow y=1.1>
				2.1
					<power y=3.1>
						3.2
					</power>
				2.2
			</pow>`.replace(/^\t{3}/gm, '').trim(),
		expected: powerAttributesResult,
		replace (content, { attributes }) {
			const y = extractAttribute(attributes, 'y')
			const x = trimIndentation(content).split(/[\n\s]+/).reduce((a, b) => Math.pow(a, b))
			const z = Math.pow(x, y)
			return z
		}
	}
]

// ------------------------------------
// Tests

joe.suite('ropo', function (suite, test) {
	suite('replaceElementTests', function (suite) {
		replaceElementTests.forEach(function ({ name, element, source, expected, replace }) {
			suite(name, function (suite, test) {
				test('replaceElementSync', function () {
					const actual = replaceElementSync(source, element, replace)
					equal(actual, expected)
				})
				test('replaceElementAsync', function (done) {
					replaceElementAsync(source, element, function (...args) {
						return new Promise(function (resolve) {
							process.nextTick(function () {
								const result = replace(...args)
								resolve(result)
							})
						})
					}).catch(done).then((actual) => {
						equal(actual, expected)
						done()
					})
				})
			})
		})
	})

	test('example', function (done) {
		const expected = `aBCd
		aBCd
		world hello
		hello gninrom doog world
		hello gninrom guten yadg morgen doog world
		hello gninrom 2:TREVNI/ negrom 3:TREVNI/ yadg 3:TREVNI netug 2:TREVNI doog world
		<strong>I am AWESOME</strong>
		8.263199609878108e+121
		8.263199609878108e+121
		1024
		hello world from example.txt
		`.replace(/^\t{2}/gm, '')

		const path = pathUtil.join(root, 'example.js')
		spawn('node', [path], { cwd: root })
			.catch(done)
			.then(function (stdout) {
				equal(stdout.toString(), expected)
				done()
			})
	})
})
