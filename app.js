/* ================= Utilidades ================= */
function fmt(v){
  return (v||0).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
}
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function currentMonth(){
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
}
function mesLabel(mesStr){
  if(!mesStr) return '';
  const [y,m] = mesStr.split('-');
  const nomes = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return nomes[parseInt(m)-1] + '/' + y;
}
function mesesRestantes(dataStr){
  const hoje = new Date();
  const alvo = new Date(dataStr+'T00:00:00');
  let meses = (alvo.getFullYear()-hoje.getFullYear())*12 + (alvo.getMonth()-hoje.getMonth());
  if(alvo.getDate() < hoje.getDate()) meses -= 1;
  return Math.max(meses, 1);
}
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 1800);
}

/* ================= Persistência (localStorage) ================= */
const CHAVE = 'minhas-financas-dados';

function carregar(){
  try{
    const raw = localStorage.getItem(CHAVE);
    if(raw) return JSON.parse(raw);
  }catch(e){ console.error('Erro ao carregar dados salvos', e); }
  return {
    perfil: { nome: '', renda: 0, banco: '' },
    contasFixas: [],
    contasVariaveis: [],
    parcelamentos: [],
    projetos: []
  };
}
function salvar(){
  try{
    localStorage.setItem(CHAVE, JSON.stringify(state));
  }catch(e){
    console.error('Erro ao salvar', e);
    toast('Não foi possível salvar os dados neste navegador.');
  }
}

let state = carregar();

/* ================= Navegação ================= */
document.querySelectorAll('.nav-item').forEach(item=>{
  item.addEventListener('click', ()=>{
    document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('page-'+item.dataset.page).classList.add('active');
  });
});

/* ================= Sobre mim / perfil ================= */
function preencherPerfil(){
  document.getElementById('pf-nome').value = state.perfil.nome || '';
  document.getElementById('pf-salario').value = state.perfil.renda || '';
  document.getElementById('pf-banco').value = state.perfil.banco || '';
  document.getElementById('rendaInput').value = state.perfil.renda || '';
}

document.getElementById('btnSalvarPerfil').addEventListener('click', ()=>{
  const nome = document.getElementById('pf-nome').value.trim();
  const renda = parseFloat(document.getElementById('pf-salario').value) || 0;
  const banco = document.getElementById('pf-banco').value;
  state.perfil = { nome, renda, banco };
  salvar();
  document.getElementById('rendaInput').value = renda || '';
  renderDashboard();
  toast('Dados salvos');
});

document.getElementById('rendaInput').addEventListener('change', (e)=>{
  const renda = parseFloat(e.target.value) || 0;
  state.perfil.renda = renda;
  salvar();
  document.getElementById('pf-salario').value = renda || '';
  renderDashboard();
});

/* ================= Contas Fixas ================= */
document.getElementById('btnAddFixa').addEventListener('click', ()=>{
  const nome = document.getElementById('fx-nome').value.trim();
  const valor = parseFloat(document.getElementById('fx-valor').value);
  const dia = parseInt(document.getElementById('fx-dia').value) || null;
  const cat = document.getElementById('fx-cat').value;
  if(!nome || !valor){ toast('Preencha nome e valor'); return; }
  state.contasFixas.push({id:uid(), nome, valor, dia, cat});
  ['fx-nome','fx-valor','fx-dia'].forEach(id=>document.getElementById(id).value='');
  salvar(); renderAll();
  toast('Conta fixa adicionada');
});
function delFixa(id){
  state.contasFixas = state.contasFixas.filter(c=>c.id!==id);
  salvar(); renderAll();
}
function renderFixas(){
  const el = document.getElementById('listaFixas');
  if(!state.contasFixas.length){
    el.innerHTML = '<div class="empty">Nenhuma conta fixa cadastrada ainda.</div>';
    return;
  }
  el.innerHTML = state.contasFixas
    .slice().sort((a,b)=>(a.dia||99)-(b.dia||99))
    .map(c=>`
    <div class="item-card">
      <div class="info">
        <b>${c.nome}</b>
        <div class="sub">${c.dia ? 'Vence dia '+c.dia+' · ' : ''}${c.cat}</div>
      </div>
      <div class="right">
        <span class="pill fixa">fixa</span>
        <span class="amount">${fmt(c.valor)}</span>
        <button class="btn-danger-icon" onclick="delFixa('${c.id}')">✕</button>
      </div>
    </div>`).join('');
}

