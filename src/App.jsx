import { useState, useEffect } from 'react'
import { supabase, CLIENT } from './supabase.js'
import {
  ComposedChart, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from 'recharts'

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const PASSWORD    = 'sLprtYz64='
const SESSION_KEY = 'manutec_auth'
const ACCENT      = '#38bdf8'   // sky blue — distinct from Stremet (indigo) / Strand (emerald)

// ─── MONTHS ───────────────────────────────────────────────────────────────────
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

// ─── SEED DATA ────────────────────────────────────────────────────────────────
// Note: 2024 and 2025 only have DEC (annual) actuals — months 0-10 are 0.
// 2026 has full monthly budget.
const SEED_DATA = {
  2024: {
    revenue:       [0,0,0,0,0,0,0,0,0,0,0,2456468.39],
    materials:     [0,0,0,0,0,0,0,0,0,0,0,-1619089.79],
    directLabour:  [0,0,0,0,0,0,0,0,0,0,0,-442285.35],
    employeeExp:   [0,0,0,0,0,0,0,0,0,0,0,-350546.77],
    ebitda:        [0,0,0,0,0,0,0,0,0,0,0,-315448.85],
    optionalStaff: [0,0,0,0,0,0,0,0,0,0,0,-25422.20],
    premises:      [0,0,0,0,0,0,0,0,0,0,0,-223868.59],
    marketing:     [0,0,0,0,0,0,0,0,0,0,0,-45272.37],
    admin:         [0,0,0,0,0,0,0,0,0,0,0,-2088.06],
    otherAdmin:    [0,0,0,0,0,0,0,0,0,0,0,-63344.11],
    ebit:          [0,0,0,0,0,0,0,0,0,0,0,-315448.85],
    finIncome:     [0,0,0,0,0,0,0,0,0,0,0,60.79],
    finExpenses:   [0,0,0,0,0,0,0,0,0,0,0,-22649.11],
    ebt:           [0,0,0,0,0,0,0,0,0,0,0,-338037.17],
    netProfit:     [0,0,0,0,0,0,0,0,0,0,0,-338037.17],
    // Balance sheet (DEC snapshot, same value all months for display)
    inventory:          [0,0,0,0,0,0,0,0,0,0,0,114560.01],
    tradeReceivables:   [0,0,0,0,0,0,0,0,0,0,0,227503.71],
    cash:               [0,0,0,0,0,0,0,0,0,0,0,0],
    totalCurrentAssets: [0,0,0,0,0,0,0,0,0,0,0,342063.72],
    totalAssets:        [0,0,0,0,0,0,0,0,0,0,0,342063.72],
    shareholdersEq:     [0,0,0,0,0,0,0,0,0,0,0,10000],
    retainedEarnings:   [0,0,0,0,0,0,0,0,0,0,0,-314022.05],
    periodProfit:       [0,0,0,0,0,0,0,0,0,0,0,-338037.17],
    totalEquity:        [0,0,0,0,0,0,0,0,0,0,0,-567059.22],
    longTermLoan:       [0,0,0,0,0,0,0,0,0,0,0,89001.21],
    equityLoan:         [0,0,0,0,0,0,0,0,0,0,0,231070.40],
    tradePayables:      [0,0,0,0,0,0,0,0,0,0,0,362108.95],
    accrualLiab:        [0,0,0,0,0,0,0,0,0,0,0,110855.38],
    otherPayables:      [0,0,0,0,0,0,0,0,0,0,0,116087.00],
    totalLiabilities:   [0,0,0,0,0,0,0,0,0,0,0,909122.94],
  },
  2025: {
    revenue:       [0,0,0,0,0,0,0,0,0,0,0,3231430.88],
    materials:     [0,0,0,0,0,0,0,0,0,0,0,-2127442.96],
    directLabour:  [0,0,0,0,0,0,0,0,0,0,0,-533984.39],
    employeeExp:   [0,0,0,0,0,0,0,0,0,0,0,-364896.89],
    ebitda:        [0,0,0,0,0,0,0,0,0,0,0,-215289.68],
    optionalStaff: [0,0,0,0,0,0,0,0,0,0,0,-45141.87],
    premises:      [0,0,0,0,0,0,0,0,0,0,0,-233183.26],
    marketing:     [0,0,0,0,0,0,0,0,0,0,0,-66762.99],
    admin:         [0,0,0,0,0,0,0,0,0,0,0,-1486.12],
    otherAdmin:    [0,0,0,0,0,0,0,0,0,0,0,-74122.08],
    ebit:          [0,0,0,0,0,0,0,0,0,0,0,-215289.68],
    finIncome:     [0,0,0,0,0,0,0,0,0,0,0,0],
    finExpenses:   [0,0,0,0,0,0,0,0,0,0,0,-20024.69],
    ebt:           [0,0,0,0,0,0,0,0,0,0,0,-235314.37],
    netProfit:     [0,0,0,0,0,0,0,0,0,0,0,-235314.37],
    inventory:          [0,0,0,0,0,0,0,0,0,0,0,270120.75],
    tradeReceivables:   [0,0,0,0,0,0,0,0,0,0,0,422878.10],
    cash:               [0,0,0,0,0,0,0,0,0,0,0,3986.04],
    totalCurrentAssets: [0,0,0,0,0,0,0,0,0,0,0,696984.89],
    totalAssets:        [0,0,0,0,0,0,0,0,0,0,0,698352.89],
    shareholdersEq:     [0,0,0,0,0,0,0,0,0,0,0,10000],
    retainedEarnings:   [0,0,0,0,0,0,0,0,0,0,0,-652059.22],
    periodProfit:       [0,0,0,0,0,0,0,0,0,0,0,-83351.94],
    totalEquity:        [0,0,0,0,0,0,0,0,0,0,0,-650411.16],
    longTermLoan:       [0,0,0,0,0,0,0,0,0,0,0,0],
    equityLoan:         [0,0,0,0,0,0,0,0,0,0,0,231070.40],
    tradePayables:      [0,0,0,0,0,0,0,0,0,0,0,523461.96],
    accrualLiab:        [0,0,0,0,0,0,0,0,0,0,0,133896.38],
    advanceReceived:    [0,0,0,0,0,0,0,0,0,0,0,233300.00],
    otherPayables:      [0,0,0,0,0,0,0,0,0,0,0,227035.31],
    totalLiabilities:   [0,0,0,0,0,0,0,0,0,0,0,1348764.05],
  },
  2026: {
    // Full monthly BUD from Main report cols 29-40
    revenue:      [108377,501458,610921,408315,161348,853257,122236,498858,280874,318675,181629,309081],
    materials:    [-70661.80,-326950.62,-398320.49,-266221.38,-105198.90,-556323.56,-79697.87,-325255.42,-183129.85,-207776.10,-118422.11,-201520.81],
    directLabour: [-14089.01,-65189.54,-79419.73,-53080.95,-20975.24,-110923.41,-15890.68,-64851.54,-36513.62,-41427.75,-23611.77,-40180.53],
    employeeExp:  [-30408.07,-30408.07,-30408.07,-30408.07,-30408.07,-30408.07,-30408.07,-30408.07,-30408.07,-30408.07,-30408.07,-30408.07],
    ebitda:       [-50477.13,33588.86,63293.37,17770.92,-39800.33,114186.96,-44056.15,32162.60,-43508.38,-3589.32,-37346.98,-9105.99],
    ebit:         [-50499.55,33566.43,63270.95,17748.49,-39822.76,114164.54,-44078.57,32140.17,-43530.81,-3611.75,-37369.41,-9128.41],
    ebt:          [-53021.25,31832.98,62207.70,15509.50,-40933.41,113513.06,-46291.65,31014.91,-45000.32,-4681.14,-38786.24,-12539.51],
    netProfit:    [-53021.25,31832.98,62207.70,15509.50,-40933.41,113513.06,-46291.65,31014.91,-45000.32,-4681.14,-38786.24,-12539.51],
  }
}

// ─── DEADLINES ────────────────────────────────────────────────────────────────
const DEADLINES = [
  {month:'JAN', board:'Last Thu Feb', deadline:'16 Feb 2026', apClose:'11 Feb', receipts:'11 Feb', inventory:'14 Feb', accruals:'11 Feb', invoicing:'6 Feb'},
  {month:'FEB', board:'Last Thu Mar', deadline:'16 Mar 2026', apClose:'11 Mar', receipts:'11 Mar', inventory:'14 Mar', accruals:'11 Mar', invoicing:'6 Mar'},
  {month:'MAR', board:'Last Thu Apr', deadline:'15 Apr 2026', apClose:'10 Apr', receipts:'10 Apr', inventory:'13 Apr', accruals:'10 Apr', invoicing:'5 Apr'},
  {month:'APR', board:'Last Thu May', deadline:'15 May 2026', apClose:'10 May', receipts:'10 May', inventory:'13 May', accruals:'10 May', invoicing:'5 May'},
  {month:'MAY', board:'Last Thu Jun', deadline:'15 Jun 2026', apClose:'10 Jun', receipts:'10 Jun', inventory:'13 Jun', accruals:'10 Jun', invoicing:'5 Jun'},
  {month:'JUN', board:'–',           deadline:'7 Aug 2026',  apClose:'2 Aug',  receipts:'2 Aug',  inventory:'5 Aug',  accruals:'2 Aug',  invoicing:'28 Jul'},
  {month:'JUL', board:'–',           deadline:'17 Aug 2026', apClose:'12 Aug', receipts:'12 Aug', inventory:'15 Aug', accruals:'12 Aug', invoicing:'7 Aug'},
  {month:'AUG', board:'Last Thu Sep', deadline:'15 Sep 2026', apClose:'10 Sep', receipts:'10 Sep', inventory:'13 Sep', accruals:'10 Sep', invoicing:'5 Sep'},
  {month:'SEP', board:'Last Thu Oct', deadline:'15 Oct 2026', apClose:'10 Oct', receipts:'10 Oct', inventory:'13 Oct', accruals:'10 Oct', invoicing:'5 Oct'},
  {month:'OCT', board:'Last Thu Nov', deadline:'16 Nov 2026', apClose:'11 Nov', receipts:'11 Nov', inventory:'14 Nov', accruals:'11 Nov', invoicing:'6 Nov'},
  {month:'NOV', board:'Last Thu Dec', deadline:'15 Dec 2026', apClose:'10 Dec', receipts:'10 Dec', inventory:'13 Dec', accruals:'10 Dec', invoicing:'5 Dec'},
  {month:'DEC', board:'Last Thu Jan', deadline:'15 Jan 2027', apClose:'10 Jan', receipts:'10 Jan', inventory:'13 Jan', accruals:'10 Jan', invoicing:'5 Jan'},
]

const AUDIT_2026 = [
  {label:'Kick-off with Auditor',      date:'10 Oct 2026'},
  {label:'Books Closed',               date:'16 Jan 2027'},
  {label:'Preliminary Figures to Board',date:'20 Jan 2027'},
  {label:'Financial Statements Ready', date:'1 Feb 2027'},
  {label:'Remote Audit Start',         date:'8 Feb 2027'},
  {label:'Auditor On-Site',            date:'9 Feb 2027'},
  {label:'Board Approval',             date:'16 Feb 2027'},
  {label:'AGM',                        date:'31 Mar 2027'},
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const sum = arr => (arr||[]).reduce((a,b) => a+(b||0), 0)
const fmt = (n, short=false) => {
  if (n===null||n===undefined||isNaN(n)) return '–'
  const abs=Math.abs(n)
  if(short&&abs>=1000000) return (n/1000000).toFixed(2)+'M'
  if(short&&abs>=1000)    return (n/1000).toFixed(0)+'k'
  return new Intl.NumberFormat('fi-FI',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n)
}
const pct = n => (n===null||isNaN(n)) ? '–' : (n*100).toFixed(1)+'%'
const valColor = n => (n||0)>=0 ? '#34d399' : '#f87171'

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
const KPI = ({label,value,sub,color=ACCENT}) => (
  <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,padding:'14px 18px',position:'relative',overflow:'hidden'}}>
    <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:color}}/>
    <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',color:'#475569',textTransform:'uppercase',marginBottom:6}}>{label}</div>
    <div style={{fontSize:20,fontWeight:700,color:'#f1f5f9',fontFamily:'monospace'}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:'#475569',marginTop:3}}>{sub}</div>}
  </div>
)

