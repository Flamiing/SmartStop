import { promises as fs } from 'node:fs'
import { promptUser, VALID_DISTROS } from './../src/utils/getUserPreferences.js'

// Path to the settings file
const SETTINGS_FILE_PATH = '/etc/Smart\ Stop/settings.json'

// Path to the log in case of error
const LOG_FILE_PATH = '/var/log/Smart\ Stop'

// Class to control the settings
export class Settings {
  static userSettings = {
    linuxDistro: null,
    codeEditor: null,
    winTerminal: false
  }

  // TODO: A log when any error is found

  static async setup() {
    try {
      const getSettingsStatus = await this.#_getSettings()
      if (getSettingsStatus.status === true) {
        return { status: true }
      } else if (getSettingsStatus.missing
                || (!getSettingsStatus.status
                && getSettingsStatus.code === 'ENOENT')) {
        const createSettingsStatus = await this.#_createSettings({ status: getSettingsStatus })
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

  static #_validateSettings({ settings }) {
    if (!settings || (!settings.hasOwnProperty('linuxDistro')
      && !settings.hasOwnProperty('codeEditor')
      && !settings.hasOwnProperty('winTerminal'))) {
      return { status: false, missing: "all" }
    } else if (!settings.hasOwnProperty('linuxDistro')
      || !VALID_DISTROS.includes(settings.linuxDistro)) {
      this.userSettings.codeEditor = settings.codeEditor
      this.userSettings.winTerminal = settings.winTerminal
      return { status: false, missing: "linuxDistro" }
    } else if (!settings.hasOwnProperty('codeEditor')) {
      this.userSettings.linuxDistro = settings.linuxDistro
      this.userSettings.winTerminal = settings.winTerminal
      return { status: false, missing: "codeEditor" }
    } else if (!settings.hasOwnProperty('winTerminal')) {
      this.userSettings.linuxDistro = settings.linuxDistro
      this.userSettings.codeEditor = settings.codeEditor
      return { status: false, missing: "winTerminal" }
    }
    this.userSettings = settings
    return { status: true }
  }

  static async #_getSettings() {
    try {
      const data = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8')
      return this.#_validateSettings({ settings: JSON.parse(data) })
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.error('Error: reading settings file failed')
        console.error(err)
      }
      return { status: false, code: err.code }
    }
  }

  static async #_createSettings({ status }) {
    let newSettings

    switch (status.missing) {
      case 'linuxDistro':
        newSettings = await promptUser({ linuxDistro: false })
        this.userSettings.linuxDistro = newSettings.linuxDistro
        break
      case 'codeEditor':
        newSettings = await promptUser({ codeEditor: false })
        this.userSettings.codeEditor = newSettings.codeEditor
        break
      case 'winTerminal':
        newSettings = await promptUser({ winTerminal: false })
        this.userSettings.winTerminal = newSettings.winTerminal
        break
      default:
        this.userSettings = await promptUser({
          linuxDistro: false,
          codeEditor: false, 
          winTerminal: false
        })
    }
    console.log('New Settings:', this.userSettings)
    console.error('TODO: CREATE SETTINGS FILE')
  }
}