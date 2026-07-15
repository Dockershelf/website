FROM dockershelf/node:22
LABEL maintainer="Luis Alejandro Martínez Faneyth <luis@luisalejandro.org>"

ARG UID=1000
ARG GID=1000

RUN apt-get update && \
    apt-get install -y gnupg dirmngr sudo && \
    rm -rf /var/lib/apt/lists/*

RUN EXISTUSER=$(getent passwd | awk -F':' '$3 == '$UID' {print $1}') && \
    [ -n "${EXISTUSER}" ] && userdel ${EXISTUSER} || true

RUN EXISTGROUP=$(getent group | awk -F':' '$3 == '$GID' {print $1}') && \
    [ -n "${EXISTGROUP}" ] && groupdel ${EXISTGROUP} || true

RUN groupadd -g "${GID}" app || true
RUN useradd -u "${UID}" -g "${GID}" -ms /bin/bash app
RUN echo "app ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/app

USER app

RUN mkdir -p \
    /home/app/app \
    /home/app/.npm

WORKDIR /home/app/app

CMD ["tail", "-f", "/dev/null"]
