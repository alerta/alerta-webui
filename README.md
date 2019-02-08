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
API server is located, using either an environment variable:

    $ export VUE_APP_ALERTA_ENDPOINT=https://alerta-api.example.com

or a `config.json` configuration file in the `dist` directory.

    {
        "endpoint": "https://alerta-api.example.com"
    }

Any setting from the API server can be overridden if included in
the local `config.json` file. For a full list of supported settings
see the web UI config settings in the [online docs][1].

[1]: https://docs.alerta.io/en/latest/webui.html#configuration-from-api-server

As a special case, support for setting an OAuth Client ID using an
environment variable is possible but should not be be necessary for
most deployments.

    $ export VUE_APP_CLIENT_ID=0ffe5d26-6c66-4871-a6fa-593d9fa972b1

Deployment
----------

During the beta phase a docker container is available to download and
test the new web UI. It can be built locally using the `Dockerfile` in
this repository 

    $ docker build -t alerta/alerta-beta .
    $ docker run -e VUE_APP_ALERTA_ENDPOINT=https://alerta-api.example.com \
      -it -p 8000:80 --rm --name alerta-beta alerta/alerta-beta

or the container can be downloaded from Docker Hub.

    $ docker pull alerta/alerta-beta

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
