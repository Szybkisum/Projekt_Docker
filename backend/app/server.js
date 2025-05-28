const express = require("express");
const cors = require("cors");
const { auth } = require("express-oauth2-jwt-bearer");

const issuer = process.env.KEYCLOAK_ISSUER;
const jwksUri = process.env.KEYCLOAK_INTERNAL_JWKS_URI;
const audience = process.env.BACKEND_CLIENT_ID;
const externalUrl = process.env.EXTERNAL_URL;

const checkJwt = auth({
  audience: audience,
  issuer: issuer,
  jwksUri: jwksUri,
  tokenSigningAlg: "RS256",
});

const app = express();
app.use(cors({ origin: externalUrl }));

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.json({ message: "Hello from PUBLIC Express API root!" });
});

app.get("/protected", checkJwt, (req, res) => {
  const userInfo = req.auth.payload;
  const userRoles = userInfo.resource_access?.frontend?.roles || [];

  if (userRoles.includes("admin")) {
    res.json({
      message: "Access GRANTED to SECURED Admin Express API!",
      user: {
        id: userInfo.sub,
        name: userInfo.name,
        preferred_username: userInfo.preferred_username,
        email: userInfo.email,
        roles: userRoles,
      },
    });
  } else {
    res.json({
      message: "Access GRANTED to SECURED Express API!",
      user: {
        id: userInfo.sub,
        name: userInfo.name,
        preferred_username: userInfo.preferred_username,
        email: userInfo.email,
        roles: userRoles,
      },
    });
  }
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use((err, req, res, next) => {
  if (err.name === "InvalidTokenError" || err.name === "UnauthorizedError") {
    console.error("JWT Auth Error in Express:", err.message);
    res
      .status(err.status || 401)
      .json({ error: "Unauthorized", message: err.message });
  } else {
    console.error("Unhandled Express Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Express API server (backend service) listening on port ${PORT}`);
});
