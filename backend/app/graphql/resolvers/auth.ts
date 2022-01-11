import {
  Arg,
  Ctx,
  Mutation,
  Resolver,
} from "type-graphql";
import {
  Context,
} from "../../types/apollo-context";

@Resolver()
export class AuthResolver {
  @Mutation()
  login(@Arg("identifier") identifier: string, @Arg("passowrd") password: string, @Ctx() context: Context): boolean {
    console.log({
      identifier,
      password,
      context,
    });

    return false;
  }
}
