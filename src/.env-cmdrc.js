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
    "DREAMTRACK_HOST": "track.dreamnet.tech",
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
