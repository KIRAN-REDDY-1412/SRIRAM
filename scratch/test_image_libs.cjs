try {
  const canvas = require('canvas');
  console.log('node-canvas is available!');
} catch (e) {
  console.log('node-canvas is not available');
}

try {
  const sharp = require('sharp');
  console.log('sharp is available!');
} catch (e) {
  console.log('sharp is not available');
}
