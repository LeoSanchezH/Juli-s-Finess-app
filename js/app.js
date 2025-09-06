// js/app.js (ACTUALIZADO) — Render estático con soporte para rutinas tipo objeto

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`No se pudo cargar ${path}`);
  return res.json();
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function renderList(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  (items || []).forEach((t) => {
    const li = document.createElement('li');
    li.textContent = t;
    li.className = 'text-sm text-slate-300';
    el.appendChild(li);
  });
}

function createExerciseItem(item) {
  // Acepta string o objeto {titulo, series_reps, descripcion, observaciones}
  if (typeof item === 'string') {
    const li = document.createElement('li');
    li.textContent = item;
    li.className = 'text-sm text-slate-300';
    return li;
  }
  const wrap = document.createElement('div');
  wrap.className = 'rounded-lg border border-slate-800 bg-slate-800/50 p-3';

  const title = document.createElement('p');
  title.className = 'font-medium';
  title.textContent = item.titulo || 'Ejercicio';
  wrap.appendChild(title);

  if (item.series_reps) {
    const sr = document.createElement('p');
    sr.className = 'text-xs text-slate-300';
    sr.textContent = item.series_reps;
    wrap.appendChild(sr);
  }
  if (item.descripcion) {
    const d = document.createElement('p');
    d.className = 'text-xs text-slate-400';
    d.textContent = item.descripcion;
    wrap.appendChild(d);
  }
  if (item.observaciones) {
    const o = document.createElement('p');
    o.className = 'text-xs text-slate-400';
    o.textContent = item.observaciones;
    wrap.appendChild(o);
  }
  return wrap;
}

(async function init() {
  // PERFIL
  const profile = await loadJSON('/data/profile.json');
  const pesoLS = localStorage.getItem('peso_actual');
  const pesoActual = pesoLS ? parseFloat(pesoLS) : profile.peso_actual;
  setText('peso-inicial', profile.peso_inicial);
  setText('peso-actual', pesoActual);
  setText('perfil-fecha', `Inicio: ${profile.fecha_inicio}`);

  const medidas = profile.medidas || {};
  const medidasEl = document.getElementById('medidas');
  if (medidasEl) {
    medidasEl.innerHTML = '';
    Object.entries(medidas).forEach(([k, v]) => {
      const div = document.createElement('div');
      div.className =
        'bg-slate-800/70 rounded px-3 py-2 flex items-center justify-between';
      div.innerHTML = `<span class="capitalize">${k.replace(
        '_',
        ' '
      )}</span><strong>${v} cm</strong>`;
      medidasEl.appendChild(div);
    });
  }

  document.getElementById('btn-guardar-peso')?.addEventListener('click', () => {
    const val = parseFloat(document.getElementById('input-peso').value);
    if (!isNaN(val)) {
      localStorage.setItem('peso_actual', String(val));
      setText('peso-actual', val);
    }
  });

  // PLAN
  const plan = await loadJSON('/data/plan.json');
  setText('plan-nombre', plan.nombre);
  renderList('plan-preparacion', plan.preparacion || []);

  // LAB
  const lab = await loadJSON('/data/lab.json');
  const labC = document.getElementById('lab-resultados');
  if (labC) {
    labC.innerHTML = '';
    (lab.resultados || []).forEach((r) => {
      const card = document.createElement('div');
      card.className =
        'rounded-xl border border-slate-800 bg-slate-800/60 p-3';
      card.innerHTML = `<p class='font-medium'>${r.nombre}</p>
        <p class='text-sm text-slate-300'>${r.valor}</p>
        <p class='text-xs text-slate-400'>${r.fecha}</p>`;
      labC.appendChild(card);
    });
  }

  // NUTRICIÓN
  const nutrition = await loadJSON('/data/nutrition.json');
  const comidasC = document.getElementById('comidas');
  if (comidasC) {
    comidasC.innerHTML = '';
    (nutrition.comidas || []).forEach((c) => {
      const card = document.createElement('div');
      card.className =
        'rounded-xl border border-slate-800 bg-slate-800/60 p-3';
      card.innerHTML = `<p class='font-medium'>${c.titulo}</p>
        <ul class='list-disc list-inside text-sm text-slate-300'>${(
          c.items || []
        )
          .map((i) => `<li>${i}</li>`)
          .join('')}</ul>`;
      comidasC.appendChild(card);
    });
  }
  setText('pre-digestivo', nutrition.ciclo_pre_digestivo || '');
  setText('agua', nutrition.agua || '');

  // SUPLEMENTOS
  const supp = await loadJSON('/data/supplements.json');
  const supC = document.getElementById('suplementos-list');
  if (supC) {
    supC.innerHTML = '';
    function block(titulo, arr) {
      const wrap = document.createElement('div');
      wrap.className =
        'rounded-xl border border-slate-800 bg-slate-800/60 p-3';
      wrap.innerHTML = `<p class='font-medium mb-1'>${titulo}</p>`;
      const ul = document.createElement('ul');
      ul.className = 'list-disc list-inside text-sm text-slate-300';
      (arr || []).forEach((x) => {
        const li = document.createElement('li');
        li.textContent = x;
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
      return wrap;
    }
    supC.appendChild(block('Oxidantes', supp.oxidantes));
    supC.appendChild(block('Thermo oxidación', supp.thermo_oxidacion));
    supC.appendChild(block('Pre-entreno', supp.pre_entreno));
    supC.appendChild(block('Mid-entreno', supp.mid_entreno));
    supC.appendChild(block('Post-entreno', supp.post_entreno));
  }

  // RUTINAS (soporta arrays de strings u objetos)
  const routines = await loadJSON('/data/routines.json');
  setText('ciclo-cardio', routines.ciclo_cardio || '');
  const semanal = routines.semanal || {};
  const ruC = document.getElementById('rutina-semanal');
  if (ruC) {
    ruC.innerHTML = '';
    ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
      .forEach((d) => {
        const card = document.createElement('div');
        card.className =
          'rounded-xl border border-slate-800 bg-slate-800/60 p-3';

        const title = document.createElement('p');
        title.className = 'font-medium capitalize mb-2';
        title.textContent = d;
        card.appendChild(title);

        const dayItems = semanal[d] || [];
        if (dayItems.length === 0) {
          const empty = document.createElement('p');
          empty.className = 'text-sm text-slate-400';
          empty.textContent = 'Sin ejercicios asignados';
          card.appendChild(empty);
        } else {
          const listWrap = document.createElement('div');
          listWrap.className = 'grid gap-2';
          dayItems.forEach((item) =>
            listWrap.appendChild(createExerciseItem(item))
          );
          card.appendChild(listWrap);
        }

        ruC.appendChild(card);
      });
  }
  setText('final-cardio', routines.final_cardio || '');

  // TIPS
  const tips = await loadJSON('/data/tips.json');
  renderList('tips-alimentacion', tips.alimentacion || []);
  renderList('tips-acondicionamiento', tips.acondicionamiento || []);
})();
