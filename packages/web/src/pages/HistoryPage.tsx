import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { historyApi } from "@/lib/api"
import type { HistoryItem } from "@liuyao/shared"

const mL:Record<string,string>={yao:"铜钱起卦",number:"数字起卦",time:"时间起卦",manual:"手动排盘"}

export default function HistoryPage() {
  const navigate=useNavigate();const[items,setItems]=useState<HistoryItem[]>([]);const[loading,setLoading]=useState(true)
  useEffect(()=>{historyApi.list(1,50).then(setItems).catch(()=>{}).finally(()=>setLoading(false))},[])
  const del=async(id:string)=>{if(!confirm("删除？"))return;try{await historyApi.delete(id);setItems(p=>p.filter(i=>i.id!==id))}catch{}}

  return <div className="clean-bg hist-page">
    <div className="hist-body">
      <div className="hist-hdr">
        <div style={{display:"flex",alignItems:"center",gap:12}}><button className="form-back" onClick={()=>navigate(-1)}>←</button><span className="hist-title" style={{marginBottom:0}}>历史记录</span></div>
        <span className="hist-desc">过往占卜，随时回顾</span>
      </div>
      {loading?<div className="spin spin-dark"/>:items.length===0?<div className="hist-empty"><span style={{fontSize:52,display:"block",marginBottom:16}}>📜</span><span style={{fontSize:17,color:"var(--ink)"}}>还没有占卜记录</span><span style={{fontSize:14,color:"var(--ink-dim)",marginTop:6,display:"block"}}>去首页开始第一次占卜吧</span></div>:items.map(item=>{const d=new Date(item.created_at),ds=`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;return <div key={item.id} className="hist-card" onClick={()=>navigate(`/interpret/${item.id}`)} style={{cursor:"pointer"}}>
        <div className="hist-card-top"><span className="hist-badge">{mL[item.method]??item.method}</span><span className="hist-time">{ds}</span></div>
        <span className="hist-gua">{item.ben_gua_name}</span>
        {item.question&&<span className="hist-question">{item.question}</span>}
        {item.ai_interpretation&&<span className="hist-preview">{item.ai_interpretation.slice(0,100)}</span>}
        <div className="hist-card-bot"><span className="hist-dyn">动爻: 第{item.dong_yao?.join("、")||"—"}爻</span><button className="hist-del" onClick={e=>{e.stopPropagation();del(item.id)}}>删除</button></div>
      </div>})}</div></div>
}