const ST = ({children,mt=28}) => (
  <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'#334155',marginBottom:12,marginTop:mt,paddingBottom:6,borderBottom:'1px solid rgba(255,255,255,0.05)'}}>{children}</div>
)

const YBtn = ({year,label,active,onClick}) => (
  <button onClick={onClick} style={{padding:'4px 14px',borderRadius:16,border:'none',cursor:'pointer',background:active?ACCENT:'rgba(255,255,255,0.05)',color:active?'#080b12':'#64748b',fontWeight:700,fontSize:12,fontFamily:'inherit',transition:'all 0.12s'}}>{label||year}</button>
)

const TT = ({active,payload,label}) => {
  if(!active||!payload?.length) return null
  return <div style={{background:'#1e293b',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'10px 14px',fontSize:11}}>
    <div style={{color:'#64748b',marginBottom:5,fontWeight:700}}>{label}</div>
    {payload.map(p=><div key={p.dataKey} style={{color:p.color||p.fill,marginBottom:2}}>{p.name}: <strong>{fmt(p.value,true)}</strong></div>)}
  </div>
}

const NoBudget = () => (
  <div style={{background:'rgba(255,255,255,0.03)',border:'1px dashed rgba(255,255,255,0.08)',borderRadius:12,padding:40,textAlign:'center'}}>
    <div style={{fontSize:36,marginBottom:12}}>📋</div>
    <div style={{fontSize:15,fontWeight:600,color:'#64748b',marginBottom:8}}>Budget Not Yet Entered</div>
    <div style={{fontSize:13,color:'#334155'}}>Enter budget figures in the Excel BUD sheet to populate this view.</div>
  </div>
)

