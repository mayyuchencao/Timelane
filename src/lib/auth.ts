import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  providers: [
    EmailProvider({
      from: process.env.RESEND_FROM,
      maxAge: 24 * 60 * 60,
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        if (!process.env.RESEND_API_KEY) {
          throw new Error("Missing RESEND_API_KEY.");
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: provider.from as string,
          to: identifier,
          subject: "Sign in to Timelane",
          html: `
            <div style="font-family: Georgia, serif; padding: 32px; color: #322d2b;">
              <p style="letter-spacing: 0.22em; text-transform: uppercase; font-size: 12px; color: #857b76;">Timelane</p>
              <h1 style="font-size: 28px; margin: 12px 0;">Your magic link is ready.</h1>
              <p style="font-size: 16px; line-height: 1.7; color: #5b504b;">Use the button below to sign in to your personal time tracking space.</p>
              <p style="margin: 28px 0;">
                <a href="${url}" style="display: inline-block; border: 1px solid rgba(91,80,75,0.24); padding: 12px 18px; border-radius: 999px; color: #322d2b; text-decoration: none;">Sign in to Timelane</a>
              </p>
              <p style="font-size: 14px; line-height: 1.7; color: #857b76;">If you did not request this email, you can safely ignore it.</p>
            </div>
          `,
          text: `Sign in to Timelane: ${url}`,
        });
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    verifyRequest: "/sign-in?sent=1",
  },
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { displayName: true, timezone: true },
        });
        session.user.id = user.id;
        session.user.displayName = dbUser?.displayName ?? null;
        session.user.timezone = dbUser?.timezone ?? null;
      }

      return session;
    },
  },
  events: {
    createUser: async ({ user }) => {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          displayName: user.email?.split("@")[0] ?? "You",
          name: user.email?.split("@")[0] ?? "You",
        },
      });
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
