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
      } else if (getSettingsStatus.invalidSettings
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
    const validation = {
      status: false,
      invalidSettings: false,
      settings: {
        linuxDistro: true,
        codeEditor: true,
        winTerminal: true,
        all: false
      }
    }

    if (!settings || (!settings.hasOwnProperty('linuxDistro')
      && !settings.hasOwnProperty('codeEditor')
      && !settings.hasOwnProperty('winTerminal'))) {
      validation.settings.all = true
      validation.invalidSettings = true
      return validation
    } 
    if (!settings.hasOwnProperty('linuxDistro')
      || !VALID_DISTROS.includes(settings.linuxDistro)) {
      this.userSettings.linuxDistro = settings.codeEditor
      this.userSettings.winTerminal = settings.winTerminal
      validation.settings.linuxDistro = false
      validation.invalidSettings = true
    }
    if (!settings.hasOwnProperty('codeEditor')) {
      this.userSettings.linuxDistro = settings.linuxDistro
      this.userSettings.winTerminal = settings.winTerminal
      validation.settings.codeEditor = false
      validation.invalidSettings = true
    }
    if (!settings.hasOwnProperty('winTerminal')) {
      this.userSettings.linuxDistro = settings.linuxDistro
      this.userSettings.codeEditor = settings.codeEditor
      validation.settings.winTerminal = false
      validation.invalidSettings = true
    }
    if (!validation.invalidSettings) {
      this.userSettings = settings
      return { status: true }
    }
    return validation
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
      return { 
        status: false,
        code: err.code,
        noSettingsFound: true
      }
    }
  }

  static async #_createSettings({ status }) {
    if (status.noSettingsFound || status.settings.all) {
      this.userSettings = await promptUser({
        linuxDistro: false,
        codeEditor: false,
        winTerminal: false
      })
    } else {
      const newSettings = await promptUser({
        linuxDistro: status.settings.linuxDistro,
        codeEditor: status.settings.codeEditor,
        winTerminal: status.settings.winTerminal
      })
      if (!status.settings.linuxDistro) {
        this.userSettings.linuxDistro = newSettings.linuxDistro
      }
      if (!status.settings.codeEditor) {
        this.userSettings.codeEditor = newSettings.codeEditor
      }
      if (!status.settings.winTerminal) {
        this.userSettings.winTerminal = newSettings.winTerminal
      }
    }

    console.log('New Settings:', this.userSettings)
    console.error('TODO: CREATE SETTINGS FILE')
  }
}