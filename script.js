// ============================================
// МОЙ ИДЕАЛЬНЫЙ ДЕНЬ — ЛОГИКА
// ============================================

var data = {
    habits: [], history: {}, water: {}, moods: {}, sport: {}, sportGoal: '', food: {},
    rituals: {
        morning: [
            { id: 'm1', text: 'Ранний подъём' },
            { id: 'm2', text: 'Стакан воды' },
            { id: 'm3', text: 'Зарядка / растяжка' },
            { id: 'm4', text: 'Душ' },
            { id: 'm5', text: 'Завтрак' },
            { id: 'm6', text: 'План на день' }
        ],
        evening: [
            { id: 'e1', text: 'Убраться на столе' },
            { id: 'e2', text: 'Без телефона за час до сна' },
            { id: 'e3', text: 'Тёплый душ' },
            { id: 'e4', text: 'Книга / медитация' },
            { id: 'e5', text: 'Записать благодарности' },
            { id: 'e6', text: 'Ложиться вовремя' }
        ]
    },
    ritualDone: {}, goals: [], reward: '', notes: ''
};

var WATER_GOAL = 6;
var WATER_SLOTS = ['08:00', '10:30', '13:00', '15:30', '18:00', '20:30'];
var SPORT_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

var FOOD_ITEMS = [
    { id: 'breakfast', text: 'Завтрак' },
    { id: 'lunch', text: 'Обед' },
    { id: 'dinner', text: 'Ужин' },
    { id: 'snack', text: 'Перекусы' },
    { id: 'veggies', text: 'Овощи и фрукты' },
    { id: 'water', text: 'Пить воду' },
    { id: 'sugar', text: 'Меньше сахара' }
];

var MOODS = [
    { value: 5, emoji: '😊', label: 'Отлично' },
    { value: 4, emoji: '🙂', label: 'Хорошо' },
    { value: 3, emoji: '😐', label: 'Нормально' },
    { value: 2, emoji: '😴', label: 'Устал' },
    { value: 1, emoji: '😔', label: 'Плохо' }
];

// ---------- СТАТЬИ ----------
var ARTICLES = [
    { id: 'warmup', tag: 'спорт', title: 'Зачем нужна разминка', excerpt: '5 минут разминки снижают риск травмы почти вдвое.', full: '<p>Разминка готовит мышцы, суставы и сердце к нагрузке.</p><p>Достаточно 5–7 минут:</p><ul><li>лёгкое кардио</li><li>круговые движения</li><li>наклоны и растяжка</li></ul>' },
    { id: 'eat-before', tag: 'питание', title: 'Что есть до тренировки', excerpt: 'За 1–1,5 часа — сложные углеводы и немного белка.', full: '<p>Еда перед тренировкой даёт энергию.</p><ul><li>овсянка с бананом</li><li>гречка с курицей</li><li>тост с творожным сыром</li></ul>' },
    { id: 'water-art', tag: 'питание', title: 'Почему вода важнее, чем кажется', excerpt: 'Даже 2% обезвоживания снижают концентрацию.', full: '<p>Вода участвует во всех процессах организма.</p><p>Признаки нехватки:</p><ul><li>сухость во рту</li><li>головная боль</li><li>усталость</li></ul>' },
    { id: '21days', tag: 'привычки', title: 'Правило 21 дня — миф?', excerpt: 'На самом деле привычка формируется от 18 до 254 дней.', full: '<p>Средний срок — 66 дней.</p><p>Что важно:</p><ul><li>регулярность</li><li>привязка к ритуалу</li><li>маленькие шаги</li></ul>' },
    { id: 'sleep-art', tag: 'сон', title: 'Что делать за час до сна', excerpt: 'Тёплый свет, никакого телефона и немного тишины.', full: '<p>За час до сна:</p><ul><li>приглушите свет</li><li>уберите телефон</li><li>тёплый душ</li><li>книга или медитация</li></ul>' },
    { id: 'cardio-art', tag: 'спорт', title: 'Кардио для начинающих', excerpt: '20–30 минут в день достаточно.', full: '<p>Кардио тренирует сердце и выносливость.</p><ul><li>быстрая ходьба</li><li>бег трусцой</li><li>велосипед</li><li>танцы</li></ul>' }
];

