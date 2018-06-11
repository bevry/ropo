'use strict'

const { extractAttribute, replaceSync, replaceAsync, replaceElementSync, replaceElementAsync } = require('./')

async function main () {
	// uppercase `bc` of `abcd`
	console.log(
		replaceSync(
			'abcd',
			/bc/,
			function (content) {
				return content.toUpperCase()
			}
		)
	)
	// => aBCd

	// uppercase `bc` of `abcd` asynchronously
	console.log(
		await replaceAsync(
			'abcd',
			/bc/,
			function (content) {
				return new Promise(function (resolve) {
					process.nextTick(function () {
						resolve(
							content.toUpperCase()
						)
					})
				})
			}
		)
	)
	// => aBCd

	// use RegExp named capture groups to swap two words
	// https://github.com/tc39/proposal-regexp-named-groups
	console.log(
		replaceSync(
			'hello world',
			new RegExp('^(?<first>\\w+) (?<second>\\w+)$'),
			function (content, { first, second }) {
				return second + ' ' + first
			}
		)
	)
	// => world hello
	// yes, doing content.split(' ').reverse().join('') would have also worked
	// but now you know what RegExp named capture groups are and how to use them
	// which will come into play in the following examples

	// invert anything between BEGIN and END
	console.log(
		replaceSync(
			'hello BEGIN good morning END world',
			new RegExp('BEGIN (?<inner>.+?) END'),
			function (content) {
				return content.split('').reverse().join('')
			}
		)
	)
	// => hello gninrom doog world

	// invert anything between INVERT:<N>
	console.log(
		replaceSync(
			'hello INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1 world',
			new RegExp('(?<element>INVERT:\\d+) (?<inner>.+?) /\\k<element>'),
			function (content) {
				return content.split('').reverse().join('')
			}
		)
	)
	// => hello gninrom guten yadg morgen doog world
	// notice how the text is replaced correctly, gday has 3 inversions applied, so it is inverted
	// whereas guten morgen has 2 inversions applied, so is reset
	// the ability to perform this recursive replacement is possible by using a RegExp named capture group called `inner` with ropo
	// when inner is provided, ropo will perform recursion on inner
	// e.g. using inner, the initial recursion will occur on the content: good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning
	// then on: guten INVERT:3 gday /INVERT:3 morgen
	// and finally on: gday
	// without inner, recursion would have to happen on the outer, which would cause the replacement to recur infinitely against itself
	// e.g. the intiial recursion would occur on: INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1
	// and the second on: INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1
	// and the third on: INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1
	// and so on, so no progress is made
	// as such, ropo will only allow recursion when it detects the `inner` named capture group

	// invert anything between INVERT:<N>, without using the `inner` named capture group
	console.log(
		replaceSync(
			'hello INVERT:1 good INVERT:2 guten INVERT:3 gday /INVERT:3 morgen /INVERT:2 morning /INVERT:1 world',
			new RegExp('(?<element>INVERT:\\d+) (?<content>.+?) /\\k<element>'),
			function (outer, { content }) {
				return content.split('').reverse().join('')
			}
		)
	)
	// => hello gninrom 2:TREVNI/ negrom 3:TREVNI/ yadg 3:TREVNI netug 2:TREVNI doog world
	// as we can see, recursion was correctly disabled
	// if it wasn't, we would end up with an error like:
	// (node:7252) UnhandledPromiseRejectionWarning: RangeError: Maximum call stack size exceeded
	// and if we used `outer` instead of the content capture group, we would have:
	// => hello 1:TREVNI/ gninrom 2:TREVNI/ negrom 3:TREVNI/ yadg 3:TREVNI netug 2:TREVNI doog 1:TREVNI world

	// uppercase the contents of <x-uppercase>
	console.log(
		replaceElementSync(
			'<strong>I am <x-uppercase>awesome</x-uppercase></strong>',
			/x-uppercase/,
			function (content) {
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
			function (content) {
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
			function (content) {
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
			function (content, { attributes }) {
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
			'<x-readfile>example.txt</x-readfile>',
			/x-readfile/,
			function (content) {
				return require('fs').promises.readFile(content, 'utf8')
			}
		)
	)
	// => hello world from example.txt

	// and with support for self-closing elements
	console.log(
		replaceElementSync(
			'<x-pow x=2 y=3 /> <x-pow>4 6</x-pow>',
			/x-pow/,
			function (content, { attributes }) {
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
