/* eslint no-invalid-regexp:0 */
'use strict'

const { isRegExp } = require('typechecker')

// ====================================
// Private Utilities

/**
 * Merge the characters of two strings together without duplicates
 * Used to merge the flags of regexes
 * @private
 * @param {string} a
 * @param {string} b
 * @returns {string}
 */
function mergeFlags (a, b) {
	return [...new Set(
		a.split('').concat(
			b.split('')
		)
	)].join('')
}

/**
 * Extract the inputs RegExp source, and merge its flags with the passed flags
 * @private
 * @param {string|RegExp} input
 * @param {string} [addFlags]
 * @returns {RegExp}
 */
function prepareElementRegex (input, addFlags = '') {
	let source, flags
	if (isRegExp(input)) {
		flags = mergeFlags(addFlags, input.flags)
		source = input.source
	}
	else {
		flags = addFlags
		source = input
	}
	return { source, flags }
}

/**
 * The regular expression used for finding elements
 * @private
 * @type {RegExp}
 */
const elementsRegex = new RegExp('<(?<element>[-a-z]+)(?<attributes> +[^>]+)?>(?<inner>[\\s\\S]+?)<\\/\\k<element>>')

/**
 * Get a regular expression for finding a particular element
 * @private
 * @param {RegExp} element
 * @param {string} [addFlags]
 * @returns {RegExp}
 */
function getElementRegex (element, addFlags) {
	const { source, flags } = prepareElementRegex(element, addFlags)
	const regex = new RegExp(`<(?<element>${source})(?<attributes>\\s+[^>]+)?>(?<inner>[\\s\\S]+?)<\\/\\k<element>>`, flags)
	return regex
}

/**
 * The regular expression used for finding comment elements
 * @private
 * @type {RegExp}
 */
const commentElementsRegex = new RegExp('<!-- <(?<element>[-a-z]+)(?<attributes> +[^>]+)?> -->(?<inner>[\\s\\S]+?)<!-- <\\/\\k<element>> -->')

/**
 * Get a regular expression for finding a particular element
 * @private
 * @param {RegExp} element
 * @param {string} [addFlags]
 * @returns {RegExp}
 */
function getCommentElementRegex (element, addFlags) {
	const { source, flags } = prepareElementRegex(element, addFlags)
	const regex = new RegExp(`<!-- <(?<element>${source})(?<attributes>\\s+[^>]+)?> -->(?<inner>[\\s\\S]+?)<!-- <\\/\\k<element>> -->`, flags)
	return regex
}

// ====================================
// Public Utilities

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


// ====================================
// Replace

/**
 * Performs an operation on the content and returns the result
 * @callback replaceSyncCallback
 * @param {object} match
 * @param {string} content
 * @returns {string}
 */

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source - the source string to replace elements within
 * @param {RegExp} regex - the regular expression - to perform nested replacements, you must provide a RegExp named capture group called inner
 * @param {replaceSyncCallback} replace - the callback to perform the replacement
 * @returns {string}
 */
function replaceSync (source, regex, replace) {
	const result = source.replace(regex, function (...args) {
		const group = args[args.length - 1]
		const outer = (group && group.outer) || args[0]
		const inner = (group && group.inner)
		const bubbleResult = inner == null ? outer : replaceSync(inner, regex, replace)
		const innerResult = replace(group, bubbleResult)
		return innerResult
	})
	return result
}

/**
 * Performs an operation on the content and resolves the result
 * @callback replaceAsyncCallback
 * @param {object} match
 * @param {string} content
 * @returns {Promise<string>}
 */

/**
 * Replaces each match of the regular expression, with the result of the replace function
 * @param {string} source - the source string to run the regular expression against
 * @param {RegExp} regex - the regular expression - to perform nested replacements, you must provide a RegExp named capture group called inner
 * @param {replaceAsyncCallback} replace - the callback to perform the replacement
 * @returns {Promise<string>}
 */
async function replaceAsync (source, regex, replace) {
	// evaluate if the `y` (sticky) flag will speed this up
	const match = source.match(regex)
	if (!match) return source
	const outer = (match.groups && match.groups.outer) || match[0]
	const inner = (match.groups && match.groups.inner)
	const bubbleResult = inner == null ? outer : await replaceAsync(inner, regex, replace)
	let innerResult = await replace(match.groups, bubbleResult)
	if (innerResult == null) {
		innerResult = bubbleResult
	}
	const result = match.input.replace(outer, innerResult)
	return await replaceAsync(result, regex, replace)
}


// ====================================
// Replace Elements

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source - the source string to replace elements within
 * @param {replaceSyncCallback} replace - the callback to perform the replacement
 * @returns {Promise<string>}
 */
function replaceElementsSync (source, replace) {
	return replaceSync(source, elementsRegex, replace)
}


/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source - the source string to replace elements within
 * @param {replaceAsyncCallback} replace - the callback to perform the replacement
 * @returns {Promise<string>}
 */
async function replaceElementsAsync (source, replace) {
	return await replaceAsync(source, elementsRegex, replace)
}

// ====================================
// Replace Element

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source - the source string to replace elements within
 * @param {RegExp} element - the element tag to search for and replace, supports regex, e.g. `(?:x-)?uppercase`
 * @param {replaceSyncCallback} replace - the callback to perform the replacement
 * @returns {string}
 */
function replaceElementSync (source, element, replace) {
	const regex = getElementRegex(element, 'g')
	const result = replaceSync(source, regex, replace)
	return result
}

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source - the source string to replace elements within
 * @param {RegExp} element - the regex string/instance for finding the element
 * @param {replaceAsyncCallback} replace - the callback to perform the replacement
 * @returns {Promise<string>}
 */
async function replaceElementAsync (source, element, replace) {
	const regex = getElementRegex(element)
	return await replaceAsync(source, regex, replace)
}

// ====================================
// Replace Comment Elements

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source - the source string to replace elements within
 * @param {replaceSyncCallback} replace - the callback to perform the replacement
 * @returns {string}
 */
function replaceCommentElementsSync (source, replace) {
	return replaceSync(source, commentElementsRegex, replace)
}

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source - the source string to replace elements within
 * @param {replaceAsyncCallback} replace - the callback to perform the replacement
 * @returns {Promise<string>}
 */
async function replaceCommentElementsAsync (source, replace) {
	return await replaceAsync(source, commentElementsRegex, replace)
}

// ====================================
// Replace Comment Element

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source - the source string to replace elements within
 * @param {RegExp} element - the element tag to search for and replace, supports regex, e.g. `(?:x-)?uppercase`
 * @param {replaceSyncCallback} replace - the callback to perform the replacement
 * @returns {string}
 */
function replaceCommentElementSync (source, element, replace) {
	const regex = getCommentElementRegex(element, 'g')
	return replaceSync(source, regex, replace)
}

/**
 * Replaces each iteration of the element with the result of the replace function
 * @param {string} source - the source string to replace elements within
 * @param {RegExp} element - the element tag to search for and replace, supports regex, e.g. `(?:x-)?uppercase`
 * @param {replaceSyncCallback} replace - the callback to perform the replacement
 * @returns {Promise<string>}
 */
async function replaceCommentElementAsync (source, element, replace) {
	const regex = getCommentElementRegex(element)
	return await replaceAsync(source, regex, replace)
}


// ====================================
// Export

module.exports = {
	extractAttribute,
	replaceSync, replaceElementSync, replaceElementsSync, replaceCommentElementSync, replaceCommentElementsSync,
	replaceAsync, replaceElementAsync, replaceElementsAsync, replaceCommentElementAsync, replaceCommentElementsAsync
}