// ---------- ВСПОМОГАТЕЛЬНОЕ ----------
function today() { return new Date().toISOString().split('T')[0]; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}
function formatDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}
function formatDateShort(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

// ---------- СОХРАНЕНИЕ ----------
function load() {
    var s = localStorage.getItem('planner');
    if (s) {
        try {
            var parsed = JSON.parse(s);
            Object.keys(parsed).forEach(function(k) { data[k] = parsed[k]; });
        } catch (e) {}
    }
}

function save() {
    localStorage.setItem('planner', JSON.stringify(data));
    if (window.currentFirebaseUser && window.firebaseDb) {
        window.firebaseSetDoc(
            window.firebaseDoc(window.firebaseDb, "users", window.currentFirebaseUser.uid),
            { plannerData: data },
            { merge: true }
        ).catch(function(e) { console.log('Ошибка сохранения:', e); });
    }
}

// ---------- ПРИВЫЧКИ ----------
function addHabit(name, desc, cat) {
    data.habits.push({ id: uid(), name: name.trim(), description: desc.trim() || '', category: cat });
    save(); renderHabits(); renderHome();
}
function deleteHabit(id) {
    if (!confirm('Удалить привычку?')) return;
    data.habits = data.habits.filter(function(h) { return h.id !== id; });
    Object.keys(data.history).forEach(function(d) {
        data.history[d] = data.history[d].filter(function(hid) { return hid !== id; });
    });
    save(); renderHabits(); renderHome();
}
function toggleHabit(id) {
    var t = today();
    if (!data.history[t]) data.history[t] = [];
    var idx = data.history[t].indexOf(id);
    if (idx === -1) data.history[t].push(id);
    else data.history[t].splice(idx, 1);
    save(); renderHabits(); renderHome(); renderWeekChart();
}
function isHabitDone(id) {
    var t = today();
    return data.history[t] && data.history[t].indexOf(id) !== -1;
}

// ---------- ВОДА ----------
function getWater() {
    var t = today();
    if (!data.water[t]) data.water[t] = { count: 0, slots: WATER_SLOTS.map(function() { return false; }) };
    return data.water[t];
}
function setWaterCount(n) {
    var w = getWater();
    w.count = Math.max(0, Math.min(WATER_GOAL, n));
    save(); renderWater(); renderHome();
}
function toggleWaterSlot(i) {
    var w = getWater();
    w.slots[i] = !w.slots[i];
    w.count = w.slots.filter(function(s) { return s; }).length;
    save(); renderWater(); renderHome();
}

// ---------- СПОРТ ----------
function toggleSport(dateISO) {
    if (data.sport[dateISO]) delete data.sport[dateISO];
    else data.sport[dateISO] = true;
    save(); renderSport();
}
function renderSport() {
    var container = document.getElementById('sportWeek');
    if (!container) return;
    var now = new Date();
    var day = (now.getDay() + 6) % 7;
    var monday = new Date(now);
    monday.setDate(now.getDate() - day);
    var t = today();
    var html = '';
    var count = 0;
    for (var i = 0; i < 7; i++) {
        var d = new Date(monday);
        d.setDate(monday.getDate() + i);
        var dateISO = d.toISOString().split('T')[0];
        var done = !!data.sport[dateISO];
        var isToday = dateISO === t;
        if (done) count++;
        html += '<div class="sport-day ' + (done ? 'done' : '') + (isToday ? ' today' : '') + '" data-date="' + dateISO + '">' +
            '<div class="day-label">' + SPORT_DAYS[i] + '</div>' +
            '<div class="check">✓</div></div>';
    }
    container.innerHTML = html;
    var countEl = document.getElementById('sportWeekCount');
    if (countEl) countEl.textContent = count + ' / 7';
    container.querySelectorAll('.sport-day').forEach(function(el) {
        el.addEventListener('click', function() { toggleSport(el.dataset.date); });
    });
    var goalInput = document.getElementById('sportGoal');
    if (goalInput && document.activeElement !== goalInput) goalInput.value = data.sportGoal || '';
}

// ---------- ПИТАНИЕ ----------
function toggleFood(itemId) {
    var t = today();
    if (!data.food[t]) data.food[t] = [];
    var idx = data.food[t].indexOf(itemId);
    if (idx === -1) data.food[t].push(itemId);
    else data.food[t].splice(idx, 1);
    save(); renderFood(); renderHome();
}
function renderFood() {
    var container = document.getElementById('foodList');
    if (!container) return;
    var t = today();
    var doneList = data.food[t] || [];
    container.innerHTML = FOOD_ITEMS.map(function(item) {
        var done = doneList.indexOf(item.id) !== -1;
        return '<label class="food-item ' + (done ? 'done' : '') + '">' +
            '<input type="checkbox" ' + (done ? 'checked' : '') + ' data-id="' + item.id + '">' +
            '<span>' + item.text + '</span></label>';
    }).join('');
    var countEl = document.getElementById('foodCount');
    if (countEl) countEl.textContent = doneList.length + ' / ' + FOOD_ITEMS.length;
    container.querySelectorAll('input').forEach(function(cb) {
        cb.addEventListener('change', function() { toggleFood(cb.dataset.id); });
    });
}

// ---------- НАСТРОЕНИЕ ----------
function setMood(dateISO, value) {
    if (value === null) delete data.moods[dateISO];
    else data.moods[dateISO] = value;
    save(); renderCalendar(); renderMoodStats();
}

// ---------- РИТУАЛЫ ----------
function isRitualDone(id) {
    var t = today();
    return data.ritualDone[t] && data.ritualDone[t].indexOf(id) !== -1;
}
function toggleRitual(id) {
    var t = today();
    if (!data.ritualDone[t]) data.ritualDone[t] = [];
    var idx = data.ritualDone[t].indexOf(id);
    if (idx === -1) data.ritualDone[t].push(id);
    else data.ritualDone[t].splice(idx, 1);
    save(); renderRituals();
}

// ---------- ГЛАВНАЯ ----------
function renderHome() {
    var t = today();
    var dateEl = document.getElementById('todayDate');
    if (dateEl) dateEl.textContent = formatDate(t);

    var totalHabits = data.habits.length;
    var doneHabits = data.history[t] ? data.history[t].length : 0;
    var waterCount = getWater().count;
    var foodDone = (data.food[t] || []).length;
    var foodTotal = FOOD_ITEMS.length;

    var W_HABITS = 50, W_WATER = 25, W_FOOD = 25;
    if (totalHabits === 0) { W_HABITS = 0; W_WATER = 50; W_FOOD = 50; }

    var habitsPart = totalHabits > 0 ? (doneHabits / totalHabits) * W_HABITS : 0;
    var waterPart = (waterCount / WATER_GOAL) * W_WATER;
    var foodPart = (foodDone / foodTotal) * W_FOOD;
    var percent = Math.round(habitsPart + waterPart + foodPart);
    if (percent > 100) percent = 100;

    document.getElementById('todayPercentBig').textContent = percent + '%';
    var note = percent === 100 ? 'Идеальный день!' :
               percent >= 70 ? 'Отличный прогресс' :
               percent >= 40 ? 'Хорошее начало' :
               percent > 0 ? 'Продолжай' : 'Начни с малого';
    document.getElementById('todayNote').textContent = note;

    var breakdown = document.getElementById('todayBreakdown');
    if (breakdown) {
        breakdown.innerHTML =
            '<span>Привычки ' + Math.round(habitsPart) + '%</span>' +
            '<span>Вода ' + Math.round(waterPart) + '%</span>' +
            '<span>Питание ' + Math.round(foodPart) + '%</span>';
    }

    document.getElementById('homeHabitsCount').textContent = doneHabits + ' / ' + totalHabits;
    document.getElementById('homeWaterCount').textContent = waterCount + ' / ' + WATER_GOAL;
    document.getElementById('homeStreak').textContent = calcStreak();

    drawChart('homeChart', percent);

    var list = document.getElementById('homeHabitList');
    if (!list) return;
    var preview = data.habits.slice(0, 3);
    if (preview.length === 0) {
        list.innerHTML = '<div style="padding:20px;text-align:center;color:#8a7a84;font-size:0.85rem;">Добавьте первую привычку</div>';
        return;
    }
    list.innerHTML = preview.map(function(h) {
        var done2 = isHabitDone(h.id);
        return '<div class="item ' + (done2 ? 'done' : '') + '">' +
            '<input type="checkbox" ' + (done2 ? 'checked' : '') + ' data-id="' + h.id + '">' +
            '<div class="body"><div class="title ' + (done2 ? 'done' : '') + '">' + escapeHtml(h.name) + '</div>' +
            '<div class="meta">' + h.category + '</div></div></div>';
    }).join('');
    list.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
        cb.addEventListener('change', function() { toggleHabit(cb.dataset.id); });
    });
}

