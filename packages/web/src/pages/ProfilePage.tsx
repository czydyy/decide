import { useNavigate } from "react-router-dom"
import { useAuthContext } from "@/providers/AuthProvider"

export default function ProfilePage() {
  const navigate=useNavigate();const{user,isLoggedIn,logout,loading}=useAuthContext()
  if(loading)return<div className="clean-bg" style={{display:"flex",alignItems:"center",justifyContent:"center"}}><div className="spin spin-dark"/></div>
  if(!isLoggedIn)return<div className="clean-bg prof-page"><div className="prof-body"><div className="prof-card" style={{marginBottom:24}}><div className="prof-avatar"><span style={{fontSize:36,color:"#fff",fontWeight:700}}>爻</span></div><span className="prof-name">未登录</span><span className="prof-id">登录后查看占卜记录</span></div><button onClick={()=>navigate("/login")} className="cta-btn">登录 / 注册</button></div></div>
  return <div className="clean-bg prof-page"><div className="prof-body">
    <div className="prof-card"><div className="prof-avatar"><span style={{fontSize:36,color:"#fff",fontWeight:700}}>{user?.nickname?.[0]??"爻"}</span></div><span className="prof-name">{user?.nickname??"用户"}</span><span className="prof-id">ID: {user?.id?.slice(0,8)??"—"}</span>
      <div className="prof-stats"><div className="prof-stat"><span className="prof-stat-n">12</span><span className="prof-stat-l">占卜次数</span></div><div className="prof-stat"><span className="prof-stat-n">64</span><span className="prof-stat-l">已学卦象</span></div><div className="prof-stat"><span className="prof-stat-n">3</span><span className="prof-stat-l">收藏解读</span></div></div></div>
    <div className="prof-menu">{[{l:"我的解读",on:()=>navigate("/history")},{l:"收藏解读"},{l:"设置"}].map((item,i)=><div key={item.l} className="prof-menu-item" onClick={item.on??(()=>alert("开发中"))}><span className="prof-mi">{i===0?"📋":i===1?"⭐":"⚙️"}</span><span className="prof-ml">{item.l}</span><span className="prof-ma">→</span></div>)}</div>
    <button onClick={async()=>{if(confirm("退出？")){await logout();navigate("/",{replace:true})}}} style={{display:"block",margin:"24px auto 0",background:"none",border:"none",fontSize:14,color:"var(--ink-dim)",cursor:"pointer",fontFamily:"var(--font)"}}>退出登录</button>
    <div className="prof-footer">爻爻 · 以卦明辨</div>
  </div></div>
}
