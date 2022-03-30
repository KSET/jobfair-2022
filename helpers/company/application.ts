import {
  ICompanyApplication,
  ICompanyApplicationApproval,
} from "~/graphql/schema";

export const nameAliases: Record<keyof Omit<ICompanyApplicationApproval, "forApplication">, keyof ICompanyApplication> = {
  talkParticipants: "talk",
  workshopParticipants: "workshop",
  panel: "wantsPanel",
  cocktail: "wantsCocktail",
  booth: "booth",
} as const;
