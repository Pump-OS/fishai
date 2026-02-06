import { NextResponse, type NextRequest } from "next/server";

export async function middleware(_request: NextRequest) {
  // No auth middleware needed — app works without Supabase
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|music|images|video|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
  ],
};
