export interface BaseEntity {
  id: string | number
}

export class BaseDecorator<T extends BaseEntity> {
  constructor(public original: T) {}
  get id(): T["id"] {
    return this.original.id
  }
}
