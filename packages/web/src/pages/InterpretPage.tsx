import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { historyApi } from "@/lib/api"
import type { HistoryDetail } from "@liuyao/shared"
const mL:Record<string,string>={yao:"铜钱起卦",number:"数字起卦",time:"时间起卦",manual:"手动排盘"}

export default function InterpretPage() {
  const{recordId}=useParams<{recordId:string}>();const navigate=useNavigate();const[rec,setRec]=useState<HistoryDetail|null>(null);const[loading,setLoading]=useState(true)
  useEffect(()=>{if(recordId)historyApi.get(recordId).then(setRec).catch(()=>{}).finally(()=>setLoading(false))},[recordId])
  if(loading)return<div className="clean-bg" style={{display:"flex",alignItems:"center",justifyContent:"center"}}><div className="spin spin-dark"/></div>
  if(!rec)return<div className="clean-bg" style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}><p style={{color:"var(--ink-dim)"}}>记录不存在</p><button onClick={()=>navigate(-1)} className="form-back">←</button></div>

  return <div className="clean-bg" style={{minHeight:"100vh",padding:"40px 24px 48px",display:"flex",flexDirection:"column",alignItems:"center"}}>
    <div style={{width:"100%",maxWidth:"var(--chat-max)"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}><button className="form-back" onClick={()=>navigate(-1)}>←</button><span style={{fontSize:19,fontWeight:700,color:"var(--ink)",letterSpacing:2}}>解读详情</span></div>
      <div style={{background:"#fff",border:"1px solid var(--clean-border)",borderRadius:"var(--radius-lg)",padding:24,marginBottom:14}}>
        {rec.question&&<h2 style={{fontSize:18,fontWeight:600,color:"var(--ink)",marginBottom:8,lineHeight:1.5}}>{rec.question}</h2>}
        <div style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"var(--ink-dim)"}}><span className="hist-badge">{mL[rec.method]??rec.method}</span><span>{new Date(rec.created_at).toLocaleDateString("zh-CN")}</span></div>
      </div>
      <div style={{background:"#fff",border:"1px solid var(--clean-border)",borderRadius:"var(--radius-lg)",padding:24}}>
        <span style={{fontSize:11,color:"var(--gold-text)",letterSpacing:2,fontWeight:600,display:"block",marginBottom:14,opacity:0.85}}>AI 解读</span>
        {rec.ai_interpretation?<div style={{fontSize:15,lineHeight:1.75,color:"var(--ink-sec)"}}>{rec.ai_interpretation.split("\n").map((l,i)=>l.startsWith("【")&&l.includes("】")?<h4 key={i} style={{color:"var(--gold-text)",fontWeight:700,marginTop:16,marginBottom:4,fontSize:14}}>{l}</h4>:<p key={i} style={{marginBottom:4}}>{l}</p>)}</div>:<p style={{fontSize:14,color:"var(--ink-dim)"}}>暂无 AI 解读</p>}
      </div>
    </div>
  </div>
}
