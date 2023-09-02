import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { URLSearchParams } from "url";
import type { OrganizationMembers } from "~/pages/api/members";
import { InferGetStaticPropsType } from "next";
import { env } from "~/lib/env";
import { RadioGroup } from "@headlessui/react";

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
            <h1 className="text-center font-semibold">Welcome!</h1>

            <div className="p-1" />

            <p className="text-center">
                Before we get started, please put in your student ID
            </p>

            <div className="p-3" />

            <input
                type="number"
                className="bg-gray-100 rounded-xl p-3"
                placeholder="Student ID"
                value={studentNumber}
                onChange={function (event) {
                    setStudentNumber(event.target.valueAsNumber);
                }}
            />
        </>
    );
}

type OrganizationPairIds = { [organizationName: string]: number };

function VotePage({
    members,
    organizationMemberIds,
    setOrganizationMemberIds,
}: {
    members: Awaited<OrganizationMembers>;
    organizationMemberIds: number[] | undefined;
    setOrganizationMemberIds: React.Dispatch<
        React.SetStateAction<OrganizationPairIds>
    >;
}) {
    const organizationNames = Object.keys(members);

    return (
        <div className="flex flex-col gap-16">
            {organizationNames.map(function (organizationName) {
                const organizationPairs = members[organizationName];
                const pairIds = Object.keys(organizationPairs);

                return (
                    <div>
                        <h2 className="font-semibold text-center">
                            {organizationName}
                        </h2>

                        <div className="p-3" />

                        <RadioGroup
                            value={selectedPairId}
                            onChange={setSelectedPairId}
                        >
                            <div className="grid grid-cols-2 gap-5">
                                {pairIds.map(function (pairId) {
                                    const pair = organizationPairs[pairId];

                                    return (
                                        <RadioGroup.Option className="focus:outline-none" value={pairId}>
                                            <div className="ui-checked:bg-gray-500 bg-gray-100 rounded-xl flex flex-col gap-3 ui-checked:divide-gray-600 divide-y ui-checked:text-white cursor-pointer ui-active:ring-2 ui-active:ring-gray-400">
                                                {pair.map(function (member) {
                                                    return (
                                                        <div className="p-5">
                                                            <h3 className="font-semibold">
                                                                {
                                                                    member.fullName
                                                                }
                                                            </h3>
                                                            <span className="ui-checked:text-gray-100">
                                                                {member.position ===
                                                                "vice_chairman"
                                                                    ? "Wakil Ketua"
                                                                    : "Ketua"}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </RadioGroup.Option>
                                    );
                                })}
                            </div>
                        </RadioGroup>
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
    const [organizationPairIds, setOrganizationPairIds] =
        useState<OrganizationPairIds>({});

    const [pageIndex, setPageIndex] = useState<number>(1);
    const pageIndexLimit = 2;

    return (
        <div>
            <div className="flex justify-between gap-3 p-3">
                <button
                    className="flex gap-3 bg-gray-200 rounded-xl p-5 py-3 items-center"
                    disabled={pageIndex <= 1}
                    onClick={function () {
                        setPageIndex(function (pageIndex) {
                            if (pageIndex > 1) {
                                return pageIndex - 1;
                            }

                            return pageIndex;
                        });
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 19.5L8.25 12l7.5-7.5"
                        />
                    </svg>
                </button>

                <div className="flex flex-col">
                    <div className="p-3" />

                    {pageIndex === 1 ? (
                        <StudentNumberPage
                            studentNumber={studentNumber}
                            setStudentNumber={setStudentNumber}
                        />
                    ) : null}

                    {pageIndex === 2 ? (
                        <VotePage
                            members={members}
                            organizationMemberIds={organizationPairIds}
                            setOrganizationMemberIds={setOrganizationPairIds}
                        />
                    ) : null}

                    {pageIndex === pageIndexLimit ? (
                        <>
                            <div className="p-8" />

                            <div className="flex gap-3 items-center justify-center">
                                <button className="bg-gray-500 text-white font-semibold px-6 py-3 rounded-xl flex gap-3 justify-center items-center">
                                    Submit
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </>
                    ) : null}

                    <div className="p-3" />
                </div>

                <button
                    className="flex gap-3 bg-gray-200 rounded-xl p-5 py-3 items-center"
                    disabled={pageIndex >= pageIndexLimit}
                    onClick={function () {
                        setPageIndex(function (pageIndex) {
                            if (pageIndex < pageIndexLimit) {
                                return pageIndex + 1;
                            }

                            return pageIndex;
                        });
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                    </svg>
                </button>
            </div>
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
