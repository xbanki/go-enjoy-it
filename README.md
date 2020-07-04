# Go EnjoyIT Launch Page #

![Dependencies](https://img.shields.io/david/xbanki/go-enjoy-it?style=flat-square)
![License](https://img.shields.io/github/license/xbanki/go-enjoy-it?style=flat-square)

A simple and customizeable launcher page with a heavy focus on UI fluidity and beauty in design. Utilizes many of the current web technologies, while heavily relying on JavaScript based animations for added smoothness.

# Table of Contents #

 - [Getting Started](#getting-started)
   - [Script Reference](#script-reference)
 - [License](#license)

# Getting Started #

 - Clone this repository using Git or download as zip
 - Open your favorite shell client
 - run `cd path/to/go-enjoy-it` inside of the client
 - run `npm i` to install all of Node.js dependencies
 - run `npm run build` to build the source files in to `./build` folder
 - Navigate to the build output folder using any file explorer, opening up `index.html` in your chosen web browser

## Script Reference ##

Below you will find a table containing all of the availlable [npm](https://nodejs.org/en/) command line scripts to interact with the codebase in certain ways.

Each row inside of the table must have a command column, denoting what you actually have to run. For example, if we take the very first item in our table, we'd have to run `npm run build` .

Rows marked with `Requires run: Yes` must use `npm run {command}` syntax to execute the script. Otherwise `run` keyword can be omitted.

| Command | Requires Run | Type | Description
|---|---|---| --- |
| `build` | **Yes** | Compiling | Builds project contents once using [Webpack](https://webpack.js.org/) in development mode in to `./build/` folder.
| `build:production` | **Yes** | Compiling | Builds codebase using [Webpack](https://webpack.js.org/) in production mode, minifying the output and splitting certain parts of the code in to smaller chunks. [ **NOTE** ] Currently broken.
| `build:development` | **Yes** | Compiling | Builds project contents in watch mode using [Webpack](https://webpack.js.org/) in development mode, re-building once changes to the codebase are detected
| `lint` | **Yes** | Code Quality | Runs [ESLint](https://eslint.org/) configurations on codebase, printing any warnings or errors in to console.
| `lint:ts` | **Yes** | Code Quality | Same as above, but only running on [TypeScript](https://typescriptlang.org/) source files.
| `lint:js` | **Yes** | Code Quality | Same as above, but only running on vanilla JavaScript source files.
| `lint:fix` | **Yes** | Code Quality | Same as `npm run lint lint` , but fixes any suppored fixable rules.
| `lint:fix:ts` | **Yes** | Code Quality | Same as above, but only running on [TypeScript](https://typescriptlang.org/) source files.
| `lint:fix:js` | **Yes** | Code Quality | Same as above, but only running on vanilla JavaScript source files.

# License #

This repository is licensed under the [MIT License](./LICENSE). Copyright (C) 2020, xbanki & EnjoyIT