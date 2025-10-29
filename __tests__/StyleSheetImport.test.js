const fs = require('fs');
const path = require('path');

const SEARCH_DIRS = ['components', 'screens', 'utils'];

function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    if (entry.isDirectory()) {
      files.push(...collectFiles(path.join(dir, entry.name)));
    } else if (entry.name.endsWith('.js')) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

describe('StyleSheet imports', () => {
  const files = SEARCH_DIRS.flatMap(dir => collectFiles(path.join(__dirname, '..', dir)));

  it('every file that references StyleSheet imports it from react-native', () => {
    const offenders = [];

    files.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      if (!content.includes('StyleSheet')) {
        return;
      }

      const importRegex = /import\s+\{[^}]*StyleSheet[^}]*\}\s+from\s+'react-native'/;
      const hasImport = importRegex.test(content);
      if (!hasImport) {
        offenders.push(path.relative(path.join(__dirname, '..'), filePath));
      }
    });

    expect(offenders).toEqual([]);
  });
});
