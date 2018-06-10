'use strict'

const { extractAttribute, replaceElement, replaceElementAsync } = require('./')

// uppercase the contents of <x-uppercase>
console.log(
	replaceElement(
		'<strong>I am <x-uppercase>awesome</x-uppercase></strong>',
		'x-uppercase',
		function (element, attributes, content) {
			return content.toUpperCase()
		}
	)
)
// => <strong>I am AWESOME</strong>

// power the numbers of <power> together
console.log(
	replaceElement(
		'<x-pow>2 <x-power>3 4</x-power> 5</x-pow>',
		'x-pow(?:er)?',
		function (element, attributes, content) {
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
	replaceElement(
		'<x-pow:1>2 <x-pow:2>3 4</x-pow:2> 5</x-pow:1>',
		'x-pow',
		function (element, attributes, content) {
			const result = content.split(/[\n\s]+/).reduce((a, b) => Math.pow(a, b))
			return result
		}
	)
)
// => 8.263199609878108e+121

// we can even fetch attributes
console.log(
	replaceElement(
		'<x-pow power=10>2</x-pow>',
		'x-pow',
		function (element, attributes, content) {
			const power = extractAttribute(attributes, 'power')
			const result = Math.pow(content, power)
			return result
		}
	)
)
// => 1024

// and even do asynchronous replacements
async function asyncExample () {
	const result = await replaceElementAsync(
		'<x-readfile>package.json</x-readfile>',
		'x-readfile',
		function (element, attributes, content) {
			return require('fs').promises.readFile(content, 'utf8')
		}
	)
	console.log(result)
	// => the output of package.json
}
asyncExample()
