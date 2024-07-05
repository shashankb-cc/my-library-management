import { IPageRequest, IPagesResponse } from "../core/pagination";
import { IRepository } from "../core/repository";
import { Database } from "../db/ds";
import { LibraryDataset } from "../db/library-dataset";
import { IMemberBase, IMember } from "./models/member.model";

export class MemberRepository implements IRepository<IMemberBase, IMember> {
  constructor(private db: Database<LibraryDataset>) {}
  private get members(): IMember[] {
    return this.db.table("members");
  }
  async create(data: IMemberBase): Promise<IMember> {
    const member = { ...data, id: this.members.length + 1 };
    this.members.push(member);
    await this.db.save();
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
      await this.db.save();
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
    const filteredMembers = search
      ? this.members.filter(
          (m) =>
            m.firstName.toLowerCase().includes(search) ||
            m.lastName.toLowerCase().includes(search) ||
            m.email.toLowerCase().includes(search)
        )
      : this.members;
    return {
      items: filteredMembers.slice(params.offset, params.offset + params.limit),
      pagination: {
        offset: params.offset,
        limit: params.limit,
        total: filteredMembers.length,
      },
    };
  }

  async deleteAll() {
    this.members.length = 0;
    await this.db.save();
  }
}