// ---------- ПРИВЫЧКИ РЕНДЕР ----------
function renderHabits() {
    var list = document.getElementById('habitList');
    if (!list) return;
    if (data.habits.length === 0) {
        list.innerHTML = '<div style="padding:40px 20px;text-align:center;color:#8a7a84;font-size:0.85rem;">Нет привычек. Добавьте первую!</div>';
        return;
    }
    list.innerHTML = data.habits.map(function(h) {
        var done = isHabitDone(h.id);
        return '<div class="item ' + (done ? 'done' : '') + '">' +
            '<input type="checkbox" ' + (done ? 'checked' : '') + ' data-id="' + h.id + '">' +
            '<div class="body"><div class="title ' + (done ? 'done' : '') + '">' + escapeHtml(h.name) + '</div>' +
            (h.description ? '<div class="meta">' + escapeHtml(h.description) + '</div>' : '<div class="meta">' + h.category + '</div>') +
            '</div><div class="actions"><button class="del" data-id="' + h.id + '">Уд.</button></div></div>';
    }).join('');
    list.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
        cb.addEventListener('change', function() { toggleHabit(cb.dataset.id); });
    });
    list.querySelectorAll('.del').forEach(function(btn) {
        btn.addEventListener('click', function() { deleteHabit(btn.dataset.id); });
    });
}

