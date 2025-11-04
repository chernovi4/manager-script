// ==UserScript==
// @name         GetCourse — Важный заказ + скрытие служебных задач (user + kanban)
// @namespace    https://molodeem.online/
// @version      1.0.1
// @description  Подсветка задач "Новый заказ" и скрытие служебных задач на карточке пользователя и в канбане сделок
// @match        https://*.getcourse.ru/user/control/user/update/id/*
// @match        https://*.getcourse.ru/user/control/user/update/id/*?*
// @match        https://*.getcourse.ru/pl/tasks/task/kanban/deals*
// @run-at       document-end
// @grant        none

// @updateURL    https://raw.githubusercontent.com/chernovi4/manager-script/main/manager.user.js
// @downloadURL  https://raw.githubusercontent.com/chernovi4/manager-script/main/manager.user.js
// ==/UserScript==

(function() {
  const targetTask = 'задача по процессу "задача новый заказ "';

  const hideList = [
    "не оплатил и создал новый тариф",
    "уведомление менеджеров об оплате",
    "группы колесо",
    "колесо призы",
    "история изменений",
    "история выполнения задачи"
  ].map(x => x.toLowerCase());

  const clean = s => s.replace(/\s+/g," ").trim().toLowerCase();

  function hideInside(row) {
    const body = row.parentElement;
    if (!body) return;

    const parts = body.querySelectorAll(`
      .task-body,
      .task-jobs,
      .task-scripts,
      .task-field-values-list,
      .task-links
    `);

    for (const el of parts) {
      if (el && el.style) el.style.display = "none";
    }

    if (!body.querySelector(".hidden-task-note")) {
      const note = document.createElement("div");
      note.className = "hidden-task-note";
      note.style.cssText = "margin:8px 0;font-size:13px;color:#999;font-family:Montserrat,sans-serif;";
      note.textContent = "📂 Скрытая служебная задача";
      body.prepend(note);
    }
  }

  function highlight(row) {
    row.style.background = "#fff9fa";
    row.style.border = "2px solid #ff4b5c";
    row.style.borderRadius = "8px";
    row.style.padding = "14px 16px";
    row.style.fontFamily = '"Montserrat",sans-serif';
    row.style.fontWeight = "600";
    row.style.fontSize = "16px";
    row.style.position = "relative";

    row.querySelectorAll("a").forEach(a=>{
      a.style.color="#0a4ecb";
      a.style.fontWeight="600";
      a.style.textDecoration="none";
    });

    const tag = document.createElement("div");
    tag.textContent = "⚡ Важно — новый заказ";
    Object.assign(tag.style,{
      position:"absolute",
      top:"-18px",
      right:"10px",
      background:"#ff4b5c",
      color:"#fff",
      fontFamily:'"Montserrat",sans-serif',
      fontWeight:"700",
      fontSize:"13px",
      padding:"6px 14px",
      borderRadius:"10px",
      boxShadow:"0 4px 10px rgba(0,0,0,.15)",
      textTransform:"uppercase",
      whiteSpace:"nowrap",
      zIndex:"9999"
    });
    row.appendChild(tag);
  }

  function processTaskTitle(row, txt) {
    if (txt.includes(clean(targetTask))) {
      highlight(row);
      return;
    }

    if (hideList.some(h=>txt.includes(h))) {
      row.style.display="none";
      hideInside(row);
    }
  }

  function run() {
    // ✅ карточка пользователя
    document.querySelectorAll(".task-title").forEach(row=>{
      processTaskTitle(row, clean(row.innerText));
    });

    // ✅ канбан (у карточек другой селектор)
    document.querySelectorAll(".task-card__title, .task-card-title, .task-card a").forEach(row=>{
      const txt = clean(row.innerText);
      processTaskTitle(row, txt);
    });

    // ✅ скрыть историю
    document.querySelectorAll('a.change-logs, a.show-all-history-link').forEach(el => {
      el.style.display="none";
    });

    console.log("%c✅ GC UI улучшен на user + kanban", "background:#28a745;color:#fff;padding:4px 8px;border-radius:4px;");
  }

  setTimeout(run, 800);
})();