const AnnualNote = () => (
  <div style={{background:`${ACCENT}10`,border:`1px solid ${ACCENT}30`,borderRadius:8,padding:'10px 14px',fontSize:11,color:'#94a3b8',marginBottom:18}}>
    ℹ️ Only annual (DEC) actuals available for this year — monthly breakdown not yet entered in source file.
  </div>
)

// ─── P&L VIEW ─────────────────────────────────────────────────────────────────
function PLView({data}) {
  const [yr,setYr] = useState(2026)
  const d = data[yr] || SEED_DATA[yr] || {}
  const isAnnualOnly = yr !== 2026

  const tRev  = sum(d.revenue)
  const tEbit = sum(d.ebit)
  const tEbitda=sum(d.ebitda)
  const tNet  = sum(d.netProfit)
  const tMat  = sum(d.materials)
  const tDL   = sum(d.directLabour)
  const salesMarginPct = tRev!==0 ? (tRev+tMat+tDL)/tRev : 0
  const netPct = tRev!==0 ? tNet/tRev : 0

  const prev = data[yr-1]||SEED_DATA[yr-1]||{}
  const prevRev = sum(prev.revenue||[])
  const revGrowth = prevRev!==0 ? ((tRev-prevRev)/Math.abs(prevRev))*100 : null

  const chartData = MONTHS.map((m,i)=>({
    month:m,
    Revenue:      (d.revenue||[])[i]||0,
    EBITDA:       (d.ebitda||[])[i]||0,
    EBIT:         (d.ebit||[])[i]||0,
    'Net Profit': (d.netProfit||[])[i]||0,
  }))

  const costData = MONTHS.map((m,i)=>({
    month:m,
    'Materials':    Math.abs((d.materials||[])[i]||0),
    'Direct Labour':Math.abs((d.directLabour||[])[i]||0),
    'Staff Exp.':   Math.abs((d.employeeExp||[])[i]||0),
    'Premises':     Math.abs((d.premises||[])[i]||0),
  }))

  const plLines = [
    {l:'Revenue',                  v:tRev,                    c:ACCENT},
    {l:'Materials & Services',     v:tMat,                    c:'#f87171'},
    {l:'Direct Labour',            v:tDL,                     c:'#f87171'},
    {l:'Employee Expenses',        v:sum(d.employeeExp||[]),  c:'#f87171'},
    {l:'Sales Margin',             v:tRev+tMat+tDL,           c:valColor(tRev+tMat+tDL), b:true},
    {l:'Voluntary Social Exp.',    v:sum(d.optionalStaff||[]),c:'#f87171'},
    {l:'Premises',                 v:sum(d.premises||[]),     c:'#f87171'},
    {l:'Marketing',                v:sum(d.marketing||[]),    c:'#f87171'},
    {l:'Administration',           v:sum(d.admin||[]),        c:'#f87171'},
    {l:'Other Admin',              v:sum(d.otherAdmin||[]),   c:'#f87171'},
    {l:'EBITDA',                   v:tEbitda,                 c:valColor(tEbitda), b:true},
    {l:'EBIT',                     v:tEbit,                   c:valColor(tEbit), b:true},
    {l:'Financial Income',         v:sum(d.finIncome||[]),    c:'#64748b'},
    {l:'Financial Expenses',       v:sum(d.finExpenses||[]),  c:'#64748b'},
    {l:'EBT',                      v:sum(d.ebt||[]),          c:valColor(sum(d.ebt||[])), b:true},
    {l:'Net Profit / Loss',        v:tNet,                    c:valColor(tNet), b:true},
  ]

  const hasBud26 = sum(SEED_DATA[2026].revenue||[]) !== 0

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:20,alignItems:'center'}}>
        <YBtn year={2024} active={yr===2024} onClick={()=>setYr(2024)}/>
        <YBtn year={2025} active={yr===2025} onClick={()=>setYr(2025)}/>
        <YBtn year={2026} label="2026 BUD" active={yr===2026} onClick={()=>setYr(2026)}/>
        {revGrowth!==null&&<span style={{fontSize:11,color:revGrowth>=0?'#34d399':'#f87171',marginLeft:4}}>{revGrowth>=0?'▲':'▼'} {Math.abs(revGrowth).toFixed(1)}% vs {yr-1}</span>}
      </div>

      {yr===2026&&!hasBud26 ? <NoBudget/> : (
        <>
          {isAnnualOnly && <AnnualNote/>}
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:22}}>
            <KPI label="Revenue"      value={fmt(tRev,true)}    color={ACCENT}/>
            <KPI label="Sales Margin" value={pct(salesMarginPct)} color={valColor(salesMarginPct)}/>
            <KPI label="EBITDA"       value={fmt(tEbitda,true)} color={valColor(tEbitda)}/>
            <KPI label="EBIT"         value={fmt(tEbit,true)}   color={valColor(tEbit)}/>
            <KPI label="Net Profit"   value={fmt(tNet,true)}    color={valColor(tNet)} sub={pct(netPct)+' margin'}/>
          </div>

          <ST>Monthly Revenue & Profitability — {yr}{yr===2026?' (BUD)':' (ACT)'}</ST>
          <div style={{height:230,marginBottom:22}}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{top:0,right:0,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="month" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={v=>fmt(v,true)} tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip content={<TT/>}/>
                <Legend wrapperStyle={{fontSize:11,color:'#475569'}}/>
                <Bar dataKey="Revenue" fill={ACCENT} opacity={0.7} radius={[2,2,0,0]}/>
                <Line type="monotone" dataKey="EBITDA"     stroke="#f59e0b" strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="EBIT"       stroke="#34d399" strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="Net Profit" stroke="#f87171" strokeWidth={2} dot={false} strokeDasharray="4 3"/>
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)"/>
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {!isAnnualOnly && <>
            <ST>Cost Breakdown — {yr}</ST>
            <div style={{height:200,marginBottom:22}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costData} margin={{top:0,right:0,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="month" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis tickFormatter={v=>fmt(v,true)} tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<TT/>}/>
                  <Legend wrapperStyle={{fontSize:11,color:'#475569'}}/>
                  <Bar dataKey="Materials"     fill="#f87171" opacity={0.85} stackId="c"/>
                  <Bar dataKey="Direct Labour" fill="#fb923c" opacity={0.85} stackId="c"/>
                  <Bar dataKey="Staff Exp."    fill={ACCENT}  opacity={0.85} stackId="c"/>
                  <Bar dataKey="Premises"      fill="#f59e0b" opacity={0.85} stackId="c" radius={[2,2,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>}

          <ST>Year-on-Year Revenue Comparison</ST>
          <div style={{height:180,marginBottom:22}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MONTHS.map((m,i)=>({month:m,'2024 ACT':(SEED_DATA[2024].revenue||[])[i],'2025 ACT':(SEED_DATA[2025].revenue||[])[i],'2026 BUD':(SEED_DATA[2026].revenue||[])[i]}))} margin={{top:0,right:0,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                <XAxis dataKey="month" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={v=>fmt(v,true)} tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip content={<TT/>}/>
                <Legend wrapperStyle={{fontSize:11,color:'#475569'}}/>
                <Line type="monotone" dataKey="2024 ACT" stroke="#475569" strokeWidth={2} dot={false} strokeDasharray="4 3"/>
                <Line type="monotone" dataKey="2025 ACT" stroke="#64748b" strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="2026 BUD" stroke={ACCENT}  strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          <ST>P&L Summary — {yr}{yr===2026?' BUD':' ACT'}</ST>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:22}}>
            {plLines.map(({l,v,c,b})=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 12px',background:b?'rgba(255,255,255,0.04)':'transparent',borderRadius:6,border:b?'1px solid rgba(255,255,255,0.07)':'none'}}>
                <span style={{fontSize:12,color:b?'#e2e8f0':'#64748b',fontWeight:b?700:400}}>{l}</span>
                <span style={{fontSize:12,color:c,fontWeight:b?700:400,fontFamily:'monospace'}}>{fmt(v,true)}</span>
              </div>
            ))}
          </div>

          {!isAnnualOnly && <>
            <ST>Monthly P&L Table — {yr}</ST>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',fontSize:11,fontFamily:'monospace'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                    <th style={{textAlign:'left',padding:'7px 10px',color:'#475569',minWidth:160}}>Line</th>
                    {MONTHS.map(m=><th key={m} style={{textAlign:'right',padding:'7px 5px',color:'#475569',minWidth:60}}>{m}</th>)}
                    <th style={{textAlign:'right',padding:'7px 10px',color:'#475569'}}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {l:'Revenue',      a:d.revenue,      dyn:false,c:'#e2e8f0'},
                    {l:'Materials',    a:d.materials,    dyn:false,c:'#94a3b8'},
                    {l:'Direct Labour',a:d.directLabour, dyn:false,c:'#94a3b8'},
                    {l:'Employee Exp.',a:d.employeeExp,  dyn:false,c:'#94a3b8'},
                    {l:'EBITDA',       a:d.ebitda,       dyn:true, b:true},
                    {l:'EBIT',         a:d.ebit,         dyn:true, b:true},
                    {l:'Net Profit',   a:d.netProfit,    dyn:true, b:true},
                  ].map(({l,a,dyn,c,b})=>{
                    const tot=sum(a||[])
                    const clr=dyn?valColor(tot):c
                    return <tr key={l} style={{borderBottom:'1px solid rgba(255,255,255,0.03)',background:b?'rgba(255,255,255,0.02)':'transparent'}}>
                      <td style={{padding:'5px 10px',color:clr,fontWeight:b?700:400}}>{l}</td>
                      {(a||[]).map((v,i)=>{const vc=dyn?valColor(v):c;return<td key={i} style={{textAlign:'right',padding:'5px 5px',color:vc,fontWeight:b?700:400}}>{v!==0?fmt(v,true):'–'}</td>})}
                      <td style={{textAlign:'right',padding:'5px 10px',color:dyn?valColor(tot):c,fontWeight:700}}>{fmt(tot,true)}</td>
                    </tr>
                  })}
                </tbody>
              </table>
            </div>
          </>}
        </>
      )}
    </div>
  )
}

