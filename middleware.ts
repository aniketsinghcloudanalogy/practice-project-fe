import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";


export default withAuth(
    function middleware() {
        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                if (
                    pathname.startsWith("/dashboard") ||
                    pathname.startsWith("/login") ||
                    pathname.startsWith("/signup")
                ) {
                    return true;
                }
                
                // public route
                if(pathname ==="/" ){
                        return true;
                }

                return !!token;
            }
        }
    }
)


export const config = {
    matcher : ["/((?!_next/static|_next/iamge|favicon.ico|public/).*)"]
} 