// ---------- НЕДЕЛЬНАЯ ДИАГРАММА ----------
function renderWeekChart() {
    var total = data.habits.length;
    var now = new Date();
    var done = 0, totalSlots = 0, bestDay = null, bestCount = -1;
    for (var i = 0; i < 7; i++) {
        var d = new Date(now);
        d.setDate(d.getDate() - i);
        var key = d.toISOString().split('T')[0];
        var c = data.history[key] ? data.history[key].length : 0;
        done += c;
        totalSlots += total;
        if (c > bestCount) { bestCount = c; bestDay = formatDateShort(key); }
    }
    var percent = totalSlots > 0 ? Math.round((done / totalSlots) * 100) : 0;
    var centerEl = document.getElementById('weekChartCenter');
    if (centerEl) centerEl.textContent = percent + '%';
    var doneEl = document.getElementById('weekDone');
    if (doneEl) doneEl.textContent = done;
    var totalEl = document.getElementById('weekTotal');
    if (totalEl) totalEl.textContent = totalSlots;
    var bestEl = document.getElementById('weekBest');
    if (bestEl) bestEl.textContent = bestCount > 0 ? bestDay : '—';
    drawChart('weekChart', percent);
}

// ---------- ВОДА РЕНДЕР ----------
function renderWater() {
    var w = getWater();
    var countEl = document.getElementById('waterCount');
    if (countEl) countEl.textContent = w.count;
    var goalTopEl = document.getElementById('waterGoalTop');
    if (goalTopEl) goalTopEl.textContent = WATER_GOAL;
    var goalEl = document.getElementById('waterGoal');
    if (goalEl) goalEl.textContent = WATER_GOAL;
    var fillEl = document.getElementById('waterFill');
    if (fillEl) fillEl.style.width = (w.count / WATER_GOAL * 100) + '%';
    var slots = document.getElementById('waterSlots');
    if (slots) {
        slots.innerHTML = WATER_SLOTS.map(function(time, i) {
            return '<div class="water-slot ' + (w.slots[i] ? 'done' : '') + '" data-idx="' + i + '">' +
                '<span class="time">' + time + '</span><span class="glass"></span></div>';
        }).join('');
        slots.querySelectorAll('.water-slot').forEach(function(el) {
            el.addEventListener('click', function() {
                toggleWaterSlot(parseInt(el.dataset.idx));
            });
        });
    }
}

