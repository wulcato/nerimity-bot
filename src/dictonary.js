/**
 * Gets the definition of a given word
 * @param {string} word
 * @returns {Promise<string | undefined>}
 */
const define = async (word) => {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition;
  } catch {
    return undefined;
  }
};
