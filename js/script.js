(function () {
  const STORAGE = {
    DATA: "notes-system-ui-data",
    AUTH: "notes-system-ui-auth"
  };

  const STATES = {
    ACTIVE: "ACTIVE",
    ARCHIVE: "ARCHIVE",
    TRASH: "TRASH"
  };

  const PAGE_CONFIG = {
    dashboard: {
      state: STATES.ACTIVE,
      title: "Dashboard",
      subtitle: "A clean working space for active notes, pinned notes, and quick actions.",
      allowCreate: true,
      allowPinnedSection: true
    },
    archive: {
      state: STATES.ARCHIVE,
      title: "Archived Notes",
      subtitle: "Stored away from the main workspace and available for future reference.",
      allowCreate: false,
      allowPinnedSection: false
    },
    trash: {
      state: STATES.TRASH,
      title: "Trash",
      subtitle: "Recovered notes live here temporarily before permanent deletion.",
      allowCreate: false,
      allowPinnedSection: false
    }
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

  const stateLabels = {
    [STATES.ACTIVE]: "Active",
    [STATES.ARCHIVE]: "Archive",
    [STATES.TRASH]: "Trash"
  };

  const initialData = {
    notes: [
      {
        id: 101,
        title: "Spring Security JWT flow",
        note: "JWT issued after login, stateless auth, invalid token handling, and Authorization header parsing.",
        createdAt: "2026-05-28T09:30:00Z",
        updatedAt: "2026-05-28T11:20:00Z",
        pinned: true,
        state: STATES.ACTIVE
      },
      {
        id: 102,
        title: "Notes lifecycle rules",
        note: "Active notes can be archived, soft deleted, edited, and pinned. Trash notes can be restored or purged.",
        createdAt: "2026-05-28T10:15:00Z",
        updatedAt: "2026-05-29T15:05:00Z",
        pinned: true,
        state: STATES.ACTIVE
      },
      {
        id: 103,
        title: "Pagination spec",
        note: "Page number starts at 1 in the UI, backend converts to zero-based page index. Allowed size range is 1 to 30.",
        createdAt: "2026-05-27T08:40:00Z",
        updatedAt: "2026-05-27T08:40:00Z",
        pinned: false,
        state: STATES.ACTIVE
      },
      {
        id: 104,
        title: "Sort by title",
        note: "Backend supports sorting by createdAt, title, or noteId. Direction can be asc or desc.",
        createdAt: "2026-05-25T17:05:00Z",
        updatedAt: "2026-05-26T12:05:00Z",
        pinned: false,
        state: STATES.ACTIVE
      },
      {
        id: 105,
        title: "Interview answer draft",
        note: "Talk about secure backend design, note state management, and clean separation of authentication and note workflows.",
        createdAt: "2026-05-24T13:35:00Z",
        updatedAt: "2026-05-24T13:35:00Z",
        pinned: false,
        state: STATES.ARCHIVE
      },
      {
        id: 106,
        title: "Old roadmap idea",
        note: "This was moved to archive after the feature priority changed. Keep it for future reference only.",
        createdAt: "2026-05-22T06:55:00Z",
        updatedAt: "2026-05-22T07:10:00Z",
        pinned: false,
        state: STATES.ARCHIVE
      },
      {
        id: 107,
        title: "Broken onboarding note",
        note: "Deleted during cleanup. Available in trash for restore or permanent removal.",
        createdAt: "2026-05-18T14:10:00Z",
        updatedAt: "2026-05-19T09:25:00Z",
        pinned: false,
        state: STATES.TRASH
      },
      {
        id: 108,
        title: "Week 1 fixes",
        note: "Need to revisit modal validation, card spacing, and pagination UX before the final interview demo.",
        createdAt: "2026-05-19T09:00:00Z",
        updatedAt: "2026-05-20T13:40:00Z",
        pinned: false,
        state: STATES.TRASH
      },
      {
        id: 109,
        title: "Database transaction behavior",
        note: "Transactional updates happen by changing managed entities and letting the persistence context flush the changes.",
        createdAt: "2026-05-29T07:15:00Z",
        updatedAt: "2026-05-29T07:15:00Z",
        pinned: false,
        state: STATES.ACTIVE
      },
      {
        id: 110,
        title: "Backend feature checklist",
        note: "Auth register/login, note CRUD, pin/unpin, archive/unarchive, restore, purge, and pagination all represented.",
        createdAt: "2026-05-30T05:50:00Z",
        updatedAt: "2026-05-30T05:50:00Z",
        pinned: true,
        state: STATES.ACTIVE
      },
      {
        id: 111,
        title: "Archived design reference",
        note: "A product-like interface needs consistent elevation, muted color palette, and clear hierarchy.",
        createdAt: "2026-05-23T16:45:00Z",
        updatedAt: "2026-05-23T18:00:00Z",
        pinned: false,
        state: STATES.ARCHIVE
      },
      {
        id: 112,
        title: "Trash cleanup sample",
        note: "Permanent delete is only available from trash. Active and archived notes must be moved first.",
        createdAt: "2026-05-21T11:20:00Z",
        updatedAt: "2026-05-21T11:20:00Z",
        pinned: false,
        state: STATES.TRASH
      }
    ]
  };

  function loadData() {
    const raw = localStorage.getItem(STORAGE.DATA);
    if (!raw) {
      localStorage.setItem(STORAGE.DATA, JSON.stringify(initialData));
      return structuredClone(initialData);
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.notes)) {
        throw new Error("Invalid data");
      }
      return parsed;
    } catch {
      localStorage.setItem(STORAGE.DATA, JSON.stringify(initialData));
      return structuredClone(initialData);
    }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE.DATA, JSON.stringify(data));
  }

  function loadAuth() {
    const raw = localStorage.getItem(STORAGE.AUTH);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveAuth(auth) {
    localStorage.setItem(STORAGE.AUTH, JSON.stringify(auth));
  }

  function fmtDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function fmtDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return date.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function initials(email) {
    const base = (email || "NV").split("@")[0];
    const parts = base.split(/[._-]/).filter(Boolean);
    if (!parts.length) return "NV";
    return parts.slice(0, 2).map(p => p[0]).join("").toUpperCase();
  }

  function toast(title, message) {
    const box = $("#toast");
    if (!box) return;
    box.innerHTML = `<strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p>`;
    box.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => box.classList.remove("show"), 2400);
  }

  function getPageConfig() {
    const page = document.body.dataset.page;
    return PAGE_CONFIG[page] || null;
  }

  function currentUser() {
    return loadAuth();
  }

  function ensureUserChip() {
    const auth = currentUser();
    const avatar = $("#topAvatar");
    const name = $("#userEmail");
    const navAvatar = $("#sideAvatar");
    const navEmail = $("#sideEmail");
    if (!auth) return;
    if (avatar) avatar.textContent = initials(auth.email);
    if (name) name.textContent = auth.email;
    if (navAvatar) navAvatar.textContent = initials(auth.email);
    if (navEmail) navEmail.textContent = auth.email;
  }

  function setActiveNav() {
    const path = location.pathname.split("/").pop() || "login.html";
    $$(".nav a, .nav button.nav-link").forEach(el => {
      const href = el.getAttribute("href");
      if (href && href.endsWith(path)) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  }

  function getPageFilters() {
    const search = ($("#searchInput")?.value || "").trim().toLowerCase();
    const sort = $("#sortSelect")?.value || "createdAt";
    const dir = $("#directionSelect")?.value || "desc";
    const size = parseInt($("#sizeSelect")?.value || "6", 10);
    const page = parseInt($("#pageSelect")?.value || "1", 10);
    return { search, sort, dir, size, page };
  }

  function filteredNotes(data, state) {
    const { search, sort, dir } = getPageFilters();
    const matchesState = data.notes.filter(n => n.state === state);

    const term = search;
    const searched = term
      ? matchesState.filter(n => {
          const hay = `${n.title} ${n.note} ${n.id}`.toLowerCase();
          return hay.includes(term);
        })
      : matchesState.slice();

    searched.sort((a, b) => {
      let av, bv;
      if (sort === "title") {
        av = (a.title || "").toLowerCase();
        bv = (b.title || "").toLowerCase();
      } else if (sort === "noteId") {
        av = a.id;
        bv = b.id;
      } else {
        av = new Date(a.createdAt).getTime();
        bv = new Date(b.createdAt).getTime();
      }

      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });

    return searched;
  }

  function paginate(items, page, size) {
    const totalPages = Math.max(1, Math.ceil(items.length / size));
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const start = (currentPage - 1) * size;
    return {
      currentPage,
      totalPages,
      totalItems: items.length,
      items: items.slice(start, start + size)
    };
  }

  function cardActions(note, context) {
    const actions = [];

    if (note.state !== STATES.TRASH) {
      actions.push(`
        <button class="icon-btn ${note.pinned ? 'primary' : ''}" data-action="toggle-pin" data-id="${note.id}">
          ${note.pinned ? "📌 Unpin" : "📌 Pin"}
        </button>
      `);
    }

    if (note.state === STATES.ACTIVE) {
      actions.push(`
        <button class="icon-btn" data-action="edit-note" data-id="${note.id}">
          ✏️ Edit
        </button>
      `);
    }

    if (note.state === STATES.ACTIVE) {
      actions.push(`
        <button class="icon-btn good" data-action="archive-note" data-id="${note.id}">🗂 Archive</button>
      `);
      actions.push(`
        <button class="icon-btn danger" data-action="delete-note" data-id="${note.id}">🗑 Delete</button>
      `);
    } else if (note.state === STATES.ARCHIVE) {
      actions.push(`
        <button class="icon-btn good" data-action="unarchive-note" data-id="${note.id}">↩ Unarchive</button>
      `);
      actions.push(`
        <button class="icon-btn danger" data-action="delete-note" data-id="${note.id}">🗑 Move to Trash</button>
      `);
    } else if (note.state === STATES.TRASH) {
      actions.push(`
        <button class="icon-btn good" data-action="restore-note" data-id="${note.id}">↩ Restore</button>
      `);
      actions.push(`
        <button class="icon-btn danger" data-action="purge-note" data-id="${note.id}">💀 Purge</button>
      `);
    }

    return actions.join("");
  }

  function renderNoteCard(note, context = "dashboard") {
    const badge = note.pinned && note.state !== STATES.TRASH
      ? `<span class="note-badge">📌 Pinned</span>`
      : `<span class="note-badge">${stateLabels[note.state]}</span>`;

    const updated = note.updatedAt && note.updatedAt !== note.createdAt
      ? `Updated ${fmtDateTime(note.updatedAt)}`
      : `Created ${fmtDateTime(note.createdAt)}`;

    return `
      <article class="note-card">
        <div class="note-top">
          <div style="min-width:0;flex:1">
            <h4 class="note-title">${escapeHtml(note.title || "Untitled note")}</h4>
          </div>
          ${badge}
        </div>
        <p class="note-preview">${escapeHtml(note.note || "No content added yet.")}</p>
        <div class="note-meta">
          <span>#${note.id}</span>
          <span>${escapeHtml(fmtDate(note.createdAt))}</span>
        </div>
        <div class="note-actions">
          ${cardActions(note, context)}
        </div>
      </article>
    `;
  }

  function renderSectionGrid(container, notes, context) {
    if (!container) return;
    if (!notes.length) {
      const emptyIcon = context === "trash" ? "🗑" : context === "archive" ? "🗄" : "📝";
      const emptyCopy = context === "trash"
        ? "Trash is empty."
        : context === "archive"
          ? "No archived notes right now."
          : "No notes match the current filters.";
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="icon">${emptyIcon}</div>
          <h3 style="margin:0 0 6px;color:var(--text)">Nothing to show</h3>
          <p style="margin:0;line-height:1.7">${escapeHtml(emptyCopy)}</p>
        </div>
      `;
      return;
    }
    container.innerHTML = notes.map(n => renderNoteCard(n, context)).join("");
  }

  function renderPagination(container, pageInfo) {
    if (!container) return;
    const { currentPage, totalPages, totalItems } = pageInfo;
    const start = totalItems === 0 ? 0 : (currentPage - 1) * pageInfo.size + 1;
    const end = totalItems === 0 ? 0 : Math.min(currentPage * pageInfo.size, totalItems);

    container.innerHTML = `
      <div>
        <strong>${start}-${end}</strong>
        <span style="color:var(--muted)"> of ${totalItems} notes</span>
      </div>
      <div class="page-controls">
        <button class="page-pill" data-page-nav="prev" ${currentPage <= 1 ? "disabled" : ""}>Prev</button>
        ${Array.from({ length: totalPages }, (_, i) => i + 1).map(page => `
          <button class="page-pill ${page === currentPage ? "active" : ""}" data-page-nav="num" data-page="${page}">${page}</button>
        `).join("")}
        <button class="page-pill" data-page-nav="next" ${currentPage >= totalPages ? "disabled" : ""}>Next</button>
      </div>
    `;
  }

  function updateStats(data) {
    const active = data.notes.filter(n => n.state === STATES.ACTIVE);
    const pinned = active.filter(n => n.pinned);
    const archived = data.notes.filter(n => n.state === STATES.ARCHIVE);
    const trash = data.notes.filter(n => n.state === STATES.TRASH);
    const total = data.notes.length;

    const map = {
      totalCount: total,
      activeCount: active.length,
      pinnedCount: pinned.length,
      archivedCount: archived.length,
      trashCount: trash.length
    };

    Object.entries(map).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  function syncPagePickers(pageInfo) {
    const sizeSelect = $("#sizeSelect");
    const pageSelect = $("#pageSelect");

    if (pageSelect) {
      const totalPages = Math.max(1, pageInfo.totalPages);
      pageSelect.innerHTML = Array.from({ length: totalPages }, (_, i) => {
        const p = i + 1;
        return `<option value="${p}" ${p === pageInfo.currentPage ? "selected" : ""}>Page ${p}</option>`;
      }).join("");
    }

    if (sizeSelect && !sizeSelect.dataset.bound) {
      sizeSelect.dataset.bound = "1";
    }
  }

  function renderPage() {
    const config = getPageConfig();
    if (!config) return;

    const data = loadData();
    ensureUserChip();
    updateStats(data);

    const allStateNotes = filteredNotes(data, config.state);
    const size = parseInt($("#sizeSelect")?.value || "6", 10);
    const page = parseInt($("#pageSelect")?.value || "1", 10);
    const pageInfo = paginate(allStateNotes, page, size);
    syncPagePickers({...pageInfo, size});

    const grid = $("#notesGrid");
    renderSectionGrid(grid, pageInfo.items, document.body.dataset.page);

    const pagination = $("#pagination");
    renderPagination(pagination, {...pageInfo, size});

    const countLabel = $("#noteCountLabel");
    if (countLabel) {
      countLabel.textContent = `${pageInfo.totalItems} ${config.state.toLowerCase()} notes`;
    }

    const pageHint = $("#pageHint");
    if (pageHint) {
      pageHint.textContent = config.state === STATES.TRASH
        ? "Trash notes stay here until restored or purged."
        : config.state === STATES.ARCHIVE
          ? "Archived notes are still editable and can be moved back to active."
          : "Pinned notes are shown separately above the active list.";
    }

    if (config.allowPinnedSection) {
      const pinned = data.notes.filter(n => n.state === STATES.ACTIVE && n.pinned);
      const pinnedGrid = $("#pinnedGrid");
      const pinnedCount = $("#pinnedCount");
      if (pinnedGrid) renderSectionGrid(pinnedGrid, pinned, "dashboard");
      if (pinnedCount) pinnedCount.textContent = pinned.length;
    }

    const archiveCount = $("#archiveCount");
    const trashCount = $("#trashCount");
    if (archiveCount) archiveCount.textContent = data.notes.filter(n => n.state === STATES.ARCHIVE).length;
    if (trashCount) trashCount.textContent = data.notes.filter(n => n.state === STATES.TRASH).length;

    if (config.state !== STATES.ACTIVE) {
      const banner = $("#stateBanner");
      if (banner) {
        banner.querySelector("strong").textContent = config.title;
        banner.querySelector("span").textContent = config.subtitle;
      }
    }
  }

  function openModal(mode, noteId) {
    const modal = $("#noteModal");
    const title = $("#modalTitle");
    const form = $("#noteForm");
    const noteTitle = $("#noteTitle");
    const noteBody = $("#noteBody");
    if (!modal || !title || !form || !noteTitle || !noteBody) return;

    const data = loadData();
    const note = noteId ? data.notes.find(n => n.id === noteId) : null;

    modal.dataset.mode = mode;
    modal.dataset.noteId = noteId ? String(noteId) : "";
    title.textContent = mode === "edit" ? "Edit Note" : "Create Note";
    noteTitle.value = note?.title || "";
    noteBody.value = note?.note || "";
    const error = $("#noteError");
    if (error) {
        error.textContent = "";
        error.style.display = "none";
    }
    modal.classList.add("open");
    setTimeout(() => noteTitle.focus(), 20);
  }

  function closeModal() {
    const modal = $("#noteModal");
    if (modal) modal.classList.remove("open");
  }

  function upsertNoteFromModal() {
    const modal = $("#noteModal");
    if (!modal) return;

    const mode = modal.dataset.mode;
    const noteId = modal.dataset.noteId ? parseInt(modal.dataset.noteId, 10) : null;
    const title = ($("#noteTitle")?.value || "").trim();
    const note = ($("#noteBody")?.value || "").trim();
    const error = $("#noteError");
    if (error) {
      error.textContent = "";
      error.style.display = "none";
    }
    if (!title && !note) {
      if (error) {
        error.textContent = "Add at least a title or note content.";
        error.style.display = "block";
      }
      return;
    }
    const data = loadData();
    const now = new Date().toISOString();

    if (mode === "edit" && noteId) {
      const target = data.notes.find(n => n.id === noteId);
      if (!target) return;
      target.title = title || target.title;
      target.note = note || target.note;
      target.updatedAt = now;
      saveData(data);
      toast("Note updated", "The note card was refreshed with the latest content.");
    } else {
      const nextId = Math.max(0, ...data.notes.map(n => n.id)) + 1;
      data.notes.unshift({
        id: nextId,
        title,
        note,
        createdAt: now,
        updatedAt: now,
        pinned: false,
        state: STATES.ACTIVE
      });
      saveData(data);
      toast("Note saved", "A new active note was created.");
    }

    closeModal();
    renderPage();
  }

  function mutateNote(id, mutator) {
    const data = loadData();
    const note = data.notes.find(n => n.id === id);
    if (!note) return;
    mutator(note, data);
    saveData(data);
    renderPage();
  }

  function handleAction(action, id) {
    const config = getPageConfig();
    const data = loadData();
    const note = data.notes.find(n => n.id === id);
    if (!note) return;

    switch (action) {
      case "toggle-pin":
        if (note.state === STATES.TRASH) {
          toast("Action blocked", "Trash notes cannot be pinned.");
          return;
        }
        note.pinned = !note.pinned;
        note.updatedAt = new Date().toISOString();
        saveData(data);
        toast(note.pinned ? "Pinned" : "Unpinned", `Note #${id} was ${note.pinned ? "pinned" : "unpinned"}.`);
        renderPage();
        break;
      case "edit-note":
        openModal("edit", id);
        break;
      case "archive-note":
        if (note.state === STATES.TRASH) {
          toast("Action blocked", "Trash notes cannot be archived.");
          return;
        }
        note.state = STATES.ARCHIVE;
        note.updatedAt = new Date().toISOString();
        saveData(data);
        toast("Archived", `Note #${id} moved to archive.`);
        renderPage();
        break;
      case "unarchive-note":
        note.state = STATES.ACTIVE;
        note.updatedAt = new Date().toISOString();
        saveData(data);
        toast("Restored", `Note #${id} returned to active notes.`);
        renderPage();
        break;
      case "delete-note":
        note.pinned = false;
        note.state = STATES.TRASH;
        note.updatedAt = new Date().toISOString();
        saveData(data);
        toast("Moved to trash", `Note #${id} is now in trash.`);
        renderPage();
        break;
      case "restore-note":
        if (note.state === STATES.ARCHIVE) {
          toast("Blocked by state rule", "Archived notes should be unarchived first.");
          return;
        }
        note.state = STATES.ACTIVE;
        note.updatedAt = new Date().toISOString();
        saveData(data);
        toast("Restored", `Note #${id} returned to active notes.`);
        renderPage();
        break;
      case "purge-note":
        data.notes = data.notes.filter(n => n.id !== id);
        saveData(data);
        toast("Deleted permanently", `Note #${id} was removed from storage.`);
        renderPage();
        break;
      default:
        break;
    }
  }

  function bindCommon() {
    setActiveNav();

    const sidebar = $("#sidebar");
    const topToggle = $("#sidebarToggle");
    const insideToggle = $("#sidebarToggleInside");
    [topToggle, insideToggle].forEach(btn => {
      if (btn && sidebar) {
        btn.addEventListener("click", () => {
          sidebar.classList.toggle("open");
        });
      }
    });

    document.addEventListener("click", (event) => {
      const actionBtn = event.target.closest("[data-action]");
      if (actionBtn) {
        event.preventDefault();
        const action = actionBtn.dataset.action;
        const id = parseInt(actionBtn.dataset.id, 10);
        if (!Number.isNaN(id)) {
          handleAction(action, id);
          return;
        }
        if (action === "open-create-modal") {
          openModal("create");
          return;
        }
        if (action === "scroll-pinned") {
          document.getElementById("pinnedSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        if (action === "scroll-active") {
          document.getElementById("activeSection")
          ?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
        return;
        }
        if (action === "toggle-dashboard-menu") {
          const menu = document.getElementById("dashboardMenu");
          const arrow = document.getElementById("dashboardArrow");
          if (!menu || !arrow) return;
          menu.classList.toggle("hidden");
          arrow.textContent =
            menu.classList.contains("hidden")
            ? "▶"
            : "▼";
          return;
        }
        if (action === "logout") {
          localStorage.removeItem(STORAGE.AUTH);
          location.href = "login.html";
          return;
        }
      }

      const navPage = event.target.closest("[data-page-nav]");
      if (navPage) {
        const current = parseInt($("#pageSelect")?.value || "1", 10);
        const total = $("#pageSelect")?.options?.length || 1;
        let next = current;
        if (navPage.dataset.pageNav === "prev") next = Math.max(1, current - 1);
        if (navPage.dataset.pageNav === "next") next = Math.min(total, current + 1);
        if (navPage.dataset.pageNav === "num") next = parseInt(navPage.dataset.page, 10);
        const pageSelect = $("#pageSelect");
        if (pageSelect) {
          pageSelect.value = String(next);
          renderPage();
        }
      }

      const modal = $("#noteModal");
      if (modal && event.target === modal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });

    const search = $("#searchInput");
    if (search) {
      search.addEventListener("input", () => {
        $("#pageSelect") && ($("#pageSelect").value = "1");
        renderPage();
        if (search.value.trim()) {
          const page = document.body.dataset.page;
          if (page === "dashboard") {
            document
              .getElementById("activeSection")
              ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
              });
          } else {
            document
              .getElementById("notesGrid")
              ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
              });
          }
        }
      });
    }

    ["sortSelect", "directionSelect", "sizeSelect", "pageSelect"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", renderPage);
    });

    const createBtn = $("#createNoteBtn");
    if (createBtn) createBtn.addEventListener("click", () => openModal("create"));
    const closeBtns = $$("[data-close-modal]");
    closeBtns.forEach(btn => btn.addEventListener("click", closeModal));

    const form = $("#noteForm");
    if (form) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        upsertNoteFromModal();
      });
    }
  }

  function bindAuthPage(type) {
    const form = type === "login" ? $("#loginForm") : $("#registerForm");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = ($("#email")?.value || "").trim().toLowerCase();
      const password = ($("#password")?.value || "").trim();
      const confirm = $("#confirmPassword")?.value?.trim();

      const error = $("#formError");

      if (error) {
        error.textContent = "";
        error.style.display="none";
      }
  

      if (!email || !password) {
        if (error) {
          error.textContent = "Email and password are required.";
          error.style.display = "block";
        }
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (error) {
          error.textContent = "Enter a valid email address.";
          error.style.display = "block";
        }
        return;
      }
      if (password.length < 6) {
        if (error) {
          error.textContent = "Password must be at least 6 characters.";
          error.style.display = "block";
        }
        return;
      }
      if (type === "register") {
        if (!confirm) {
          if (error){ 
            error.textContent = "Confirm your password.";
            error.style.display = "block";
        }
          return;
        }
        if (password !== confirm) {
          if (error) {
            error.textContent = "Passwords do not match.";
            error.style.display = "block";
          }
          return;
        }
      }

      saveAuth({
        email,
        token: "demo-token-" + Date.now(),
        startedAt: new Date().toISOString()
      });
      location.href = "dashboard.html";
    });
  }

  function initAuthPage() {
    bindAuthPage(document.body.dataset.page);
  }

  function initAppPage() {
    const auth = currentUser();
    if (!auth) {
      saveAuth({
        email: "vector.demo@notesapp.dev",
        token: "demo-token-seeded",
        startedAt: new Date().toISOString()
      });
    }
    ensureUserChip();
    bindCommon();
    renderPage();
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "login" || document.body.dataset.page === "register") {
      initAuthPage();
      return;
    }
    initAppPage();
  });
})();
