export const msalConfig = {
  auth: {
    clientId: "273a815d-6cd5-43aa-958a-5c6685a1d13b",
    authority: "https://login.microsoftonline.com/8f137cf4-3c51-4772-9858-75e8fbd0ae28",
    redirectUri: "http://localhost:3000", // Tu URL de React
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["api://273a815d-6cd5-43aa-958a-5c6685a1d13b/access_as_user", "User.Read"],
};