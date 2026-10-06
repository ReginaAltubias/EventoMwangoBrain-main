import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { brainService } from "../services";
import type { BrainState, BrainUser, Contact, ContactCreateInput, ContactDetail, FollowUpCreateInput, Interaction, InteractionCreateInput, Lead, LeadDetail, LeadWriteInput, Meeting, SolutionWriteInput, VisitorFeedback } from "../types";

type QuickContact = Pick<Contact,"fullName"|"company"|"phone"> & { mainSolution: Lead["mainSolution"]; interest: Lead["interest"]; notes?: string };
type BrainContextValue = BrainState & {
  authenticated:boolean; loading:boolean; currentUser:BrainUser|null;
  login:(email:string,password:string)=>Promise<void>; register:(data:{name:string;email:string;role:string;password:string})=>Promise<void>; logout:()=>void; refresh:()=>Promise<void>;
  getContact:(id:string)=>Promise<ContactDetail>; createContact:(data:ContactCreateInput)=>Promise<void>;
  updateContact:(id:string,data:ContactCreateInput)=>Promise<ContactDetail>; deleteContact:(id:string)=>Promise<void>;
  getLead:(id:string)=>Promise<LeadDetail>; createLead:(data:Omit<LeadWriteInput,"ownerId">)=>Promise<Lead>;
  updateLead:(id:string,data:LeadWriteInput)=>Promise<Lead>; deleteLead:(id:string)=>Promise<void>;
  createQuickContact:(data:QuickContact)=>Promise<string>; createFullContact:(contact:Omit<Contact,"id"|"createdAt"|"createdBy"|"source"|"isComplete">, lead:Omit<Lead,"id"|"contactId"|"ownerId"|"status">)=>Promise<string>;
  createInteraction:(data:InteractionCreateInput)=>Promise<void>; addInteraction:(leadId:string, description:string, type?:Interaction["type"])=>Promise<void>; addMeeting:(meeting:Omit<Meeting,"id"|"ownerId">)=>Promise<void>;
  addFollowUp:(data:FollowUpCreateInput)=>Promise<void>; updateFollowUp:(id:string)=>Promise<void>;
  completeFollowUp:(id:string)=>Promise<void>; updateLeadStatus:(id:string,status:Lead["status"])=>Promise<void>; addFeedback:(data:Omit<VisitorFeedback,"id">)=>Promise<void>;
  createQrContact:(data:Pick<Contact,"fullName"|"company"|"role"|"whatsapp"|"email"> & {solution:Lead["mainSolution"];solutions?:Lead["solutions"];wantsDemo?:boolean;notes?:string})=>Promise<void>;
  markNotification:(id:string)=>Promise<void>; updateEvaluation:(evaluation:BrainState["evaluation"])=>Promise<void>;
  addSolution:(data:{name:string;subtitle:string})=>Promise<void>; updateSolution:(id:string,data:{name:string;subtitle:string})=>Promise<void>; deleteSolution:(id:string)=>Promise<void>;
  approveUser:(id:string)=>Promise<void>; deleteUser:(id:string|number)=>Promise<void>;
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
  const [data,contacts,leads,interactions,followUps,meetings,feedback,solutions,users,notifications,evaluation]=await Promise.all([
   api.get<BrainState>("/api/state"),
   brainService.getContacts(),
   brainService.getLeads(),
   brainService.getInteractions(),
   brainService.getFollowUps(),
   brainService.getMeetings(),
   brainService.getFeedback(),
   brainService.getSolutions(),
   brainService.getUsers(),
   brainService.getNotifications(),
   brainService.getEvaluation()
  ]);
  setState({...data,contacts,leads,interactions,followUps,meetings,feedback,solutions,users,notifications,evaluation});
 },[]);
 useEffect(()=>{refresh().catch(err=>toast.error(err instanceof Error?err.message:"Erro ao carregar dados da API")).finally(()=>setLoading(false))},[refresh]);
 const value=useMemo<BrainContextValue>(()=>({...state,authenticated:!!currentUser,loading,currentUser,refresh,
  getContact:async id=>brainService.getContact(id),
  createContact:async data=>{await brainService.createContact(data);await refresh()},
  updateContact:async(id,data)=>{const contact=await brainService.updateContact(id,data);await refresh();return contact},
  deleteContact:async id=>{await brainService.deleteContact(id);await refresh()},
  getLead:async id=>brainService.getLead(id),
  createLead:async data=>{
   if(!currentUser)throw new Error("É necessário iniciar sessão para criar uma lead.");
   const lead=await brainService.createLead({...data,ownerId:currentUser.id});
   await refresh();
   return lead
  },
  updateLead:async(id,data)=>{const lead=await brainService.updateLead(id,data);await refresh();return lead},
  deleteLead:async id=>{await brainService.deleteLead(id);await refresh()},
  login:async(email,password)=>{const user=await api.post<BrainUser>("/api/auth/login",{email,password});localStorage.setItem(sessionKey,JSON.stringify(user));setCurrentUser(user)},
  register:async data=>{await api.post("/api/auth/register",data)},
  logout:()=>{localStorage.removeItem(sessionKey);setCurrentUser(null)},
  createQuickContact:async data=>{const result=await api.post<{contact:Contact;lead:Lead}>("/api/contacts/quick",data);await refresh();return result.lead.id},
  createFullContact:async(contactData,leadData)=>{const result=await api.post<{contact:Contact;lead:Lead}>("/api/contacts/full",{contact:contactData,lead:leadData});await refresh();return result.lead.id},
  createInteraction:async data=>{await brainService.createInteraction(data);await refresh()},
  addInteraction:async(leadId,description,type="Nota")=>{await brainService.createInteractionForLead(leadId,{description,type});await refresh()},
  addMeeting:async meeting=>{
   if(!currentUser)throw new Error("É necessário iniciar sessão para agendar uma reunião.");
   await brainService.createMeeting(meeting,currentUser.id);
   await refresh()
  },
  addFollowUp:async data=>{await brainService.createFollowUp(data);await refresh()},
  updateFollowUp:async id=>{await brainService.updateFollowUp(id);await refresh()},
  completeFollowUp:async id=>{await brainService.completeFollowUp(id);await refresh()},
  updateLeadStatus:async(id,status)=>{await brainService.updateLeadStatus(id,status);await refresh()},
  addFeedback:async data=>{await brainService.createFeedback(data);await refresh()},
  createQrContact:async data=>{await api.post("/api/public/qr-contact",data);await refresh()},
  markNotification:async id=>{
   await brainService.markNotificationRead(id);
   setState(previous=>({...previous,notifications:previous.notifications.map(notification=>notification.id===id?{...notification,read:true}:notification)}))
  },
  updateEvaluation:async evaluation=>{
   const saved=await brainService.saveEvaluation(evaluation);
   setState(previous=>({...previous,evaluation:saved}))
  },
  addSolution:async data=>{await brainService.createSolution(data);await refresh()},
  updateSolution:async(id,data:SolutionWriteInput)=>{await brainService.updateSolution(id,data);await refresh()},
  deleteSolution:async id=>{await brainService.deleteSolution(id);await refresh()},
  approveUser:async id=>{await api.patch(`/api/users/${id}/approve`);await refresh()},
  deleteUser:async id=>{
   await brainService.deleteUser(id);
   setState(previous=>({...previous,users:previous.users.filter(user=>String(user.id)!==String(id))}));
   if(currentUser&&String(currentUser.id)===String(id)){
    localStorage.removeItem(sessionKey);
    setCurrentUser(null)
   }
  }
 }),[state,currentUser,loading,refresh]);
 return <BrainContext.Provider value={value}>{children}</BrainContext.Provider>
}
export function useBrain(){const value=useContext(BrainContext);if(!value)throw new Error("useBrain requer BrainProvider");return value}
