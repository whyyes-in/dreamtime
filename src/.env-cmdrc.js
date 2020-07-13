const development = {
  "LOG": "debug",
  "DEVTOOLS": true,
}

module.exports = {
  "default": {
    "SERVER_HOST": "localhost",
    "SERVER_PORT": 4000
  },
  "development": {
    "NODE_ENV": "development",
    "ROLLBAR_ACCESS_TOKEN": "e62c909ec771492fa7f371dc61eea092",
    "LOGROCKET_ACCESS_TOKEN": "5iqym0/dreamtime-development",
    "DREAMTRACK_HOST": "localhost:3333",
    ...development
  },
  "production": {
    "NODE_ENV": "production",
    "DREAMTRACK_HOST": "track.dreamnet.tech"
  },
  "test": {
    "NODE_ENV": "test",
  },
  "preview": {
    ...development
  }
}
