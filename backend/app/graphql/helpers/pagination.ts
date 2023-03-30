import {
  ArgsType,
  ClassType,
  Field,
  Int,
  ObjectType,
} from "type-graphql";

export const PaginationResultFor = <TEntity>(TEntityClass: ClassType<TEntity>) => {
  @ObjectType({
    simpleResolvers: true,
    isAbstract: true,
  })
  abstract class PaginationResult {
    @Field(() => Int)
      totalRecords: number = 0;

    @Field(() => Int)
      page: number = 0;

    @Field(() => Int)
      perPage: number = 0;

    @Field(() => [ TEntityClass ])
      records?: TEntity[] = [];
  }

  return PaginationResult;
};

@ArgsType()
export class PaginationArgs {
  @Field(() => Int)
    page: number = 1;

  @Field(() => Int)
    perPage: number = 20;
}
