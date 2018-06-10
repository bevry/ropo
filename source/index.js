'use strict'

function extractAttribute (attributes, attribute) {
	const regex = new RegExp(`(${attribute})\\s*=\\s*('[^']+'|\\"[^\\"]+\\"|[^'\\"\\s]\\S*)`, 'ig')
	let value = null
	while (true) {
		const match = regex.exec(attributes)
		if (!match) break
		value = match[2].trim().replace(/(^['"]\s*|\s*['"]$)/g, '')
	}
	return value
}

// Replace Element
// replaceElementCallback(outerHTML, element, attributes, innerHTML)
// returns the replace result
function replaceElement (html, search, replace) {
	const regex = new RegExp(`<(${search}(?:\\:[-:_a-z0-9]+)?)(\\s+[^>]+)?>([\\s\\S]+?)<\\/\\1>`, 'ig')
	const result = html.replace(regex, function (outerHTML, element, attributes, innerHTML) {
		innerHTML = replaceElement(innerHTML, search, replace)
		return replace(outerHTML, element, attributes, innerHTML)
	})
	return result
}

// Replace Element Async
// replaceElementCallback(outerHTML, element, attributes, innerHTML, replaceElementCompleteCallback), replaceElementCompleteCallback(err,replaceElementResult)
// next(err,result)
async function replaceElementAsync (html, search, replace) {
	const codes = new Map()
	const tasks = []

	let rollingResult = replaceElement(html, search, function (...args) {
		const code = '[async:' + Math.random() + ']'
		const task = replace(...args).then((result) => codes.set(code, result))
		tasks.push(task)
		return code
	})

	await Promise.all(tasks)

	function iterator (result, code) {
		console.log({ code, result, rollingResult })
		if (rollingResult.indexOf(code) !== -1) {
			rollingResult = rollingResult.replace(code, result)
			codes.delete(code)
		}
	}

	while (codes.size) {
		codes.forEach(iterator)
	}

	// Return
	return Promise.resolve(rollingResult)
}

module.exports = { extractAttribute, replaceElement, replaceElementAsync }
