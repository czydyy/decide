import { Routes, Route } from "react-router-dom"
import LandingPage from "@/pages/LandingPage"
import PaipanPage from "@/pages/PaipanPage"
import ChatPage from "@/pages/ChatPage"
import HistoryPage from "@/pages/HistoryPage"
import InterpretPage from "@/pages/InterpretPage"
import ProfilePage from "@/pages/ProfilePage"
import LoginPage from "@/pages/LoginPage"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/paipan" element={<PaipanPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/interpret/:recordId" element={<InterpretPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}
