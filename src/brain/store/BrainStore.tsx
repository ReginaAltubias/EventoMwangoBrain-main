import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "../lib/api";
import type { BrainState, BrainUser, Contact, FollowUp, Interaction, Lead, Meeting, VisitorFeedback } from "../types";

type QuickContact = Pick<Contact,"fullName"|"company"|"phone"> & { mainSolution: Lead["mainSolution"]; interest: Lead["interest"] };
type BrainContextValue = BrainState & {
  authenticated:boolean; loading:boolean; currentUser:BrainUser|null;
  login:(email:string,password:string)=>Promise<void>; register:(data:{name:string;email:string;role:string;password:string})=>Promise<void>; logout:()=>void; refresh:()=>Promise<void>;
  createQuickContact:(data:QuickContact)=>Promise<string>; createFullContact:(contact:Omit<Contact,"id"|"createdAt"|"createdBy"|"source"|"isComplete">, lead:Omit<Lead,"id"|"contactId"|"ownerId"|"status">)=>Promise<string>;
  addInteraction:(leadId:string, description:string, type?:Interaction["type"])=>Promise<void>; addMeeting:(meeting:Omit<Meeting,"id"|"ownerId">)=>Promise<void>;
  addFollowUp:(data:{leadId:string; action:FollowUp["action"]; dueDate:string})=>Promise<void>;
  completeFollowUp:(id:string,result:string)=>Promise<void>; updateLeadStatus:(id:string,status:Lead["status"])=>Promise<void>; addFeedback:(data:Omit<VisitorFeedback,"id">)=>Promise<void>;
  createQrContact:(data:Pick<Contact,"fullName"|"company"|"role"|"whatsapp"|"email"> & {solution:Lead["mainSolution"];solutions?:Lead["solutions"];wantsDemo?:boolean})=>Promise<void>;
  markNotification:(id:string)=>Promise<void>; updateEvaluation:(evaluation:BrainState["evaluation"])=>Promise<void>;
  addSolution:(data:{name:string;subtitle:string})=>Promise<void>; updateSolution:(id:string,data:{name:string;subtitle:string})=>Promise<void>; deleteSolution:(id:string)=>Promise<void>;
  approveUser:(id:string)=>Promise<void>; rejectUser:(id:string)=>Promise<void>;
};
const BrainContext=createContext<BrainContextValue|null>(null);
const sessionKey="mwango.session";
const emptyEvaluation:BrainState["evaluation"]={scores:{},wentWell:"",difficulties:"",topSolutions:[],mainNeeds:"",improvements:""};
const emptyState:BrainState={contacts:[],leads:[],interactions:[],followUps:[],meetings:[],feedback:[],notifications:[],evaluation:emptyEvaluation,users:[],solutions:[]};
function readSession():BrainUser|null{try{const raw=localStorage.getItem(sessionKey);return raw?JSON.parse(raw) as BrainUser:null}catch{return null}}
export function BrainProvider({children}:{children:ReactNode}){
 const [state,setState]=useState<BrainState>(emptyState);
 const [loading,setLoading]=useState(true);
 const [currentUser,setCurrentUser]=useState<BrainUser|null>(readSession);
 const refresh=useCallback(async()=>{
  const data=await api.get<BrainState>("/api/state");
  setState({...data,evaluation:data.evaluation??emptyEvaluation});
 },[]);
 useEffect(()=>{refresh().catch(()=>{}).finally(()=>setLoading(false))},[refresh]);
 const value=useMemo<BrainContextValue>(()=>({...state,authenticated:!!currentUser,loading,currentUser,refresh,
  login:async(email,password)=>{const user=await api.post<BrainUser>("/api/auth/login",{email,password});localStorage.setItem(sessionKey,JSON.stringify(user));setCurrentUser(user)},
  register:async data=>{await api.post("/api/auth/register",data)},
  logout:()=>{localStorage.removeItem(sessionKey);setCurrentUser(null)},
  createQuickContact:async data=>{const result=await api.post<{contact:Contact;lead:Lead}>("/api/contacts/quick",data);await refresh();return result.lead.id},
  createFullContact:async(contactData,leadData)=>{const result=await api.post<{contact:Contact;lead:Lead}>("/api/contacts/full",{contact:contactData,lead:leadData});await refresh();return result.lead.id},
  addInteraction:async(leadId,description,type="Nota")=>{await api.post(`/api/leads/${leadId}/interactions`,{description,type});await refresh()},
  addMeeting:async meeting=>{await api.post("/api/meetings",meeting);await refresh()},
  addFollowUp:async data=>{await api.post("/api/follow-ups",data);await refresh()},
  completeFollowUp:async(id,result)=>{await api.patch(`/api/follow-ups/${id}/complete`,{result});await refresh()},
  updateLeadStatus:async(id,status)=>{await api.patch(`/api/leads/${id}/status`,{status});await refresh()},
  addFeedback:async data=>{await api.post("/api/feedback",data);await refresh()},
  createQrContact:async data=>{await api.post("/api/public/qr-contact",data);await refresh()},
  markNotification:async id=>{await api.patch(`/api/notifications/${id}/read`);await refresh()},
  updateEvaluation:async evaluation=>{await api.put("/api/evaluation",evaluation);await refresh()},
  addSolution:async data=>{await api.post("/api/solutions",data);await refresh()},
  updateSolution:async(id,data)=>{await api.patch(`/api/solutions/${id}`,data);await refresh()},
  deleteSolution:async id=>{await api.delete(`/api/solutions/${id}`);await refresh()},
  approveUser:async id=>{await api.patch(`/api/users/${id}/approve`);await refresh()},
  rejectUser:async id=>{await api.delete(`/api/users/${id}`);await refresh()}
 }),[state,currentUser,loading,refresh]);
 return <BrainContext.Provider value={value}>{children}</BrainContext.Provider>
}
export function useBrain(){const value=useContext(BrainContext);if(!value)throw new Error("useBrain requer BrainProvider");return value}
