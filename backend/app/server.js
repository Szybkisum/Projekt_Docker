const express = require("express");
const cors = require("cors");
var { NodeAdapter } = require("ef-keycloak-connect");

const keycloakConfig = {
  realm: process.env.KEYCLOAK_REALM_NAME,
  "auth-server-url": process.env.KEYCLOAK_BACKEND_INTERNAL_URL,
  "ssl-required": "external",
  resource: process.env.KEYCLOAK_CLIENT_ID,
  "verify-token-audience": true,
  credentials: {
    secret: process.env.KEYCLOAK_CLIENT_SECRET,
  },
  "confidential-port": 0,
};

const keycloak = new NodeAdapter(keycloakConfig);

const app = express();
app.use(cors({ origin: "https://localhost" }));
app.use(keycloak.middleware({}));

app.get("/", (req, res) => {
  res.json({ message: "Hello from public Express API!" });
});

app.get("/api/v1/protected", keycloak.protect(), (req, res) => {
  const userInfo = req.kauth?.grant?.access_token?.content;
  res.json({
    message: "Hello from SECURED Express API!",
    user: userInfo
      ? {
          id: userInfo.sub,
          name: userInfo.name,
          preferred_username: userInfo.preferred_username,
          email: userInfo.email,
          roles:
            userInfo.resource_access?.[keycloakConfig.resource]?.roles ||
            userInfo.realm_access?.roles ||
            [],
        }
      : "Validated user (no specific user info extracted by default)",
  });
});

app.get("/api/v1/admin-only", keycloak.protect("realm:admin"), (req, res) => {
  const userInfo = req.kauth?.grant?.access_token?.content;
  res.json({
    message: "Hello Admin from SECURED Express API!",
    user: userInfo?.name,
    detail: "This endpoint is for admins only.",
  });
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(3001, () => {});
