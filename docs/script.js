// ==================== КОНФИГУРАЦИЯ ====================
const REPO_OWNER = 'Lixjd';
const REPO_NAME = 'crm-discordka';
const BRANCH = 'main';

const DATA_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/data/`;
const BOT_API = 'http://mango.fps.ms:10456/api/command';

// ==================== ЗАГРУЗКА СОСТАВА ====================
async function loadStaff() {
    console.log('📥 Загрузка состава...');
    try {
        const response = await fetch(`${DATA_URL}staff.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const staff = await response.json();
        console.log(`✅ Загружено ${staff.length} сотрудников`);
        
        const container = document.getElementById('staffList');
        container.innerHTML = '';
        
        const groups = {};
        staff.forEach(emp => {
            if (!groups[emp.role]) groups[emp.role] = [];
            groups[emp.role].push(emp);
        });
        
        for (const [role, members] of Object.entries(groups)) {
            let html = `<div class="role-group"><h4>${role}</h4>`;
            members.forEach(m => {
                html += `<div class="staff-item"><strong>${m.nick}</strong> ${m.tag}</div>`;
            });
            html += '</div>';
            container.innerHTML += html;
        }
        
        // Обновляем селект для выговоров
        const sel = document.getElementById('userSelect');
        sel.innerHTML = '';
        staff.forEach(emp => {
            const opt = document.createElement('option');
            opt.value = emp.nick;
            opt.textContent = `${emp.nick} (${emp.tag})`;
            sel.appendChild(opt);
        });
        
    } catch (error) {
        console.error('❌ Ошибка загрузки состава:', error);
        document.getElementById('staffList').innerHTML = 
            '<div class="card">⚠️ Нет данных. Нажмите "Обновить".</div>';
    }
}

// ==================== ОТПРАВКА КОМАНД БОТУ ====================
async function sendCommand(command, params) {
    console.log(`📤 Отправка команды: ${command}`, params);
    
    try {
        const response = await fetch(BOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command, params })
        });
        
        console.log(`📥 Статус ответа: ${response.status}`);
        const result = await response.json();
        console.log('📥 Ответ бота:', result);
        
        if (result.status === 'ok') {
            alert('✅ Команда отправлена!');
        } else {
            alert('❌ Ошибка: ' + (result.message || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('❌ Ошибка при отправке:', error);
        alert('❌ Бот не отвечает. Проверь: 1) Запущен ли бот на FPS.ms 2) Правильный ли порт 10456');
    }
}

// ==================== КНОПКИ ====================
function sendReprimand() {
    const user = document.getElementById('userSelect').value;
    const type = document.getElementById('reprimandType').value;
    const reason = document.getElementById('reprimandReason').value;
    if (!reason) { alert('Укажи причину!'); return; }
    sendCommand('reprimand', { user, type, reason });
}

function sendDismiss() {
    const name = document.getElementById('dismissName').value;
    const id = document.getElementById('dismissId').value;
    const reason = document.getElementById('dismissReason').value;
    if (!name || !id) { alert('Заполни все поля!'); return; }
    sendCommand('dismiss_report', { name, static_id: id, reason });
}

function sendPromotion() {
    const name = document.getElementById('promoName').value;
    const id = document.getElementById('promoId').value;
    const from = document.getElementById('promoFrom').value;
    const to = document.getElementById('promoTo').value;
    if (!name || !id || !from || !to) { alert('Заполни все поля!'); return; }
    sendCommand('promotion_report', { name, static_id: id, from_rank: from, to_rank: to });
}

function sendVB() {
    const name = document.getElementById('vbName').value;
    const id = document.getElementById('vbId').value;
    const reason = document.getElementById('vbReason').value;
    if (!name || !id) { alert('Заполни все поля!'); return; }
    sendCommand('vb_request', { name, static_id: id, reason });
}

function addStaff() {
    const nick = document.getElementById('newNick').value;
    const tag = document.getElementById('newTag').value;
    const role = document.getElementById('newRole').value;
    if (!nick || !tag || !role) { alert('Заполни все поля!'); return; }
    sendCommand('add_staff', { nick, tag, role });
}

function refreshStaff() {
    console.log('🔄 Обновление состава...');
    sendCommand('get_staff', {});
    setTimeout(loadStaff, 3000);
}

// ==================== СТАТУС БОТА ====================
async function checkBotStatus() {
    console.log('🔍 Проверка статуса бота...');
    try {
        const response = await fetch(BOT_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: 'ping', params: {} })
        });
        
        if (response.ok) {
            document.getElementById('botStatus').innerHTML = '🟢 Бот онлайн';
            console.log('✅ Бот онлайн');
        } else {
            document.getElementById('botStatus').innerHTML = '🔴 Бот не отвечает';
            console.log('❌ Бот не отвечает (HTTP ' + response.status + ')');
        }
    } catch (error) {
        console.error('❌ Ошибка проверки статуса:', error);
        document.getElementById('botStatus').innerHTML = '🔴 Бот не отвечает';
    }
}

// ==================== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ====================
document.querySelectorAll('.sidebar button').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.sidebar button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.getElementById(this.dataset.tab).classList.add('active');
    });
});

// ==================== ЗАГРУЗКА ПРИ СТАРТЕ ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 CRM загружена!');
    loadStaff();
    checkBotStatus();
    setInterval(loadStaff, 30000);
});
