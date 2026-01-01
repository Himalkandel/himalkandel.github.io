let quiz = null;
let index = 0;
let answers = {};
let quizKey = "";
let resumeSession = false;

/* Load quiz */
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
          resumeSession = true;
        } else {
          localStorage.removeItem(quizKey);
          answers = {};
          index = 0;
          resumeSession = false;
        }
      }
    });
}

/* Start exam */
function startQuiz() {
  document.getElementById("intro").classList.add("hidden");
  document.getElementById("exam").classList.remove("hidden");

  // IMPORTANT: do not reset index/answers here
  render();
}

/* Render question */
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

/* Navigation grid */
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

/* Auto-save ENTIRE exam */
function autoSave() {
  localStorage.setItem(
    quizKey,
    JSON.stringify({
      answers,
      index,
      updatedAt: Date.now()
    })
  );
}

/* SAVE & EXIT */
function saveAndExit() {
  autoSave();
  window.location.href = "../main.html";
}

/* Navigation */
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

/* Next → Finish */
function updateNextButton() {
  const nextBtn = document.querySelector("button[onclick='nextQuestion()']");
  if (!nextBtn) return;

  nextBtn.textContent =
    index === quiz.questions.length - 1 ? "Finish" : "Next";
}

/* Finish exam */
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
