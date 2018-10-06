var fs = require('fs');

setTimeout(() => {
  fs.writeFileSync('./forkTouched2.txt', 'hello world');
}, 50);
