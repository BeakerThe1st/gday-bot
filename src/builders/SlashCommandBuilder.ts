import { SlashCommandBuilder as djsSlashCommandBuilder } from "discord.js";

export enum SlashCommandScope {
  GLOBAL,
  MAIN_GUILD = "332309672486895637",
}

export class SlashCommandBuilder extends djsSlashCommandBuilder {
  constructor() {
    super();
  }

  public readonly ephemeral: boolean = false;
  public readonly scope: SlashCommandScope = SlashCommandScope.GLOBAL;

  public setEphemeral(ephemeral: boolean) {
    Reflect.set(this, "ephemeral", ephemeral);
    return this;
  }

  public setScope(scope: SlashCommandScope) {
    Reflect.set(this, "scope", scope);
    return this;
  }
}
