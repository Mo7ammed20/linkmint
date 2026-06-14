import { dbQuery } from "@/lib/db";
import { RedirectFlow } from "@/components/redirect/redirect-flow";
import { LinkNotFound } from "@/components/redirect/link-not-found";
import { createRedirectSession } from "@/lib/redirect-session";

export const dynamic = "force-dynamic";

function isLinkAccessible(status: string, expiresAt: Date | null): boolean {
  if (status !== "active") return false;
  if (!expiresAt) return true;
  return expiresAt.getTime() >= Date.now();
}

export default async function RedirectPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const link = await dbQuery((p) =>
    p.link.findUnique({
      where: { shortCode: code },
      select: {
        id: true,
        shortCode: true,
        destination: true,
        title: true,
        description: true,
        status: true,
        expiresAt: true,
      },
    }),
  );
  if (!link || !isLinkAccessible(link.status, link.expiresAt)) {
    return <LinkNotFound code={code} />;
  }

  const sessionToken = await createRedirectSession({
    linkId: link.id,
    shortCode: link.shortCode,
    destination: link.destination,
    title: link.title,
    description: link.description,
  });

  return (
    <RedirectFlow
      sessionToken={sessionToken}
      shortCode={link.shortCode}
      title={link.title}
      description={link.description}
    />
  );
}
