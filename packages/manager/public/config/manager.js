window.SPAship = {
  configs: [
    {
      name: "SPAship @ localhost",
      isPreset: true,
      environments: [
        {
          name: "Dev",
          api: SPASHIP_LOCALENV_API || "http://localhost:2345/api/v1",
          domain: SPASHIP_LOCALENV_DOMAIN || "http://localhost:1234",
        },
      ],
    },
  ],
};
