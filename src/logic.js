export function translateByDictionary(originalText, dictionary) {
    if (dictionary === null) {
        return originalText;
    }

    return dictionary.content.reduce((ans, replacement) => {
        const { original, target } = replacement;
        return ans.replace(new RegExp(original, 'g'), target);
    }, originalText);
}
