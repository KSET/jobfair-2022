import {
  type ICompanyApplication,
  type ICompanyApplicationApproval,
} from "~/graphql/schema";

export const nameAliases: Record<keyof Omit<ICompanyApplicationApproval, "forApplication" | "logoHidden">, keyof ICompanyApplication> = {
  talkParticipants: "talk",
  workshopParticipants: "workshop",
  fusionParticipants: "fusion",
  panel: "wantsPanel",
  cocktail: "wantsCocktail",
  quest: "wantsQuest",
  booth: "booth",
} as const;