// ─── BALANCE SHEET VIEW ───────────────────────────────────────────────────────
function BSView({data}) {
  const [yr,setYr] = useState(2025)
  const d = data[yr]||SEED_DATA[yr]||{}
  const li = 11  // always DEC index

  const tA   = (d.totalAssets||[])[li]||0
  const tE   = (d.totalEquity||[])[li]||0
  const cash = (d.cash||[])[li]||0
  const inv  = (d.inventory||[])[li]||0
  const ar   = (d.tradeReceivables||[])[li]||0
  const curA = (d.totalCurrentAssets||[])[li]||0
  const tL   = (d.totalLiabilities||[])[li]||0
  const tp   = (d.tradePayables||[])[li]||0
  const eqL  = (d.equityLoan||[])[li]||0
  const ltL  = (d.longTermLoan||[])[li]||0
  const eqRatio = tA!==0 ? tE/tA : 0

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:20,alignItems:'center'}}>
        <YBtn year={2024} active={yr===2024} onClick={()=>setYr(2024)}/>
        <YBtn year={2025} active={yr===2025} onClick={()=>setYr(2025)}/>
        <span style={{fontSize:11,color:'#334155',marginLeft:4}}>DEC snapshot</span>
      </div>

      <AnnualNote/>

      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:22}}>
        <KPI label="Total Assets"  value={fmt(tA,true)}  color={ACCENT}/>
        <KPI label="Total Equity"  value={fmt(tE,true)}  color={valColor(tE)}/>
        <KPI label="Equity Ratio"  value={pct(eqRatio)}  color={valColor(eqRatio)}/>
        <KPI label="Cash"          value={fmt(cash,true)} color="#f59e0b"/>
        <KPI label="Inventory"     value={fmt(inv,true)}  color="#94a3b8"/>
      </div>

      <ST>Balance Sheet — {yr} DEC</ST>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'#475569',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.1em'}}>Assets</div>
          {[
            {l:'Intangible Assets',   v:yr===2025?1368:0},
            {l:'Tangible Assets',     v:yr===2025?0:0},
            {l:'Current Assets',      v:curA},
            {l:'  Inventory',         v:inv,  indent:true},
            {l:'  Trade Receivables', v:ar,   indent:true},
            {l:'  Cash & Equivalents',v:cash, indent:true},
            {l:'TOTAL ASSETS',        v:tA,   b:true},
          ].map(({l,v,b,indent})=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'5px 10px',background:b?'rgba(255,255,255,0.04)':'transparent',borderRadius:4,marginBottom:2}}>
              <span style={{fontSize:11,color:indent?'#475569':'#94a3b8',fontWeight:b?700:400,paddingLeft:indent?12:0}}>{l}</span>
              <span style={{fontSize:11,color:b?'#f1f5f9':'#64748b',fontFamily:'monospace',fontWeight:b?700:400}}>{fmt(v,true)}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:'#475569',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.1em'}}>Equity & Liabilities</div>
          {[
            {l:'Shareholders Equity',  v:(d.shareholdersEq||[])[li]||0},
            {l:'Invested Equity Fund', v:75000},
            {l:'Retained Earnings',    v:(d.retainedEarnings||[])[li]||0},
            {l:'Period Profit/Loss',   v:(d.periodProfit||[])[li]||0},
            {l:'TOTAL EQUITY',         v:tE,   b:true, color:valColor(tE)},
            {l:'Equity Loan',          v:eqL},
            {l:'Long-term Loan',       v:ltL},
            {l:'Trade Payables',       v:tp},
            {l:'Accrual Liabilities',  v:(d.accrualLiab||[])[li]||0},
            ...(yr===2025?[{l:'Advance Received', v:(d.advanceReceived||[])[li]||0}]:[]),
            {l:'Other Payables',       v:(d.otherPayables||[])[li]||0},
            {l:'TOTAL LIABILITIES',    v:tL,   b:true},
          ].map(({l,v,b,color})=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'5px 10px',background:b?'rgba(255,255,255,0.04)':'transparent',borderRadius:4,marginBottom:2}}>
              <span style={{fontSize:11,color:'#94a3b8',fontWeight:b?700:400}}>{l}</span>
              <span style={{fontSize:11,color:color||(b?'#f1f5f9':'#64748b'),fontFamily:'monospace',fontWeight:b?700:400}}>{fmt(v,true)}</span>
            </div>
          ))}
        </div>
      </div>

      <ST>2024 vs 2025 Key Metrics</ST>
      <div style={{height:220,marginBottom:22}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[
            {name:'Revenue', '2024':sum(SEED_DATA[2024].revenue||[]), '2025':sum(SEED_DATA[2025].revenue||[])},
            {name:'Materials', '2024':Math.abs(sum(SEED_DATA[2024].materials||[])), '2025':Math.abs(sum(SEED_DATA[2025].materials||[]))},
            {name:'EBIT', '2024':sum(SEED_DATA[2024].ebit||[]), '2025':sum(SEED_DATA[2025].ebit||[])},
            {name:'Net P/L', '2024':sum(SEED_DATA[2024].netProfit||[]), '2025':sum(SEED_DATA[2025].netProfit||[])},
          ]} margin={{top:0,right:0,left:0,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
            <XAxis dataKey="name" tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>fmt(v,true)} tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false}/>
            <Tooltip content={<TT/>}/>
            <Legend wrapperStyle={{fontSize:11,color:'#475569'}}/>
            <Bar dataKey="2024" fill="#475569" opacity={0.8} radius={[2,2,0,0]}/>
            <Bar dataKey="2025" fill={ACCENT}  opacity={0.8} radius={[2,2,0,0]}/>
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)"/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── DEADLINES VIEW ───────────────────────────────────────────────────────────
function DeadlinesView() {
  const today = new Date()
  return (
    <div>
      <ST mt={0}>Monthly Reporting Deadlines 2026</ST>
      <div style={{overflowX:'auto',marginBottom:24}}>
        <table style={{width:'100%',fontSize:11}}>
          <thead>
            <tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
              {['Month','Board','Deadline @ 2pm','AP Closed','Receipts','Inventory','Accruals','Invoicing'].map(h=>
                <th key={h} style={{textAlign:'left',padding:'7px 10px',color:'#475569',fontWeight:700,whiteSpace:'nowrap'}}>{h}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {DEADLINES.map((d,i)=>{
              const dl=new Date(d.deadline)
              const ip=dl<today
              const is=!ip&&(dl-today)<14*24*3600*1000
              const sc=ip?'#334155':is?'#f59e0b':'#34d399'
              return <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.03)',opacity:ip?0.5:1}}>
                <td style={{padding:'8px 10px',fontWeight:700,color:'#f1f5f9'}}>{d.month}</td>
                <td style={{padding:'8px 10px',color:'#475569',fontSize:10}}>{d.board}</td>
                <td style={{padding:'8px 10px'}}>
                  <span style={{color:sc,fontWeight:600}}>{d.deadline}</span>
                  <span style={{fontSize:9,marginLeft:6,color:sc,background:`${sc}20`,padding:'1px 5px',borderRadius:8}}>{ip?'DONE':is?'SOON':'OPEN'}</span>
                </td>
                <td style={{padding:'8px 10px',color:'#475569',fontSize:10}}>{d.apClose}</td>
                <td style={{padding:'8px 10px',color:'#475569',fontSize:10}}>{d.receipts}</td>
                <td style={{padding:'8px 10px',color:'#475569',fontSize:10}}>{d.inventory}</td>
                <td style={{padding:'8px 10px',color:'#475569',fontSize:10}}>{d.accruals}</td>
                <td style={{padding:'8px 10px',color:'#475569',fontSize:10}}>{d.invoicing}</td>
              </tr>
            })}
          </tbody>
        </table>
      </div>

      <ST>Audit Calendar 2026–2027</ST>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:8,marginBottom:24}}>
        {AUDIT_2026.map(({label,date})=>{
          const dt=new Date(date)
          const ip=dt<today
          const is=!ip&&(dt-today)<14*24*3600*1000
          const sc=ip?'#334155':is?'#f59e0b':ACCENT
          return <div key={label} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,padding:'12px 14px',opacity:ip?0.5:1}}>
            <div style={{fontSize:11,fontWeight:700,color:sc,marginBottom:4}}>{date}</div>
            <div style={{fontSize:11,color:'#64748b'}}>{label}</div>
          </div>
        })}
      </div>

      <ST>Closing Process Guide</ST>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:10}}>
        {[
          {e:'📦',t:'AP Closed',           d:'5 days before deadline'},
          {e:'🧾',t:'Receipts & Clearing', d:'Same day as AP close'},
          {e:'🏭',t:'Inventory & WIP',     d:'3 days before deadline'},
          {e:'📊',t:'Accruals Submitted',  d:'Same day as AP close'},
          {e:'💳',t:'Sales Invoicing',     d:'10 days before deadline'},
          {e:'📋',t:'No Jun/Jul Board',    d:'Both months combined in Aug'},
        ].map(({e,t,d})=>(
          <div key={t} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10,padding:'14px 16px',display:'flex',gap:12,alignItems:'flex-start'}}>
            <span style={{fontSize:20}}>{e}</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:'#94a3b8',marginBottom:3}}>{t}</div>
              <div style={{fontSize:11,color:'#475569'}}>{d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({onSuccess}) {
  const [pw,setPw]   = useState('')
  const [err,setErr] = useState(false)
  const attempt = () => {
    if(pw===PASSWORD){sessionStorage.setItem(SESSION_KEY,'1');onSuccess()}
    else{setErr(true);setTimeout(()=>setErr(false),1500)}
  }
  return (
    <div style={{minHeight:'100vh',background:'#080b12',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'DM Mono','Courier New',monospace"}}>
      <div style={{width:340,textAlign:'center'}}>
        <div style={{fontSize:11,letterSpacing:'0.3em',color:'#334155',marginBottom:12,textTransform:'uppercase'}}>Board Dashboard</div>
        <div style={{fontSize:32,fontWeight:800,letterSpacing:'-0.03em',color:'#f1f5f9',marginBottom:4}}>Manutec</div>
        <div style={{width:40,height:2,background:ACCENT,margin:'0 auto 32px'}}/>
        <input type="password" placeholder="Enter password" value={pw}
          onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&attempt()}
          style={{width:'100%',padding:'13px 16px',background:'rgba(255,255,255,0.04)',border:`1px solid ${err?'#f87171':'rgba(255,255,255,0.1)'}`,borderRadius:8,color:'#f1f5f9',fontSize:14,outline:'none',fontFamily:'inherit',marginBottom:10}}
          autoFocus/>
        <button onClick={attempt} style={{width:'100%',padding:'13px',background:ACCENT,border:'none',borderRadius:8,color:'#080b12',fontWeight:800,fontSize:14,cursor:'pointer',fontFamily:'inherit'}}>ENTER</button>
        {err&&<div style={{marginTop:10,color:'#f87171',fontSize:13}}>Incorrect password</div>}
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const TABS = [
  {id:'pl',        label:'P & L'},
  {id:'bs',        label:'Balance Sheet'},
  {id:'deadlines', label:'Deadlines'},
]

export default function App() {
  const [authed,   setAuthed]   = useState(!!sessionStorage.getItem(SESSION_KEY))
  const [tab,      setTab]      = useState('pl')
  const [dbStatus, setDbStatus] = useState('idle')
  const [liveData, setLiveData] = useState(null)

  useEffect(()=>{if(authed)loadFromSupabase()},[authed])

  const loadFromSupabase = async () => {
    if(!supabase){setDbStatus('offline');return}
    setDbStatus('loading')
    try {
      const {data,error} = await supabase.from('dashboard_pnl').select('*').eq('client', CLIENT)
      if(error) throw error
      if(!data||data.length===0){setDbStatus('ok');await seedDatabase();return}
      const structured={}
      data.forEach(row=>{
        if(!structured[row.year]) structured[row.year]={}
        if(!structured[row.year][row.line_item]) structured[row.year][row.line_item]=Array(12).fill(0)
        structured[row.year][row.line_item][row.month_index]=row.value
      })
      setLiveData(structured)
      setDbStatus('ok')
    } catch(e){console.error(e);setDbStatus('error')}
  }

  const seedDatabase = async () => {
    if(!supabase) return
    const rows=[]
    Object.entries(SEED_DATA).forEach(([year,yd])=>{
      Object.entries(yd).forEach(([line_item,arr])=>{
        ;(arr||[]).forEach((value,month_index)=>{
          if(value!==0&&value!==null&&value!==undefined)
            rows.push({client:CLIENT,entity:'',year:parseInt(year),line_item,month_index,value})
        })
      })
    })
    if(rows.length>0){
      const {error}=await supabase.from('dashboard_pnl').upsert(rows,{onConflict:'client,entity,year,line_item,month_index'})
      if(!error) await loadFromSupabase()
    }
  }

  const data = liveData||SEED_DATA
  if(!authed) return <Login onSuccess={()=>setAuthed(true)}/>

  return (
    <div style={{minHeight:'100vh',background:'#080b12',color:'#e2e8f0',fontFamily:"'DM Mono','Courier New',monospace"}}>
      <header style={{borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'0 28px',display:'flex',alignItems:'center',justifyContent:'space-between',height:52,position:'sticky',top:0,zIndex:100,background:'rgba(8,11,18,0.97)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{fontSize:16,fontWeight:800,letterSpacing:'-0.02em',color:'#f1f5f9'}}>Manutec</div>
          <div style={{width:1,height:16,background:'rgba(255,255,255,0.08)'}}/>
          <div style={{fontSize:11,color:'#334155',letterSpacing:'0.05em'}}>Board Dashboard</div>
        </div>
        <nav style={{display:'flex',gap:2}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'5px 14px',borderRadius:6,border:'none',cursor:'pointer',background:tab===t.id?`${ACCENT}20`:'transparent',color:tab===t.id?ACCENT:'#475569',fontWeight:tab===t.id?700:400,fontSize:12,fontFamily:'inherit',transition:'all 0.12s'}}>{t.label}</button>
          ))}
        </nav>
        <div style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'#334155'}}>
          <span style={{width:6,height:6,borderRadius:'50%',background:dbStatus==='ok'?'#34d399':dbStatus==='loading'?'#f59e0b':dbStatus==='offline'?'#475569':'#f87171',display:'inline-block'}}/>
          {dbStatus==='ok'?'Supabase':dbStatus==='loading'?'Syncing…':dbStatus==='offline'?'Offline':'Error'}
        </div>
      </header>

      <main style={{padding:'24px 28px',maxWidth:1400,margin:'0 auto'}}>
        <h1 style={{fontSize:18,fontWeight:800,color:'#f1f5f9',marginBottom:22,letterSpacing:'-0.02em'}}>
          {TABS.find(t=>t.id===tab)?.label}
          <span style={{fontSize:12,color:'#334155',fontWeight:400,marginLeft:10}}>2024–2026 · ACT + BUD</span>
        </h1>
        {tab==='pl'        && <PLView data={data}/>}
        {tab==='bs'        && <BSView data={data}/>}
        {tab==='deadlines' && <DeadlinesView/>}
      </main>

      <div style={{textAlign:'center',padding:'18px',borderTop:'1px solid rgba(255,255,255,0.04)',fontSize:11,color:'#1e293b'}}>
        Manutec · Board Dashboard · Confidential · {new Date().getFullYear()}
      </div>
    </div>
  )
}
