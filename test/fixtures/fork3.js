process.on('message', function(msg) {
  process.send(msg + ' world');
  process.exit();
});
