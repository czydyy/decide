import { useState, useEffect, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { conversationApi } from "@/lib/api"
import type { PaipanData, PaipanSummary } from "@liuyao/shared"

interface Msg { id:string; role:"user"|"assistant"; content:string }

export default function ChatPage() {
  const navigate=useNavigate();const[sp]=useSearchParams();const[msgs,setMsgs]=useState<Msg[]>([])
  const[inp,setInp]=useState("");const[streaming,setStreaming]=useState(false);const[sText,setSText]=useState("")
  const[cid,setCid]=useState<string|null>(null);const[loading,setLoading]=useState(true)
  const[paipan,setPaipan]=useState<PaipanSummary|null>(null);const mid=useRef(0);const sr=useRef<HTMLDivElement>(null)

  useEffect(()=>{const dStr=sp.get("data"),q=sp.get("question")??"占卜";if(!dStr){navigate("/",{replace:true});return};let pd:PaipanData;try{pd=JSON.parse(decodeURIComponent(dStr))}catch{navigate("/",{replace:true});return}
    conversationApi.create({question:q,method:"manual",hexagram_index:pd.ben_gua.index??1,dong_yao:pd.dong_yao,day_gan:"甲",month_zhi:"子",day_zhi:"午"})
      .then(res=>{setCid(res.conversation_id);setPaipan(res.paipan);mid.current++;setMsgs([{id:`m${mid.current}`,role:"user",content:q}]);setStreaming(true);let full=""
        conversationApi.streamMessage(res.conversation_id,{content:q},c=>{full+=c;setSText(full)},()=>{mid.current++;setMsgs(p=>[...p,{id:`m${mid.current}`,role:"assistant",content:full}]);setSText("");setStreaming(false)},()=>setStreaming(false))}).finally(()=>setLoading(false))},[])
  useEffect(()=>{sr.current?.scrollTo({top:sr.current.scrollHeight,behavior:"smooth"})},[msgs,sText])

  const send=()=>{if(!inp.trim()||!cid||streaming)return;const c=inp.trim();setInp("");mid.current++;setMsgs(p=>[...p,{id:`m${mid.current}`,role:"user",content:c}]);setStreaming(true);let full=""
    conversationApi.streamMessage(cid,{content:c},ch=>{full+=ch;setSText(full)},()=>{mid.current++;setMsgs(p=>[...p,{id:`m${mid.current}`,role:"assistant",content:full}]);setSText("");setStreaming(false)},()=>setStreaming(false))}
  const fmt=(t:string)=>t.split("\n").map((l,i)=>l.startsWith("【")&&l.includes("】")?<h4 key={i} style={{color:"var(--gold-text)",fontWeight:700,marginTop:16,marginBottom:4,fontSize:14}}>{l}</h4>:<p key={i} style={{marginBottom:4,fontSize:14,lineHeight:1.8,color:"var(--ink-sec)"}}>{l}</p>)

  if(loading)return <div className="clean-bg" style={{display:"flex",alignItems:"center",justifyContent:"center"}}><div className="spin spin-dark"/></div>

  return <div className="chat-page">
    <header className="chat-header">
      <button className="form-back" onClick={()=>navigate(-1)}>←</button>
      <div style={{flex:1}}><span style={{fontSize:15,fontWeight:600,color:"var(--ink)"}}>AI 解读</span>{paipan&&<span style={{fontSize:12,color:"var(--ink-dim)",display:"block",marginTop:1}}>{paipan.ben_gua.symbol} {paipan.ben_gua.name}</span>}</div>
    </header>
    <div ref={sr} className="chat-msgs"><div className="chat-msgs-inner">
      {msgs.map(m=><div key={m.id} className={`msg-row ${m.role}`}><div className={`msg-bubble ${m.role}`}>{fmt(m.content)}</div></div>)}
      {streaming&&sText&&<div className="msg-row assistant"><div className="msg-bubble assistant">{fmt(sText)}<span style={{display:"inline-block",width:2,height:16,background:"var(--gold)",marginLeft:2,verticalAlign:"middle"}}/></div></div>}
      {streaming&&!sText&&<div className="msg-row assistant"><div className="msg-bubble assistant"><span style={{display:"flex",gap:5}}>{[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:"var(--ink-dim)",animation:`bounce 1s ${i*0.15}s infinite`}}/>)}</span></div></div>}
    </div></div>
    <div className="chat-input-wrap"><div className="chat-input-row">
      <input className="chat-input" placeholder="追问更多细节..." value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
      <button onClick={send} disabled={!inp.trim()||streaming} className={`chat-send ${inp.trim()?"active":""}`}>↑</button>
    </div></div>
  </div>
}
