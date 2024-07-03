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
    const member = { ...data, memberId: this.members.length + 1 };
    this.members.push(member);
    this.db.save();
    return member;
  }
  async update(id: number, data: IMemberBase): Promise<IMember | null> {
    const member = this.members.find((member) => member.memberId === id);
    if (member) {
      member.firstName = data.firstName;
      member.lastName = member.lastName;
      member.phoneNumber = data.phoneNumber;
      member.email = data.email;
      return member;
    }
    return null;
  }
  async delete(id: number): Promise<IMember | null> {
    const index = this.members.findIndex((member) => member.memberId === id);
    if (index !== -1) {
      const deletedMember = this.members.splice(index, 1);
      return deletedMember[0];
    }
    return null;
  }
  async getById(id: number): Promise<IMember | null> {
    const member = this.members.find((m) => m.memberId === id);
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
      : this.members; //.slice(params.offset, params.offset + params.limit);
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
