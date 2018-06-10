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
		const bubbleResult = replaceElement(innerHTML, search, replace)
		const innerResult = replace(element, attributes, bubbleResult)
		return innerResult
	})
	return result
}

// Replace Element Async
// replaceElementCallback(outerHTML, element, attributes, innerHTML, replaceElementCompleteCallback), replaceElementCompleteCallback(err,replaceElementResult)
// next(err,result)
async function replaceElementAsync (html, search, replace) {
	const regex = new RegExp(`<(${search}(?:\\:[-:_a-z0-9]+)?)(\\s+[^>]+)?>([\\s\\S]+?)<\\/\\1>`, 'i')
	const match = html.match(regex)
	if (!match) return Promise.resolve(html)
	const [outerHTML, element, attributes, innerHTML] = match
	const bubbleResult = await replaceElementAsync(innerHTML, search, replace)
	const innerResult = await replace(element, attributes, bubbleResult)
	const result = match.input.replace(outerHTML, innerResult)
	return await replaceElementAsync(result, search, replace)
}

module.exports = { extractAttribute, replaceElement, replaceElementAsync }
