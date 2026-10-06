import { api as httpApi } from "@/brain/lib/api";
import { accountGrowth, activity, admins, audit, groups, reports, users } from "@/mocks/data";

export const api = {
  dashboard: async () => {
    try {
      const data = await httpApi.get<any>("/api/state");
      return {
        activity: data.activity ?? activity,
        accountGrowth: data.accountGrowth ?? accountGrowth,
        reports: data.reports ?? reports.slice(0, 3),
      };
    } catch {
      return { activity, accountGrowth, reports: reports.slice(0, 3) };
    }
  },
  users: async () => {
    try {
      const data = await httpApi.get<any[]>("/api/users");
      return data && data.length ? data : users;
    } catch {
      return users;
    }
  },
  user: async (id: string) => {
    try {
      const data = await httpApi.get<any[]>(`/api/users`);
      return data?.find((u) => u.id === id) ?? users.find((user) => user.id === id);
    } catch {
      return users.find((user) => user.id === id);
    }
  },
  reports: () => Promise.resolve(reports),
  groups: () => Promise.resolve(groups),
  admins: () => Promise.resolve(admins),
  audit: () => Promise.resolve(audit),
};