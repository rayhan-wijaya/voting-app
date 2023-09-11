import { useQuery } from "@tanstack/react-query";
import { env } from "~/lib/env";
import type { VotingResults } from "../api/admin/results";

async function fetchVotingResults() {
    const response = await fetch(
        new URL("/api/admin/results", env.NEXT_PUBLIC_BASE_URL)
    );
    const json = (await response.json()) as VotingResults;

    return json;
}

export default function Admin() {
    const { data: votingResults } = useQuery({
        queryKey: ["voting-results"],
        queryFn: fetchVotingResults,
    });

    return (
        <>
            <h1 className="text-center font-semibold text-lg">
                Voting Results
            </h1>

            <div className="p-3" />

            <div className="flex flex-col gap-8">
                {(votingResults ? Object.keys(votingResults) : []).map(
                    function (organizationName) {
                        const organizationVotingResults =
                            votingResults?.[organizationName];

                        return (
                            <div>
                                <h2
                                    className="text-center font-semibold"
                                    dangerouslySetInnerHTML={{
                                        __html: organizationName,
                                    }}
                                />

                                <div className="p-3" />

                                <div className="flex flex-wrap gap-3 items-center justify-center">
                                    {organizationVotingResults
                                        ? organizationVotingResults
                                              .sort(function (
                                                  resultA,
                                                  resultB
                                              ) {
                                                  return (resultA?.percentage ??
                                                      0) >
                                                      (resultB?.percentage ?? 0)
                                                      ? -1
                                                      : 1;
                                              })
                                              .map(function (result) {
                                                  return (
                                                      <div className="p-3 bg-sky-100 rounded-xl">
                                                          <h3>{result.name}</h3>
                                                      </div>
                                                  );
                                              })
                                        : null}
                                </div>
                            </div>
                        );
                    }
                )}
            </div>
        </>
    );
}