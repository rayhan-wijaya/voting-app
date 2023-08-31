import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { URLSearchParams } from "url";
import type { OrganizationMembers } from "~/pages/api/members";
import { InferGetStaticPropsType } from "next";
import { env } from "~/lib/env";

async function voteOrganizationMembers({
    studentId,
    organizationMemberIds,
}: {
    studentId: number;
    organizationMemberIds: number[];
}) {
    const searchParams = new URLSearchParams({
        studentId: studentId.toString(),
        organizationMemberIds: organizationMemberIds.map(function (
            organizationMemberId
        ) {
            return organizationMemberId.toString();
        }),
    });

    const response = await fetch(
        new URL("/api/vote?" + searchParams, env.NEXT_PUBLIC_BASE_URL),
        {
            method: "POST",
            cache: "no-cache",
            next: {
                revalidate: 3000,
            },
        }
    );

    return await response.json();
}

async function getOrganizationMembers() {
    const response = await fetch(
        new URL("/api/members", env.NEXT_PUBLIC_BASE_URL)
    );
    return await (response.json() as OrganizationMembers);
}

function StudentNumberPage({
    studentNumber,
    setStudentNumber,
}: {
    studentNumber: number | undefined;
    setStudentNumber: React.Dispatch<React.SetStateAction<number | undefined>>;
}) {
    return (
        <>
            <h1>Student number</h1>

            <input
                type="number"
                value={studentNumber}
                onChange={function (event) {
                    setStudentNumber(event.target.valueAsNumber);
                }}
            />
        </>
    );
}

function VotePage({
    members,
    organizationMemberIds,
    setOrganizationMemberIds,
}: {
    members: Awaited<OrganizationMembers>;
    organizationMemberIds: number[] | undefined;
    setOrganizationMemberIds: React.Dispatch<React.SetStateAction<number[]>>;
}) {
    const organizationNames = Object.keys(members);

    return (
        <div className="flex gap-3">
            {organizationNames.map(function (organizationName) {
                const organizationPairs = members[organizationName];
                const pairIds = Object.keys(organizationPairs);

                return (
                    <div>
                        <h2>{organizationName}</h2>

                        {pairIds.map(function (pairId) {
                            const pair = organizationPairs[pairId];

                            return (
                                <div className="p-3">
                                    {pair.map(function (member) {
                                        return (
                                            <>
                                                <h3>
                                                    {member.nickname} -{" "}
                                                    {member.fullName}
                                                </h3>
                                                <span>
                                                    {member.position ===
                                                    "vice_chairman"
                                                        ? "Wakil Ketua"
                                                        : "Ketua"}
                                                </span>
                                            </>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
}

export default function Home(
    props: InferGetStaticPropsType<typeof getStaticProps>
) {
    const { data: members } = useQuery({
        queryKey: ["organization-members"],
        queryFn: getOrganizationMembers,
        initialData: props.members,
    });

    const [studentNumber, setStudentNumber] = useState<number>();
    const [organizationMemberIds, setOrganizationMemberIds] = useState<
        number[]
    >([]);

    const [pageIndex, setPageIndex] = useState<number>(1);
    const pageIndexLimit = 2;

    return (
        <div>
            <div className="flex flex-col gap-3">
                {pageIndex === 1 ? (
                    <StudentNumberPage
                        studentNumber={studentNumber}
                        setStudentNumber={setStudentNumber}
                    />
                ) : null}

                {pageIndex === 2 ? (
                    <VotePage
                        members={members}
                        organizationMemberIds={organizationMemberIds}
                        setOrganizationMemberIds={setOrganizationMemberIds}
                    />
                ) : null}

                {pageIndex === pageIndexLimit ? (
                    <div>
                        <button>Submit</button>
                    </div>
                ) : null}
            </div>

            <button
                onClick={function () {
                    setPageIndex(function (pageIndex) {
                        if (pageIndex > 1) {
                            return pageIndex - 1;
                        }

                        return pageIndex;
                    });
                }}
            >
                Prev
            </button>

            <button
                onClick={function () {
                    setPageIndex(function (pageIndex) {
                        if (pageIndex < pageIndexLimit) {
                            return pageIndex + 1;
                        }

                        return pageIndex;
                    });
                }}
            >
                Next
            </button>
        </div>
    );
}

export async function getStaticProps() {
    const members = await getOrganizationMembers();

    return {
        revalidate: 3000,
        props: {
            members,
        },
    };
}
