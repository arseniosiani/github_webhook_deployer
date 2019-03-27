var express = require("express");
var app = express();
const { spawn } = require('child_process');
var rimraf = require("rimraf");

app.use(express.json());

app.post("/webhooks/github", function (req, res) {
  let repo = req.body.repository.name;
  let branch = req.body.repository.default_branch;
  let ssh_url = req.body.repository.ssh_url;


  if (branch === 'master') {
    console.log("Started deploy");
    rimraf.sync("./workers/" + repo);
    Promise.resolve()
      .then(() => clone(ssh_url, repo))
      .then(() => do_deploy(repo))
    return res.send(200, "Started Deploy");
  }
  return res.status(200).send("Deploy not needed")
})

let clone = (ssh_url, repo) => { 
  return new Promise((res, rej) => { 
    let deploy = spawn('git', ['clone', ssh_url, "./workers/" + repo]);
    deploy.stdout.on('data', (data) => {
      console.log(data.toString().trim());
    });
    deploy.stderr.on('data', (data) => {
      console.log(data.toString().trim());
    });

    deploy.on('close', (code) => {
      if (code != 0) { 
        return rej("ERROR");
      }
      return res("OK");
    })
  });
}

let do_deploy = (repo) => {
  return new Promise((res, rej) => {
    let deploy = spawn('/bin/sh', ['deploy.sh'], { cwd: __dirname + '/workers/' + repo });
    deploy.stdout.on('data', (data) => {
      console.log(data.toString().trim());
    });
    deploy.stderr.on('data', (data) => {
      console.log(data.toString().trim());
    });

    deploy.on('close', (code) => {
      if (code != 0) {
        return rej("ERROR");
      }
      return res("OK");
    })
  });
}

module.exports = {
  listen: function (port, hostname) { 
    port = port || 80
    hostname = hostname || "0.0.0.0"
    app.listen(port, hostname, () => {
      console.log("configure webhook using this uri: http://" + hostname + ":" + port +"/webhooks/github")
    })
  }
}

module.exports.listen();

