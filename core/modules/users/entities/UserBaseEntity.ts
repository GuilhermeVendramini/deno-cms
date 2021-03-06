import { UserRoles } from "../roles/UserRoles.ts";

export class UserBaseEntity {
  protected name: string;
  protected email: string;
  protected password: string;
  protected roles: Array<UserRoles>;
  protected created: number;
  protected updated: number;
  protected status: boolean;

  constructor(
    name: string,
    email: string,
    password: string,
    roles: Array<UserRoles>,
    created: number,
    status: boolean = true,
  ) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.roles = roles;
    this.created = created;
    this.updated = Date.now();
    this.status = status;
  }
}
