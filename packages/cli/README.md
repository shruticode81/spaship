# SPAship CLI

A command line interface for SPAship.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@spaship/cli.svg)](https://npmjs.org/package/@spaship/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@spaship/cli.svg)](https://npmjs.org/package/@spaship/cli)
[![License](https://img.shields.io/npm/l/@spaship/cli.svg)](https://github.com/spaship/cli/blob/master/package.json)

<!-- toc -->

- [SPAship CLI](#spaship-cli)
- [Usage](#usage)
- [Commands](#commands)
- [Writing tests](#writing-tests)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g spashiptest
$ spaship COMMAND
running command...
$ spaship (-v|--version|version)
spashiptest/1.1.0 linux-x64 node-v14.18.2
$ spaship help [COMMAND]
USAGE
  $ spaship COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->
<!-- * [`spaship deploy [ARCHIVE]`](#spaship-deploy-archive) -->

- [`spaship help [COMMAND]`](#spaship-help-command)
- [`spaship init`](#spaship-init)
- [`spaship login`](#spaship-login)
- [`spaship pack`](#spaship-pack)
- [`spaship upload`](#spaship-upload)

<!-- ## `spaship deploy [ARCHIVE]`

deploy to a SPAship host

```
USAGE
  $ spaship deploy [ARCHIVE]

ARGUMENTS
  ARCHIVE  An archive (zip, tarball, or bzip2) file containing SPA static assets and a spaship.yaml file. You can omit
           this if you specify the build artifact path as `buildDir` in the spaship.yaml file.

OPTIONS
  -b, --builddir=builddir  path of your SPAs artifact. Defaults to 'buildDir' if specified in the spaship.yaml.

  -e, --env=env            [default: default] either the name of a SPAship environment as defined in your .spashiprc.yml
                           file, or a URL to a SPAship environment

  -p, --path=path          a custom URL path for your app under the SPAship domain. Defaults to the 'path' in your
                           spaship.yaml. ex: /my/app

  -r, --ref=ref            [default: undefined] a version tag, commit hash, or branch to identify this release

  --apikey=apikey          a SPAship API key

DESCRIPTION
  Send an archive containing a SPA to a SPAship host for deployment.  Supports .tar.gz/.tgz, .zip, and .tar.bz2.

EXAMPLES
  $ npm pack && spaship deploy your-app-1.0.0.tgz # deploying an archive created with npm pack
  $ spaship deploy # deploying a buildDir directory
```

_See code: [src/commands/deploy.js](https://github.com/shruticode81/spaship/blob/v1.1.0/src/commands/deploy.js)_ -->

## `spaship help [COMMAND]`

display help for spaship

```
USAGE
  $ spaship help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.3.1/src/commands/help.ts)_

## `spaship login`

Authenticate and Authorize users inorder to deploy SPA

```
USAGE
  $ spaship login

OPTIONS
  -s, --server=server  orchestrator-base-url it is responsible for uploading file from cli
  -t, --token=token    jwt token for authentication

DESCRIPTION
  user access token && server url is saved inside session file(.spashipsessionrc.yaml) .
  spaship login command can be copied from web-ui.

EXAMPLES
  $ spaship login --token=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiS
  --server=http://dev.api.apps.int.spoke.preprod.us-west-2.aws.paas.redhat.com
  Here server refer to api Base-URL && token refer to jwt access token for authorization
  $ spaship login
  It will prompt for token and server value
```

_See code: [src/commands/login.js](https://github.com/shruticode81/spaship/blob/v1.1.0/src/commands/login.js)_

## `spaship init`

Initialize a SPAship config file for your app.

```
USAGE
  $ spaship init

OPTIONS
  -b, --builddir=builddir  path of your SPAs artifact. Defaults to 'buildDir' if specified in the spaship.yaml.
  -d, --dist=dist          the URL path for dist folder
  -m, --file=file          the URL path for .spaship file

DESCRIPTION
  Without arguments, init will ask you a few questions and generate a .spaship config file and save the path of .spaship inside session file

EXAMPLES
  $ spaship init --file=/home/shranand/Documents/one-platform/packages/home-spa
  --dist=/home/shranand/Documents/one-platform/packages/home-spa/dist
  $ spaship init --builddir=build
```

_See code: [src/commands/init.js](https://github.com/shruticode81/spaship/blob/v1.1.0/src/commands/init.js)_

## `spaship pack`

pack the distribution folder

```
USAGE
  $ spaship pack

DESCRIPTION
  create and save the zip file of distribution folder which is consist of SPA content inside tmp.

EXAMPLE
  $ spaship pack
```

_See code: [src/commands/pack.js](https://github.com/shruticode81/spaship/blob/v1.1.0/src/commands/pack.js)_

## `spaship upload`

deploy to a SPAship host

```
USAGE
  $ spaship upload

DESCRIPTION
Send zip file containing a SPA to a SPAship host for deployment.

EXAMPLE
  $ spaship upload your-app-1.0.0.zip #here your-app-1.0.0.zip refer to zip created by pack command
  $spaship upload # will prompt to enter your-app-1.0.0.zip
  If no your-app-1.0.0.zip is provided it will zip and upload it.
```

_See code: [src/commands/upload.js](https://github.com/shruticode81/spaship/blob/v1.1.0/src/commands/upload.js)_

<!-- commandsstop -->

<!-- # spashiprc & SPAship environments

_(As a rule of thumb, spaship.yaml files are consumed by the SPAship API, whereas spashiprc files are consumed by the CLI)_

spashiprc files provide an alternative to typing out `--apikey KEY` and `--env URL` every time you run `spaship` commands. You can use a spashiprc file to define an environment name (like `qa`) along with its URL and API key, after which you can run `spaship deploy --env qa`. The URL and API key will be read from your spashiprc file.

**Do not commit API keys to your project's version control**. If you do, _I'll know_. See [spashiprc layering](#spashiprc-layering) for how to avoid committing API keys.

spashiprc files are optional, but very convenient if you plan to do deployments from your dev environment. If your deployments are done by a CI/CD server, you probably don't need a spashiprc file and will be better off using `--env URL` and `--apikey KEY`.

## spashiprc layering

To separate environment URLs from API keys, you can "layer" two spashiprc files together. After the `spaship` command finds a spashiprc file, it continues searching parent directories for other spashiprc files. If any secondary spashiprc files are found, their values are merged together. If there are conflicting values, the values from the child directory (nearer to your project) will win.

This allows you to put a spashiprc file containing your SPAship URLs in your project's source control, and a secondary spashiprc file containing API keys in a parent directory, _not_ in your project's source control.

For an example, see [spashiprc-layering-example](#spashiprc-layering-example).

## spashiprc examples

### spashiprc with default environment

This spashiprc file defines a `default` environment which will be used whenever `--env` is not provided.

**.spashiprc.yml**

```yaml
envs:
  default:
    url: https://localhost:8008
    apikey: 57d5c061-9a02-40fc-a3e4-1eb3c9ae6a12
```

Now when you run `spaship` commands, the `--env` flag is optional. When it's omitted, the default environment will be used.

```sh
spaship deploy MyProject-1.0.0.tgz
```

### spashiprc layering example

**\$HOME/.spashiprc.yml**

```yaml
envs:
  qa:
    apikey: 57d5c061-9a02-40fc-a3e4-1eb3c9ae6a12
  prod:
    apikey: 70f19422-bf53-44b1-b664-f9b4636bea61
```

**\$HOME/projects/MyProject/.spashiprc.yml**

```yaml
envs:
  qa:
    url: https://qa.spaship.io
  prod:
    url: https://spaship.io
```

When you run `spaship` commands from within `$HOME/projects/MyProject`, _both_ of the above spashiprc files will be loaded and merged together, forming a complete definition of URL+API key for each environment.

Such as:

```sh
cd $HOME/projects/MyProject
spaship deploy --env prod MyProject-1.0.0.tgz
``` -->

# Writing tests

Tests are written using oclif's testing tools. See [oclif's testing documentation](https://oclif.io/docs/testing) for more.
