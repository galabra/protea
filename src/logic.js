const SpecialTokens = {
    END_OF_WORD: '#',
    EMPTY_STRING: '_',
}

export function translateByDictionary(originalText, dictionary) {
    if (dictionary === null) {
        return originalText;
    }

    return dictionary.content.reduce((ans, replacement) => {
        const { original, target } = replacement;

        if (original.endsWith(SpecialTokens.END_OF_WORD)) {
            const originalWithoutSpecialCharacter = original.slice(0, -1);
            return ans.replace(new RegExp(`${originalWithoutSpecialCharacter}( |$|\n)`, 'g'), `${target}$1`);
        } else if (target === SpecialTokens.EMPTY_STRING) {
            return ans.replace(new RegExp(original, 'g'), '');
        }
        return ans.replace(new RegExp(original, 'g'), target);
    }, originalText);
}
