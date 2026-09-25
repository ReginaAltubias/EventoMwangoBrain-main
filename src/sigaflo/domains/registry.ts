import type { DomainConfig } from "@/sigaflo/core/config";
import { incaDomain } from "@/sigaflo/domains/inca";

/** Domínios com dados completos disponíveis nesta fase. */
export const DOMAINS: DomainConfig[] = [incaDomain];

export const findDomain = (key?: string) => DOMAINS.find((d) => d.key === key);

export const findEntity = (domainKey?: string, entityKey?: string) =>
  findDomain(domainKey)?.entities.find((e) => e.key === entityKey);
