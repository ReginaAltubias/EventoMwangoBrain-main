import { accountGrowth, activity, admins, audit, groups, reports, users } from "@/mocks/data";

const wait = <T,>(data: T, delay = 220) => new Promise<T>((resolve) => window.setTimeout(() => resolve(data), delay));

export const api = {
  dashboard: () => wait({ activity, accountGrowth, reports: reports.slice(0, 3) }),
  users: () => wait(users),
  user: (id: string) => wait(users.find((user) => user.id === id)),
  reports: () => wait(reports),
  groups: () => wait(groups),
  admins: () => wait(admins),
  audit: () => wait(audit),
};