/* eslint no-invalid-regexp:0 */
'use strict'

const { isRegExp } = require('typechecker')

// (?:\\:[-:_a-z0-9]+)?)
// (?<suffix>:[-:_a-z0-9]+)?)

/**
 * Performs an operation on the content and returns the result
 * @callback replaceSyncCallback
 * @param {object} match
 * @param {string} content
 * @returns {string}
 */

/**
 * Performs an operation on the content and resolves the result
 * @callback replaceAsyncCallback
 * @param {object} match
 * @param {string} content
 * @returns {Promise<string>}
 */

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
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source - the source string to replace elements within
 * @param {regexp} regex - the element tag to search for and replace, supports regex, e.g. `(?:x-)?uppercase`
 * @param {replaceSyncCallback} replace - the callback to perform the replacement
 * @returns {string}
 */
function replaceSync (source, regex, replace) {
	const result = source.replace(regex, function (...args) {
		const group = args[args.length - 1]
		const inner = group.inner
		const bubbleResult = replaceSync(inner, regex, replace)
		const innerResult = replace(group, bubbleResult)
		return innerResult
	})
	return result
}

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source - the source string to replace elements within
 * @param {string|regexp} search - the element tag to search for and replace, supports regex, e.g. `(?:x-)?uppercase`
 * @param {replaceSyncCallback} replace - the callback to perform the replacement
 * @returns {string}
 */
function replaceElementSync (source, search, replace) {
	let searchFlags = 'g', searchSource = search
	if (isRegExp(search)) {
		searchFlags = [...new Set(
			searchFlags.split('').concat(
				search.flags.split('')
			)
		)].join('')
		searchSource = search.source
	}
	const regex = new RegExp(`<(?<element>${searchSource})(?<attributes>\\s+[^>]+)?>(?<inner>[\\s\\S]+?)<\\/\\k<element>>`, searchFlags)
	const result = replaceSync(source, regex, replace)
	return result
}

/**
 * Replaces each iteration of the element with the result of the replace function, which should return a promise
 * @param {string} source - the source string to replace elements within
 * @param {string|regexp} regex - the element tag to search for and replace, supports regex, e.g. `(?:x-)?uppercase`
 * @param {replaceElementAsync~replaceCallback} replace - the callback to perform the replacement
 * @returns {Promise<string>}
 */
async function replaceAsync (source, regex, replace) {
	// evaluate if the `y` (sticky) flag will speed this up
	const match = source.match(regex)
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
 * @param {string|regex} element - the regex string/instance for finding the element
 * @param {replaceElementAsync~replaceCallback} replace - the callback to perform the replacement
 * @returns {Promise<string>}
 */
async function replaceElementAsync (source, element, replace) {
	let searchFlags = '', searchSource = element
	if (isRegExp(element)) {
		searchFlags = [...new Set(
			searchFlags.split('').concat(
				element.flags.split('')
			)
		)].join('')
		searchSource = element.source
	}
	const regex = new RegExp(`<(?<element>${searchSource})(?<attributes>\\s+[^>]+)?>(?<inner>[\\s\\S]+?)<\\/\\k<element>>`, searchFlags)
	return await replaceAsync(source, regex, replace)
}

/**
 * Replaces each iteration of the element with the result of the replace function, which should return a promise
 * @param {string} source - the source string to replace elements within
 * @param {replaceElementAsync~replaceCallback} replace - the callback to perform the replacement
 * @returns {Promise<string>}
 */
async function replaceElementsAsync (source, replace) {
	const regex = new RegExp('<(?<element>[-a-z]+)(?<attributes> +[^>]+)?>(?<inner>[\\s\\S]+?)<\\/\\k<element>>')
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
	const regex = new RegExp('<!-- <(?<element>[-a-z]+)(?<attributes> +[^>]+)?> -->(?<inner>[\\s\\S]+?)<!-- <\\/\\k<element>> -->')
	return await replaceAsync(source, regex, replace)
}

module.exports = { extractAttribute, replaceElementSync, replaceElementAsync, replaceElementsAsync, replaceCommentElementsAsync }
