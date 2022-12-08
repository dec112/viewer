const path = require('path');
const findRoot = require('find-root');
const args = require("args-parser")(process.argv);
const root = findRoot(__dirname);
const { promises: fs } = require('fs');

const langPath = path.join(root, 'src', 'i18n');

const readJson = async (path) => {
  return JSON.parse(await fs.readFile(path))
}

const writeJson = async (path, json) => {
  return await fs.writeFile(path, JSON.stringify(json, null, 2));
}

(async () => {
  const defaultLanguage = args['d'];

  if (!defaultLanguage)
    throw new Error("No default language specified");

  const defaultLangName = `${defaultLanguage}.json`;
  const defaultLangPath = path.join(langPath, defaultLangName);

  let langKeys = await readJson(defaultLangPath);
  // sorting the keys
  langKeys = Object.keys(langKeys).sort().reduce((acc, key) => {
    acc[key] = langKeys[key];
    return acc;
  }, {});

  await writeJson(defaultLangPath, langKeys);

  const langFiles = (await fs.readdir(langPath))
    .filter(x =>
      // only consider json files
      x.endsWith('.json') &&
      // don't include our main file
      !x.endsWith(defaultLangName)
    );

  for (const f of langFiles) {
    const translationPath = path.join(langPath, f);
    const file = await readJson(translationPath);

    await writeJson(
      translationPath,
      // only copy keys that are also present in our default language file
      // if a new key is found, initialize it with an empty string
      Object.keys(langKeys).reduce((acc, key) => {
        acc[key] = file[key] || '';
        return acc;
      }, {})
    );
  }
})();