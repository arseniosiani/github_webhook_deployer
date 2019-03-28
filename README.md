# github-webhook-deployer
nodejs server based on expressjs to automate deploy using github webhooks

# Intallation
```sh
	npm i github-webhook-deployer --save
```	
# Pre-requisites
You shound have a file called ``` deploy.sh ``` in the root directory of your github project. /
The file should contain all mandatory commands to deploy your app in production.
For example:
```bahs
npm install
npm run build
mv dist /var/www/my_awesome_app
```

# Usage
```javascript
const  deployer  =  require('@arseniosiani/github-webhook-deployer');

deployer.on('start', function(repo_info){
    console.log("Started deploy for "+ repo_info.repository.name);
})

deployer.on('all_done', function(repo_name){
    console.log("Finished deploy for "+ repo_name);
})

deployer.listen(5000,'0.0.0.0')
```
# Events
| Event    | Description   |  Params |
|----------|:--------------|-------|
| ```invoked``` |Emitted on webhook invocation| ```repo_info```: the whole data from [webhook body](https://developer.github.com/webhooks/) |
| ```start_deploy``` |Emittend when the deploy process stars| ```repo_name```: the repository name|
| ```start_clone``` | emitted when the ```git clone``` process starts | ```repo_name```: the repository name|
| ```clone_done``` | emitted when the ```git clone``` process has finised | ```repo_name```: the repository name|
| ```start_deploy_script``` | emitted when the ```./deploy.sh``` process has fired | ```repo_name```: the repository name|
| ```deploy_script_done``` | emitted when the ```./deploy.sh``` process has dinished | ```repo_name```: the repository name|
| ```data``` | emitted when new output (stdin or stderr) is available  | ```data```: the output of the script|
| ```all_done``` | emitted when everithing as gone well  |```repo_name```: the repository name|
| ```error``` | emitted when error occurried  |```err```: the error object|