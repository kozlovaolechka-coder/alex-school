const tasks=[
{title:"🟠 Множества",text:"A — все машины в гараже. B — красные машины. C — красные гоночные машины. Как расположены множества?",a:["B внутри A, C внутри B","A внутри B","C отдельно от B"],ok:0,h:"Представь большую коробку «все машины». В ней коробка «красные». А где будут красные гоночные? Сначала ответь словами."},
{title:"🟠 Элемент или множество?",text:"Число 5 — отдельный элемент множества K. Что мы сравниваем: элемент с множеством или два множества?",a:["элемент с множеством","два множества"],ok:0,h:"Если слева одно число, это один предмет. Если слева целая группа — это множество. Что здесь слева?"},
{title:"🟠 Задача в два действия",text:"В 4 одинаковых коробках 28 моделей машин. Нужно узнать, сколько моделей в 3 таких коробках. Что узнаём первым?",a:["сколько в одной коробке","сразу сколько в трёх","сколько коробок останется"],ok:0,h:"Мы знаем количество сразу для 4 одинаковых коробок. Чтобы перейти к другому числу коробок, удобно сначала узнать количество для одной. Какое действие поможет?"},
{title:"⚡ Точность без таймера",text:"48 : 4 = ?",a:["12","14","16"],ok:0,h:"Не спеши. Проверь обратным действием: какое число × 4 даёт 48?"},
{title:"➗ Деление с остатком",text:"Для 45 : 14 сначала нужно найти число, которое не больше 45 и делится на 14. Какое?",a:["42","44","28"],ok:0,h:"Вспомни произведения 14: 14, 28, 42… Какое самое близкое к 45, но не больше него?"}
];let n=0,stars=0,hints=0,startAt=0;let wrong=0;
document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>showPage(b.dataset.page,b));
function showPage(id,b){document.querySelectorAll('.page').forEach(x=>x.classList.add('hidden'));document.getElementById(id).classList.remove('hidden');document.querySelectorAll('#nav button').forEach(x=>x.classList.remove('on'));b?.classList.add('on');window.scrollTo({top:0,behavior:'smooth'})}
function startRepair(){showPage('today',document.querySelector('[data-page=today]'));n=0;stars=0;hints=0;wrong=0;startAt=Date.now();document.querySelector('#stars').textContent=0;document.querySelector('#mission').classList.remove('hidden');document.querySelector('.actions').style.display='flex';render();document.querySelector('#mission').scrollIntoView({behavior:'smooth'})}
function render(){let t=tasks[n];bar.style.width=(n/tasks.length*100)+'%';lena.classList.add('hidden');task.innerHTML='<h2>'+t.title+'</h2><p>'+t.text+'</p><div class="answers">'+t.a.map((x,i)=>'<button onclick="answer('+i+')">'+x+'</button>').join('')+'</div>'}
function answer(i){let t=tasks[n];if(i===t.ok){stars++;document.querySelector('#stars').textContent=stars;n++;n<tasks.length?render():finish()}else{wrong++;say("Это место для прокачки. Не угадываем. Нажми «Лена, помоги» — разберём только следующий шаг.")}}
function hint(){hints++;say(tasks[n].h)}
function say(x){lena.textContent='👩‍🏫 Лена: '+x;lena.classList.remove('hidden')}
function speak(x){if('speechSynthesis'in window){speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(x);u.lang='ru-RU';speechSynthesis.speak(u)}}
function readTask(){speak(tasks[n].text)}
function coach(kind){let target=kind==='homework'||kind==='russian'?document.querySelector('#homeworkLena'):document.querySelector('#newLena');let msg=kind==='russian'?'Сначала прочитай задание своими словами. Что именно просит сделать упражнение?':kind==='mathnew'?'Начнём не с ответа. В задаче сначала назови: что известно и что нужно узнать?':kind==='rusnew'?'Сначала найди грамматическую основу: кто или что? что делает?': 'Покажи или прочитай условие. Я сначала объясню правило, затем задам один вопрос. Ответ за тебя не скажу.';target.textContent='👩‍🏫 Лена: '+msg;target.classList.remove('hidden')}
function finish(){bar.style.width='100%';let sec=Math.round((Date.now()-startAt)/1000);task.innerHTML='<h2>🏆 Ремонт завершён</h2><p>Прокачано: <b>'+stars+' из '+tasks.length+'</b>. Сравниваем только с твоим прошлым результатом.</p><p>Время: '+sec+' сек. · Подсказок: '+hints+'</p><button onclick="startRepair()">Повторить позже</button>';document.querySelector('.actions').style.display='none';saveEvent(sec)}
const SUPABASE_URL="https://hohichmdidpsaoitapbi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_W0SBm4JTORf-n4w-Wly0lA_dvkjjXsy";
async function saveEvent(sec){
  const e={student:"Саша",subject:"Математика",source_work:"С/р №3",tasks:"стр. 7–8 №1,2,5",skills:["множества","математические знаки","задача в два действия","вычисления","деление с остатком"],score:stars,total:tasks.length,hints,wrong,time_seconds:sec,independence:hints===0?"самостоятельно":"с подсказками Лены",attempt:"первая диагностическая",created_at:new Date().toISOString(),sync_status:"syncing"};
  localStorage.setItem('alex_last_result',JSON.stringify(e));showLast();
  const row={student_code:"sasha",session_id:"repair-"+Date.now(),event_type:"session_finish",subject:"math",activity:"repair_sr3",skill:null,question_id:null,answer_value:null,is_correct:stars===tasks.length,attempt_no:1,response_ms:sec*1000,hint_level:hints,metadata:{source_work:e.source_work,tasks:e.tasks,skills:e.skills,score:e.score,total:e.total,wrong:e.wrong,independence:e.independence,attempt:e.attempt}};
  try{
    const r=await fetch(SUPABASE_URL+"/rest/v1/learning_events",{method:"POST",headers:{"apikey":SUPABASE_PUBLISHABLE_KEY,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify(row)});
    if(!r.ok)throw new Error("HTTP "+r.status+" "+await r.text());
    e.sync_status="synced_to_supabase";
  }catch(err){
    e.sync_status="sync_error";
    e.sync_error=String(err.message||err);
  }
  localStorage.setItem('alex_last_result',JSON.stringify(e));showLast();
}
function showLast(){let e=localStorage.getItem('alex_last_result');if(e)document.querySelector('#lastEvent').textContent=JSON.stringify(JSON.parse(e),null,2)}showLast();