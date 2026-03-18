import { submitContact, fetchProjects, fetchProject } from './api.js';

export function initUI() {
  initNavigation();
  initRevealAnimations();
  initContactForm();
  initChat();
  loadProjectsGrid();
  setupProjectPage();
}

function initNavigation() {
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  const sections = Array.from(document.querySelectorAll("section[id]"));

  function scrollToHash(hash) {
    const target = document.querySelector(hash);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth" });
  }

  navLinks.forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      if (anchor.getAttribute("href") === "#") return;
      e.preventDefault();
      scrollToHash(anchor.getAttribute("href"));
    });
  });

  const cta = document.querySelector(".cta-btn");
  if (cta && cta.getAttribute('href')?.startsWith('#')) {
    cta.addEventListener("click", () => scrollToHash(cta.getAttribute('href')));
  } else if (cta && !cta.getAttribute('href')) {
    cta.addEventListener("click", () => scrollToHash("#about"));
  }

  function setActiveLink() {
    const scrollPos = window.scrollY + window.innerHeight / 2;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const link = document.querySelector(`nav a[href="#${section.id}"]`);
      if (!link) return;
      if (scrollPos >= top && scrollPos < bottom) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  window.addEventListener("scroll", setActiveLink);
  setActiveLink();
}

function initRevealAnimations() {
  if (!window.IntersectionObserver) return;
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationDelay = "0s";
          entry.target.style.animationPlayState = "running";
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll("#about, #projects, #contact, #dev-process").forEach((section) => {
    section.style.animationPlayState = "paused";
    revealObserver.observe(section);
  });
}

function renderMarkdown(md) {
  if (!md) return "";
  const escape = (str) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return escape(md)
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("### ")) return `<h3>${trimmed.slice(4)}</h3>`;
      if (trimmed.startsWith("## ")) return `<h2>${trimmed.slice(3)}</h2>`;
      if (trimmed.startsWith("# ")) return `<h1>${trimmed.slice(2)}</h1>`;
      if (trimmed === "") return "";
      return `<p>${trimmed}</p>`;
    })
    .filter((line) => line !== "")
    .join("")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
}

// Modal handling logic (for static projects on index page)
const staticProjectsInfo = {
  "site-responsivo": {
    title: "Site Responsivo",
    subtitle: "Layout fluido que se adapta a qualquer tela.",
    description: "Websites modernos precisam funcionar bem em dispositivos de diferentes tamanhos.",
    features: ["Grid flexível", "Imagens otimizadas", "Acessibilidade"],
    tech: ["HTML5", "CSS3", "JS"],
    img: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=900",
    next: "app-mobile"
  },
  "app-mobile": {
    title: "App Mobile",
    subtitle: "Interfaces intuitivas para uso móvel.",
    description: "Foco em UX simples e desempenho.",
    features: ["Design touch", "PWA", "Offline-first"],
    tech: ["React Native"],
    img: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=900",
    next: "ia-integrada"
  },
  "ia-integrada": {
    title: "IA Integrada",
    subtitle: "Automação com inteligência artificial.",
    description: "Implemento recursos com IA para melhorar a experiência.",
    features: ["Chatbots", "Recomendações", "NLP"],
    tech: ["Python", "TensorFlow"],
    img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900",
    next: "site-responsivo"
  }
};

function openModal(slug) {
  const modal = document.getElementById("projectModal");
  if (!modal) return;
  const project = staticProjectsInfo[slug];
  if (!project) return;

  document.getElementById("modalTitle").textContent = project.title;
  document.getElementById("modalImg").src = project.img;
  document.getElementById("modalImg").alt = project.title;
  document.getElementById("modalSubtitle").textContent = project.subtitle;
  document.getElementById("modalDescription").innerHTML = renderMarkdown(project.description);

  const modalTags = document.getElementById("modalTags");
  modalTags.innerHTML = "";
  project.tech.forEach((tech) => {
    const t = document.createElement("span");
    t.className = "tag"; t.textContent = tech; modalTags.appendChild(t);
  });

  const modalFeatures = document.getElementById("modalFeatures");
  modalFeatures.innerHTML = "";
  project.features.forEach((feat) => {
    const li = document.createElement("li");
    li.textContent = feat; modalFeatures.appendChild(li);
  });

  document.getElementById("modalNext").onclick = () => openModal(project.next);
  modal.style.display = "block";
}

async function loadProjectsGrid() {
  const container = document.getElementById("projectGrid");
  if (!container) return;

  document.querySelectorAll(".details-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(btn.dataset.slug);
    });
  });

  const closeBtn = document.querySelector(".close");
  const modal = document.getElementById("projectModal");
  if (closeBtn && modal) {
    closeBtn.onclick = () => (modal.style.display = "none");
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  }
}

