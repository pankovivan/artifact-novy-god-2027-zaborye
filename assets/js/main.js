(() => {
  "use strict";

  const safe = (fn) => {
    try {
      fn();
    } catch (error) {
      console.error("[Заборье 2027]", error);
    }
  };

  /* ---------- Появление блоков при скролле ---------- */

  const reveal = () => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!elements.length) return;

    const showAll = () => elements.forEach((el) => el.classList.add("is-visible"));

    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    elements.forEach((el) => observer.observe(el));

    // Страховка: если что-то пошло не так, контент не должен остаться невидимым.
    window.setTimeout(() => {
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (el.classList.contains("is-visible")) return;
        if (rect.top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 2200);
  };

  /* ---------- Шапка, прогресс, мобильное меню ---------- */

  const header = () => {
    const siteHeader = document.querySelector("[data-header]");
    const progress = document.querySelector("[data-progress]");
    const burger = document.querySelector("[data-burger]");
    const nav = document.getElementById("site-nav");
    const backdrop = document.querySelector("[data-nav-backdrop]");
    const navLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        if (siteHeader) siteHeader.classList.toggle("is-scrolled", scrollTop > 24);

        if (progress) {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const value = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;
          progress.style.transform = `scaleX(${value})`;
        }

        ticking = false;
        spy(scrollTop);
      });
    };

    const sections = ["place", "program", "menu", "products", "people", "packing"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const spy = (scrollTop) => {
      if (!sections.length) return;
      const line = scrollTop + window.innerHeight * 0.32;
      let current = "";
      sections.forEach((section) => {
        if (section.offsetTop <= line) current = section.id;
      });
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (!burger || !nav) return;

    const setOpen = (open) => {
      document.body.classList.toggle("nav-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
      if (backdrop) backdrop.hidden = false;
    };

    burger.addEventListener("click", () => {
      setOpen(!document.body.classList.contains("nav-open"));
    });

    if (backdrop) {
      backdrop.addEventListener("click", () => setOpen(false));
    }

    navLinks.forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
        setOpen(false);
        burger.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 960 && document.body.classList.contains("nav-open")) {
        setOpen(false);
      }
    });
  };

  /* ---------- Обратный отсчёт ---------- */

  const countdown = () => {
    const root = document.querySelector("[data-countdown]");
    if (!root) return;

    const target = new Date(root.dataset.target || "2027-01-01T00:00:00+05:00").getTime();
    const end = new Date("2027-01-02T15:00:00+05:00").getTime();
    if (Number.isNaN(target)) return;

    const units = {
      days: root.querySelector('[data-unit="days"]'),
      hours: root.querySelector('[data-unit="hours"]'),
      minutes: root.querySelector('[data-unit="minutes"]'),
      seconds: root.querySelector('[data-unit="seconds"]'),
    };

    const labels = {
      days: ["день", "дня", "дней"],
      hours: ["час", "часа", "часов"],
      minutes: ["минута", "минуты", "минут"],
      seconds: ["секунда", "секунды", "секунд"],
    };

    const status = document.querySelector("[data-countdown-status]");
    const wrap = root.closest(".countdown-wrap");

    const plural = (number, forms) => {
      const abs = Math.abs(number) % 100;
      const tail = abs % 10;
      if (abs > 10 && abs < 20) return forms[2];
      if (tail > 1 && tail < 5) return forms[1];
      if (tail === 1) return forms[0];
      return forms[2];
    };

    const setLabel = (unit, value) => {
      const label = root.querySelector(`[data-label="${unit}"]`);
      if (label) label.textContent = plural(value, labels[unit]);
    };

    const pad = (value) => String(value).padStart(2, "0");

    const tick = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        Object.entries(units).forEach(([unit, el]) => {
          if (!el) return;
          el.textContent = "00";
          setLabel(unit, 0);
        });
        root.classList.add("is-done");
        if (status) {
          status.textContent =
            now < end
              ? "С Новым 2027 годом! Праздник в самом разгаре 🎉"
              : "Праздник закончился, а воспоминания остались. До 2028-го!";
        }
        if (wrap) wrap.classList.add("is-done");
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff / 3600000) % 24);
      const minutes = Math.floor((diff / 60000) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (units.days) units.days.textContent = pad(days);
      if (units.hours) units.hours.textContent = pad(hours);
      if (units.minutes) units.minutes.textContent = pad(minutes);
      if (units.seconds) units.seconds.textContent = pad(seconds);

      setLabel("days", days);
      setLabel("hours", hours);
      setLabel("minutes", minutes);
      setLabel("seconds", seconds);
    };

    tick();
    window.setInterval(tick, 1000);
  };

  /* ---------- Табы программы ---------- */

  const tabs = () => {
    const tablist = document.querySelector('[role="tablist"]');
    if (!tablist) return;

    const buttons = Array.from(tablist.querySelectorAll('[role="tab"]'));
    if (!buttons.length) return;

    const panels = buttons.map((button) => document.getElementById(button.getAttribute("aria-controls")));

    const activate = (index, focus = false) => {
      buttons.forEach((button, i) => {
        const selected = i === index;
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
        if (panels[i]) panels[i].hidden = !selected;
      });
      if (focus) buttons[index].focus();
    };

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => activate(index));
      button.addEventListener("keydown", (event) => {
        let next = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % buttons.length;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + buttons.length) % buttons.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = buttons.length - 1;
        if (next === null) return;
        event.preventDefault();
        activate(next, true);
      });
    });

    const initial = buttons.findIndex((button) => button.getAttribute("aria-selected") === "true");
    activate(initial >= 0 ? initial : 0);
  };

  /* ---------- Снегопад в герое ---------- */

  const snow = () => {
    const canvas = document.getElementById("snow");
    if (!canvas || !canvas.getContext) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const hero = canvas.closest(".hero");
    if (!hero) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let flakes = [];
    let frame = 0;
    let running = false;
    let visible = true;
    let last = 0;

    const makeFlake = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.8 + Math.random() * 2.1,
      vy: 0.25 + Math.random() * 0.75,
      vx: -0.18 + Math.random() * 0.36,
      alpha: 0.25 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.004 + Math.random() * 0.012,
    });

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(30, Math.min(130, Math.round(width / 13)));
      flakes = Array.from({ length: count }, makeFlake);
    };

    const draw = (time) => {
      if (!running) return;
      if (!last) last = time;
      const delta = Math.min(34, time - last);
      last = time;

      ctx.clearRect(0, 0, width, height);

      for (const flake of flakes) {
        flake.phase += flake.phaseSpeed * delta * 0.06;
        flake.y += flake.vy * delta * 0.06;
        flake.x += (flake.vx + Math.sin(flake.phase) * 0.25) * delta * 0.035;

        if (flake.y > height + 6) {
          flake.y = -6;
          flake.x = Math.random() * width;
        }
        if (flake.x < -8) flake.x = width + 8;
        if (flake.x > width + 8) flake.x = -8;

        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(235, 245, 255, ${flake.alpha})`;
        ctx.fill();
      }

      frame = window.requestAnimationFrame(draw);
    };

    const start = () => {
      if (running || !visible || document.hidden) return;
      running = true;
      last = 0;
      frame = window.requestAnimationFrame(draw);
    };

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(frame);
    };

    resize();
    start();

    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver(() => {
        resize();
      });
      ro.observe(hero);
    } else {
      window.addEventListener("resize", resize);
    }

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          visible = entries[0].isIntersecting;
          if (visible) start();
          else stop();
        },
        { threshold: 0 }
      );
      io.observe(hero);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });
  };

  /* ---------- Чек-лист сборов ---------- */

  const packing = () => {
    const form = document.querySelector("[data-packing]");
    if (!form) return;

    const boxes = Array.from(form.querySelectorAll('input[type="checkbox"]'));
    if (!boxes.length) return;

    const key = "zaborye-2027-packing";
    const counter = form.querySelector("[data-pack-count]");
    const bar = form.querySelector("[data-pack-bar]");
    const status = form.querySelector("[data-pack-status]");
    const progress = form.querySelector("[data-pack-progress]");
    const reset = form.querySelector("[data-pack-reset]");

    const read = () => {
      try {
        const raw = window.localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    };

    const write = () => {
      try {
        window.localStorage.setItem(key, JSON.stringify(boxes.filter((box) => box.checked).map((box) => box.id)));
      } catch (error) {
        /* Приватный режим или запрет хранилища — просто не сохраняем. */
      }
    };

    const render = () => {
      const total = boxes.length;
      const done = boxes.filter((box) => box.checked).length;
      const percent = total ? Math.round((done / total) * 100) : 0;

      if (counter) counter.textContent = `${done} из ${total}`;
      if (bar) bar.style.width = `${percent}%`;
      if (progress) progress.setAttribute("aria-valuenow", String(percent));
      if (status) {
        if (done === 0) status.textContent = "Пока ничего не собрано";
        else if (done === total) status.textContent = "Всё собрано — осталось доехать";
        else status.textContent = "Список потихоньку закрывается";
      }
      form.classList.toggle("is-complete", total > 0 && done === total);
    };

    const saved = read();
    boxes.forEach((box) => {
      if (saved.includes(box.id)) box.checked = true;
      box.addEventListener("change", () => {
        write();
        render();
      });
    });

    if (reset) {
      reset.addEventListener("click", () => {
        const done = boxes.filter((box) => box.checked).length;
        if (done && !window.confirm("Сбросить все галочки?")) return;
        boxes.forEach((box) => {
          box.checked = false;
        });
        write();
        render();
      });
    }

    form.addEventListener("submit", (event) => event.preventDefault());

    render();
  };

  /* ---------- Жеребьёвка Тайного Санты ---------- */

  const santa = () => {
    const root = document.querySelector("[data-santa]");
    if (!root) return;

    const peopleBox = root.querySelector("[data-santa-people]");
    const result = root.querySelector("[data-santa-result]");
    if (!peopleBox) return;

    // Пары зафиксированы в самом сайте, чтобы на всех устройствах они были одинаковыми.
    const assignments = [
      { giver: "Ваня", receiver: "Костя" },
      { giver: "Оксана", receiver: "Наташа" },
      { giver: "Костя", receiver: "Денис" },
      { giver: "Ирина", receiver: "Оксана" },
      { giver: "Денис", receiver: "Ирина" },
      { giver: "Наташа", receiver: "Ваня" },
    ];

    const show = (giver) => {
      const item = assignments.find((entry) => entry.giver === giver);
      if (!item || !result) return;
      peopleBox.querySelectorAll(".santa-person").forEach((button) => {
        const active = button.dataset.giver === giver;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      result.textContent = `${item.giver} дарит подарок → ${item.receiver}`;
    };

    assignments.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "santa-person";
      button.dataset.giver = item.giver;
      button.textContent = item.giver;
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", `Показать, кому дарит ${item.giver}`);
      peopleBox.appendChild(button);
    });

    peopleBox.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest(".santa-person");
      if (!button) return;
      show(button.dataset.giver);
    });
  };

  safe(reveal);
  safe(header);
  safe(countdown);
  safe(tabs);
  safe(snow);
  safe(packing);
  safe(santa);
})();
