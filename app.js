// Lightweight prototype logic for flashcards, quiz, notes, and simple parent stats.
// This is intentionally simple and client-side only for a GitHub Pages prototype.

const sampleDecks = {
  math: [
    {q:"2×6", a:"12"},
    {q:"7+8", a:"15"},
    {q:"9−4", a:"5"},
    {q:"5×5", a:"25"}
  ],
  science: [
    {q:"Photosynthesis occurs in?", a:"Leaves"},
    {q:"State of water at 0°C", a:"Ice"}
  ]
};

let deck = [...sampleDecks.math];
let cardIndex = 0;
let xp = 0;
let weakTopics = {};

function $(id){return document.getElementById(id)}

// Flashcard logic
function showCard(){
  const card = deck[cardIndex % deck.length];
  const el = $('card');
  el.textContent = card.q;
  el.dataset.side = 'front';
}
$('card').addEventListener('click', ()=>{
  const el = $('card');
  const card = deck[cardIndex % deck.length];
  if(el.dataset.side === 'front'){
    el.textContent = card.a;
    el.dataset.side = 'back';
  } else {
    cardIndex++;
    showCard();
  }
});
$('good').addEventListener('click', ()=>{
  xp += 5;
  $('xp').textContent = xp;
  cardIndex++;
  showCard();
});
$('wrong').addEventListener('click', ()=>{
  xp += 1;
  $('xp').textContent = xp;
  // mark weak topic (simple)
  weakTopics['current'] = (weakTopics['current']||0)+1;
  $('weak').textContent = Object.keys(weakTopics).join(', ');
  showCard();
});
$('deck-select').addEventListener('change', (e)=>{
  deck = [...sampleDecks[e.target.value]];
  cardIndex = 0;
  showCard();
});
$('reset-deck').addEventListener('click', ()=>{
  cardIndex = 0; xp = 0; $('xp').textContent = xp; $('weak').textContent = '—'; showCard();
});

// Simple adaptive quiz (5 questions)
const quizBank = [
  {q:"5+3", opts:["7","8","9"], a:"8", topic:"math"},
  {q:"10−4", opts:["6","7","5"], a:"6", topic:"math"},
  {q:"Which organ makes insulin?", opts:["Liver","Pancreas","Heart"], a:"Pancreas", topic:"science"},
  {q:"H2O is?", opts:["Salt","Water","Oxygen"], a:"Water", topic:"science"}
];

function startQuiz(){
  const questions = shuffle(quizBank).slice(0,5);
  runQuiz(questions);
}
$('quiz-start').addEventListener('click', startQuiz);

function runQuiz(questions){
  let i=0, score=0;
  const qEl = $('question'), aEl = $('answers'), fb = $('quiz-feedback');
  function next(){
    if(i>=questions.length){
      fb.textContent = `Quiz complete — score ${score}/${questions.length}`;
      xp += score*10;
      $('xp').textContent = xp;
      return;
    }
    const cur = questions[i];
    qEl.textContent = `Q${i+1}: ${cur.q}`;
    aEl.innerHTML = '';
    cur.opts.forEach(opt=>{
      const b = document.createElement('button');
      b.className='btn';
      b.textContent = opt;
      b.onclick = ()=>{
        if(opt===cur.a){ score++; fb.textContent='Correct!'; }
        else { fb.textContent=`Wrong — answer: ${cur.a}`; weakTopics[cur.topic]=(weakTopics[cur.topic]||0)+1; $('weak').textContent = Object.keys(weakTopics).join(', '); }
        i++; setTimeout(next,700);
      };
      aEl.appendChild(b);
    });
  }
  next();
}

// Notes -> world building (very simple)
$('save-note').addEventListener('click', ()=>{
  const text = $('note-input').value.trim();
  if(!text) return alert('Write a short summary first.');
  const node = document.createElement('div');
  node.className='note';
  node.textContent = text;
  $('world').appendChild(node);
  $('note-input').value='';
  xp += 2; $('xp').textContent = xp;
});

// small helpers
function shuffle(a){ return a.sort(()=>Math.random()-0.5) }

// initial render
document.addEventListener('DOMContentLoaded', ()=>{
  showCard();
  $('xp').textContent = xp;
  $('weak').textContent = '—';
  // hero buttons
  $('start-quiz').addEventListener('click', ()=>{ document.querySelector('#quizzes').scrollIntoView({behavior:'smooth'}); startQuiz(); });
  $('start-flash').addEventListener('click', ()=>{ document.querySelector('#flashcards').scrollIntoView({behavior:'smooth'}); });
});
