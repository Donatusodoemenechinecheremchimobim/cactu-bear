import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import TwitterProvider from "next-auth/providers/twitter";
import fs from 'fs';
import path from 'path';

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: { label: "Email", type: "text" }, password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        // 1. Check for Admin Hardcoded
        if (credentials?.email === "admin@cactus.com" && credentials?.password === "password123") {
           return { id: "admin-1", name: "Travis", email: "admin@cactus.com", role: "admin" };
        }
        
        // 2. Check Database for Users
        const dataPath = path.join(process.cwd(), 'data', 'users.json');
        if (fs.existsSync(dataPath)) {
          const fileData = fs.readFileSync(dataPath, 'utf8');
          const users = JSON.parse(fileData);
          const user = users.find((u: any) => u.email === credentials?.email);
          
          if (user && user.password === credentials?.password) {
            return { id: user.id, name: user.name, email: user.email, role: user.role || 'user' };
          }
        }
        return null;
      }
    }),
    // Social Providers (Requires Keys in .env to work strictly)
    GoogleProvider({ clientId: process.env.GOOGLE_ID || "test", clientSecret: process.env.GOOGLE_SECRET || "test" }),
    FacebookProvider({ clientId: process.env.FACEBOOK_ID || "test", clientSecret: process.env.FACEBOOK_SECRET || "test" }),
    TwitterProvider({ clientId: process.env.TWITTER_ID || "test", clientSecret: process.env.TWITTER_SECRET || "test" }),
  ],
  callbacks: {
    async jwt({ token, user }) { if (user) token.role = (user as any).role; return token; },
    async session({ session, token }) { if (session?.user) (session.user as any).role = token.role; return session; },
  },
  pages: { signIn: '/login' },
});
export { handler as GET, handler as POST };