/* eslint max-params:0 */

import { equal } from 'assert-helpers'
import kava from 'kava'
import trimIndentation from 'trim-indentation'
import spawn from 'await-spawn'
import * as pathUtil from 'path'
import {
	extractAttribute,
	replaceElementSync,
	replaceElementAsync,
	replaceSyncCallback,
	replaceAsyncCallback,
} from './'

type tests = Array<{
	name: string
	element: RegExp
	source: string
	expected: any
	replace: replaceSyncCallback
}>

const root = pathUtil.join(__dirname, '..')
const powerResult = String(Math.pow(Math.pow(1.1, Math.pow(2.1, 2.2)), 1.2))
const powerAttributesResult = String(
	Math.pow(Math.pow(Math.pow(2.1, Math.pow(3.2, 3.1)), 2.2), 1.1)
)

const replaceElementTests: tests = [
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
			dinner`
			.replace(/^\t{3}/gm, '')
			.trim(),
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
			dinner`
			.replace(/^\t{3}/gm, '')
			.trim(),
		replace({ content }) {
			return trimIndentation(content).toUpperCase()
		},
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
			end`
			.replace(/^\t{3}/gm, '')
			.trim(),
		expected: `
			begin
			eno
			two\t
			eerht
			end`
			.replace(/^\t{3}/gm, '')
			.trim(),
		replace({ content }) {
			return trimIndentation(content)
				.split('\n')
				.map((line) => line.split('').reverse().join(''))
				.join('\n')
		},
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
			</pow>`
			.replace(/^\t{3}/gm, '')
			.trim(),
		expected: powerResult,
		replace({ content }) {
			return trimIndentation(content)
				.split(/[\n\s]+/)
				.reduce((a, b) => String(Math.pow(Number(a), Number(b))))
		},
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
			</pow>`
			.replace(/^\t{3}/gm, '')
			.trim(),
		expected: powerAttributesResult,
		replace({ content }, { attributes }) {
			const y = Number(extractAttribute(attributes, 'y'))
			const x = Number(
				trimIndentation(content)
					.split(/[\n\s]+/)
					.reduce((a, b) => String(Math.pow(Number(a), Number(b))))
			)
			const z = Math.pow(x, y)
			return String(z)
		},
	},
	{
		name: 'compact',
		element: /x-link/,
		source: '<h1><x-link></x-link></h1><h1><x-link></x-link></h1>',
		expected: '<h1>replaced</h1><h1>replaced</h1>',
		replace() {
			return 'replaced'
		},
	},
	{
		name: 'multi attribute',
		element: /el/,
		source: '<el x=1 data-x=2 data-y=3 y=4></el>',
		expected: '1 2 3 4',
		replace(sections, { attributes }) {
			const a = extractAttribute(attributes, 'x')
			const b = extractAttribute(attributes, 'data-x')
			const c = extractAttribute(attributes, 'data-y')
			const d = extractAttribute(attributes, 'y')
			return [a, b, c, d].join(' ')
		},
	},
]

// ------------------------------------
// Tests

kava.suite('ropo', function (suite, test) {
	suite('replaceElementTests', function (suite) {
		replaceElementTests.forEach(function ({
			name,
			element,
			source,
			expected,
			replace,
		}) {
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
					})
						.catch(done)
						.then((actual) => {
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
		hello gninrom doog world
		hello gninrom doog world
		hello gninrom guten yadg morgen doog world
		hello gninrom 2:TREVNI/ negrom 3:TREVNI/ yadg 3:TREVNI netug 2:TREVNI doog world
		<strong>I am AWESOME</strong>
		8.263199609878108e+121
		8.263199609878108e+121
		1024
		hello world from example-fixture.txt
		8 4096
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
