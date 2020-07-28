FROM node:12-slim

ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf curl \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && chmod +x /tini

# Install puppeteer so it's available in the container.
WORKDIR /app
COPY index.js /app/index.js
COPY libs /app/libs
COPY cert /app/cert
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install --production \
    && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
USER pptruser

ENTRYPOINT ["/tini"]
