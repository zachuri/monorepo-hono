"use client";

import React from "react";

export default function AppProviders({
	children,
}: {
	children: React.ReactNode;
}) {
	// NOTE: place all third party context providers here
	return <div>{children}</div>;
}
