import { redis } from "@/lib/upstash";
import { isIframeable } from "@dub/utils";
import { recordLink } from "../../tinybird";

export async function setRootDomain({
  id,
  domain,
  domainCreatedAt,
  projectId,
  url,
  rewrite,
  newDomain,
}: {
  id: string;
  domain: string;
  domainCreatedAt: Date;
  projectId: string;
  url?: string;
  rewrite?: boolean;
  newDomain?: string; // if the domain is changed, this will be the new domain
}) {
  console.log({
    id,
    domain,
    domainCreatedAt,
    projectId,
    url,
    rewrite,
    newDomain,
  });
  if (newDomain) {
    await redis.rename(domain.toLowerCase(), newDomain.toLowerCase());
  }
  return await Promise.allSettled([
    redis.hset(newDomain ? newDomain.toLowerCase() : domain.toLowerCase(), {
      _root: {
        id,
        ...(url && {
          url,
        }),
        ...(url &&
          rewrite && {
            rewrite: true,
            iframeable: await isIframeable({
              url,
              requestDomain: newDomain
                ? newDomain.toLowerCase()
                : domain.toLowerCase(),
            }),
          }),
        projectId,
      },
    }),
    recordLink({
      link_id: id,
      domain: newDomain || domain,
      key: "_root",
      url: url || "",
      workspace_id: projectId,
      created_at: domainCreatedAt,
    }),
  ]);
}
