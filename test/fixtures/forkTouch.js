var fs = require('fs');

setTimeout(() => {
  fs.writeFileSync('./forkTouched.txt', 'hello world');
}, 50);
