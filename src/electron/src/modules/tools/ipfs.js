import IpfsCtl from 'ipfsd-ctl'
// import toStream from 'it-to-stream'
// import all from 'it-all'
import fs from 'fs-extra'
import OrbitDB from 'orbit-db'
import scouter from 'port-scout'
import { getIpfsPath } from './paths'
import { settings } from '../settings'

const logger = require('@dreamnet/logplease').create('electron:modules:tools:ipfs')

class IPFS {
  /**
   * @type {IpfsCtl.Controller}
   */
  node

  /**
   * @type {OrbitDB}
   */
  orbitdb

  db

  async init() {
    const ipfsBin = require('go-ipfs').path().replace('app.asar', 'app.asar.unpacked')
    const ipfsRepo = getIpfsPath()
    const apiPort = await scouter.range(5001)
    const swarmPort = await scouter.range(apiPort + 1)

    logger.debug('Creating node...')
    logger.debug(`API: ${apiPort} - Swarm: ${swarmPort}`)
    logger.debug(`Bin: ${ipfsBin}`)
    logger.debug(`Repo: ${ipfsRepo}`)

    fs.ensureDirSync(ipfsRepo)

    this.node = await IpfsCtl.createController({
      remote: false,
      disposable: false,
      ipfsHttpModule: require('ipfs-http-client'),
      ipfsBin,
      args: ['--enable-pubsub-experiment'],
      ipfsOptions: {
        repo: ipfsRepo,
        config: {
          Addresses: {
            API: `/ip4/127.0.0.1/tcp/${apiPort}`,
            Gateway: null,
            Swarm: [
              `/ip4/0.0.0.0/tcp/${swarmPort}`,
              `/ip6/::/tcp/${swarmPort}`,
              `/ip4/0.0.0.0/udp/${swarmPort}/quic`,
              `/ip6/::/udp/${swarmPort}/quic`,
            ],
          },
        },
      },
    })

    settings.on('change', (payload) => {
      if (payload.community.enabled) {
        this.start()
      } else {
        this.stop()
      }
    })

    if (settings.community.enabled) {
      this.start()
    }
  }

  async start() {
    if (this.node.started) {
      return
    }

    logger.info('Starting...')

    if (!fs.existsSync(getIpfsPath('repo.lock'))) {
      // Always make sure to delete this file.
      fs.removeSync(getIpfsPath('api'))
    }

    await this.node.init()

    await this.node.start()

    await this.connectMasterNodes()

    await this.startDatabase()
  }

  async stop() {
    if (this.node.started) {
      await this.node.stop()
    }

    if (this.orbitdb) {
      await this.orbitdb.stop()
      this.orbitdb = undefined
    }

    fs.removeSync(getIpfsPath('api'))
  }

  async startDatabase() {
    this.orbitdb = await OrbitDB.createInstance(this.node.api, {
      directory: getIpfsPath('orbitdb'),
    })

    if (process.env.DREAMTIME_COMMUNITY_INIT) {
      logger.info(await this.orbitdb.create('dreamtime.photos', 'feed', {
        accessController: { write: ['*'] },
        overwrite: true,
      }))

      return
    }

    this.db = await this.orbitdb.open('/orbitdb/zdpuAxdH9Jr9jyNUeBUQHz3K9Ry3sgkBwUSFjRsUyrGcYJcwP/dreamtime.photos', { type: 'feed' })

    await this.db.load()
  }

  async connectMasterNodes() {
    logger.info('Connecting to master nodes...')

    try {
      await this.node.api.swarm.connect('/dns4/mariana.dreamnet.tech/tcp/4001/p2p/QmcWoy1FzBicbYuopNT2rT6EDQSBDfco1TxibEyYgWbiMq')
    } catch (err) {
      logger.warn(err)
    }

    logger.info('Connected!')
  }
}

export const ipfs = new IPFS()
