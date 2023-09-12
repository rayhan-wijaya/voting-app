import { useAtom } from "jotai";
import { useRouter } from "next/router";
import { useState } from "react";
import { studentIdAtom } from "~/lib/atoms";
import { env } from "~/lib/env";

function StudentDetailsPage() {
    const router = useRouter();

    const [studentId, setStudentId] = useAtom(studentIdAtom);
    const [isWarningVisible, setIsWarningVisible] = useState(false);

    return (
        <>
            <div className="p-3" />

            <div className="max-w-lg m-auto px-5">
                <h1 className="text-center font-semibold">Welcome!</h1>

                <div className="p-1" />

                <p className="text-center">
                    Before we get started, please put in your student details
                </p>

                <div className="p-3" />

                <label className="flex flex-col">
                    <input
                        type="number"
                        className="bg-sky-100 rounded-xl p-3 transition-all focus:shadow-md outline-transparent outline-none"
                        placeholder="Your student ID here"
                        value={studentId}
                        onChange={function (event) {
                            if (
                                event.target.valueAsNumber.toString().length >
                                15
                            ) {
                                return;
                            }

                            setStudentId(event.target.valueAsNumber);
                        }}
                    />
                </label>
            </div>

            <div className="p-4" />

            <div className="flex gap-3 justify-center">
                <button
                    className="flex gap-3 bg-gray-200 rounded-xl p-5 py-3 items-center disabled:bg-gray-50 disabled:text-gray-300 hover:bg-gray-300 transition-colors"
                    disabled={true}
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
                    <span className="hidden sm:block">Previous</span>
                </button>

                <button
                    className="flex gap-3 bg-gray-200 rounded-xl p-5 py-3 items-center disabled:bg-gray-50 disabled:text-gray-300 hover:bg-gray-300 transition-colors"
                    disabled={!studentId}
                    onClick={async function () {
                        const studentVoteStatusResponse = await fetch(
                            new URL(
                                `/api/student_vote_status?studentId=${studentId}`,
                                env.NEXT_PUBLIC_BASE_URL
                            )
                        );

                        console.log(studentVoteStatusResponse.status);

                        if (studentVoteStatusResponse.status !== 200) {
                            setIsWarningVisible(true);

                            return void setTimeout(function () {
                                setIsWarningVisible(false);
                            }, 4000);
                        }

                        router.replace("/vote");
                    }}
                >
                    <span className="hidden sm:block">Next</span>
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

                {isWarningVisible ? <div>You already voted</div> : null}
            </div>
        </>
    );
}

export default StudentDetailsPage;
