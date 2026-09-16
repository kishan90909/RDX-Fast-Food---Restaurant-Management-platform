import { spawn } from 'node:child_process'

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const children = []

function start(label, args, cwd) {
  const child = spawn(npm, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' })
  child.on('error', (error) => console.error(`[${label}] failed to start: ${error.message}`))
  child.on('exit', (code, signal) => {
    if (!shuttingDown && code && code !== 0) {
      console.error(`[${label}] exited with code ${code}${signal ? ` (${signal})` : ''}`)
      shutdown(code)
    }
  })
  children.push(child)
}

let shuttingDown = false
function shutdown(code = 0) {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM')
  }
  setTimeout(() => process.exit(code), 250)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

const cwd = process.cwd()
start('frontend', ['run', 'dev'], cwd)
start('backend', ['--prefix', 'Backend', 'run', 'dev'], cwd)
