import {
  type ICompanyApplication,
  type ICompanyApplicationApproval,
} from "~/graphql/schema";

export const nameAliases: Record<keyof Omit<ICompanyApplicationApproval, "forApplication" | "logoHidden">, keyof ICompanyApplication> = {
  talkParticipants: "talk",
  workshopParticipants: "workshop",
  panel: "wantsPanel",
  cocktail: "wantsCocktail",
  booth: "booth",
} as const;
