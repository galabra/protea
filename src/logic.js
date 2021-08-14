import { SpecialTokens, TextDirection } from "./constants";

export function getTextDirection(text) {
    const hebrewRegex = /[\u0590-\u05FF]/;
    const arabicRegex = /[\u0600-\u06FF]/;
    return [hebrewRegex, arabicRegex].some((semiticLanguage) => semiticLanguage.test(text))
        ? TextDirection.RTL : TextDirection.LTR;
}

export function translateByDictionary(originalText, dictionary, ignoreCase) {
    if (dictionary === null) {
        return originalText;
    }

    const regexFlags = ignoreCase ? 'gi' : 'g';
    return dictionary.content.reduce((ans, replacement) => {
        const { original, target } = replacement;

        if (original.endsWith(SpecialTokens.END_OF_WORD)) {
            const originalWithoutSpecialCharacter = original.slice(0, -1);
            return ans.replace(new RegExp(`${originalWithoutSpecialCharacter}( |$|\n)`, regexFlags), `${target}$1`);
        } else if (target === SpecialTokens.EMPTY_STRING) {
            return ans.replace(new RegExp(original, regexFlags), '');
        }
        return ans.replace(new RegExp(original, regexFlags), target);
    }, originalText);
}
