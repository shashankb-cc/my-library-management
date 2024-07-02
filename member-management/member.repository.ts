import { IPageRequest, IPagesResponse } from "../core/pagination";
import { IRepository } from "../core/repository";
import { IMemberBase, IMember } from "./models/member.model";

class MemberRepositoy implements IRepository<IMemberBase, IMember> {
  create(data: IMemberBase): IMember {
    throw new Error("Method not implemented.");
  }
  update(id: number, data: IMemberBase): IMember | null {
    throw new Error("Method not implemented.");
  }
  delete(id: number): IMember | null {
    throw new Error("Method not implemented.");
  }
  getById(id: number): IMember | null {
    throw new Error("Method not implemented.");
  }
  list(params: IPageRequest): IPagesResponse<IMember> {
    throw new Error("Method not implemented.");
  }
}