/* ================= Contas Variáveis ================= */
document.getElementById('vr-mes').value = currentMonth();

document.getElementById('btnAddVariavel').addEventListener('click', ()=>{
  const nome = document.getElementById('vr-nome').value.trim();
  const valor = parseFloat(document.getElementById('vr-valor').value);
  const mes = document.getElementById('vr-mes').value || currentMonth();
  const cat = document.getElementById('vr-cat').value;
  if(!nome || !valor){ toast('Preencha nome e valor'); return; }
  state.contasVariaveis.push({id:uid(), nome, valor, mes, cat});
  document.getElementById('vr-nome').value='';
  document.getElementById('vr-valor').value='';
  salvar(); renderAll();
  toast('Conta variável adicionada');
});
function delVariavel(id){
  state.contasVariaveis = state.contasVariaveis.filter(c=>c.id!==id);
  salvar(); renderAll();
}
function renderVariaveis(){
  const el = document.getElementById('listaVariaveis');
  if(!state.contasVariaveis.length){
    el.innerHTML = '<div class="empty">Nenhuma conta variável cadastrada ainda.</div>';
    return;
  }
  el.innerHTML = state.contasVariaveis
    .slice().sort((a,b)=> b.mes.localeCompare(a.mes))
    .map(c=>`
    <div class="item-card">
      <div class="info">
        <b>${c.nome}</b>
        <div class="sub">${mesLabel(c.mes)} · ${c.cat}</div>
      </div>
      <div class="right">
        <span class="pill variavel">variável</span>
        <span class="amount">${fmt(c.valor)}</span>
        <button class="btn-danger-icon" onclick="delVariavel('${c.id}')">✕</button>
      </div>
    </div>`).join('');
}

