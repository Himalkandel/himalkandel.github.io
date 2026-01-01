let quiz = null;
let index = 0;
let answers = {};
let saved = {};

/* Load quiz */
function loadQuiz(file) {
  fetch(`../data/quizzes/${file}`)
    .then(res => res.json())
    .then(data => {
      quiz = data;
      index = 0;
      answers = {};
      saved = {};

      document.getElementById("quizSelect").classList.add("hidden");
      document.getElementById("intro").classList.remove("hidden");

      document.getElementById("title").textContent = quiz.title;
      document.getElementById("count").textContent = quiz.questions.length;
    });
}

/* Start */
function startQuiz() {
  document.getElementById("intro").classList.add("hidden");
  document.getElementById("exam").classList.remove("hidden");
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
      render();
    };
    choices.appendChild(div);
  });

  renderNav();
}

/* Small navigation buttons */
function renderNav() {
  const nav = document.getElementById("questionNav");
  nav.innerHTML = "";

  quiz.questions.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.textContent = i + 1;

    if (i === index) btn.classList.add("current");
    if (answers[i] !== undefined) btn.classList.add("answered");
    if (saved[i]) btn.classList.add("saved");

    btn.onclick = () => {
      index = i;
      render();
    };

    nav.appendChild(btn);
  });

  renderLegend();
}

/* Legend */
function renderLegend() {
  let legend = document.getElementById("legend");
  if (!legend) {
    legend = document.createElement("div");
    legend.id = "legend";
    legend.className = "legend";
    document.getElementById("exam").appendChild(legend);
  }

  legend.innerHTML = `
    <span><div class="legend-box legend-current"></div> Current</span>
    <span><div class="legend-box legend-answered"></div> Answered</span>
    <span><div class="legend-box legend-saved"></div> Saved</span>
  `;
}

/* Navigation */
function nextQuestion() {
  if (index < quiz.questions.length - 1) {
    index++;
    render();
  } else {
    finishQuiz();
  }
}

function prevQuestion() {
  if (index > 0) {
    index--;
    render();
  }
}

/* Save for later */
function saveForLater() {
  saved[index] = true;
  localStorage.setItem("quizSave", JSON.stringify({ answers, saved, index }));
  renderNav();
}

/* Finish */
function finishQuiz() {
  let correct = 0;

  quiz.questions.forEach((q, i) => {
    if (answers[i] === q.answer) correct++;
  });

  const score = Math.round((correct / quiz.questions.length) * 100);

  document.getElementById("exam").classList.add("hidden");
  document.getElementById("result").classList.remove("hidden");

  document.getElementById("score").textContent = score;
  document.getElementById("status").textContent =
    score >= 80 ? "PASSED" : "FAILED";
}

/* Retake */
function retakeQuiz() {
  answers = {};
  saved = {};
  index = 0;

  document.getElementById("result").classList.add("hidden");
  document.getElementById("review").classList.add("hidden");
  document.getElementById("intro").classList.remove("hidden");
}

/* Review */
function reviewQuiz() {
  const review = document.getElementById("review");
  review.innerHTML = "<h1>Review</h1>";

  document.getElementById("result").classList.add("hidden");
  review.classList.remove("hidden");

  quiz.questions.forEach((q, i) => {
    const div = document.createElement("div");
    div.innerHTML = `<p><strong>${i + 1}. ${q.question}</strong></p>`;

    q.options.forEach((opt, idx) => {
      const p = document.createElement("p");
      p.textContent = opt;

      if (idx === q.answer) p.className = "correct";
      if (answers[i] === idx && idx !== q.answer) p.className = "wrong";

      div.appendChild(p);
    });

    review.appendChild(div);
  });
}
