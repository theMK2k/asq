const {
  SecretsManagerClient,
  GetSecretValueCommand,
  ListSecretsCommand,
} = require("@aws-sdk/client-secrets-manager");
const ora = require("ora");
const cliTable = require("cli-table");

const config = require("./config.json");

const arg = process.argv.slice(2);
const searchTerm = arg[0] || "";

console.log("asq (AWS Secrets Query) v1.0.0\n");

let currentOra = null;

(async () => {
  const entries = [];

  for (const account of config.accounts) {
    currentOra = ora(`reading ${account.name}`).start();

    for (const region of account.regions) {
      currentOra.text = `reading ${account.name} ${region.region}`;

      try {
        const client = new SecretsManagerClient({
          region: region.region,
          credentials: {
            accessKeyId: region.AWS_ACCESS_KEY_ID,
            secretAccessKey: region.AWS_SECRET_ACCESS_KEY,
          },
        });

        const secretsListCommand = new ListSecretsCommand({ MaxResults: 100 });
        const secretsListResult = await client.send(secretsListCommand);
        const secretsList = secretsListResult.SecretList;

        let counter = 0;
        for (const secret of secretsList) {
          currentOra.text = `reading ${account.name} ${
            region.region
          } (${++counter}/${secretsList.length})`;

          if (!secret.ARN.includes(region.region)) {
            continue;
          }

          if (searchTerm && !secret.Name.includes(searchTerm)) {
            continue;
          }

          try {
            const command = new GetSecretValueCommand({ SecretId: secret.ARN });
            const response = await client.send(command);
            const secretContent = response.SecretString;

            entries.push({
              account: account.name,
              region: region.region,
              arn: secret.ARN,
              name: secret.Name,
              value: secretContent,
            });
          } catch (error) {
            console.error(error);
          }
        }
        currentOra.succeed();
      } catch (error) {
        console.error(error);
        currentOra.fail();
      }
    }
  }
  if (entries.length === 0) {
    console.info(`No secrets found${searchTerm ? ` for ${searchTerm}` : ""}.`);
    return;
  }

  if (config.output.format === "json") {
    console.info(JSON.stringify(entries, null, 2));
    return;
  }

  if (config.output.format === "cli-table") {
    const table = new cliTable({ head: config.output.fields });
    entries.forEach((entry) => {
      table.push(config.output.fields.map((field) => entry[field]));
    });
    console.info(table.toString());
  }

  if (config.output.format === "markdown-table") {
    console.info(`| ${config.output.fields.join(" | ")} |`);
    console.info(`| ${config.output.fields.map(() => "---").join(" | ")} |`);
    entries.forEach((entry) => {
      console.info(
        `| ${config.output.fields.map((field) => entry[field]).join(" | ")} |`
      );
    });
    return;
  }
})();
