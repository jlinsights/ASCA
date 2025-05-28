import { clerkMiddleware } from "@clerk/nextjs/server";

// 기본 Clerk 미들웨어 - 모든 라우트에서 인증 상태 제공
export default clerkMiddleware();

// 향후 특정 라우트 보호가 필요한 경우:
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
// export default clerkMiddleware((auth, req) => {
//   if (isProtectedRoute(req)) auth().protect();
// });

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}; 