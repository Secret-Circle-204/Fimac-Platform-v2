import { CollectionSlug } from "payload"
import { User } from "@/payload-types"
import { BaseRepository } from "../base-repository"
import { BaseDecorator } from "../base-decorator"

export class UserRepository extends BaseRepository<User, UserDecorator> {
  override collection: CollectionSlug = "users"
  override DecoratorClass = UserDecorator

  email!: User["email"]
}

export class UserDecorator extends BaseDecorator<User> {}
