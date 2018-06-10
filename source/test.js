/* eslint max-params:0 */
'use strict'

const { equal } = require('assert-helpers')
const joe = require('joe')
const { replaceElementSync, replaceElementAsync } = require('./')

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
		search: /uc|uppercase/,
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
		replace (match, content) {
			return trimIndentation(content).toUpperCase()
		}
	},
	{
		search: /in|invert/,
		source: `
			breakfast
			<title>blah</title>
			brunch
			<in>
				one
					<invert>
						two
					</invert>
				three
			</in>
			lunch
			<in>
				four
					<invert>
						five
					</invert>
				six
			</in>
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
		replace (match, content) {
			return trimIndentation(content).split('\n').map((line) => line.split('').reverse().join('')).join('\n')
		}
	},
	{
		search: /pow|power/,
		source: `
			breakfast
			<title>blah</title>
			brunch
			<pow>
				2
					<power>
						3
						4
					</power>
				5
			</pow>
			lunch
			<pow>
				6
					<power>
						7
						8
					</power>
				9
			</pow>
			dinner`.replace(/^\t{3}/gm, '').trim(),
		expected: `
			breakfast
			<title>blah</title>
			brunch
			${num1}
			lunch
			${num2}
			dinner`.replace(/^\t{3}/gm, '').trim(),
		replace (match, content) {
			return trimIndentation(content).split(/[\n\s]+/).reduce((a, b) => Math.pow(a, b))
		}
	}
]

// ------------------------------------
// Tests

joe.suite('replace-html-element', function (suite) {
	tests.forEach(function ({ search, source, expected, replace }) {
		suite(search.source, function (suite, test) {
			test('replaceElement', function () {
				const actual = replaceElementSync(source, search, replace)
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