// ---------- КАЛЕНДАРЬ ----------
var calMonth = new Date().getMonth();
var calYear = new Date().getFullYear();

function renderCalendar() {
    var grid = document.getElementById('calendarGrid');
    if (!grid) return;
    var months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    document.getElementById('monthTitle').textContent = months[calMonth] + ' ' + calYear;
    var firstDay = new Date(calYear, calMonth, 1);
    var startWeekday = (firstDay.getDay() + 6) % 7;
    var daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    var html = '';
    for (var i = 0; i < startWeekday; i++) html += '<div class="day empty"></div>';
    var t = today();
    for (var d = 1; d <= daysInMonth; d++) {
        var dateISO = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        var mood = data.moods[dateISO];
        var isToday = dateISO === t;
        var cls = 'day' + (isToday ? ' today' : '');
        var moodAttr = mood ? ' data-mood="' + mood + '"' : '';
        var dot = mood ? '<span class="mood-dot mood-' + mood + '"></span>' : '';
        html += '<div class="' + cls + '" data-date="' + dateISO + '"' + moodAttr + '>' + d + dot + '</div>';
    }
    grid.innerHTML = html;
    grid.querySelectorAll('.day:not(.empty)').forEach(function(el) {
        el.addEventListener('click', function() { openMoodModal(el.dataset.date); });
    });
}

function renderMoodStats() {
    var container = document.getElementById('moodStats');
    if (!container) return;
    var counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    Object.keys(data.moods).forEach(function(dateISO) {
        var d = new Date(dateISO);
        if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
            counts[data.moods[dateISO]] = (counts[data.moods[dateISO]] || 0) + 1;
        }
    });
    container.innerHTML = MOODS.map(function(m) {
        return '<div class="mood-stat"><div class="count">' + counts[m.value] + '</div>' +
            '<div class="label">' + m.emoji + ' ' + m.label + '</div></div>';
    }).join('');
}

// ---------- РИТУАЛЫ РЕНДЕР ----------
function renderRituals() {
    var morningList = document.getElementById('morningList');
    var eveningList = document.getElementById('eveningList');
    if (!morningList || !eveningList) return;
    morningList.innerHTML = data.rituals.morning.map(function(r) {
        var done = isRitualDone(r.id);
        return '<label class="ritual-item ' + (done ? 'done' : '') + '">' +
            '<input type="checkbox" ' + (done ? 'checked' : '') + ' data-id="' + r.id + '">' +
            '<span>' + r.text + '</span></label>';
    }).join('');
    eveningList.innerHTML = data.rituals.evening.map(function(r) {
        var done = isRitualDone(r.id);
        return '<label class="ritual-item ' + (done ? 'done' : '') + '">' +
            '<input type="checkbox" ' + (done ? 'checked' : '') + ' data-id="' + r.id + '">' +
            '<span>' + r.text + '</span></label>';
    }).join('');
    morningList.querySelectorAll('input').forEach(function(cb) {
        cb.addEventListener('change', function() { toggleRitual(cb.dataset.id); });
    });
    eveningList.querySelectorAll('input').forEach(function(cb) {
        cb.addEventListener('change', function() { toggleRitual(cb.dataset.id); });
    });
}

