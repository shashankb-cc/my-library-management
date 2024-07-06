import { describe, expect, test, beforeAll } from "vitest";
import { MemberRepository } from "./member.repository";
import { Database } from "../db/ds";
import { LibraryDataset } from "../db/library-dataset";
import { faker } from "@faker-js/faker";

describe("Member Repository Tests", () => {
  const db: Database<LibraryDataset> = new Database("./data/mock-library.json");
  const memberRepository = new MemberRepository(db);
  const members = [
    {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phoneNumber: "+1234567890",
    },
    {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smitgit stah@example.com",
      phoneNumber: "+0987654321",
    },
    {
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice.johnson@example.com",
      phoneNumber: "+1122334455",
    },
    {
      firstName: "Bob",
      lastName: "Williams",
      email: "bob.williams@example.com",
      phoneNumber: "+2233445566",
    },
    {
      firstName: "Charlie",
      lastName: "Brown",
      email: "charlie.brown@example.com",
      phoneNumber: "+3344556677",
    },
  ];

  beforeAll(async () => {
    await memberRepository.deleteAll();
  });

  test("Create Member", async () => {
    const newmember = await memberRepository.create(members[0]);
    expect(newmember).toBeDefined();
    expect(newmember.firstName).toBe("John");
    expect(newmember.lastName).toBe("Doe");
  });

  test("Update the Member details", async () => {
    const newmember = await memberRepository.create(members[1]);
    expect(newmember).toBeDefined();
    expect(newmember.firstName).toBe("Jane");
    newmember.firstName = "test";
    const updatedmember = await memberRepository.update(
      newmember.id,
      newmember
    );
    expect(updatedmember).toBeDefined();
    expect(updatedmember?.firstName).toBe("test");
  });

  test("Get member by its id", async () => {
    const newmember = await memberRepository.create(members[2]);
    const fetchedmember = await memberRepository.getById(newmember.id);
    expect(fetchedmember?.id).toBe(newmember.id);
  });

  test("Get a list of added members", async () => {
    await memberRepository.deleteAll();

    const newMember1 = await memberRepository.create(members[0]);
    const newMember2 = await memberRepository.create(members[1]);
    const newMember3 = await memberRepository.create(members[2]);
    const listOfmembers = memberRepository.list({ offset: 0, limit: 3 });
    console.log(listOfmembers.items);

    expect(listOfmembers.items).toEqual([
      {
        ...newMember1,
        email: newMember1.email,
      },
      {
        ...newMember2,
        email: newMember2.email,
      },
      {
        ...newMember3,
        email: newMember3.email,
      },
    ]);
  });

  test("Delete a member from the list", async () => {
    await memberRepository.deleteAll();

    const newMember1 = await memberRepository.create(members[0]);
    const newMember2 = await memberRepository.create(members[1]);
    await memberRepository.delete(newMember1.id);
    const listOfmembers = memberRepository.list({ offset: 0, limit: 3 });
    expect(listOfmembers.items.length).toBe(1);
    expect(listOfmembers.items[0].id).toBe(newMember2.id);
  });
});
