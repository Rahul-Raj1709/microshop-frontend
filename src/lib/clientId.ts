import { v4 as uuidv4 } from "uuid";

export const getClientId = (): string => {
  let clientId = localStorage.getItem("app_client_id");
  if (!clientId) {
    clientId = uuidv4();
    localStorage.setItem("app_client_id", clientId);
  }
  return clientId;
};