async function setupProjectPage() {
  const projectTitle = document.getElementById("projectTitle");
  if (!projectTitle) return;

  const slug = window.location.pathname.split("/").pop();
  try {
    const project = await fetchProject(slug);
    
    document.title = `DWX DEV - ${project.title}`;
    projectTitle.textContent = project.title;
    document.getElementById("projectSubtitle").textContent = project.subtitle;
    document.getElementById("projectDescription").innerHTML = renderMarkdown(project.description);

    const tags = document.getElementById("projectTags");
    tags.innerHTML = "";
    (project.tech || []).forEach((tech) => {
      const chip = document.createElement("span");
      chip.className = "tag"; chip.textContent = tech; tags.appendChild(chip);
    });

    const features = document.getElementById("projectFeatures");
    features.innerHTML = "";
    (project.features || []).forEach((feature) => {
      const li = document.createElement("li");
      li.textContent = feature; features.appendChild(li);
    });

    const img = document.getElementById("projectImage");
    if(img && project.img) {
      img.src = project.img; img.alt = project.title;
    }

    const nextLink = document.getElementById("projectNext");
    if(nextLink) nextLink.href = `/project/${project.next || project.slug}`;
  } catch (err) {
    projectTitle.textContent = "Projeto não encontrado";
  }
}

function initContactForm() {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const btn = this.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = "Enviando...";
    btn.disabled = true;

    try {
      const result = await submitContact({
        name: this.name.value,
        email: this.email.value,
        message: this.message.value
      });
      alert(result.message || "Mensagem enviada!");
      this.reset();
    } catch (err) {
      alert(err.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

function initChat() {
  const chatBtn = document.getElementById("chatBtn");
  const modal = document.getElementById("chatModal");
  if (!chatBtn || !modal) return;

  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const closeBtn = document.getElementById("chatClose");

  const aiResponses = {
    "oi": "Olá! Sou a assistente de IA do DWX DEV. <br>Posso te falar sobre meus <a href='#projects' onclick='document.getElementById(\"chatModal\").style.display=\"none\";'>Projetos</a>, <a href='#about' onclick='document.getElementById(\"chatModal\").style.display=\"none\";'>Habilidades</a> ou <a href='#contact' onclick='document.getElementById(\"chatModal\").style.display=\"none\";'>Contato</a>.",
    "olá": "Olá! Sou a assistente de IA do DWX DEV. <br>Posso te falar sobre meus <a href='#projects' onclick='document.getElementById(\"chatModal\").style.display=\"none\";'>Projetos</a>, <a href='#about' onclick='document.getElementById(\"chatModal\").style.display=\"none\";'>Habilidades</a> ou <a href='#contact' onclick='document.getElementById(\"chatModal\").style.display=\"none\";'>Contato</a>.",
    "projeto": "Temos projetos incríveis! Veja a seção completa clicando aqui: <a href='#projects' onclick='document.getElementById(\"chatModal\").style.display=\"none\";'>Meus Projetos</a>.",
    "contato": "Quer bater um papo comercial? <a href='#contact' onclick='document.getElementById(\"chatModal\").style.display=\"none\";'>Vá para a seção de Contato</a> e me mande uma mensagem!",
    "habilidade": "Eu trabalho com as melhores stacks do mercado (React, Node, UX/UI). Veja mais em <a href='#about' onclick='document.getElementById(\"chatModal\").style.display=\"none\";'>Sobre Mim</a>.",
    "sobre": "Eu sou o Daniel, um desenvolvedor Full-Stack apaixonado por interfaces de alto nível. <a href='#about' onclick='document.getElementById(\"chatModal\").style.display=\"none\";'>Saiba mais aqui</a>.",
    "default": "Não tenho certeza se entendi. Mas posso te direcionar para nossos <a href='#projects' onclick='document.getElementById(\"chatModal\").style.display=\"none\";'>Projetos</a> ou <a href='#contact' onclick='document.getElementById(\"chatModal\").style.display=\"none\";'>Contato</a>."
  };

  function addMsg(txt, sender) {
    const d = document.createElement("div");
    d.className = `message ${sender}`; 
    if (sender === 'ai') {
      d.innerHTML = txt;
    } else {
      d.textContent = txt;
    }
    chatMessages.appendChild(d);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function handleSend() {
    const msg = chatInput.value.trim();
    if (!msg) return;
    addMsg(msg, "user");
    chatInput.value = "";
    sendBtn.disabled = true;
    
    setTimeout(() => {
      const lower = msg.toLowerCase();
      let res = aiResponses.default;
      for (const key in aiResponses) {
        if (lower.includes(key)) {
          res = aiResponses[key];
          break;
        }
      }
      addMsg(res, "ai");
      sendBtn.disabled = false;
    }, 600);
  }

  chatBtn.onclick = () => {
    modal.style.display = "block";
    if (chatMessages.children.length === 0) {
      addMsg("Olá! Como posso ajudar?", "ai");
    }
  };

  closeBtn.onclick = () => (modal.style.display = "none");
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  sendBtn.onclick = handleSend;
  chatInput.onkeypress = (e) => { if (e.key === "Enter") handleSend(); };
}
