/* eslint max-params:0 */
'use strict'

const { equal } = require('assert-helpers')
const joe = require('joe')
const { replaceElement, replaceElementAsync } = require('./')

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

const num1 = Math.pow(
	Math.pow(2,
		Math.pow(3, 4)
	),
	5
)
const num2 = Math.pow(
	Math.pow(6,
		Math.pow(7, 8)
	),
	9
)

const tests = [
	{
		search: 'uppercase',
		source: `
			breakfast
			<title>blah</title>
			brunch
			<uppercase:1>
				one
					<uppercase:2>
						two
					</uppercase:2>
				three
			</uppercase:1>
			lunch
			<uppercase:1>
				four
					<uppercase:2>
						five
					</uppercase:2>
				six
			</uppercase:1>
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
		replace (element, attributes, content) {
			return trimIndentation(content).toUpperCase()
		}
	},
	{
		search: 'invert',
		source: `
			breakfast
			<title>blah</title>
			brunch
			<invert:1>
				one
					<invert:2>
						two
					</invert:2>
				three
			</invert:1>
			lunch
			<invert:1>
				four
					<invert:2>
						five
					</invert:2>
				six
			</invert:1>
			dinner`.replace(/^\t{3}/gm, '').trim(),
		expected: `
			breakfast
			<title>blah</title>
			brunch
			eno
			two\t
			eerht
			lunch
			ruof
			five\t
			xis
			dinner`.replace(/^\t{3}/gm, '').trim(),
		replace (element, attributes, content) {
			return trimIndentation(content).split('\n').map((line) => line.split('').reverse().join('')).join('\n')
		}
	},
	{
		search: 'power',
		source: `
			breakfast
			<title>blah</title>
			brunch
			<power:1>
				2
					<power:2>
						3
						4
					</power:2>
				5
			</power:1>
			lunch
			<power:1>
				6
					<power:2>
						7
						8
					</power:2>
				9
			</power:1>
			dinner`.replace(/^\t{3}/gm, '').trim(),
		expected: `
			breakfast
			<title>blah</title>
			brunch
			${num1}
			lunch
			${num2}
			dinner`.replace(/^\t{3}/gm, '').trim(),
		replace (element, attributes, content) {
			return trimIndentation(content).split(/[\n\s]+/).reduce((a, b) => Math.pow(a, b))
		}
	}
]

// ------------------------------------
// Tests

joe.suite('replace-html-element', function (suite) {
	tests.forEach(function ({ search, source, expected, replace }) {
		suite(search, function (suite, test) {
			test('replaceElement', function () {
				const actual = replaceElement(source, search, replace)
				equal(actual, expected)
			})
			test('replaceElementAsync', function (done) {
				replaceElementAsync(source, search, function (...args) {
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
