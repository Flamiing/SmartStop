import { promises as fs } from 'node:fs'
import { promptUser } from './../src/utils/getUserPreferences.js'

// Path to the settings file
const SETTINGS_FILE_PATH = '/etc/smart-stop/settings.json'

// Path to the log in case of error
const LOG_FILE_PATH = '/var/log/Smart\ Stop'

const VALID_DISTROS = ["Ubuntu", "Debian", "kali-linux", "Ubuntu-16.04", "Ubuntu-18.04", "Ubuntu-20.04"]

// Class to control the settings
export class Settings {
  static userSettings = {
    linuxDistro: null,
    codeEditor: null,
    winTerminal: false
  }

  // TODO: Need to implement a way in which if the file exists but has wrong settings or anything missing you can change just that

  static async setup() {
    try {
      const getSettingsStatus = await this.#_getSettings()
      if (getSettingsStatus.status === true) {
        return { status: true }
      } else if (!getSettingsStatus.status && getSettingsStatus.code === 'ENOENT') {
        const createSettingsStatus = await this.#_createSettings()
        return { status: createSettingsStatus }
      } else {
        return { status: false }
      }
    } catch (e) {
      return { status: false }
    }
  }

  static setSetting({ key, value }) {
    this.userSettings[key] = value
  }

  static getAllSettings() {
    return this.userSettings
  }

  static async #_getSettings() {
    try {
      const data = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8')
      this.userSettings = data
      return { status: true }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.error('Error: reading settings file failed')
        console.error(err)
      }
      return { status: false, code: err.code }
    }
  }

  static async #_createSettings() {
    this.userSettings = await promptUser()
    console.error('TODO: CREATE SETTINGS')
  }
}