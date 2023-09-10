import type { NextApiRequest, NextApiResponse } from "next";
import { database } from "~/lib/database";
import { validateCredentials } from "~/lib/auth";
import { createId } from "~/lib/cuid";
import { createHash } from "crypto";
import { z } from "zod";

function createSession({
    username,
    hashedPassword,
    isValidateCredentials = true,
}: {
    username: string;
    hashedPassword: string;
    isValidateCredentials: boolean;
}) {
    return new Promise<void>(async function (resolve, reject) {
        if (
            isValidateCredentials &&
            !(await validateCredentials({ username, hashedPassword }))
        ) {
            return reject("Invalid credentials");
        }

        database.pool.getConnection(function (error, connection) {
            if (error) {
                return reject(error);
            }

            connection.query(
                {
                    sql: `
                        INSERT INTO
                            \`admin_session\` (\`admin_id\`, \`token\`)
                        VALUES
                            ((SELECT \`id\` FROM \`admin\` WHERE \`username\` = ?), ?);
                    `,
                    values: [username, createId()],
                },
                function (error) {
                    if (error) {
                        return reject(error);
                    }
                }
            );

            return resolve(connection.release());
        });
    });
}

const bodySchema = z.object({
    username: z.string(),
    password: z.string(),
});

async function handlePost(request: NextApiRequest, response: NextApiResponse) {
    const parsedBodyResult = await bodySchema.safeParseAsync(request.body);

    if (!parsedBodyResult.success) {
        return response
            .status(400)
            .send({ error: parsedBodyResult.error.issues });
    }

    const { username, password } = parsedBodyResult.data;
    const hashedPassword = createHash("sha256").update(password).digest("hex");

    if (!(await validateCredentials({ username, hashedPassword }))) {
        return response
            .status(400)
            .send({ error: "Invalid username or password" });
    }

    try {
        await createSession({
            username,
            hashedPassword,
            isValidateCredentials: false,
        });
    } catch (error) {
        console.error(error);

        return response
            .status(500)
            .send({ error: "Internal server error, something went wrong" });
    }

    return response.status(200).send({ message: "OK" });
}

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    switch (request.method) {
        case "POST":
            return await handlePost(request, response);
        default:
            return response
                .status(501)
                .json({ message: "Unimplemented method" });
    }
}
