import {
  ClassType,
  Field,
  ObjectType,
} from "type-graphql";

export const SearchResponseFor = <Entity extends object>(entity: ClassType<Entity>) => {
  @ObjectType({
    simpleResolvers: true,
    // isAbstract: true,
  })
  abstract class ValidationResponse {
    @Field(() => Number)
      index: number = 0;

    @Field(() => [ entity ])
      entities: Entity[] = [];
  }

  return ValidationResponse;
};

@ObjectType()
export class SearchResponseStringArray extends SearchResponseFor(String) {
}
