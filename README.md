# AWS Secrets Query

AWS Secrets Query (in short: **asq**) is a simple CLI tool which outputs AWS Secrets Manager secrets.

## Usage

Copy `config.json.example` as `config.json` and provide the necessary configuration values.

Run `asq` and it will provide all secrets in the AWS accounts and regions defined in `config.json`.

Run `asq $searchTerm` and it will provide all secrets that contain _$searchTerm_ in their name, e.g. `asq dbrootpw`.

## Build

### Prerequisites

Install Node.js by using `nvm` ([Linux+MacOS](https://github.com/nvm-sh/nvm), [Windows](https://github.com/coreybutler/nvm-windows)) or download it from <https://nodejs.org>.

### Install Dependencies

```bash
npm install
```

## Build with pkg

```bash
npm i -g pkg
npm run pkg
```
