import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { qiguaApi } from "@/lib/api"
import type { PaipanData } from "@liuyao/shared"

export default function PaipanPage() {
  const navigate = useNavigate()
  const [sp] = useSearchParams()
  const [d, setD] = useState<PaipanData|null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string|null>(null)
  const question = sp.get("question")??""

  useEffect(()=>{
    const m = sp.get("method") as any
    if(!m){setErr("缺少起卦方式");setLoading(false);return}
    qiguaApi.fullPaipan({method:m,day_gan:"甲"}).then(setD).catch(e=>setErr(e.message)).finally(()=>setLoading(false))
  },[])

  if(loading)return <div className="warm-bg" style={{display:"flex",alignItems:"center",justifyContent:"center"}}><div className="spin"/></div>
  if(err||!d)return <div className="warm-bg" style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12,padding:40}}><p style={{color:"#f0ebe0"}}>{err}</p><button onClick={()=>navigate("/")} style={{color:"var(--gold)",background:"none",border:"none",cursor:"pointer",fontSize:14}}>返回首页</button></div>

  return (
    <div className="warm-bg">
      <div className="paipan-page">
        <div className="form-top">
          <button className="form-back" onClick={()=>navigate(-1)}>←</button>
          <span style={{fontSize:19,fontWeight:700,color:"#f0ebe0",letterSpacing:2}}>卦象结果</span>
        </div>
        <div className="paipan-body">
          {question && <div className="q-banner"><span className="q-banner-lbl">占问</span><span className="q-banner-txt">{question}</span></div>}
          <div className="gua-hero"><span className="gua-symbol">{d.ben_gua.symbol}</span><span className="gua-name">{d.ben_gua.name}</span><span className="gua-sub">{d.palace}宫 · {d.palace_element}</span>{d.ben_gua.gua_ci&&<p className="gua-ci">{d.ben_gua.gua_ci}</p>}</div>
          <div className="yao-card">
            <div className="yao-row yao-hdr">{["位","爻","纳甲","六亲","六兽","世应"].map(h=><span key={h} className={`yao-col col-${h==="位"?"pos":h==="爻"?"sym":h==="纳甲"?"nj":h==="六亲"?"lq":h==="六兽"?"ls":"sy"}`}>{h}</span>)}</div>
            {[...d.lines].reverse().map(l=><div key={l.position} className={`yao-row ${l.changing?"chg":""}`}><span className="yao-col col-pos">{l.position}</span><span className="yao-col col-sym">{l.yao_type==="yang"?"——":"— —"}{l.changing&&<span style={{color:"#f0b040",marginLeft:3}}>○</span>}</span><span className="yao-col col-nj">{l.najia}</span><span className="yao-col col-lq">{l.liuqin}</span><span className="yao-col col-ls">{l.liushou}</span><span className={`yao-col col-sy ${l.shiying==="世"?"shi":l.shiying==="应"?"ying":""}`}>{l.shiying||"—"}</span></div>)}
          </div>
          {(d.bian_gua||d.hu_gua||d.zong_gua)&&<div className="tf-grid">{[{label:"变卦",g:d.bian_gua},{label:"互卦",g:d.hu_gua},{label:"综卦",g:d.zong_gua}].map(({label,g})=>g&&<div key={label} className="tf-item"><span className="tf-lbl">{label}</span><span className="tf-sym">{g.symbol}</span><span className="tf-nm">{g.name}</span></div>)}</div>}
          <button onClick={()=>navigate(`/chat?data=${encodeURIComponent(JSON.stringify(d))}&question=${encodeURIComponent(question)}`)} className="outline-btn">查看 AI 解读 →</button>
        </div>
      </div>
    </div>
  )
}
