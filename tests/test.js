let deployer = require('../index');

deployer.on('start', (info) => {
  console.log(info);
});

deployer.on('add_done', (info) => {
  console.log(info);
});

deployer.listen(5003)