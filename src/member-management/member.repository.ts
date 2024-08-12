import { IPageRequest, IPagesResponse } from "../../core/pagination";
import { IRepository } from "../../core/repository";
import { IMemberBase, IMember } from "./models/member.model";
import { MySql2Database } from "drizzle-orm/mysql2";
import { members } from "../drizzle/schema";
import { eq, count, or, like } from "drizzle-orm";
import chalk from "chalk";

export class MemberRepository implements IRepository<IMemberBase, IMember> {
  constructor(private db: MySql2Database<Record<string, never>>) {}

  async create(data: IMemberBase): Promise<IMember | undefined> {
    try {
      const member: Omit<IMember, "id"> = { ...data, refreshToken: null };
      const [result] = await this.db
        .insert(members)
        .values(member)
        .$returningId();
      console.log("result", result);
      if (result) {
        const [insertedMember] = await this.db
          .select()
          .from(members)
          .where(eq(members.id, result.id));
        return insertedMember as IMember;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(
    id: number,
    data: Partial<IMember>
  ): Promise<IMember | undefined> {
    try {
      await this.db.update(members).set(data).where(eq(members.id, id));

      const [updatedMember] = await this.db
        .select()
        .from(members)
        .where(eq(members.id, id))
        .limit(1);
      if (updatedMember) {
        return updatedMember as IMember;
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(id: number): Promise<IMember | undefined> {
    try {
      const deletedMember = await this.getById(id);
      if (!deletedMember) {
        console.log(chalk.red("No Such Member to delete"));
        return undefined;
      }

      await this.db.delete(members).where(eq(members.id, id));
      return deletedMember;
    } catch (error) {
      throw error;
    }
  }

  async list(
    params: IPageRequest
  ): Promise<IPagesResponse<IMember> | undefined> {
    try {
      const { limit, offset, search } = params;
      const searchFilter = search
        ? or(
            like(members.firstName, `%${search}%`),
            like(members.lastName, `%${search}%`),
            like(members.email, `%${search}%`)
          )
        : undefined;

      const totalCount = await this.getTotalCount();
      if (!totalCount) throw new Error("Could not fetch the count");

      const result = await this.db
        .select()
        .from(members)
        .where(searchFilter)
        .offset(offset)
        .limit(limit);

      if (result) {
        return {
          items: result as IMember[],
          pagination: { offset, limit, total: totalCount },
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async getById(id: number): Promise<IMember | undefined> {
    try {
      const [result] = await this.db
        .select()
        .from(members)
        .where(eq(members.id, id))
        .limit(1);

      if (result) {
        return result as IMember;
      }
    } catch (error) {
      throw error;
    }
  }

  async getTotalCount(): Promise<number | undefined> {
    try {
      const [result] = await this.db.select({ value: count() }).from(members);

      if (result) {
        return result.value;
      }
    } catch (error) {
      throw error;
    }
  }
  async getByEmail(email: string): Promise<IMember | undefined> {
    try {
      const [result] = await this.db
        .select()
        .from(members)
        .where(eq(members.email, email))
        .limit(1);

      if (result) {
        return result as IMember;
      }
    } catch (error) {
      throw error;
    }
  }
  async getByRefreshToken(refreshToken: string): Promise<IMember | undefined> {
    try {
      const [result] = await this.db
        .select()
        .from(members)
        .where(eq(members.refreshToken, refreshToken))
        .limit(1);

      if (result) {
        return result as IMember;
      }
    } catch (error) {
      throw error;
    }
  }
}
