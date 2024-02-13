import rl from 'node:readline'

const VALID_DISTROS = ["Ubuntu", "Debian", "kali-linux", "Ubuntu-16.04", "Ubuntu-18.04", "Ubuntu-20.04"]

let userSettings = {
  linuxDistro: "",
  codeEditor: null,
  winTerminal: false
}

const readline = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function getDistro() {
  while (true) {
    const distro = await askQuestion(`Choose your Linux Distro from the list:
["Ubuntu", "Debian", "kali-linux", "Ubuntu-16.04", "Ubuntu-18.04", "Ubuntu-20.04"]`)

    if (VALID_DISTROS.includes(distro)) {
      return distro
    } else {
      process.stdout.write('\x1B[2J\x1B[H')
      console.log('HINT: Your chosen distro must be written exactly like in the list.')
    }
  }
}

async function getCodeEditor() {
  // TODO: Add link to explanation of where to find the name of the code editor
  const editor = await askQuestion(`IMPORTANT:
If you use WSL within your code editor, we need to also kill the code editor process.
In order to do this you need to go to 'Task Manager', go to 'Details' and find your
code editor's process name. Finally input it into the terminal.`)

  return editor
}

async function getWinTerminal() {
  while (true) {
    const terminal = await askQuestion(`IMPORTANT:
If you use Windows Terminal it must be closed too.
Please indicate with 'true' if you use it and 'false' if you don't.`)

    if (terminal.toLowerCase() === 'true'
      || terminal.toLowerCase() === 'false') {
      return terminal.toLowerCase() === 'true' ? true : false
    } else {
      process.stdout.write('\x1B[2J\x1B[H')
    }
  }
}

export async function promptUser(distro=true, codeEditor=true, winTerminal=true) {
  console.log(`ATENTION:\nConfig file needs to be created.
Next we are going to ask you for your preferences.
--------------------------------------------------`)


  if (distro) {
    userSettings.linuxDistro = await getDistro()
  }
  if (codeEditor) {
    userSettings.codeEditor = await getCodeEditor()
  }
  if (winTerminal) {
    userSettings.winTerminal = await getWinTerminal()
  }

  readline.close();
  return userSettings
}

function askQuestion(question) {
  return new Promise(resolve => {
    readline.question(`${question}\n---> `, answer => {
      resolve(answer.trim());
    });
  });
}

