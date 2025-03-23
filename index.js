#!/usr/bin/env node
import inquirer from 'inquirer'
import shell from 'shelljs'
import chalk from 'chalk'
import fs from 'fs'

/**
 * This script initializes an Angular project with optional routing and styling options.
 * It uses Inquirer for user prompts, ShellJS for command execution, and Chalk for colored output.
 */
(async () => {
  let projectName = process.argv[3]

  if (!projectName) {
    const answer = await inquirer.prompt([
      { type: 'input', name: 'projectName', message: 'Enter project name:' }
    ])
    projectName = answer.projectName
  }

  const answers = await inquirer.prompt([
    { type: 'confirm', name: 'enableRouting', message: 'Enable Routing?', default: true },
    {
      type: 'list',
      name: 'style',
      message: 'Choose a stylesheet format:',
      choices: ['CSS', 'SCSS', 'SASS', 'LESS'],
      default: 'SCSS'
    },
    {
      type: 'checkbox',
      name: 'frameworks',
      message: 'Select frameworks to install:',
      choices: ['Angular Material', 'Tailwind CSS', 'Bootstrap', 'NgRx']
    }
  ])

  console.log(chalk.green(`\nCreating project: ${projectName}...\n`))
  shell.exec(`ng new ${projectName} --routing=${answers.enableRouting} --style=${answers.style.toLowerCase()}`, { silent: false })

  shell.cd(projectName)

  if (answers.frameworks.includes('Angular Material')) {
    console.log(chalk.yellow('\nInstalling Angular Material...\n'))
    shell.exec(`ng add @angular/material --skip-confirmation`, { silent: false })
  }

  if (answers.frameworks.includes('Tailwind CSS')) {
    console.log(chalk.yellow('\nInstalling Tailwind CSS...'))
    shell.exec('npm install -D tailwindcss postcss autoprefixer')
    shell.exec('npx tailwindcss init -p')

    const tailwindConfigPath = 'tailwind.config.js'
    let tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf8')
    tailwindConfig = tailwindConfig.replace(
      'content: [],',
      `content: ["./src/**/*.{html,ts}"],`
    )
    fs.writeFileSync(tailwindConfigPath, tailwindConfig)
    console.log(chalk.blue('Updating tailwind.config.js with Angular content paths & styles file.'))

    const stylesPath = `src/styles.${answers.style.toLowerCase()}`
    shell.ShellString(`\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`).toEnd(stylesPath)
  }

  if (answers.frameworks.includes('Bootstrap')) {
    console.log(chalk.yellow('\nInstalling Bootstrap...'))
    shell.exec('npm install bootstrap')
    shell.ShellString(`\n@import 'bootstrap/dist/css/bootstrap.min.css';\n`).toEnd(`src/styles.${answers.style.toLowerCase()}`)
  }

  if (answers.frameworks.includes('NgRx')) {
    console.log(chalk.yellow('\nInstalling NgRx Store...\n'))
    shell.exec(`ng add @ngrx/store --skip-confirmation`, { silent: false })
  }

  console.log(chalk.green('\nSetup Complete! Run your project with:'))
  console.log(chalk.cyan(`\tcd ${projectName} && ng serve --open\n`))
})();

