## Pirple NodeJS course: Homework assignment #1

### Requirements
Please create a simple "Hello World" API. Meaning:

1. It should be a RESTful JSON API that listens on a port of your choice.
2. When someone posts anything to the route /hello, you should return a welcome message, in JSON format. This message can be anything you want.

### How to test
Start the HTTP server with using either of the following commands:
```sh
node index
# OR
PORT=5000 node index
```

If you don't set a port, the default one will be `3000`.

```sh
curl http://localhost:<port>/hello
# should returns {"success":true,"message":"Hello, John Doe!","data":null}

curl -X POST http://localhost:<port>/hello/
# should returns {"success":true,"message":"Hello, John Doe!","data":null}

curl http://localhost:<port>/
# should returns {}

curl http://localhost:<port>/foo
# should returns {}
```
