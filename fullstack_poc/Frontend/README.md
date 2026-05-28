# Kofuku Forum Web

This repository is a built for Kofuku web application

### Built with:

- ⚡️ Next.js 13
- ⚛️ React 18
- ✨ TypeScript
- 💨 Tailwind CSS
- 📏 ESLint — Find and fix problems in your code, also will **auto sort** your imports
- 🐶 Husky & Lint Staged — Run scripts on your staged files before they are committed

Note: it is HIGHLY recommended that you use Visual Studio Code (https://code.visualstudio.com/), as it is generally considered the best editor for writing TypeScript.

## Prerequisites:

We are using **yarn** as the package manager. (https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)
Make sure your are using the latest version of yarn version 1.22.19
`yarn -v`

## Developer Notes:

- Use `yarn` to install the packages `yarn install`
- Install type dependencies using dev flag ex. `yarn add <dev_dependencies> --dev `
- Make sure you have all the mandatory extenstion installed ( Ref: .vscode )
- Set the default formatter to Prettier EsLint
- After wrapping up the changes before doing a commit run `yarn run lint:fix`
- If any error or warning is encountered, fix those before doing a commit
- Avoid ignoring the EsLint rules
- Always pull the latest "development" branch before moving to new branch
- Follow the standart branch name practices
  - If its a new feature, prefix the branch name with "feat/{featureName}"
  - If its a bug fix, prefix the branch name with "fix/{bugName}"
- Make sure you commit message is short and precise
- When raise a PR, attach the Ticket Number & Ticket link in the description
- Always raise PR to development branch

## Clone Kofuku frontend repository:

`git clone git@github.com:Kofuku-Technologies/Frontend.git`

`cd Frontend`

`yarn install`

## Running the server:

Run `yarn dev` in your terminal. Navigate to <http://localhost:3000/> in your browser to see the development webpage.
