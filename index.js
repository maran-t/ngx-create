#!/usr/bin/env node
import inquirer from 'inquirer'
import shell from 'shelljs'
import chalk from 'chalk'
import fs from 'fs'
import {spawn} from 'child_process';

shell.env.FORCE_COLOR = '1';

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

function getAngularVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const angularCoreVersion = packageJson.dependencies['@angular/core'] || packageJson.devDependencies['@angular/core'];
    return angularCoreVersion ? angularCoreVersion.replace('^', '').split('.')[0] : null;
  } catch (error) {
    console.error(chalk.red('Error reading Angular version:', error));
    return null;
  }
}

/**
 * This script initializes an Angular project with optional routing and styling options.
 * It uses Inquirer for user prompts, ShellJS for command execution, and Chalk for colored output.
 */
(async () => {
  console.log('Welcome to ng-create v2.0.')
  console.log("For more information, kindly visit: " + chalk.cyan.underline(`https://www.npmjs.com/package/ngx-create\n`))

  let projectName = process.argv[3]

  if (!projectName) {
    const answer = await inquirer.prompt([
      { type: 'input', name: 'projectName', message: 'Enter project name:' }
    ])
    projectName = answer.projectName
  }

  console.log(chalk.bold.cyan(`Initializing project: ${projectName}..\n`))

  await new Promise((resolve) => {
    const process = spawn(npxCmd, ['ng', 'new', projectName], { stdio: 'inherit', shell: true });
    process.on('close', () => {
      resolve();
    });
  });

  shell.cd(projectName)

  const angularVersion = getAngularVersion();

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'frameworks',
      loop: false,
      message: chalk.bold.white('Select frameworks to install!'),
      choices: ['Angular Material', 'Tailwind CSS', 'Bootstrap', 'NgRx']
    }
  ])

  if (answers.frameworks.includes('Angular Material')) {
    console.log(chalk.yellow('\nInstalling Angular Material...\n'))
    await new Promise((resolve) => {
      const process = spawn(npxCmd, ['ng', 'add', '@angular/material'], { stdio: 'inherit', shell: true });
      process.on('close', () => {
        resolve();
      });
    });
  }

  const stylesFile = shell.ls("src/styles.*")[0];

  if (answers.frameworks.includes('Tailwind CSS')) {
    console.log(chalk.yellow('\nInstalling Tailwind CSS...'))

    const tailwindPackages = (angularVersion && parseInt(angularVersion) >= 18)
        ? ['tailwindcss', '@tailwindcss/postcss', 'postcss']
        : ['tailwindcss', 'postcss', 'autoprefixer'];

    await new Promise((resolve) => {
      const process = spawn(npxCmd, ['npm', 'install', '-D', ...tailwindPackages], { stdio: 'inherit', shell: true });
      process.on('close', () => {
        resolve();
      });
    });

    shell.ShellString(`\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`).toEnd(stylesFile)
    console.log(chalk.white('Updated Tailwind CSS config file: tailwind.config.js, styles.css'))
  }

  if (answers.frameworks.includes('Bootstrap')) {
    console.log(chalk.yellow('\nInstalling Bootstrap...'))
    shell.exec(`npm install bootstrap`, { stdio: 'inherit' })
    shell.ShellString(`\n@import 'bootstrap/dist/css/bootstrap.min.css';\n`).toEnd(stylesFile)
  }

  if (answers.frameworks.includes('NgRx')) {
    console.log(chalk.yellow('\nInstalling NgRx Store...\n'))
    shell.exec(`ng add @ngrx/store --skip-confirmation`, { stdio: 'inherit', shell: true });
  }

  if (answers.frameworks.length > 0) {
    console.log(chalk.green('\n✨ Setup Complete! All selected frameworks have been installed successfully.'));
  } else {
    console.log(chalk.green('\n✨ Setup Complete!'));
  }

  console.log(chalk.green('🚀 You can now start your project by running,\n'));
  console.log(chalk.cyan(`    cd ${projectName} && ng serve --open\n`))

})();

