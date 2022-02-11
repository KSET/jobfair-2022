import {
  ClassType,
  Field,
  ObjectType,
} from "type-graphql";

@ObjectType({
  simpleResolvers: true,
})
export class FieldError {
  @Field()
    field: string = "";

  @Field()
    message: string = "";
}

export const ValidationResponseFor = <Entity>(entity: ClassType<Entity>) => {
  @ObjectType({
    simpleResolvers: true,
    isAbstract: true,
  })
  abstract class ValidationResponse {
    @Field(() => [ FieldError ], { nullable: true })
      errors?: FieldError[];

    @Field(() => entity, { nullable: true })
      entity?: Entity;
  }

  return ValidationResponse;
};
