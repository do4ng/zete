const esbuild = require('esbuild');

module.exports = function (config) {
  return new Promise((resolve, reject) => {
    esbuild.build(config).then((out) => {
      if (out.errors) out.errors.forEach((error) => console.log(`[esbuild] ${error.text} (${error.location})`));
      resolve(out.outputFiles);
    });
  });
};
