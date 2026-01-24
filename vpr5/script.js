/* =========================
   VPR Interactive • 4 tasks
   - Task 1: Listening True/False (key editable)
   - Task 2: Reading MCQ (with key)
   - Task 3: Grammar dropdowns (with key)
   - Task 4: Writing textarea + word counter (no checking)
========================= */

const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function setResult(el, text, ok=null){
  if(!el) return;
  el.textContent = text || "";
  if(ok === null) el.style.color = "";
  else el.style.color = ok ? "var(--good)" : "var(--bad)";
}

/* ===================== ANSWER KEYS ===================== */
/* Task 1: Listening (T/F). Set to null to disable checking for that statement. */
const KEY_T1 = { A:"F", B:"T", C:"T", D:"F", E:"F" };

/* Task 2: Reading (1/2/3) */
const KEY_T2 = { A:"3", B:"2", C:"1", D:"2", E:"3" };

/* Task 3: Grammar (values in selects: 1/2/3) */
const KEY_T3 = { A:"2", B:"3", C:"3", D:"3", E:"1" };

/* ===================== HIGHLIGHT HELPERS ===================== */
function clearChoiceHighlights(root){
  if(!root) return;
  $$('.choice-correct, .choice-wrong', root).forEach(el=>{
    el.classList.remove('choice-correct','choice-wrong');
  });
}

function highlightRadioChoice(root, name, correctValue){
  const checked = root.querySelector(`input[name="${name}"]:checked`);
  if(!checked) return { answered:false, correct:false };

  const label = checked.closest('.opt');
  if(!label) return { answered:true, correct:false };

  const ok = (checked.value === correctValue);
  label.classList.add(ok ? 'choice-correct' : 'choice-wrong');
  return { answered:true, correct:ok };
}

function highlightSelectChoice(selectEl, correctValue){
  if(!selectEl || !selectEl.value) return { answered:false, correct:false };

  const ok = (selectEl.value === correctValue);
  selectEl.classList.add(ok ? 'choice-correct' : 'choice-wrong');
  return { answered:true, correct:ok };
}

/* ===================== TASK 1 (Listening) ===================== */
(function initTask1(){
  const t1 = $('#t1');
  if(!t1) return;

  const audio = $('#task1Audio');
  const playBtn = $('#audioPlayBtn');
  const pauseBtn = $('#audioPauseBtn');
  const replayBtn = $('#audioReplayBtn');

  if(audio && playBtn) playBtn.addEventListener('click', ()=> audio.play());
  if(audio && pauseBtn) pauseBtn.addEventListener('click', ()=> audio.pause());
  if(audio && replayBtn) replayBtn.addEventListener('click', ()=>{
    audio.currentTime = 0;
    audio.play();
  });

  const checkBtn = $('#checkT1');
  const resetBtn = $('#resetT1');
  const res = $('#resT1');

  if(checkBtn) checkBtn.addEventListener('click', ()=>{
    const root = $('#task1List') || t1;
    clearChoiceHighlights(root);

    let total = 0;
    let correct = 0;

    // считаем только те, где ключ задан (не null)
    Object.keys(KEY_T1).forEach(q=>{
      const key = KEY_T1[q];
      if(key === null) return;

      total++;
      const r = highlightRadioChoice(root, `t1_${q}`, key);
      if(r.answered && r.correct) correct++;
    });

    if(total === 0){
      setResult(res, 'Проверка отключена (ключ не задан).', true);
      return;
    }
    setResult(res, `Правильно: ${correct}/${total}.`, correct === total);
  });

  if(resetBtn) resetBtn.addEventListener('click', ()=>{
    const root = $('#task1List') || t1;
    $$('#t1 input[type="radio"]').forEach(i=> i.checked = false);
    clearChoiceHighlights(root);
    setResult(res, "");
  });
})();

/* ===================== TASK 2 (Reading) ===================== */
(function initTask2(){
  const t2 = $('#t2');
  if(!t2) return;

  const checkBtn = $('#checkT2');
  const resetBtn = $('#resetT2');
  const res = $('#resT2');

  if(checkBtn) checkBtn.addEventListener('click', ()=>{
    clearChoiceHighlights(t2);

    let total = 0;
    let correct = 0;

    $$('.mcq', t2).forEach(block=>{
      const q = block.getAttribute('data-q');
      if(!q || !KEY_T2[q]) return;

      total++;
      const r = highlightRadioChoice(block, `t2_${q}`, KEY_T2[q]);
      if(r.answered && r.correct) correct++;
    });

    setResult(res, `Правильно: ${correct}/${total}.`, correct === total);
  });

  if(resetBtn) resetBtn.addEventListener('click', ()=>{
    $$('#t2 input[type="radio"]').forEach(i=> i.checked = false);
    clearChoiceHighlights(t2);
    setResult(res, "");
  });
})();

/* ===================== TASK 3 (Grammar) ===================== */
(function initTask3(){
  const t3 = $('#t3');
  if(!t3) return;

  const checkBtn = $('#checkT3');
  const resetBtn = $('#resetT3');
  const res = $('#resT3');

  // если ты делала "пустые" селекты при старте:
  // оставляем как было: чтобы не стояло значение по умолчанию
  $$('#t3 select').forEach(s => { try { s.selectedIndex = -1; } catch(e){} });

  if(checkBtn) checkBtn.addEventListener('click', ()=>{
    clearChoiceHighlights(t3);

    let total = 0;
    let correct = 0;

    $$('.gap', t3).forEach(gap=>{
      const code = gap.getAttribute('data-gap'); // A..E
      const sel = $('select', gap);
      if(!code || !KEY_T3[code]) return;

      total++;
      const r = highlightSelectChoice(sel, KEY_T3[code]);
      if(r.answered && r.correct) correct++;
    });

    setResult(res, `Правильно: ${correct}/${total}.`, correct === total);
  });

  if(resetBtn) resetBtn.addEventListener('click', ()=>{
    $$('#t3 select').forEach(s=>{
      s.value = "";
      try { s.selectedIndex = -1; } catch(e){}
    });
    clearChoiceHighlights(t3);
    setResult(res, "");
  });
})();

/* ===================== TASK 4 (Writing) ===================== */
(function initTask4(){
  const writing = $('#writingText');
  const stat = $('#wordStat');
  if(!writing || !stat) return;

  function countWords(text){
    const cleaned = (text || "").replace(/\u00A0/g, " ").trim();
    if(!cleaned) return 0;
    const words = cleaned.match(/[A-Za-zА-Яа-яЁё0-9]+(?:'[A-Za-z]+)?/g);
    return words ? words.length : 0;
  }

  function updateWordStat(){
    const n = countWords(writing.value);
    stat.textContent = `Слов: ${n} (норма 40–60)`;

    if(n >= 40 && n <= 60) stat.style.color = "var(--good)";
    else if(n > 60) stat.style.color = "var(--bad)";
    else stat.style.color = "var(--muted)";
  }

  writing.addEventListener('input', updateWordStat);
  updateWordStat();
})();
