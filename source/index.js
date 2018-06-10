'use strict'

/**
 * Returns the value of a specific attribute
 * @param {string} attributes - the string of attributes to fetch from
 * @param {string} attribute - the attribute to fetch the value of
 * @returns {string}
 */
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

/**
 * Performs an operation on the content and returns the result
 * @callback replaceElement~replaceCallback
 * @param {string} element
 * @param {string} attributes
 * @param {string} content
 * @returns {string}
 */

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} html - the source string to replace elements within
 * @param {string} search - the element tag to search for and replace, supports regex, e.g. `(?:x-)?uppercase`
 * @param {replaceElement~replaceCallback} replace - the callback to perform the replacement
 * @returns {string}
 */
function replaceElement (html, search, replace) {
	const regex = new RegExp(`<(${search}(?:\\:[-:_a-z0-9]+)?)(\\s+[^>]+)?>([\\s\\S]+?)<\\/\\1>`, 'ig')
	const result = html.replace(regex, function (outerHTML, element, attributes, innerHTML) {
		const bubbleResult = replaceElement(innerHTML, search, replace)
		const innerResult = replace(element, attributes, bubbleResult)
		return innerResult
	})
	return result
}

/**
 * Performs an operation on the content and resolves the result
 * @callback replaceElementAsync~replaceCallback
 * @param {string} element
 * @param {string} attributes
 * @param {string} content
 * @returns {Promise<string>}
 */

/**
 * Replaces each iteration of the element with the result of the replace function, which should return a promise
 * @param {string} html - the source string to replace elements within
 * @param {string} search - the element tag to search for and replace, supports regex, e.g. `(?:x-)?uppercase`
 * @param {replaceElementAsync~replaceCallback} replace - the callback to perform the replacement
 * @returns {Promise<string>}
 */
async function replaceElementAsync (html, search, replace) {
	const regex = new RegExp(`<(${search}(?:\\:[-:_a-z0-9]+)?)(\\s+[^>]+)?>([\\s\\S]+?)<\\/\\1>`, 'i')
	const match = html.match(regex)
	if (!match) return html
	const [outerHTML, element, attributes, innerHTML] = match
	const bubbleResult = await replaceElementAsync(innerHTML, search, replace)
	const innerResult = await replace(element, attributes, bubbleResult)
	const result = match.input.replace(outerHTML, innerResult)
	return await replaceElementAsync(result, search, replace)
}

module.exports = { extractAttribute, replaceElement, replaceElementAsync }
