var fs = require('fs');
var path = require('path');
var p = path.join(__dirname, 'src', 'routes', 'auth', 'choisir-template.tsx');
var c = fs.readFileSync(p, 'utf8');
var idx = c.indexOf('Votre forfait');
console.log('idx', idx);
if (idx >= 0) {
  var before = c.substring(0, idx - 10);
  var after = c.substring(idx + 60);
  console.log('before len', before.length, 'after len', after.length);
  fs.writeFileSync(p, before + after, 'utf8');
  console.log('removed subtitle');
} else {
  console.log('not found');
}