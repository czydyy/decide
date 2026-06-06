import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "@/providers/AuthProvider"
import { authApi } from "@/lib/api"

export default function LoginPage() {
  const navigate=useNavigate();const{isLoggedIn,login,register:reg}=useAuthContext()
  const[mode,setMode]=useState<"login"|"register">("login");const[phone,setPhone]=useState("");const[pwd,setPwd]=useState("")
  const[pwd2,setPwd2]=useState("");const[sms,setSms]=useState("");const[cd,setCd]=useState(0);const[loading,setLoading]=useState(false);const[err,setErr]=useState<string|null>(null)
  useEffect(()=>{if(isLoggedIn)navigate("/profile",{replace:true})},[isLoggedIn])
  useEffect(()=>{if(cd<=0)return;const t=setTimeout(()=>setCd(c=>c-1),1000);return()=>clearTimeout(t)},[cd])
  const sendSms=async()=>{if(phone.length!==11)return;try{await authApi.sendSms({phone});setCd(60)}catch(e:any){setErr(e.message)}}
  const submit=async()=>{setErr(null);setLoading(true);try{if(mode==="login")await login(phone,pwd);else{if(pwd!==pwd2){setErr("两次密码不一致");setLoading(false);return};await reg(phone,pwd,sms)};navigate("/profile",{replace:true})}catch(e:any){setErr(e.message)}finally{setLoading(false)}}
  const valid=phone.length===11&&pwd.length>=6&&(mode==="login"||(pwd===pwd2&&sms.length>=4))

  return <div className="clean-bg" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:24}}>
    <div style={{width:"100%",maxWidth:420}}>
      <div style={{textAlign:"center",marginBottom:32}}><div className="landing-icon" style={{margin:"0 auto 16px"}}>☯</div><h1 className="landing-brand" style={{fontSize:32,letterSpacing:8}}>爻爻</h1><span className="landing-tagline">登录后可同步占卜记录</span></div>
      <div style={{background:"#fff",border:"1px solid var(--clean-border)",borderRadius:"var(--radius-lg)",padding:32}}>
        <div style={{display:"flex",background:"#f5f1ea",borderRadius:"var(--radius-sm)",padding:4,marginBottom:24}}>
          {(["login","register"]as const).map(m=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"10px 0",border:"none",borderRadius:"var(--radius-sm)",fontSize:14,fontWeight:mode===m?600:400,color:mode===m?"var(--ink)":"var(--ink-dim)",background:mode===m?"#fff":"transparent",cursor:"pointer",fontFamily:"var(--font)",transition:"all 0.2s"}}>{m==="login"?"登录":"注册"}</button>)}
        </div>
        <input className="chat-input" style={{borderRadius:"var(--radius-sm)",height:48,marginBottom:12,width:"100%",background:"#f5f1ea"}} placeholder="手机号" maxLength={11} value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,""))}/>
        {mode==="register"&&<div style={{display:"flex",gap:8,marginBottom:12}}><input className="chat-input" style={{borderRadius:"var(--radius-sm)",height:48,flex:1,background:"#f5f1ea"}} placeholder="验证码" maxLength={6} value={sms} onChange={e=>setSms(e.target.value.replace(/\D/g,""))}/><button onClick={sendSms} disabled={phone.length!==11||cd>0} style={{padding:"0 16px",border:"1px solid var(--gold)",borderRadius:"var(--radius-sm)",background:"transparent",fontSize:13,color:"var(--gold-text)",fontWeight:500,fontFamily:"var(--font)",cursor:"pointer",opacity:phone.length!==11||cd>0?.4:1}}>{cd>0?`${cd}s`:"获取验证码"}</button></div>}
        <input className="chat-input" style={{borderRadius:"var(--radius-sm)",height:48,marginBottom:12,width:"100%",background:"#f5f1ea"}} type="password" placeholder="密码" value={pwd} onChange={e=>setPwd(e.target.value)}/>
        {mode==="register"&&<input className="chat-input" style={{borderRadius:"var(--radius-sm)",height:48,marginBottom:12,width:"100%",background:"#f5f1ea"}} type="password" placeholder="确认密码" value={pwd2} onChange={e=>setPwd2(e.target.value)}/>}
        {err&&<p style={{fontSize:13,color:"var(--accent)",textAlign:"center",marginBottom:12}}>{err}</p>}
        <button onClick={submit} disabled={!valid||loading} className="cta-btn" style={{maxWidth:"100%"}}>{loading?"处理中...":mode==="login"?"登录":"注册"}</button>
        <p style={{fontSize:12,color:"var(--ink-dim)",textAlign:"center",marginTop:16}}>{mode==="login"?"还没有账号？":"已有账号？"}<button onClick={()=>setMode(mode==="login"?"register":"login")} style={{background:"none",border:"none",color:"var(--gold-text)",fontWeight:500,cursor:"pointer",fontFamily:"var(--font)",marginLeft:4}}>{mode==="login"?"立即注册":"去登录"}</button></p>
      </div>
    </div>
  </div>
}
