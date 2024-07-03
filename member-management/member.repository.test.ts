import { describe, test, expect, beforeEach } from "vitest";
import { MemberRepository } from "./member.repository";
import { IMemberBase } from "./models/member.model";

describe("MemberRepository", () => {
  let repo: MemberRepository;
  let memberData: IMemberBase;

  beforeEach(() => {
    // Initialize a new repository and member data before each test
    repo = new MemberRepository();
    memberData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phoneNumber: "1234567890",
    };
  });

  test("should create a new member", () => {
    const newMember = repo.create(memberData);
    expect(newMember).toEqual({ ...memberData, memberId: 1 });
    expect(newMember.memberId).toBe(1);
  });

  test("should update an existing member", () => {
    const newMember = repo.create(memberData);
    const dataToUpdate: IMemberBase = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      phoneNumber: "0987654321",
    };
    const updatedMember = repo.update(newMember.memberId, dataToUpdate);
    expect(updatedMember).toEqual({ ...dataToUpdate, memberId: 2 });
    expect(updatedMember?.memberId).toBe(newMember.memberId);
  });

  test("should return null when updating a non-existent member", () => {
    const updatedData: IMemberBase = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      phoneNumber: "0987654321",
    };
    const updatedMember = repo.update(999, updatedData);
    expect(updatedMember).toBeNull();
  });

  test("should delete an existing member", () => {
    const newMember = repo.create(memberData);
    const deletedMember = repo.delete(newMember.memberId);
    expect(deletedMember).toEqual(newMember);
    expect(repo.getById(newMember.memberId)).toBeNull();
  });

  test("should return null when deleting a non-existent member", () => {
    const deletedMember = repo.delete(999);
    expect(deletedMember).toBeNull();
  });

  test("should get a member by ID", () => {
    const newMember = repo.create(memberData);
    const foundMember = repo.getById(newMember.memberId);
    expect(foundMember).toEqual(newMember);
  });

  test("should return null when getting a non-existent member by ID", () => {
    const foundMember = repo.getById(999);
    expect(foundMember).toBeNull();
  });

  test("should list members with pagination and search", () => {
    const members = [
      {
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice.johnson@example.com",
        phoneNumber: "5555555555",
      },
    ];

    members.forEach((member) => repo.create(member));

    const searchParams = { offset: 0, limit: 1, search: "Alice" };
    const searchResult = repo.list(searchParams);
    expect(searchResult.items.length).toBe(1);
    expect(searchResult.items[0].firstName).toBe("Alice");
  });
});
