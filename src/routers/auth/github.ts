import { GitHub } from "arctic";
import type { Context } from "hono";
import { env } from "hono/adapter";

import { oauthAccountTable } from "@/db/table/oauth.account";
import { User, userTable } from "@/db/schema";
import { AppContext } from "@/utils/context";
import { createSession, validateSessionToken } from "@/utils/sessions";
import { generateIdFromEntropySize } from "lucia"; // Note: okay to use lucia api

const githubClient = (c: Context<AppContext>) =>
	new GitHub(env(c).GITHUB_CLIENT_ID, env(c).GITHUB_CLIENT_SECRET, null);

export const getGithubAuthorizationUrl = async ({
	c,
	state,
}: {
	c: Context<AppContext>;
	state: string;
}) => {
	const github = githubClient(c);
	return await github.createAuthorizationURL(state, [
		"read:user",
		"user:email",
	]);
};

export const createGithubSession = async ({
	c,
	idToken,
	sessionToken,
}: {
	c: Context<AppContext>;
	idToken: string;
	sessionToken?: string;
}) => {
	const github = githubClient(c);
	const tokens = await github.validateAuthorizationCode(idToken);
	const accessToken = tokens.accessToken();

	const githubUserResponse = await fetch("https://api.github.com/user", {
		headers: {
			"User-Agent": "hono",
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const githubUserResult: {
		id: number;
		login: string; // username
		name: string;
		avatar_url: string;
	} = await githubUserResponse.json();

	const userEmailResponse = await fetch("https://api.github.com/user/emails", {
		headers: {
			"User-Agent": "hono",
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const userEmailResult = await userEmailResponse.json();
	console.log("userEmailResult", userEmailResult); // Debugging line

	if (!Array.isArray(userEmailResult)) {
		throw new Error("Expected an array of emails from GitHub API");
	}

	const primaryEmail = userEmailResult.find(email => email.primary);
	if (!primaryEmail) {
		return null;
	}

	const existingAccount = await c.get("db").query.oauthAccountTable.findFirst({
		where: (account, { eq }) =>
			eq(account.providerUserId, githubUserResult.id.toString()),
	});
	let existingUser: User | null = null;
	if (sessionToken) {
		const sessionUser = await validateSessionToken(sessionToken, c);
		if (sessionUser.user) {
			existingUser = sessionUser.user as User;
		}
	} else {
		const response = await c.get("db").query.userTable.findFirst({
			where: (u, { eq }) => eq(u.email, primaryEmail.email),
		});
		if (response) {
			existingUser = response;
		}
	}
	if (
		existingUser?.emailVerified &&
		primaryEmail.verified &&
		!existingAccount
	) {
		await c.get("db").insert(oauthAccountTable).values({
			providerUserId: githubUserResult.id.toString(),
			provider: "github",
			userId: existingUser.id,
		});
		const session = await createSession(existingUser.id, idToken, c);
		return session;
	}

	if (existingAccount) {
		const session = await createSession(existingAccount.userId, idToken, c);
		return session;
	} else {
		const userId = generateIdFromEntropySize(15);
		let username = githubUserResult.login;
		const existingUsername = await c.get("db").query.userTable.findFirst({
			where: (u, { eq }) => eq(u.username, username),
		});
		if (existingUsername) {
			username = `${username}-${generateIdFromEntropySize(5)}`;
		}
		await c
			.get("db")
			.insert(userTable)
			.values({
				id: userId,
				username,
				profilePictureUrl: githubUserResult.avatar_url,
				email: primaryEmail.email ?? "",
				emailVerified: primaryEmail.verified ? 1 : 0,
			});
		await c.get("db").insert(oauthAccountTable).values({
			providerUserId: githubUserResult.id.toString(),
			provider: "github",
			userId,
		});

		const session = await createSession(userId, idToken, c);

		return session;
	}
};
