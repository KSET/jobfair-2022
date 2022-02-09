import {
  Field,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import {
  BoothsService,
} from "../../services/booths-service";

@ObjectType()
class Booth {
  @Field()
    name: string = "";

  @Field(() => String, { nullable: true })
    key: string | null = null;
}

@Resolver(() => Booth)
export class BoothsListResolver {
  @Query(() => [ Booth ])
  booths() {
    return BoothsService.fetchBooths();
  }
}
