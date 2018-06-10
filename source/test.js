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
		search: 'uc',
		source: `
			breakfast
			<title>blah</title>
			brunch
			<uc:1>
				one
					<uc:2>
						two
					</uc:2>
				three
			</uc:1>
			lunch
			<uc:1>
				four
					<uc:2>
						five
					</uc:2>
				six
			</uc:1>
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
		replace (outerHTML, elementNameMatched, attributes, innerHTML) {
			return trimIndentation(innerHTML).toUpperCase()
		}
	},
	{
		search: 'in',
		source: `
			breakfast
			<title>blah</title>
			brunch
			<in:1>
				one
					<in:2>
						two
					</in:2>
				three
			</in:1>
			lunch
			<in:1>
				four
					<in:2>
						five
					</in:2>
				six
			</in:1>
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
		replace (outerHTML, elementNameMatched, attributes, innerHTML) {
			return trimIndentation(innerHTML).split('\n').map((line) => line.split('').reverse().join('')).join('\n')
		}
	},
	{
		search: 'power',
		source: `
			breakfast
			<title>blah</title>
			brunch
			<pow:1>
				2
					<pow:2>
						3
						4
					</pow:2>
				5
			</pow:1>
			lunch
			<pow:1>
				6
					<pow:2>
						7
						8
					</pow:2>
				9
			</pow:1>
			dinner`.replace(/^\t{3}/gm, '').trim(),
		expected: `
			breakfast
			<title>blah</title>
			brunch
			${num1}
			lunch
			${num2}
			dinner`.replace(/^\t{3}/gm, '').trim(),
		replace (outerHTML, elementNameMatched, attributes, innerHTML) {
			return trimIndentation(innerHTML).split(/[\n\s]+/).reduce((a, b) => Math.pow(a, b))
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
						setTimeout(function () {
							const result = replace(...args)
							resolve(result)
						}, 1000)
					})
				}).catch(done).then((actual) => {
					equal(actual, expected)
					done()
				})
			})
		})
	})
})