// ---------- ЦЕЛИ ----------
function renderGoals() {
    var list = document.getElementById('goalsList');
    if (!list) return;
    if (data.goals.length === 0) {
        list.innerHTML = '<div style="color:#8a7a84;font-size:0.8rem;padding:8px 0;">Пока нет целей</div>';
    } else {
        list.innerHTML = data.goals.map(function(g) {
            return '<div class="goal-item">' +
                '<input type="checkbox" ' + (g.done ? 'checked' : '') + ' data-id="' + g.id + '">' +
                '<span style="' + (g.done ? 'text-decoration:line-through;color:#8a7a84;' : '') + '">' + escapeHtml(g.text) + '</span>' +
                '<button data-id="' + g.id + '">&times;</button></div>';
        }).join('');
        list.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
            cb.addEventListener('change', function() {
                var g = data.goals.find(function(x) { return x.id === cb.dataset.id; });
                if (g) { g.done = cb.checked; save(); renderGoals(); }
            });
        });
        list.querySelectorAll('button').forEach(function(btn) {
            btn.addEventListener('click', function() {
                data.goals = data.goals.filter(function(x) { return x.id !== btn.dataset.id; });
                save(); renderGoals();
            });
        });
    }
    var rewardEl = document.getElementById('rewardInput');
    if (rewardEl && document.activeElement !== rewardEl) rewardEl.value = data.reward || '';
    var notesEl = document.getElementById('notesInput');
    if (notesEl && document.activeElement !== notesEl) notesEl.value = data.notes || '';
}

// ---------- СТАТЬИ ----------
function renderArticles() {
    var list = document.getElementById('articlesList');
    if (!list) return;
    var shuffled = shuffleByDate(ARTICLES.slice());
    list.innerHTML = shuffled.map(function(a) {
        return '<div class="article-card" data-id="' + a.id + '">' +
            '<span class="article-tag ' + a.tag + '">' + a.tag + '</span>' +
            '<div class="article-title">' + escapeHtml(a.title) + '</div>' +
            '<div class="article-excerpt">' + escapeHtml(a.excerpt) + '</div></div>';
    }).join('');
    list.querySelectorAll('.article-card').forEach(function(card) {
        card.addEventListener('click', function() { openArticleModal(card.dataset.id); });
    });
}

function shuffleByDate(arr) {
    var seed = dateSeed();
    var rand = mulberry32(seed);
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(rand() * (i + 1));
        var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
}
function dateSeed() {
    var d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
function mulberry32(a) {
    return function() {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

function openArticleModal(id) {
    var a = ARTICLES.find(function(x) { return x.id === id; });
    if (!a) return;
    var modal = document.getElementById('articleModal');
    var body = document.getElementById('articleBody');
    body.innerHTML = '<span class="article-tag ' + a.tag + '">' + a.tag + '</span>' +
        '<h2>' + escapeHtml(a.title) + '</h2>' + a.full;
    modal.classList.add('show');
}
function closeArticleModal() {
    document.getElementById('articleModal').classList.remove('show');
}

// ---------- СТРИК ----------
function calcStreak() {
    var streak = 0;
    var d = new Date();
    while (true) {
        var key = d.toISOString().split('T')[0];
        var h = data.history[key];
        if (h && h.length > 0) { streak++; d.setDate(d.getDate() - 1); }
        else break;
    }
    return streak;
}

// ---------- ДИАГРАММА ----------
function drawChart(canvasId, percent) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width, h = canvas.height;
    var cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 12;
    var start = -Math.PI / 2;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(247, 200, 216, 0.3)';
    ctx.lineWidth = 12;
    ctx.stroke();
    var end = start + (percent / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end);
    ctx.strokeStyle = '#f7c8d8';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();
}

// ---------- МОДАЛКИ ----------
function openHabitModal() {
    document.getElementById('habitModalTitle').textContent = 'Добавить привычку';
    document.getElementById('habitForm').reset();
    document.getElementById('habitModal').classList.add('show');
}
function closeHabitModal() {
    document.getElementById('habitModal').classList.remove('show');
}
var moodDate = null;
function openMoodModal(dateISO) {
    moodDate = dateISO;
    document.getElementById('moodModalTitle').textContent = formatDate(dateISO);
    var picker = document.getElementById('moodPicker');
    var current = data.moods[dateISO];
    picker.innerHTML = MOODS.map(function(m) {
        return '<div class="mood-option ' + (current === m.value ? 'selected' : '') + '" data-value="' + m.value + '">' +
            '<span class="emoji">' + m.emoji + '</span><span class="label">' + m.label + '</span></div>';
    }).join('');
    picker.querySelectorAll('.mood-option').forEach(function(el) {
        el.addEventListener('click', function() {
            var v = parseInt(el.dataset.value);
            if (data.moods[moodDate] === v) setMood(moodDate, null);
            else setMood(moodDate, v);
            document.getElementById('moodModal').classList.remove('show');
        });
    });
    document.getElementById('moodModal').classList.add('show');
}

// ---------- НАВИГАЦИЯ ----------
function setupNav() {
    document.querySelectorAll('.nav-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var page = btn.dataset.page;
            document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
            var pageEl = document.getElementById('page-' + page);
            if (pageEl) pageEl.classList.add('active');
            if (page === 'habits') renderWeekChart();
            if (page === 'health') { renderWater(); renderSport(); renderFood(); }
            if (page === 'calendar') { renderCalendar(); renderMoodStats(); }
            if (page === 'rituals') renderRituals();
            if (page === 'goals') renderGoals();
        });
    });
}

