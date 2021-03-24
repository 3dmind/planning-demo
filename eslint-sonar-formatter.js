const GITHUB_WORKSPACE = '/github/workspace';

function replacer(key, value) {
  if (key === 'filePath') {
    return value.replace(__dirname, GITHUB_WORKSPACE);
  }
  return value;
}

module.exports = function(results) {
  return JSON.stringify(results, replacer, 2);
};
