
// 전역 변수
let students = [];
let constraints = [];
let savedLayouts = [];
let pairHistory = {};
let classroomRows = 4;
let classroomCols = 6;

function init() {
    const app = document.getElementById('app');
    app.innerHTML = \`
        <h2>학생 등록</h2>
        <input id="student-name" placeholder="학생 이름 입력" />
        <button id="add-student">추가</button>
        <div id="student-list"></div>
        <hr />
        <h2>자리 배치</h2>
        <label>행 <input id="rows" type="number" value="4" /></label>
        <label>열 <input id="cols" type="number" value="6" /></label>
        <button id="generate">자리 생성</button>
        <button id="auto-assign">자동 배치</button>
        <div id="classroom"></div>
        <hr />
        <h2>제약 조건</h2>
        <select id="student1"></select>
        <select id="student2"></select>
        <button id="add-constraint">추가</button>
        <div id="constraint-list"></div>
        <hr />
        <h2>저장 및 불러오기</h2>
        <button id="save-layout">현재 배치 저장</button>
        <div id="layout-list"></div>
        <hr />
        <h2>HWP 다운로드</h2>
        <button id="download-hwp">한글 파일로 다운로드</button>
    \`;

    document.getElementById('add-student').onclick = addStudent;
    document.getElementById('generate').onclick = generateSeats;
    document.getElementById('auto-assign').onclick = autoAssign;
    document.getElementById('add-constraint').onclick = addConstraint;
    document.getElementById('save-layout').onclick = saveLayout;
    document.getElementById('download-hwp').onclick = downloadHWP;

    updateStudentList();
    updateConstraintSelects();
}

function addStudent() {
    const input = document.getElementById('student-name');
    const name = input.value.trim();
    if (!name) return;
    students.push({ id: Date.now().toString(), name });
    input.value = '';
    updateStudentList();
    updateConstraintSelects();
}

function updateStudentList() {
    const list = document.getElementById('student-list');
    list.innerHTML = students.map(s => s.name).join(', ');
}

function updateConstraintSelects() {
    const s1 = document.getElementById('student1');
    const s2 = document.getElementById('student2');
    [s1, s2].forEach(select => {
        select.innerHTML = '<option value="">선택</option>' + students.map(s => \`<option value="\${s.id}">\${s.name}</option>\`).join('');
    });
}

function generateSeats() {
    const r = parseInt(document.getElementById('rows').value);
    const c = parseInt(document.getElementById('cols').value);
    classroomRows = r;
    classroomCols = c;
    const container = document.getElementById('classroom');
    container.innerHTML = '';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = \`repeat(\${c}, 1fr)\`;
    container.style.gap = '4px';
    const total = r * c;
    for (let i = 0; i < total; i++) {
        const cell = document.createElement('div');
        cell.style.border = '1px solid #aaa';
        cell.style.height = '50px';
        cell.style.display = 'flex';
        cell.style.justifyContent = 'center';
        cell.style.alignItems = 'center';
        cell.textContent = '';
        container.appendChild(cell);
    }
}

function addConstraint() {
    const id1 = document.getElementById('student1').value;
    const id2 = document.getElementById('student2').value;
    if (!id1 || !id2 || id1 === id2) return;
    if (!constraints.find(([a, b]) => (a === id1 && b === id2) || (a === id2 && b === id1))) {
        constraints.push([id1, id2]);
        updateConstraintList();
    }
}

function updateConstraintList() {
    const list = document.getElementById('constraint-list');
    list.innerHTML = constraints.map(([a, b]) => {
        const na = students.find(s => s.id === a)?.name;
        const nb = students.find(s => s.id === b)?.name;
        return \`<div>\${na} ↔ \${nb}</div>\`;
    }).join('');
}

function getPairKey(id1, id2) {
    return [id1, id2].sort().join('-');
}

function autoAssign() {
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const assigned = [];
    const used = new Set();
    for (let i = 0; i < shuffled.length; i++) {
        if (used.has(shuffled[i].id)) continue;
        let best = null, bestScore = Infinity;
        for (let j = i + 1; j < shuffled.length; j++) {
            if (used.has(shuffled[j].id)) continue;
            const key = getPairKey(shuffled[i].id, shuffled[j].id);
            const score = pairHistory[key] || 0;
            if (score < bestScore && !constraints.find(([a, b]) =>
                (a === shuffled[i].id && b === shuffled[j].id) || 
                (a === shuffled[j].id && b === shuffled[i].id))) {
                best = shuffled[j];
                bestScore = score;
            }
        }
        if (best) {
            assigned.push([shuffled[i], best]);
            used.add(shuffled[i].id);
            used.add(best.id);
            const key = getPairKey(shuffled[i].id, best.id);
            pairHistory[key] = (pairHistory[key] || 0) + 1;
        } else {
            assigned.push([shuffled[i]]);
            used.add(shuffled[i].id);
        }
    }

    const classroom = document.getElementById('classroom');
    const seats = classroom.children;
    let index = 0;
    for (let i = 0; i < assigned.length; i++) {
        for (let j = 0; j < assigned[i].length; j++) {
            if (index < seats.length) {
                seats[index].textContent = assigned[i][j].name;
                index++;
            }
        }
    }
}

function saveLayout() {
    const layout = {
        id: Date.now().toString(),
        students: [...students],
        constraints: [...constraints],
        rows: classroomRows,
        cols: classroomCols
    };
    savedLayouts.push(layout);
    updateLayoutList();
}

function updateLayoutList() {
    const container = document.getElementById('layout-list');
    container.innerHTML = savedLayouts.map(layout => {
        const btn = document.createElement('button');
        btn.textContent = new Date(Number(layout.id)).toLocaleString();
        btn.onclick = () => loadLayout(layout);
        return btn.outerHTML;
    }).join('');
}

function loadLayout(layout) {
    students = layout.students;
    constraints = layout.constraints;
    classroomRows = layout.rows;
    classroomCols = layout.cols;
    document.getElementById('rows').value = layout.rows;
    document.getElementById('cols').value = layout.cols;
    updateStudentList();
    updateConstraintSelects();
    updateConstraintList();
    generateSeats();
}

function downloadHWP() {
    const container = document.getElementById('classroom');
    let output = '교실 자리 배치표\n\n';
    const seats = container.children;
    for (let i = 0; i < seats.length; i++) {
        output += seats[i].textContent.padEnd(10, ' ') + ' ';
        if ((i + 1) % classroomCols === 0) output += '\n';
    }
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '자리배치표.hwp';
    link.click();
}

document.addEventListener('DOMContentLoaded', init);
