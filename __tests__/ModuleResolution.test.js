const fs = require('fs');
const path = require('path');

const SEARCH_DIRS = ['components', 'screens', 'utils'];
const RELATIVE_PATTERN = /^\.|\//;

function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const resolved = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(resolved));
    } else if (/\.(js|jsx)$/.test(entry.name)) {
      files.push(resolved);
    }
  }
  return files;
}

describe('module resolution sanity check', () => {
  const projectRoot = path.join(__dirname, '..');
  const files = SEARCH_DIRS.flatMap(dir => collectFiles(path.join(projectRoot, dir)));

  it('all non-relative imports resolve via require.resolve', () => {
    const failed = new Set();

    files.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');

      const importRegex = /import[^'"`]+['"`]([^'"`]+)['"`]/g;
      const requireRegex = /require\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

      const addModule = (_, specifier) => {
        if (!RELATIVE_PATTERN.test(specifier)) {
          failed.add(specifier);
        }
        return _;
      };

      content.replace(importRegex, addModule);
      content.replace(requireRegex, addModule);
    });

    const failures = [];
    failed.forEach(specifier => {
      try {
        require.resolve(specifier);
      } catch (err) {
        failures.push({ specifier, error: err.message });
      }
    });

    expect(failures).toEqual([]);
  });
});
