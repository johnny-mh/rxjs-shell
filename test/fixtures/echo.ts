console.log('hello world');

if (process.send) {
  process.send('good');
}
