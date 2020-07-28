# QuicTransport-test
test repository of QuicTransport (Includes WebTransport and WebCodecs, maybe)

## how to try demo app

platform: Ubuntu18.0.4

### setup

* install python3.7

```bash
$ sudo apt-get update
$ sudo apt-get install -y build-essential checkinstall libreadline-gplv2-dev \
       libncursesw5-dev libssl-dev libsqlite3-dev tk-dev libgdbm-dev libc6-dev \
       libbz2-dev zlib1g-dev openssl libffi-dev python3-dev python3-setuptools \
       wget
$ wget https://www.python.org/ftp/python/3.7.0/Python-3.7.0.tar.xz
$ tar xvf Python-3.7.0.tar.xz
$ cd Python-3.7.0/
$ ./configure
$ sudo make altinstall
$ sudo update-alternatives --install /usr/bin/python python /usr/local/bin/python3.7 3
$ sudo update-alternatives --config python
$ python --version
$ sudo pip3.7 install aioquic
```

* setup certificate

> note : self-signed certification is already included in this repo, though.

```bash
$ cd ./cert
$ openssl x509 -pubkey -noout -in certificate.pem | \
    openssl rsa -pubin -outform der | \
    openssl dgst -sha256 -binary | base64
$ openssl x509 -pubkey -noout -in certificate.pem | \
    openssl rsa -pubin -outform der | \
    openssl dgst -sha256 -binary | base64 > fingerprints.txt
```

* install dev

download and install `google-chrome-unstable`
https://www.google.com/intl/ja/chrome/dev/



### run simple QuicTransport server locally

> note: This server is little tweaked script from [quic_transport_server.py](./getting-started.md).

```bash
$ cd samples/server
$ python3.7 simple-server.py ../../certificate.pem ../../certificate.key
```

Server will start listening on port 4433/udp.

### run http server

> note : We are assuming that [serve](https://www.npmjs.com/package/serve) is already installed on your machine.
> This app is little tweaked files from [client.html](./getting-started.md) etc.

```bash
$ cd samples/app
$ serve
```

HTTP server will run on port `5000`. (We assume this port number will be used)

### run puppeteer

> note: by using puppeteer, you can skip additional configuration for chrome

```
$ cd samples/chromium
$ npm start
```

#### how to use

1. click 'Connect'
2. you will periodical message of `timestamp`
3. input text in textbox, then click 'Send data'
4. you will see message length
5. if you send `bye` message with datagram, connection will be closed.
