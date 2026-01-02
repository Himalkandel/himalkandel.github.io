let exam = null;
let index = 0;
let answers = {};
let examKey = "";

/* =========================
   LOAD EXAM
========================= */
function loadExam(file) {
  examKey = `longExamSession_${file}`;

  fetch(`../data/exams/${file}`)
    .then(res => res.json())
    .then(data => {
      exam = data;

      document.getElementById("quizSelect").classList.add("hidden");
      document.getElementById("intro").classList.remove("hidden");

      document.getElementById("title").textContent = exam.title;
      document.getElementById("count").textContent = exam.questions.length;

      const session = localStorage.getItem(examKey);

      if (session) {
        if (confirm("You have a saved exam.\n\nContinue where you left off?")) {
          const parsed = JSON.parse(session);
          answers = parsed.answers || {};
          index = parsed.index ?? 0;
        } else {
          localStorage.removeItem(examKey);
          answers = {};
          index = 0;
        }
      }
    })
    .catch(err => console.error("Failed to load exam:", err));
}

/* =========================
   START EXAM
========================= */
function startExam() {
  document.getElementById("intro").classList.add("hidden");
  document.getElementById("exam").classList.remove("hidden");
  renderExam();
}

/* =========================
   RENDER QUESTION
========================= */
function renderExam() {
  const q = exam.questions[index];

  document.getElementById("progress").textContent =
    `Question ${index + 1} of ${exam.questions.length}`;

  document.getElementById("question").textContent = q.question;

  const choices = document.getElementById("choices");
  choices.innerHTML = "";

  Object.entries(q.options).forEach(([key, text]) => {
    const div = document.createElement("div");
    div.className = "option";

    if (answers[index] === key) div.classList.add("selected");

    div.textContent = `${key}. ${text}`;

    div.onclick = () => {
      answers[index] = key;
      autoSaveExam();
      renderExam();
    };

    choices.appendChild(div);
  });

  updateNextButtonExam();
  renderExamNav();
}

/* =========================
   QUESTION NAVIGATION
========================= */
function renderExamNav() {
  const nav = document.getElementById("questionNav");
  nav.innerHTML = "";

  exam.questions.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.textContent = i + 1;

    if (i === index) btn.classList.add("current");
    if (answers[i] !== undefined) btn.classList.add("answered");

    btn.onclick = () => {
      index = i;
      autoSaveExam();
      renderExam();
    };

    nav.appendChild(btn);
  });
}

/* =========================
   AUTO SAVE SESSION
========================= */
function autoSaveExam() {
  localStorage.setItem(
    examKey,
    JSON.stringify({
      answers,
      index,
      savedAt: Date.now()
    })
  );
}

/* =========================
   SAVE & EXIT
========================= */
function saveAndExit() {
  autoSaveExam();
  window.location.href = "../main.html";
}

/* =========================
   NAVIGATION
========================= */
function nextQuestion() {
  if (index < exam.questions.length - 1) {
    index++;
    autoSaveExam();
    renderExam();
  } else {
    finishExam();
  }
}

function prevQuestion() {
  if (index > 0) {
    index--;
    autoSaveExam();
    renderExam();
  }
}

/* =========================
   NEXT → FINISH
========================= */
function updateNextButtonExam() {
  const nextBtn = document.querySelector("button[onclick='nextQuestion()']");
  if (!nextBtn) return;

  nextBtn.textContent =
    index === exam.questions.length - 1 ? "Finish" : "Next";
}

/* =========================
   FINISH EXAM
========================= */
function finishExam() {
  let correct = 0;

  exam.questions.forEach((q, i) => {
    if (answers[i] === q.answer) correct++;
  });

  const score = Math.round((correct / exam.questions.length) * 100);

  localStorage.removeItem(examKey);

  document.getElementById("exam").classList.add("hidden");
  document.getElementById("result").classList.remove("hidden");

  document.getElementById("score").textContent = score;
  document.getElementById("status").textContent =
    score >= 80 ? "PASSED" : "FAILED";
}

/* =========================
   RETAKE EXAM
========================= */
function retakeExam() {
  localStorage.removeItem(examKey);
  answers = {};
  index = 0;

  document.getElementById("result").classList.add("hidden");
  document.getElementById("review").classList.add("hidden");
  document.getElementById("intro").classList.remove("hidden");
}

/* =========================
   REVIEW ANSWERS
========================= */
function reviewExam() {
  const review = document.getElementById("review");

  review.innerHTML = "<h1>Review Answers</h1>";

  document.getElementById("result").classList.add("hidden");
  review.classList.remove("hidden");

  exam.questions.forEach((q, i) => {
    const block = document.createElement("div");
    block.style.marginBottom = "20px";

    const question = document.createElement("p");
    question.innerHTML = `<strong>${i + 1}. ${q.question}</strong>`;
    block.appendChild(question);

    Object.entries(q.options).forEach(([key, text]) => {
      const p = document.createElement("p");
      p.textContent = `${key}. ${text}`;

      if (key === q.answer) p.classList.add("correct");
      if (answers[i] === key && key !== q.answer) p.classList.add("wrong");

      block.appendChild(p);
    });

    review.appendChild(block);
  });

  window.scrollTo(0, 0);
}
