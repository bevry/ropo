'use strict'

const { strictEqual } = require('assert')
const {
	extractAttribute,
	replaceSync,
	replaceAsync,
	replaceElementSync,
	replaceElementAsync,
} = require('./')

async function main() {
	// uppercase `bc` of `abcd`
	console.log(
		replaceSync('abcd', /bc/, function ({ content }) {
			return content.toUpperCase()
		})
	)
	// => aBCd

	// uppercase `bc` of `abcd` asynchronously
	console.log(
		await replaceAsync('abcd', /bc/, function ({ content }) {
			return new Promise(function (resolve) {
				process.nextTick(function () {
					resolve(content.toUpperCase())
				})
			})
		})
	)
	// => aBCd

	// use a RegExp named capture group to allow the inversion of content between BEGIN and END
	// https://github.com/tc39/proposal-regexp-named-groups
	console.log(
		replaceSync(
			'hello BEGIN good morning END world',
			new RegExp('BEGIN (?<inside>.+?) END'),
			function (section, captures) {
				strictEqual(section.outer, 'BEGIN good morning END')
				strictEqual(section.inner, null)
				strictEqual(section.content, section.outer)
				return captures.inside.split('').reverse().join('')
			}
		)
	)
	// => hello gninrom doog world

	// for convenience, and some extra magic (magic explained in next example) we can call `inside` `inner` to have it used as a section
	console.log(
		replaceSync(
			'hello BEGIN good morning END world',
			new RegExp('BEGIN (?<inner>.+?) END'),
			function (section, captures) {
				strictEqual(section.outer, 'BEGIN good morning END')
				strictEqual(section.inner, captures.inner)
				strictEqual(section.content, captures.inner)
				return section.content.split('').reverse().join('')
			}
		)
	)
	// => hello gninrom doog world

	// invert anything between INVERT:<N> with recursive rendering
	console.log(
		replaceSync(
			'hello INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1 world',
			new RegExp('(?<element>INVERT:\\d+) (?<inner>.+?) /\\k<element>'),
			function ({ content }) {
				return content.split('').reverse().join('')
			}
		)
	)
	// => hello gninrom guten yadg morgen doog world
	// notice how the text is replaced correctly, gday has 3 inversions applied, so it is inverted
	// whereas guten morgen has 2 inversions applied, so is reset
	// the ability to perform this recursive replacement is possible because if the RegExp named capture group `inner` exists,
	// then ropo will perform recursion on it inner, and return the result as the `content` section
	// e.g. by doing this, the initial recursion will occur on: good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning
	// then on: guten INVERT:3 gday /INVERT:3 morgen
	// and finally on: gday
	// without doing this, recursion would have to happen on the outer, which would cause the replacement to recur infinitely against itself
	// e.g. the initial recursion would occur on: INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1
	// and the second on: INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1
	// and the third on: INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1
	// and so on, so no progress is made
	// as such, ropo will only allow recursion when it detects the `inner` named capture group

	// invert anything between INVERT:<N>, without using the `inner` named capture group
	console.log(
		replaceSync(
			'hello INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1 world',
			new RegExp('(?<element>INVERT:\\d+) (?<whatever>.+?) /\\k<element>'),
			function (sections, { whatever }) {
				return whatever.split('').reverse().join('')
			}
		)
	)
	// => hello gninrom 2:TREVNI/ negrom 3:TREVNI/ yadg 3:TREVNI netug 2:TREVNI doog world
	// as we can see, recursion was correctly disabled
	// if it wasn't, we would end up with an error like:
	// (node:7252) UnhandledPromiseRejectionWarning: RangeError: Maximum call stack size exceeded
	// and if we used the `outer` section instead of the `whatever` capture group, we would have:
	// => hello 1:TREVNI/ gninrom 2:TREVNI/ negrom 3:TREVNI/ yadg 3:TREVNI netug 2:TREVNI doog 1:TREVNI world

	// ropo also has built in helpers for element replacements,
	// such that we only need to specify the tag name/regexp,
	// and ropo handles the replacement sections and capture groups for us

	// uppercase the contents of <x-uppercase>
	console.log(
		replaceElementSync(
			'<strong>I am <x-uppercase>awesome</x-uppercase></strong>',
			/x-uppercase/,
			function ({ content }) {
				return content.toUpperCase()
			}
		)
	)
	// => <strong>I am AWESOME</strong>

	// power the numbers of <power> together
	console.log(
		replaceElementSync(
			'<x-pow>2 <x-power>3 4</x-power> 5</x-pow>',
			/x-pow(?:er)?/,
			function ({ content }) {
				const result = content.split(/[\n\s]+/).reduce((a, b) => Math.pow(a, b))
				return result
			}
		)
	)
	// => 8.263199609878108e+121
	// note that this is the correct result of: 2 ^ (3 ^ 4) ^ 5
	// which means, the nested element is replaced first, then the parent element, as expected

	// now as replace-element is just regex based, we must ensure that nested elements have unique tags
	// this can be done as above with `x-pow` and `x-power`, but can also be done via a `:<N>` suffix to the tag
	console.log(
		replaceElementSync(
			'<x-pow>2 <x-pow:2>3 4</x-pow:2> 5</x-pow>',
			/x-pow(?::\d+)?/,
			function ({ content }) {
				const result = content.split(/[\n\s]+/).reduce((a, b) => Math.pow(a, b))
				return result
			}
		)
	)
	// => 8.263199609878108e+121

	// we can even fetch attributes
	console.log(
		replaceElementSync(
			'<x-pow power=10>2</x-pow>',
			/x-pow/,
			function ({ content }, { attributes }) {
				const power = extractAttribute(attributes, 'power')
				const result = Math.pow(content, power)
				return result
			}
		)
	)
	// => 1024

	// and even do asynchronous replacements
	console.log(
		await replaceElementAsync(
			'<x-readfile>example-fixture.txt</x-readfile>',
			/x-readfile/,
			function ({ content }) {
				return require('fs').promises.readFile(content, 'utf8')
			}
		)
	)
	// => hello world from example-fixture.txt

	// and with support for self-closing elements
	console.log(
		replaceElementSync(
			'<x-pow x=2 y=3 /> <x-pow>4 6</x-pow>',
			/x-pow/,
			function ({ content }, { attributes }) {
				const x = extractAttribute(attributes, 'x') || content.split(' ')[0]
				const y = extractAttribute(attributes, 'y') || content.split(' ')[1]
				const result = Math.pow(x, y)
				return result
			}
		)
	)
	// => 8 4096
}
main()
