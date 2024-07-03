import { IPageRequest, IPagesResponse } from "../core/pagination";
import { IRepository } from "../core/repository";
import { IMemberBase, IMember } from "./models/member.model";

export const members: IMember[] = [];

export class MemberRepository implements IRepository<IMemberBase, IMember> {
  create(data: IMemberBase): IMember {
    const member = { ...data, memberId: members.length + 1 };
    members.push(member);
    return member;
  }
  update(id: number, data: IMemberBase): IMember | null {
    const index = members.findIndex((member) => member.memberId === id);
    if (index !== -1) {
      members[index] = { memberId: id, ...data } as IMember;
      return members[index];
    }
    return null;
  }
  delete(id: number): IMember | null {
    const index = members.findIndex((member) => member.memberId === id);
    if (index !== -1) {
      const deletedMember = members.splice(index, 1);
      return deletedMember[0];
    }
    return null;
  }
  getById(id: number): IMember | null {
    const member = members.find((m) => m.memberId === id);
    return member || null;
  }
  list(params: IPageRequest): IPagesResponse<IMember> {
    const search = params.search?.toLocaleLowerCase();
    const filteredBooks = search
      ? members.filter(
          (m) =>
            m.firstName.toLowerCase().includes(search) ||
            m.lastName.toLowerCase().includes(search) ||
            m.email.toLowerCase().includes(search)
        )
      : members; //.slice(params.offset, params.offset + params.limit);
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
