/* eslint no-invalid-regexp:0 */
'use strict'

const { isRegExp } = require('typechecker')

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
 * @param {string|regexp} search - the element tag to search for and replace, supports regex, e.g. `(?:x-)?uppercase`
 * @param {replaceElement~replaceCallback} replace - the callback to perform the replacement
 * @returns {string}
 */
function replaceElement (html, search, replace) {
	let searchFlags = 'g', searchSource = search
	if (isRegExp(search)) {
		searchFlags = [...new Set(
			searchFlags.split('').concat(
				search.flags.split('')
			)
		)].join('')
		searchSource = search.source
	}
	const regex = new RegExp(`<(${searchSource}(?:\\:[-:_a-z0-9]+)?)(\\s+[^>]+)?>([\\s\\S]+?)<\\/\\1>`, searchFlags)
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
 * @param {string|regexp} search - the element tag to search for and replace, supports regex, e.g. `(?:x-)?uppercase`
 * @param {replaceElementAsync~replaceCallback} replace - the callback to perform the replacement
 * @returns {Promise<string>}
 */
async function replaceElementAsync (html, search, replace) {
	let searchFlags = '', searchSource = search
	if (isRegExp(search)) {
		searchFlags = search.flags
		searchSource = search.source
	}
	const regex = new RegExp(`<(${searchSource}(?:\\:[-:_a-z0-9]+)?)(\\s+[^>]+)?>([\\s\\S]+?)<\\/\\1>`, searchFlags)
	const match = html.match(regex)
	if (!match) return html
	const [outerHTML, element, attributes, innerHTML] = match
	const bubbleResult = await replaceElementAsync(innerHTML, search, replace)
	const innerResult = await replace(element, attributes, bubbleResult)
	const result = match.input.replace(outerHTML, innerResult)
	return await replaceElementAsync(result, search, replace)
}

module.exports = { extractAttribute, replaceElement, replaceElementAsync }

/**
 * Replaces each iteration of the element with the result of the replace function, which should return a promise
 * @param {string} source - the source string to replace elements within
 * @param {string|regexp} regex - the element tag to search for and replace, supports regex, e.g. `(?:x-)?uppercase`
 * @param {replaceElementAsync~replaceCallback} replace - the callback to perform the replacement
 * @returns {Promise<string>}
 */
async function replaceAsync (source, regex, replace) {
	const match = source.match(regex)
	console.log(match)
	if (!match) return source
	const outer = match.groups.outer || match[0]
	const inner = match.groups.inner
	const bubbleResult = await replaceAsync(inner, regex, replace)
	let innerResult = await replace(match.groups, bubbleResult)
	if (innerResult == null) {
		innerResult = bubbleResult
	}
	const result = match.input.replace(outer, innerResult)
	return await replaceAsync(result, regex, replace)
}

/**
 * Replaces each iteration of the element with the result of the replace function, which should return a promise
 * @param {string} source - the source string to replace elements within
 * @param {replaceElementAsync~replaceCallback} replace - the callback to perform the replacement
 * @returns {Promise<string>}
 */
async function replaceHTMLElementsAsync (source, replace) {
	const regex = new RegExp('<(?<element>[-a-z]+)(?<attributes> +[^>]+)?>(?<inner>[\\s\\S]+?)<\\/\\1>')
	return await replaceAsync(source, regex, replace)
}

/**
 * Replaces each iteration of the element with the result of the replace function, which should return a promise
 * @param {string} source - the source string to replace elements within
 * @param {replaceElementAsync~replaceCallback} replace - the callback to perform the replacement
 * @returns {Promise<string>}
 */
async function replaceCommentElementsAsync (source, replace) {
	// don't code it directly, as eslint will fail, as it does not yet support regex groups
	const regex = new RegExp('<!-- <(?<element>[-a-z]+)(?<attributes> +[^>]+)?> -->(?<inner>[\\s\\S]+?)<!-- <\\/\\1> -->')
	return await replaceAsync(source, regex, replace)
}

module.exports = { extractAttribute, replaceElement, replaceElementAsync, replaceHTMLElementsAsync, replaceCommentElementsAsync }
