import { initialState } from "../data/mock";
const wait=<T,>(value:T)=>new Promise<T>(resolve=>window.setTimeout(()=>resolve(value),180));
export const brainService={getContacts:()=>wait(initialState.contacts),getLeads:()=>wait(initialState.leads),getFollowUps:()=>wait(initialState.followUps),getMeetings:()=>wait(initialState.meetings),getFeedback:()=>wait(initialState.feedback)};
