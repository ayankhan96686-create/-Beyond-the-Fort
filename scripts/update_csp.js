const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'server.js');
let s = fs.readFileSync(p, 'utf8');

const oldCsp = 'res.setHeader(\'Content-Security-Policy\', "default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com data:; img-src \'self\' data: https:; connect-src \'self\' https:; object-src \'none\'; base-uri \'self\'; frame-ancestors \'none\'; form-action \'self\'");';
const newCsp = 'res.setHeader(\'Content-Security-Policy\', "default-src \'self\'; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com https://unpkg.com; font-src \'self\' https://fonts.gstatic.com data:; img-src \'self\' data: https:; connect-src \'self\' https: ws: wss:; object-src \'none\'; base-uri \'self\'; frame-ancestors \'none\'; form-action \'self\'");';

if (s.includes(oldCsp)) {
  s = s.replace(oldCsp, newCsp);
  fs.writeFileSync(p, s);
  console.log('CSP updated successfully in server.js.');
} else {
  console.log('Old CSP not found in exact string, updating regex.');
  s = s.replace(/res\.setHeader\('Content-Security-Policy',[^;]+;/, newCsp);
  fs.writeFileSync(p, s);
  console.log('CSP updated via regex in server.js.');
}

