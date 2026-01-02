let quiz = null;
let index = 0;
let answers = {};
let quizKey = "";

/* =========================
   LOAD QUIZ
========================= */
function loadQuiz(file) {
  quizKey = `examSession_${file}`;

  fetch(`../data/quizzes/${file}`)
    .then(res => res.json())
    .then(data => {
      quiz = data;

      document.getElementById("quizSelect").classList.add("hidden");
      document.getElementById("intro").classList.remove("hidden");

      document.getElementById("title").textContent = quiz.title;
      document.getElementById("count").textContent = quiz.questions.length;

      const session = localStorage.getItem(quizKey);

      if (session) {
        if (confirm("You have a saved exam.\n\nContinue where you left off?")) {
          const parsed = JSON.parse(session);
          answers = parsed.answers || {};
          index = parsed.index ?? 0;
        } else {
          localStorage.removeItem(quizKey);
          answers = {};
          index = 0;
        }
      }
    });
}

/* =========================
   START EXAM
========================= */
function startQuiz() {
  document.getElementById("intro").classList.add("hidden");
  document.getElementById("exam").classList.remove("hidden");
  render();
}

/* =========================
   RENDER QUESTION
========================= */
function render() {
  const q = quiz.questions[index];

  document.getElementById("progress").textContent =
    `Question ${index + 1} of ${quiz.questions.length}`;

  document.getElementById("question").textContent = q.question;

  const choices = document.getElementById("choices");
  choices.innerHTML = "";

  q.options.forEach((opt, i) => {
    const div = document.createElement("div");
    div.className = "option";
    if (answers[index] === i) div.classList.add("selected");
    div.textContent = opt;

    div.onclick = () => {
      answers[index] = i;
      autoSave();
      render();
    };

    choices.appendChild(div);
  });

  updateNextButton();
  renderNav();
}

/* =========================
   QUESTION NAVIGATION
========================= */
function renderNav() {
  const nav = document.getElementById("questionNav");
  nav.innerHTML = "";

  quiz.questions.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.textContent = i + 1;

    if (i === index) btn.classList.add("current");
    if (answers[i] !== undefined) btn.classList.add("answered");

    btn.onclick = () => {
      index = i;
      autoSave();
      render();
    };

    nav.appendChild(btn);
  });
}

/* =========================
   AUTO SAVE SESSION
========================= */
function autoSave() {
  localStorage.setItem(
    quizKey,
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
  autoSave();
  window.location.href = "../main.html";
}

/* =========================
   NAVIGATION
========================= */
function nextQuestion() {
  if (index < quiz.questions.length - 1) {
    index++;
    autoSave();
    render();
  } else {
    finishQuiz();
  }
}

function prevQuestion() {
  if (index > 0) {
    index--;
    autoSave();
    render();
  }
}

/* =========================
   NEXT → FINISH
========================= */
function updateNextButton() {
  const nextBtn = document.querySelector("button[onclick='nextQuestion()']");
  if (!nextBtn) return;

  nextBtn.textContent =
    index === quiz.questions.length - 1 ? "Finish" : "Next";
}

/* =========================
   FINISH EXAM
========================= */
function finishQuiz() {
  let correct = 0;

  quiz.questions.forEach((q, i) => {
    if (answers[i] === q.answer) correct++;
  });

  const score = Math.round((correct / quiz.questions.length) * 100);

  localStorage.removeItem(quizKey);

  document.getElementById("exam").classList.add("hidden");
  document.getElementById("result").classList.remove("hidden");

  document.getElementById("score").textContent = score;
  document.getElementById("status").textContent =
    score >= 80 ? "PASSED" : "FAILED";
}

/* =========================
   RETAKE QUIZ
========================= */
function retakeQuiz() {
  localStorage.removeItem(quizKey);
  answers = {};
  index = 0;

  document.getElementById("result").classList.add("hidden");
  document.getElementById("review").classList.add("hidden");
  document.getElementById("intro").classList.remove("hidden");
}

/* =========================
   REVIEW ANSWERS
========================= */
function reviewQuiz() {
  const review = document.getElementById("review");

  review.innerHTML = "<h1>Review Answers</h1>";

  document.getElementById("result").classList.add("hidden");
  review.classList.remove("hidden");

  quiz.questions.forEach((q, i) => {
    const block = document.createElement("div");
    block.style.marginBottom = "20px";

    const question = document.createElement("p");
    question.innerHTML = `<strong>${i + 1}. ${q.question}</strong>`;
    block.appendChild(question);

    q.options.forEach((opt, idx) => {
      const p = document.createElement("p");
      p.textContent = opt;

      if (idx === q.answer) p.classList.add("correct");
      if (answers[i] === idx && idx !== q.answer) p.classList.add("wrong");

      block.appendChild(p);
    });

    review.appendChild(block);
  });

  window.scrollTo(0, 0);
}
