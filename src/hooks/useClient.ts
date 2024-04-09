import { Client } from "discord.js";

let client: Client;

export const useClient = () => {
  const setClient = (newClient: Client) => {
    client = newClient;
  };
  return { client, setClient };
};
