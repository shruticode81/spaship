const Ajv = require("ajv");

const ajv = new Ajv({ allErrors: true });

const schema = {
  $id: "http://example.com/schemas/schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "SPAshipConfiguration",
  type: "object",
  additionalProperties: false,
  properties: {
    websiteVersion: {
      description: "the human-readable website version",
      type: "string",
    },
    websiteName: {
      description: "the human-readable website url",
      type: "string",
      minLength: 4,
    },
    name: {
      description: "the human-readable title of the SPA",
      type: "string",
      minLength: 1,
    },
    mapping: {
      description: "the URL path at which to deploy the SPA",
      type: "string",
      minLength: 1,
    },
    environments: {
      type: "array",
      minItems: 1,
      items: {
        title: "Environments",
        description: "Environments at which SPA will get deploy",
        type: "object",
        properties: {
          name: {
            description: "the human-readable environment name",
            type: "string",
            minLength: 2,
          },
          updateRestriction: {
            description: "Control the update in an Environment",
            type: "boolean",
          },
          exclude: {
            description: "Control SPA deployment in an Enviroment",
            type: "boolean",
          },
        },
        required: ["name", "updateRestriction", "exclude"],
        additionalProperties: false,
      },
    },
  },
  required: ["websiteName", "name", "mapping", "environments"],
};
const valid = (data) => {
  const validJSON = ajv.compile(schema);
  const validate = validJSON(data);
  const errors = validJSON.errors;
  return {
    validate,
    errors,
  };
};

module.exports = valid;
