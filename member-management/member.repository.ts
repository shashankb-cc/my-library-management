import { IPageRequest, IPagesResponse } from "../core/pagination";
import { IRepository } from "../core/repository";
import { Database } from "../db/ds";
import { IMemberBase, IMember } from "./models/member.model";

export class MemberRepository implements IRepository<IMemberBase, IMember> {
  constructor(private db: Database) {}
  private get members(): IMember[] {
    return this.db.table<IMember>("members");
  }
  async create(data: IMemberBase): Promise<IMember> {
    const member = { ...data, id: this.members.length + 1 };
    this.members.push(member);
    this.db.save();
    return member;
  }
  async update(id: number, data: IMemberBase): Promise<IMember | null> {
    const member = this.members.find((member) => member.id === id);
    if (member) {
      member.firstName = data.firstName;
      member.lastName = data.lastName;
      member.phoneNumber = data.phoneNumber;
      member.email = data.email;
      await this.db.save();
      console.table(member);
      return member;
    }
    return null;
  }
  async delete(id: number): Promise<IMember | null> {
    const index = this.members.findIndex((member) => member.id === id);
    if (index !== -1) {
      const deletedMember = this.members.splice(index, 1);
      this.db.save();
      return deletedMember[0];
    }
    return null;
  }
  async getById(id: number): Promise<IMember | null> {
    const member = this.members.find((member) => member.id === id);
    return member || null;
  }
  list(params: IPageRequest): IPagesResponse<IMember> {
    const search = params.search?.toLocaleLowerCase();
    const filteredBooks = search
      ? this.members.filter(
          (m) =>
            m.firstName.toLowerCase().includes(search) ||
            m.lastName.toLowerCase().includes(search) ||
            m.email.toLowerCase().includes(search)
        )
      : this.members;
    return {
      items: filteredBooks.slice(params.offset, params.offset + params.limit),
      pagination: {
        offset: params.offset,
        limit: params.limit,
        total: filteredBooks.length,
      },
    };
  }
}
