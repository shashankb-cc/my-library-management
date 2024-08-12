  import { Request, Response } from "express";
  import { getDrizzleDB } from "../../drizzle/drizzleDB";
  import { MemberRepository } from "../member.repository";
  export const db = getDrizzleDB();
  const memberRepository = new MemberRepository(db);

  // Insert a new member
  export const handleInsertMember = async (req: Request, res: Response) => {
    try {
      const member = req.body;
      const result = await memberRepository.create(member);
      res.status(201).json({
        message: "Member Created Successfully",
        createdMember: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      }
    }
  };

  // Update a member
  export const handleUpdateMember = async (req: Request, res: Response) => {
    try {
      const memberId = Number(req.query.id);
      if (isNaN(memberId)) {
        return res.status(400).send("Invalid member ID");
      }

      const data = req.body;
      const updatedMember = await memberRepository.update(memberId, data);
      if (updatedMember) {
        res.status(200).json({
          message: "Member Updated Successfully",
          updatedMember,
        });
      } else {
        res.status(404).send("Member not found");
      }
    } catch (error) {
      console.log("Error is", error);
      res.status(500).send("Internal Server Error");
    }
  };

  // Handle both get by ID and list members
  export const handleMembers = async (req: Request, res: Response) => {
    const memberId = req.query.id ? Number(req.query.id) : null;

    if (memberId) {
      return handleGetMemberById(req, res);
    } else {
      return handleListMembers(req, res);
    }
  };

  // Get a member by ID
  export const handleGetMemberById = async (req: Request, res: Response) => {
    const memberId = Number(req.query.id); // Use req.query to access the id
    if (isNaN(memberId)) {
      return res.status(400).send("Invalid member ID");
    }
    try {
      const member = await memberRepository.getById(memberId);
      if (member) {
        res.status(200).json(member);
      } else {
        res.status(404).send("Member not found");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  };

  // Delete a member
  export const handleDeleteMember = async (req: Request, res: Response) => {
    const memberId = Number(req.query.id); // Use req.query to access the id
    if (isNaN(memberId)) {
      return res.status(400).send("Invalid member ID");
    }
    try {
      const deletedMember = await memberRepository.delete(memberId);
      if (deletedMember) {
        res.status(200).json({
          message: `Member with Id ${memberId} deleted successfully`,
          deletedMember,
        });
      } else {
        res.status(404).send("Member not found");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  };

  // List members with pagination and search
  export const handleListMembers = async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 5;
    const offset = Number(req.query.offset) || 0;
    const search = (req.query.search as string) || "";

    const currentPage = Math.floor(offset / limit) + 1;

    try {
      const params = { limit, offset, search };
      const [result, totalCount] = await Promise.all([
        memberRepository.list(params),
        memberRepository.getTotalCount(),
      ]);

      const totalPages = Math.ceil(totalCount! / limit);

      if (result) {
        res.status(200).json({ currentPage, totalPages, members: result });
      } else {
        res.status(404).send("Members not found");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  };
