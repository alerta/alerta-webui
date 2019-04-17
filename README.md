beta.alerta.io
==============

[![Gitter chat](https://badges.gitter.im/alerta/chat.png)](https://gitter.im/alerta/chat)

This is the repository for the next major release of the Alerta web console.

![webui](/docs/images/alerta-webui-v7-beta1.png?raw=true&v=1)

Installation
-------------

TBC 

Configuration
-------------

Most configuration will come from the Alerta API server. The minimum,
and most common, configuration is simply to tell the web UI where the
API server is located.

Environment variables for some settings can be used at build time:

    $ export VUE_APP_ALERTA_ENDPOINT=https://alerta-api.example.com
    $ npm install
    $ npm run build

or place a `config.json` configuration file in the `dist` directory:

    {
        "endpoint": "https://alerta-api.example.com"
    }

Any setting from the API server can be overridden if included in
the local `config.json` file. For a full list of supported settings
see the web UI config settings in the [online docs][1].

[1]: https://docs.alerta.io/en/latest/webui.html#configuration-from-api-server

As a special case, support for setting an OAuth Client ID using a
build-time environment variable is possible but should not be be
necessary for most deployments.

    $ export VUE_APP_CLIENT_ID=0ffe5d26-6c66-4871-a6fa-593d9fa972b1

By default, Alerta Web assumes it will be deployed at the root of a
domain, e.g. https://beta.alerta.io/. If Alerta Web is deployed at a
sub-path, it will need to specify that sub-path using the `BASE_URL`
build-time environment variable. For example, if Alerta Web is deployed
at https://beta.alerta.io/alerta/, set `BASE_URL` to `/alerta`:

    $ export BASE_URL=/alerta

The value can also be set to an empty string (`''`) or a relative path (`./`)
so that all assets are linked using relative paths. This allows the built
bundle to be deployed under any public path.

Deployment
----------

During the beta phase a docker container is available to download and
test the new web UI. It can be built locally using the `Dockerfile` in
this repository 

    $ docker build -t alerta/alerta-beta .

or the container can be downloaded from Docker Hub.

    $ docker pull alerta/alerta-beta

To run, create a `config.json` file and mount the file into the container

    $ echo '{"endpoint": "https://alerta-api.example.com"}' > config.json
    $ docker run -v "$PWD/config.json:/usr/share/nginx/html/config.json" \
      -it -p 8000:80 --rm --name alerta-beta alerta/alerta-beta

Note: Update the `CORS_ORIGINS` setting in the Alerta API server config
to include the URL that the beta web console is hosted at otherwise
the browser will throw "blocked by CORS policy" errors and not work.

Development
-----------

Project setup
```
npm install
```

Compiles and hot-reloads for development
```
npm run serve
```

Compiles and minifies for production
```
npm run build
```

Tests
-----

Run your tests
```
npm run test
```

Lints and fixes files
```
npm run lint
```

Run your end-to-end tests
```
npm run test:e2e
```

Run your unit tests
```
npm run test:unit
```

License
-------

    Alerta monitoring system and console
    Copyright 2019 Nick Satterly

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
