var express = require("express");
var app = express();
const { spawn } = require('child_process');
var rimraf = require("rimraf");
const EventEmitter = require('events').EventEmitter;
var util = require('util');

app.use(express.json());


let deployer = new EventEmitter();
deployer.deploy = function (req, res) {
  let repo = req.body.repository.name;
  let branch = req.body.repository.default_branch;
  let ssh_url = req.body.repository.ssh_url;

  deployer.emit('invoked', req.body);
  if (branch === 'master') {
    deployer.emit('start_deploy', req.body);

    rimraf.sync("./workers/" + repo);
    Promise.resolve()
      .then(() => deployer.clone(ssh_url, repo))
      .then(() => deployer.do_deploy(repo))
      .then(() => deployer.emit('all_done'))
      .catch((err) => deployer.emit('error', err)) 
    return res.status(200).send("Started Deploy");
  }
  return res.status(200).send("Deploy not needed")
}
deployer.clone = function (ssh_url, repo) {
  deployer.emit('start_clone', repo);
  return new Promise((res, rej) => {
    let deploy = spawn('git', ['clone', ssh_url, "./workers/" + repo]);
    deploy.stdout.on('data', (data) => {
      deployer.emit('data', data.toString().trim());
    });
    deploy.stderr.on('data', (data) => {
      deployer.emit('data', data.toString().trim());
    });

    deploy.on('close', (code) => {
      if (code != 0) {
        deployer.emit('error', repo);
        return rej("ERROR");
      }
      deployer.emit('clone_done', repo);
      return res("OK");
    })
  });
}
deployer.do_deploy = function (repo) {
  deployer.emit('start_deploy_script', repo);
  return new Promise((res, rej) => {
    let deploy = spawn('/bin/sh', ['deploy.sh'], { cwd: './workers/' + repo });
    deploy.stdout.on('data', (data) => {
      deployer.emit('data', data.toString().trim());
    });
    deploy.stderr.on('data', (data) => {
      deployer.emit('data', data.toString().trim());
    });

    deploy.on('close', (code) => {
      if (code != 0) {
        deployer.emit('error', "Exit code:"+code);
        return rej("ERROR");
      }
      deployer.emit('deploy_script_done', repo);
      return res("OK");
    })
  });
}
deployer.listen = function (port, hostname) {
  port = port || 80
  hostname = hostname || "0.0.0.0"
  app.listen(port, hostname, () => {
    console.log("Configure webhook using this uri: http://<your_public_ip>:" + port + "/webhooks/github")
  })
}

app.post("/webhooks/github", deployer.deploy)
module.exports = deployer;
