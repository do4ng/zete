#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const { join } = require('path');
const path = require('path');

require('colors');

function isdir(dir) {
  try {
    return fs.lstatSync(dir).isDirectory();
  } catch (e) {
    return false;
  }
}

function read(dir, out, output, course) {
  const p = fs.readdirSync(dir);
  p.forEach((e) => {
    if (isdir(path.join(dir, e))) {
      if (!fs.existsSync(path.join(out, e))) {
        fs.mkdirSync(path.join(out, e));
      }
      read(path.join(dir, e), path.join(out, e), output, course);
    } else {
      if (course) console.log(`${path.join(dir, e).bold}`);
      fs.writeFileSync(path.join(out, e), fs.readFileSync(path.join(dir, e)));
    }
  });
}

function Clone(dir, out, output = false, course = false) {
  if (!fs.existsSync(out)) {
    fs.mkdirSync(out);
  }

  read(dir, out, output, course);
}

const out = join(process.cwd(), process.argv.slice(2).join(' '));

console.log('downloading template..'.cyan);

Clone(join(__dirname, 'assets'), out);

const packageJSON = JSON.parse(fs.readFileSync(join(out, 'pkg.json')).toString());

fs.writeFileSync(join(out, 'package.json'), JSON.stringify(packageJSON, null, 2));

fs.rmSync(join(out, 'pkg.json'), {
  recursive: true,
  force: true,
});
console.log('installing packages..'.cyan);
execSync('yarn add -D zete vite svelte electron', {
  cwd: join(process.cwd(), process.argv.slice(2).join(' ')),
});
