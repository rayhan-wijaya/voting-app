import { z } from "zod";

export const organizationMemberSchema = z.object({
    id: z.number(),
    organizationId: z.number(),
    pairId: z.number(),
    nickname: z.string(),
    fullName: z.string().nullable().optional(),
    position: z.enum(["chairman", "vice_chairman"]),
    imageFileName: z.string().nullable().optional(),
});

export const votingResultSchema = z.object({
    name: z.string(),
    organizationId: z.number(),
    pairId: z.number(),
    percentage: z.number().max(100).nullable().optional(),
    voteCount: z.number(),
    totalVoteCount: z.number(),
    imageFileName: z.string().nullable().optional(),
});

export const voteSchema = z.object({
    id: z.number(),
    studentId: z.number(),
    organizationId: z.number(),
    pairId: z.number(),
});
