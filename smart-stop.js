// | SMART STOP |
// Developed by: https://github.com/Flamiing
// This program lets the user close WSL by just typing 'smart-stop' in the Linux Terminal
// If needed or wanted there are several options that can be modified with parameters so that the programs suits your needs
// For more info please visit: https://github.com/Flamiing/SmartStop#readme

import { Settings } from './src/Settings.js'

async function main() {
  const settingsStatus = await Settings.setup()
  if (!settingsStatus.status) return 1

}

await main()