/* ================= Parcelamentos ================= */
document.getElementById('btnAddParcela').addEventListener('click', ()=>{
  const nome = document.getElementById('pc-nome').value.trim();
  const total = parseFloat(document.getElementById('pc-total').value);
  const num = parseInt(document.getElementById('pc-num').value);
  const pagas = parseInt(document.getElementById('pc-pagas').value) || 0;
  if(!nome || !total || !num){ toast('Preencha nome, valor total e nº de parcelas'); return; }
  state.parcelamentos.push({id:uid(), nome, total, num, pagas: Math.min(pagas,num)});
  ['pc-nome','pc-total','pc-num'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('pc-pagas').value = 0;
  salvar(); renderAll();
  toast('Parcelamento adicionado');
});
function delParcela(id){
  state.parcelamentos = state.parcelamentos.filter(p=>p.id!==id);
  salvar(); renderAll();
}
function pagarParcela(id){
  const p = state.parcelamentos.find(p=>p.id===id);
  if(p && p.pagas < p.num){ p.pagas++; salvar(); renderAll(); toast('Parcela dada como paga'); }
}
function renderParcelas(){
  const el = document.getElementById('listaParcelas');
  if(!state.parcelamentos.length){
    el.innerHTML = '<div class="empty">Nenhum parcelamento cadastrado ainda.</div>';
    return;
  }
  el.innerHTML = state.parcelamentos.map(p=>{
    const valorParcela = p.total/p.num;
    const restantes = p.num - p.pagas;
    const pct = Math.round((p.pagas/p.num)*100);
    return `
    <div class="item-card" style="flex-direction:column; align-items:stretch;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div class="info">
          <b>${p.nome}</b>
          <div class="sub">${p.pagas}/${p.num} parcelas pagas · restam ${restantes}${restantes>0 ? ' de '+fmt(valorParcela) : ''}</div>
        </div>
        <div class="right">
          <span class="pill parcela">parcelada</span>
          <span class="amount">${fmt(p.total)}</span>
          <button class="btn-danger-icon" onclick="delParcela('${p.id}')">✕</button>
        </div>
      </div>
      <div class="progress-bar"><div style="width:${pct}%"></div></div>
      ${restantes>0 ? `<div style="margin-top:10px;"><button class="btn-ghost" onclick="pagarParcela('${p.id}')">Dar baixa na próxima parcela</button></div>` : `<div class="sub" style="margin-top:8px; color:var(--money);">Quitado ✓</div>`}
    </div>`;
  }).join('');
}

/* ================= Projetos / Metas ================= */
document.getElementById('btnAddProjeto').addEventListener('click', ()=>{
  const nome = document.getElementById('pj-nome').value.trim();
  const emoji = document.getElementById('pj-emoji').value;
  const objetivo = parseFloat(document.getElementById('pj-objetivo').value);
  const atual = parseFloat(document.getElementById('pj-atual').value) || 0;
  const data = document.getElementById('pj-data').value;
  if(!nome || !objetivo || !data){ toast('Preencha nome, valor objetivo e data limite'); return; }
  state.projetos.push({id:uid(), nome, emoji, objetivo, atual, data});
  document.getElementById('pj-nome').value='';
  document.getElementById('pj-objetivo').value='';
  document.getElementById('pj-atual').value='0';
  document.getElementById('pj-data').value='';
  salvar(); renderAll();
  toast('Projeto criado');
});
function delProjeto(id){
  state.projetos = state.projetos.filter(p=>p.id!==id);
  salvar(); renderAll();
}
function aportar(id){
  const valor = parseFloat(prompt('Quanto você quer guardar para esse projeto agora? (R$)'));
  if(!valor || valor<=0) return;
  const p = state.projetos.find(p=>p.id===id);
  if(p){ p.atual += valor; salvar(); renderAll(); toast('Aporte registrado'); }
}
function projetoCardHTML(p){
  const pct = Math.min(100, Math.round((p.atual/p.objetivo)*100));
  const faltam = Math.max(p.objetivo - p.atual, 0);
  const meses = mesesRestantes(p.data);
  const aporteSugerido = faltam / meses;
  const dataFmt = new Date(p.data+'T00:00:00').toLocaleDateString('pt-BR');
  return `
  <div class="ticket">
    <div class="ticket-tag">meta</div>
    <h4><span class="emoji">${p.emoji}</span>${p.nome}</h4>
    <div class="meta-desc">até ${dataFmt} · ${meses} ${meses===1?'mês restante':'meses restantes'}</div>
    <div class="progress-bar"><div style="width:${pct}%"></div></div>
    <div class="stub-divider"></div>
    <div class="amounts">
      <span class="cur">${fmt(p.atual)}</span>
      <span class="goal">de ${fmt(p.objetivo)}</span>
    </div>
    <div class="stat-row"><span>Progresso</span><b>${pct}%</b></div>
    <div class="stat-row"><span>Guardar por mês</span><b>${p.atual>=p.objetivo ? '—' : fmt(aporteSugerido)}</b></div>
    <div class="actions">
      ${p.atual < p.objetivo ? `<button class="btn-primary" style="margin-top:0;" onclick="aportar('${p.id}')">Registrar aporte</button>` : `<button class="btn-ghost" disabled>Objetivo alcançado 🎉</button>`}
    </div>
    <button class="btn-danger-icon del" onclick="delProjeto('${p.id}')">✕</button>
  </div>`;
}
function renderProjetos(){
  const el = document.getElementById('listaProjetos');
  el.innerHTML = state.projetos.length
    ? state.projetos.map(projetoCardHTML).join('')
    : '<div class="empty">Nenhum projeto criado ainda. Que tal começar com uma viagem?</div>';
}

/* ================= Dashboard ================= */
function renderDashboard(){
  const mesAtual = currentMonth();
  const totalFixas = state.contasFixas.reduce((s,c)=>s+c.valor,0);
  const totalVariaveis = state.contasVariaveis.filter(c=>c.mes===mesAtual).reduce((s,c)=>s+c.valor,0);
  const totalParcelas = state.parcelamentos.filter(p=>p.pagas<p.num).reduce((s,p)=>s+(p.total/p.num),0);
  const comprometido = totalFixas + totalVariaveis + totalParcelas;
  const renda = (state.perfil && state.perfil.renda) || 0;

  document.getElementById('sumFixas').textContent = fmt(totalFixas);
  document.getElementById('sumVariaveis').textContent = fmt(totalVariaveis);
  document.getElementById('sumParcelas').textContent = fmt(totalParcelas);
  document.getElementById('sumTotalDespesas').textContent = fmt(comprometido);

  document.getElementById('heroReceita').textContent = fmt(renda);
  document.getElementById('heroDespesas').textContent = fmt(comprometido);

  const heroSaldo = document.getElementById('heroSaldo');
  const heroSaldoSub = document.getElementById('heroSaldoSub');
  if(renda > 0){
    const saldo = renda - comprometido;
    heroSaldo.textContent = fmt(saldo);
    heroSaldo.className = 'hero-value mono ' + (saldo>=0 ? 'pos' : 'neg');
    heroSaldoSub.textContent = saldo>=0 ? 'você ainda pode guardar esse valor' : 'suas despesas passaram o salário';
  }else{
    heroSaldo.textContent = '—';
    heroSaldo.className = 'hero-value mono';
    heroSaldoSub.textContent = 'informe seu salário ao lado';
  }

  const rows = [];
  state.contasFixas.forEach(c=>rows.push({nome:c.nome, tag:'fixa · '+c.cat, valor:c.valor}));
  state.contasVariaveis.filter(c=>c.mes===mesAtual).forEach(c=>rows.push({nome:c.nome, tag:'variável · '+c.cat, valor:c.valor}));
  state.parcelamentos.filter(p=>p.pagas<p.num).forEach(p=>rows.push({nome:p.nome, tag:'parcela '+(p.pagas+1)+'/'+p.num, valor:p.total/p.num}));

  const ledger = document.getElementById('extratoMes');
  if(!rows.length){
    ledger.innerHTML = '<div class="empty">Nada lançado para este mês ainda.</div>';
  }else{
    rows.sort((a,b)=>b.valor-a.valor);
    ledger.innerHTML =
      `<div class="ledger-head"><span>Lançamento</span><span>Valor</span></div>` +
      rows.map(r=>`
        <div class="ledger-row">
          <div class="name"><b>${r.nome}</b><span class="tag">${r.tag}</span></div>
          <div class="leader"></div>
          <div class="val">${fmt(r.valor)}</div>
        </div>`).join('') +
      `<div class="ledger-row" style="background:var(--surface-2);">
          <div class="name"><b>Total comprometido</b></div>
          <div class="leader"></div>
          <div class="val" style="font-weight:600;">${fmt(comprometido)}</div>
       </div>`;
  }

  const dashProj = document.getElementById('dashProjetos');
  const ativos = state.projetos.slice().sort((a,b)=> new Date(a.data)-new Date(b.data)).slice(0,3);
  dashProj.innerHTML = ativos.length
    ? ativos.map(projetoCardHTML).join('')
    : '<div class="empty" style="grid-column:1/-1;">Crie um projeto (ex: uma viagem) na aba "Projetos & metas" para vê-lo aqui.</div>';
}

function renderAll(){
  renderFixas();
  renderVariaveis();
  renderParcelas();
  renderProjetos();
  renderDashboard();
  renderComparativo();
}

/* ================= Comparativo de despesas por mês ================= */
function renderComparativo(){
  const el = document.getElementById('comparativoMeses');
  const totalFixas = state.contasFixas.reduce((s,c)=>s+c.valor,0);
  const totalParcelasAtivas = state.parcelamentos.filter(p=>p.pagas<p.num).reduce((s,p)=>s+(p.total/p.num),0);

  // Todo mês com alguma conta variável lançada entra no comparativo, além do mês atual.
  const mesesSet = new Set(state.contasVariaveis.map(c=>c.mes));
  mesesSet.add(currentMonth());
  const meses = Array.from(mesesSet).sort();

  if(meses.length < 2){
    el.innerHTML = '<div class="empty">Lance despesas variáveis em mais de um mês para ver o comparativo entre eles.</div>';
    return;
  }

  const dados = meses.map(m=>{
    const variavelMes = state.contasVariaveis.filter(c=>c.mes===m).reduce((s,c)=>s+c.valor,0);
    return { mes: m, total: totalFixas + totalParcelasAtivas + variavelMes };
  });

  const max = Math.max(...dados.map(d=>d.total), 1);
  const mesAtual = currentMonth();

  el.innerHTML = `
    <div class="chart-bars">
      ${dados.map(d=>`
        <div class="chart-bar-col${d.mes===mesAtual ? ' atual' : ''}">
          <div class="chart-bar-value">${fmt(d.total)}</div>
          <div class="chart-bar-track"><div class="chart-bar" style="height:${Math.max((d.total/max)*100,4)}%"></div></div>
          <div class="chart-bar-label">${mesLabel(d.mes)}</div>
        </div>`).join('')}
    </div>
    <div class="chart-legend">
      <span><span class="dot money"></span>meses anteriores</span>
      <span><span class="dot amber"></span>mês atual</span>
    </div>
    <p style="font-size:0.76rem; color:var(--muted); margin-top:10px;">Cada barra soma contas fixas + parcelas ativas + variáveis lançadas naquele mês.</p>
  `;
}

/* ================= Inicialização ================= */
preencherPerfil();
renderAll();
