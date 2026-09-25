import { Navigate,Outlet,Route,Routes } from "react-router-dom";
import { AppShell } from "@/brain/components/AppShell";
import { useBrain } from "@/brain/store/BrainStore";
import LoginPage from "@/brain/pages/LoginPage";
import PublicPage from "@/brain/pages/PublicPage";
import DashboardPage from "@/brain/pages/DashboardPage";
import ExecutivePage from "@/brain/pages/ExecutivePage";
import ContactsPage from "@/brain/pages/ContactsPage";
import LeadsPage from "@/brain/pages/LeadsPage";
import LeadDetailPage from "@/brain/pages/LeadDetailPage";
import { InteractionsPage,SolutionsPage } from "@/brain/pages/CapturePages";
import { FollowUpsPage,MeetingsPage } from "@/brain/pages/CommercialPages";
import { FeedbackPage,ParticipationPage,ReportsPage,SettingsPage,UsersPage } from "@/brain/pages/EventPages";
function Protected(){const {authenticated}=useBrain();return authenticated?<Outlet/>:<Navigate to="/login" replace/>}
export default function App(){return <Routes><Route path="/login" element={<LoginPage/>}/><Route path="/p/conheca" element={<PublicPage/>}/><Route element={<Protected/>}><Route element={<AppShell/>}><Route index element={<DashboardPage/>}/><Route path="executivo" element={<ExecutivePage/>}/><Route path="contactos" element={<ContactsPage/>}/><Route path="leads" element={<LeadsPage/>}/><Route path="leads/:id" element={<LeadDetailPage/>}/><Route path="solucoes" element={<SolutionsPage/>}/><Route path="interacoes" element={<InteractionsPage/>}/><Route path="follow-ups" element={<FollowUpsPage/>}/><Route path="reunioes" element={<MeetingsPage/>}/><Route path="oportunidades" element={<LeadsPage opportunities/>}/><Route path="feedback" element={<FeedbackPage/>}/><Route path="participacao" element={<ParticipationPage/>}/><Route path="relatorios" element={<ReportsPage/>}/><Route path="utilizadores" element={<UsersPage/>}/><Route path="configuracoes" element={<SettingsPage/>}/></Route></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes>}