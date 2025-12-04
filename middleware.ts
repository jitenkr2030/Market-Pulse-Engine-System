import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // If user is not authenticated, redirect to sign in
    if (!token) {
      const url = new URL("/auth/signin", req.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }

    // Protected routes that require authentication
    const protectedRoutes = [
      "/dashboard",
      "/profile",
      "/settings",
      "/api/user",
      "/api/subscription",
    ]

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    )

    if (isProtectedRoute && !token) {
      const url = new URL("/auth/signin", req.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }

    // Admin routes (optional - if you have admin-specific routes)
    const adminRoutes = ["/admin"]
    const isAdminRoute = adminRoutes.some(route => 
      pathname.startsWith(route)
    )

    if (isAdminRoute && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Public routes that don't require authentication
        const publicRoutes = [
          "/",
          "/auth/signin",
          "/auth/signup",
          "/api/auth",
          "/api/auth/register",
          "/pricing",
          "/about",
          "/terms",
          "/privacy",
        ]

        // Check if the current path is a public route
        const isPublicRoute = publicRoutes.some(route => 
          pathname.startsWith(route)
        )

        // Allow access to public routes
        if (isPublicRoute) {
          return true
        }

        // Require authentication for all other routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}