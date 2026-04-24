import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const role = req.auth?.user?.role;
    const isAuthenticated = !!req.auth;
    const loginUrl = new URL("/login", req.nextUrl);

    if (!isAuthenticated) return NextResponse.redirect(loginUrl);

    if (pathname.startsWith("/dashboard/customer") && role !== "CUSTOMER" && role !== "ADMIN")
        return NextResponse.redirect(new URL("/login", req.nextUrl));

    if (pathname.startsWith("/dashboard/supplier") && role !== "SUPPLIER" && role !== "ADMIN")
        return NextResponse.redirect(new URL("/login", req.nextUrl));

    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN")
        return NextResponse.redirect(new URL("/", req.nextUrl));

    return NextResponse.next();
});

export const config = {
    matcher: ["/dashboard/:path*"],
};
