Install / Quickstart for Dockershelf.

Prerequisites: Docker installed locally with permission to pull and run images.

Pull and run:

```
docker pull dockershelf/python:3.13-stable
docker run -it dockershelf/python:3.13-stable bash
```

Use as a base image:

```
FROM dockershelf/debian:bookworm
```

Build locally from source: clone https://github.com/Dockershelf/dockershelf and run `bash build-image.sh <image>` (example: `dockershelf/node:22-bookworm`).
