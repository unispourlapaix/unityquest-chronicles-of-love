// Regenerate the buildless artist-page translations from the shared source.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data=JSON.parse(fs.readFileSync(path.join(root,'src/data/localTranslations.json'),'utf8'));
fs.writeFileSync(path.join(root,'public/artist-translations.js'), 'window.UNITYQUEST_LOCAL_TRANSLATIONS = '+JSON.stringify(data)+';\n');
console.log(`${Object.keys(data).length} locales synchronized.`);
