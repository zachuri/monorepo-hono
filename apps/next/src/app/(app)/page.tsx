"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth/AuthProvider";
import type { InferResponseType } from "hono";
import type { Api } from "../../lib/api.client";

export default function App() {
	const { user, signOut, oAuthAccounts, signInWithOAuth } = useAuth();

	return (
		<div className='flex items-center flex-1 m-3'>
			<div className='flex flex-col gap-3 flex-1 w-full max-w-lg bg-white p-4 rounded-lg'>
				{user && (
					<div>
						<h3 className='mb-3'>User Information</h3>
						<div className='flex gap-4 items-center mb-3'>
							{user.profilePictureUrl ? (
								<img
									src={user.profilePictureUrl}
									alt='Profile'
									className='w-8 h-8 rounded-full'
								/>
							) : (
								<div className='w-8 h-8 bg-gray-300 rounded-full' />
							)}
							<div>
								<h4>{user.username}</h4>
								<p>{user.email}</p>
							</div>
						</div>
						<div className='flex flex-col gap-1.5'>
							<p className='text-gray-500'>User ID: {user.id}</p>
							<p className='text-gray-500'>
								E-Mail Verified: {user.emailVerified ? "yes" : "no"}
							</p>
						</div>
					</div>
				)}
				<h3>OAuth</h3>
				{["Google", "Apple", "Github"].map(provider => (
					<div
						key={provider}
						className='flex items-center justify-between bg-gray-100 rounded-lg p-3'>
						<p>{provider}</p>
						{oAuthAccounts?.some(
							account => account.provider === provider.toLowerCase()
						) ? (
							<p className='text-green-500'>Connected</p>
						) : (
							<button
								onClick={() =>
									signInWithOAuth({
										provider: provider.toLowerCase() as
											| "google"
											| "apple"
											| "github",
									})
								}>
								<p className='text-gray-700'>Connect now</p>
							</button>
						)}
					</div>
				))}
				<button
					onClick={() => {
						void signOut().then(() => window.location.replace("/auth/sign-in"));
					}}
					className='bg-gray-100 p-2 rounded-lg'>
					Sign out
				</button>
			</div>
		</div>
	);
}