// ============================================
// FIREBASE АВТОРИЗАЦИЯ — ИСПРАВЛЕНО
// ============================================

var authAttached = false;

function attachAuthListeners() {
    // Защита от повторного подключения
    if (authAttached) return;
    if (!window.firebaseAuth) return; // Firebase ещё не готов
    authAttached = true;

    console.log('✓ Firebase готов, привязываю обработчики');

    var authScreen = document.getElementById('authScreen');
    var appEl = document.querySelector('.app');
    var emailInput = document.getElementById('authEmail');
    var passInput = document.getElementById('authPassword');
    var errorEl = document.getElementById('authError');

    function showAuthError(msg) {
        if (errorEl) errorEl.textContent = msg;
        console.log('❌ Ошибка:', msg);
    }

    // Следим за состоянием входа
    window.firebaseOnAuthStateChanged(window.firebaseAuth, async function(user) {
        if (user) {
            window.currentFirebaseUser = user;
            console.log('✓ Вошёл как', user.email);
            if (authScreen) authScreen.style.display = 'none';
            if (appEl) appEl.style.display = 'flex';

            try {
                var docRef = window.firebaseDoc(window.firebaseDb, "users", user.uid);
                var snap = await window.firebaseGetDoc(docRef);
                if (snap.exists() && snap.data().plannerData) {
                    var saved = snap.data().plannerData;
                    Object.keys(saved).forEach(function(k) { data[k] = saved[k]; });
                }
            } catch (e) { console.log('Ошибка загрузки:', e); }

            renderHome(); renderHabits(); renderWater(); renderSport(); renderFood();
            renderCalendar(); renderMoodStats(); renderRituals(); renderGoals();
            renderWeekChart(); renderArticles();
        } else {
            window.currentFirebaseUser = null;
            console.log('Не вошёл');
            if (authScreen) authScreen.style.display = 'flex';
            if (appEl) appEl.style.display = 'none';
        }
    });

    // Вход
    var loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async function() {
            showAuthError('');
            var email = emailInput.value.trim();
            var pass = passInput.value;
            if (!email || !pass) { showAuthError('Заполни email и пароль'); return; }
            console.log('Попытка входа:', email);
            try {
                await window.firebaseSignIn(window.firebaseAuth, email, pass);
            } catch (err) {
                showAuthError('Ошибка: ' + (err.message || 'Не удалось войти'));
            }
        });
    }

    // Регистрация
    var regBtn = document.getElementById('registerBtn');
    if (regBtn) {
        regBtn.addEventListener('click', async function() {
            showAuthError('');
            var email = emailInput.value.trim();
            var pass = passInput.value;
            if (!email || !pass) { showAuthError('Заполни email и пароль'); return; }
            if (pass.length < 6) { showAuthError('Пароль минимум 6 символов'); return; }
            console.log('Попытка регистрации:', email);
            try {
                var cred = await window.firebaseRegister(window.firebaseAuth, email, pass);
                console.log('✓ Аккаунт создан');
                await window.firebaseSetDoc(
                    window.firebaseDoc(window.firebaseDb, "users", cred.user.uid),
                    { plannerData: data }
                );
            } catch (err) {
                showAuthError('Ошибка: ' + (err.message || 'Не удалось зарегистрироваться'));
            }
        });
    }

    // Выход
    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            window.firebaseSignOut(window.firebaseAuth);
        });
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    load();
    var d = new Date();
    var dateBox = document.getElementById('sidebarDate');
    if (dateBox) {
        dateBox.textContent = d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    setupNav();

    // Привычки
    var addBtn = document.getElementById('openAddHabit');
    if (addBtn) addBtn.addEventListener('click', openHabitModal);
    var closeHabitBtn = document.getElementById('closeHabitModal');
    if (closeHabitBtn) closeHabitBtn.addEventListener('click', closeHabitModal);
    var habitModal = document.getElementById('habitModal');
    if (habitModal) {
        habitModal.addEventListener('click', function(e) {
            if (e.target === e.currentTarget) closeHabitModal();
        });
    }
    var habitForm = document.getElementById('habitForm');
    if (habitForm) {
        habitForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var name = document.getElementById('habitName').value;
            var desc = document.getElementById('habitDesc').value;
            var cat = document.getElementById('habitCategory').value;
            if (!name.trim()) return;
            addHabit(name, desc, cat);
            closeHabitModal();
        });
    }

    // Вода
    var waterPlus = document.getElementById('waterPlus');
    if (waterPlus) waterPlus.addEventListener('click', function() { setWaterCount(getWater().count + 1); });
    var waterMinus = document.getElementById('waterMinus');
    if (waterMinus) waterMinus.addEventListener('click', function() { setWaterCount(getWater().count - 1); });

    // Спорт
    var sportGoalInput = document.getElementById('sportGoal');
    if (sportGoalInput) {
        sportGoalInput.addEventListener('input', function(e) { data.sportGoal = e.target.value; save(); });
    }

    // Календарь
    var prevBtn = document.getElementById('prevMonth');
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
            renderCalendar(); renderMoodStats();
        });
    }
    var nextBtn = document.getElementById('nextMonth');
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
            renderCalendar(); renderMoodStats();
        });
    }
    var closeMoodBtn = document.getElementById('closeMoodModal');
    if (closeMoodBtn) {
        closeMoodBtn.addEventListener('click', function() {
            document.getElementById('moodModal').classList.remove('show');
        });
    }
    var moodModal = document.getElementById('moodModal');
    if (moodModal) {
        moodModal.addEventListener('click', function(e) {
            if (e.target === e.currentTarget) moodModal.classList.remove('show');
        });
    }
    var closeArtBtn = document.getElementById('closeArticleModal');
    if (closeArtBtn) closeArtBtn.addEventListener('click', closeArticleModal);
    var artModal = document.getElementById('articleModal');
    if (artModal) {
        artModal.addEventListener('click', function(e) {
            if (e.target === e.currentTarget) closeArticleModal();
        });
    }

    // Цели
    var addGoalBtn = document.getElementById('addGoal');
    if (addGoalBtn) {
        addGoalBtn.addEventListener('click', function() {
            var inp = document.getElementById('goalInput');
            if (!inp.value.trim()) return;
            data.goals.push({ id: uid(), text: inp.value.trim(), done: false });
            inp.value = ''; save(); renderGoals();
        });
    }
    var goalInput = document.getElementById('goalInput');
    if (goalInput) {
        goalInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') { e.preventDefault(); document.getElementById('addGoal').click(); }
        });
    }
    var rewardInput = document.getElementById('rewardInput');
    if (rewardInput) {
        rewardInput.addEventListener('input', function(e) { data.reward = e.target.value; save(); });
    }
    var notesInput = document.getElementById('notesInput');
    if (notesInput) {
        notesInput.addEventListener('input', function(e) { data.notes = e.target.value; save(); });
    }

    // Быстрый переход
    document.querySelectorAll('[data-goto]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var navBtn = document.querySelector('.nav-btn[data-page="' + btn.dataset.goto + '"]');
            if (navBtn) navBtn.click();
        });
    });

    // ===== ГЛАВНОЕ ИСПРАВЛЕНИЕ =====
    // Подключаем обработчики СРАЗУ (если Firebase уже готов)
    attachAuthListeners();

    // И на всякий случай — по событию
    window.addEventListener('firebase-ready', attachAuthListeners);

    // И ещё раз через пару секунд — для надёжности
    setTimeout(attachAuthListeners, 1000);
    setTimeout(attachAuthListeners, 3000);
});