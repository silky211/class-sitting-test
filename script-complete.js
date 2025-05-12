
// 전역 변수
let students = [];
let classroomRows = 4;
let classroomCols = 6;

function init() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = \`
        <section>
            <h2>1. 학생 등록</h2>
            <input type="text" id="student-name" placeholder="학생 이름 입력" />
            <button id="add-student">추가</button>
            <div id="student-list"></div>
        </section>
        <hr />
        <section>
            <h2>2. 자리 배치</h2>
            <label>행: <input type="number" id="rows" value="\${classroomRows}" min="1" max="10"></label>
            <label>열: <input type="number" id="cols" value="\${classroomCols}" min="1" max="10"></label>
            <button id="setup-seats">배치 만들기</button>
            <div id="classroom" style="margin-top: 10px; display: grid; gap: 4px;"></div>
        </section>
    \`;

    // 이벤트 등록
    document.getElementById('add-student').addEventListener('click', addStudent);
    document.getElementById('setup-seats').addEventListener('click', setupClassroom);

    updateStudentList();
}

function addStudent() {
    const nameInput = document.getElementById('student-name');
    const name = nameInput.value.trim();
    if (!name) return;
    students.push({ id: Date.now().toString(), name });
    nameInput.value = '';
    updateStudentList();
}

function updateStudentList() {
    const list = document.getElementById('student-list');
    list.innerHTML = '';
    students.forEach(s => {
        const div = document.createElement('div');
        div.textContent = s.name;
        list.appendChild(div);
    });
}

function setupClassroom() {
    const rowVal = parseInt(document.getElementById('rows').value);
    const colVal = parseInt(document.getElementById('cols').value);
    if (isNaN(rowVal) || isNaN(colVal) || rowVal < 1 || colVal < 1) return;

    classroomRows = rowVal;
    classroomCols = colVal;

    const classroom = document.getElementById('classroom');
    classroom.innerHTML = '';
    classroom.style.gridTemplateColumns = \`repeat(\${classroomCols}, 1fr)\`;

    let i = 0;
    for (let r = 0; r < classroomRows; r++) {
        for (let c = 0; c < classroomCols; c++) {
            const desk = document.createElement('div');
            desk.style.border = '1px solid #aaa';
            desk.style.height = '60px';
            desk.style.display = 'flex';
            desk.style.justifyContent = 'center';
            desk.style.alignItems = 'center';
            desk.textContent = students[i] ? students[i].name : '';
            classroom.appendChild(desk);
            i++;
        }
    }
}

document.addEventListener('DOMContentLoaded', init);



// ... 기존 코드 이어서 아래에 추가 ...

let constraints = [];

function addConstraint(student1Id, student2Id) {
    if (!student1Id || !student2Id || student1Id === student2Id) return;

    const exists = constraints.some(
        c => (c[0] === student1Id && c[1] === student2Id) ||
             (c[0] === student2Id && c[1] === student1Id)
    );
    if (!exists) {
        constraints.push([student1Id, student2Id]);
        alert('제약 조건 추가됨: ' + getStudentName(student1Id) + ' ↔ ' + getStudentName(student2Id));
    }
}

function getStudentName(id) {
    const student = students.find(s => s.id === id);
    return student ? student.name : '';
}

// 예시 제약 조건 버튼 UI 추가
function renderConstraintUI() {
    const app = document.getElementById('app');
    const section = document.createElement('section');
    section.innerHTML = \`
        <hr />
        <h2>3. 제약 조건</h2>
        <select id="student1"></select>
        <select id="student2"></select>
        <button id="add-constraint-btn">제약 추가</button>
        <ul id="constraint-list"></ul>
    \`;
    app.appendChild(section);

    updateConstraintSelects();

    document.getElementById('add-constraint-btn').addEventListener('click', () => {
        const s1 = document.getElementById('student1').value;
        const s2 = document.getElementById('student2').value;
        addConstraint(s1, s2);
        updateConstraintList();
    });
}

function updateConstraintSelects() {
    const s1 = document.getElementById('student1');
    const s2 = document.getElementById('student2');
    if (!s1 || !s2) return;

    [s1, s2].forEach(select => {
        select.innerHTML = '<option value="">학생 선택</option>';
        students.forEach(stu => {
            const opt = document.createElement('option');
            opt.value = stu.id;
            opt.textContent = stu.name;
            select.appendChild(opt);
        });
    });
}

function updateConstraintList() {
    const list = document.getElementById('constraint-list');
    if (!list) return;

    list.innerHTML = '';
    constraints.forEach(pair => {
        const li = document.createElement('li');
        li.textContent = getStudentName(pair[0]) + ' ↔ ' + getStudentName(pair[1]);
        list.appendChild(li);
    });
}

// init 확장
const originalInit = init;
init = function () {
    originalInit();
    renderConstraintUI();
};



// 저장/불러오기 관련
let savedLayouts = [];

function saveLayout() {
    const layout = {
        id: Date.now().toString(),
        students: [...students],
        rows: classroomRows,
        cols: classroomCols,
        constraints: [...constraints],
    };
    savedLayouts.push(layout);
    alert('배치가 저장되었습니다.');
    updateLayoutList();
}

function loadLayout(layoutId) {
    const layout = savedLayouts.find(l => l.id === layoutId);
    if (!layout) return;

    students = [...layout.students];
    classroomRows = layout.rows;
    classroomCols = layout.cols;
    constraints = [...layout.constraints];

    document.getElementById('rows').value = classroomRows;
    document.getElementById('cols').value = classroomCols;

    updateStudentList();
    setupClassroom();
    updateConstraintSelects();
    updateConstraintList();
    alert('배치가 불러와졌습니다.');
}

function renderSaveLoadUI() {
    const app = document.getElementById('app');
    const section = document.createElement('section');
    section.innerHTML = \`
        <hr />
        <h2>4. 저장 및 불러오기</h2>
        <button id="save-layout">현재 배치 저장</button>
        <div id="layout-list"></div>
    \`;
    app.appendChild(section);

    document.getElementById('save-layout').addEventListener('click', saveLayout);
    updateLayoutList();
}

function updateLayoutList() {
    const list = document.getElementById('layout-list');
    if (!list) return;

    list.innerHTML = '';
    savedLayouts.forEach(layout => {
        const btn = document.createElement('button');
        btn.textContent = '불러오기: ' + new Date(Number(layout.id)).toLocaleString();
        btn.addEventListener('click', () => loadLayout(layout.id));
        list.appendChild(btn);
    });
}

// init 확장
const originalInit2 = init;
init = function () {
    originalInit2();
    renderConstraintUI();
    renderSaveLoadUI();
};



// 전역 변수
let students = [];
let classroomRows = 4;
let classroomCols = 6;

function init() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = \`
        <section>
            <h2>1. 학생 등록</h2>
            <input type="text" id="student-name" placeholder="학생 이름 입력" />
            <button id="add-student">추가</button>
            <div id="student-list"></div>
        </section>
        <hr />
        <section>
            <h2>2. 자리 배치</h2>
            <label>행: <input type="number" id="rows" value="\${classroomRows}" min="1" max="10"></label>
            <label>열: <input type="number" id="cols" value="\${classroomCols}" min="1" max="10"></label>
            <button id="setup-seats">배치 만들기</button>
            <div id="classroom" style="margin-top: 10px; display: grid; gap: 4px;"></div>
        </section>
    \`;

    // 이벤트 등록
    document.getElementById('add-student').addEventListener('click', addStudent);
    document.getElementById('setup-seats').addEventListener('click', setupClassroom);

    updateStudentList();
}

function addStudent() {
    const nameInput = document.getElementById('student-name');
    const name = nameInput.value.trim();
    if (!name) return;
    students.push({ id: Date.now().toString(), name });
    nameInput.value = '';
    updateStudentList();
}

function updateStudentList() {
    const list = document.getElementById('student-list');
    list.innerHTML = '';
    students.forEach(s => {
        const div = document.createElement('div');
        div.textContent = s.name;
        list.appendChild(div);
    });
}

function setupClassroom() {
    const rowVal = parseInt(document.getElementById('rows').value);
    const colVal = parseInt(document.getElementById('cols').value);
    if (isNaN(rowVal) || isNaN(colVal) || rowVal < 1 || colVal < 1) return;

    classroomRows = rowVal;
    classroomCols = colVal;

    const classroom = document.getElementById('classroom');
    classroom.innerHTML = '';
    classroom.style.gridTemplateColumns = \`repeat(\${classroomCols}, 1fr)\`;

    let i = 0;
    for (let r = 0; r < classroomRows; r++) {
        for (let c = 0; c < classroomCols; c++) {
            const desk = document.createElement('div');
            desk.style.border = '1px solid #aaa';
            desk.style.height = '60px';
            desk.style.display = 'flex';
            desk.style.justifyContent = 'center';
            desk.style.alignItems = 'center';
            desk.textContent = students[i] ? students[i].name : '';
            classroom.appendChild(desk);
            i++;
        }
    }
}

document.addEventListener('DOMContentLoaded', init);



// ... 기존 코드 이어서 아래에 추가 ...

let constraints = [];

function addConstraint(student1Id, student2Id) {
    if (!student1Id || !student2Id || student1Id === student2Id) return;

    const exists = constraints.some(
        c => (c[0] === student1Id && c[1] === student2Id) ||
             (c[0] === student2Id && c[1] === student1Id)
    );
    if (!exists) {
        constraints.push([student1Id, student2Id]);
        alert('제약 조건 추가됨: ' + getStudentName(student1Id) + ' ↔ ' + getStudentName(student2Id));
    }
}

function getStudentName(id) {
    const student = students.find(s => s.id === id);
    return student ? student.name : '';
}

// 예시 제약 조건 버튼 UI 추가
function renderConstraintUI() {
    const app = document.getElementById('app');
    const section = document.createElement('section');
    section.innerHTML = \`
        <hr />
        <h2>3. 제약 조건</h2>
        <select id="student1"></select>
        <select id="student2"></select>
        <button id="add-constraint-btn">제약 추가</button>
        <ul id="constraint-list"></ul>
    \`;
    app.appendChild(section);

    updateConstraintSelects();

    document.getElementById('add-constraint-btn').addEventListener('click', () => {
        const s1 = document.getElementById('student1').value;
        const s2 = document.getElementById('student2').value;
        addConstraint(s1, s2);
        updateConstraintList();
    });
}

function updateConstraintSelects() {
    const s1 = document.getElementById('student1');
    const s2 = document.getElementById('student2');
    if (!s1 || !s2) return;

    [s1, s2].forEach(select => {
        select.innerHTML = '<option value="">학생 선택</option>';
        students.forEach(stu => {
            const opt = document.createElement('option');
            opt.value = stu.id;
            opt.textContent = stu.name;
            select.appendChild(opt);
        });
    });
}

function updateConstraintList() {
    const list = document.getElementById('constraint-list');
    if (!list) return;

    list.innerHTML = '';
    constraints.forEach(pair => {
        const li = document.createElement('li');
        li.textContent = getStudentName(pair[0]) + ' ↔ ' + getStudentName(pair[1]);
        list.appendChild(li);
    });
}

// init 확장
const originalInit = init;
init = function () {
    originalInit();
    renderConstraintUI();
};



// 저장/불러오기 관련
let savedLayouts = [];

function saveLayout() {
    const layout = {
        id: Date.now().toString(),
        students: [...students],
        rows: classroomRows,
        cols: classroomCols,
        constraints: [...constraints],
    };
    savedLayouts.push(layout);
    alert('배치가 저장되었습니다.');
    updateLayoutList();
}

function loadLayout(layoutId) {
    const layout = savedLayouts.find(l => l.id === layoutId);
    if (!layout) return;

    students = [...layout.students];
    classroomRows = layout.rows;
    classroomCols = layout.cols;
    constraints = [...layout.constraints];

    document.getElementById('rows').value = classroomRows;
    document.getElementById('cols').value = classroomCols;

    updateStudentList();
    setupClassroom();
    updateConstraintSelects();
    updateConstraintList();
    alert('배치가 불러와졌습니다.');
}

function renderSaveLoadUI() {
    const app = document.getElementById('app');
    const section = document.createElement('section');
    section.innerHTML = \`
        <hr />
        <h2>4. 저장 및 불러오기</h2>
        <button id="save-layout">현재 배치 저장</button>
        <div id="layout-list"></div>
    \`;
    app.appendChild(section);

    document.getElementById('save-layout').addEventListener('click', saveLayout);
    updateLayoutList();
}

function updateLayoutList() {
    const list = document.getElementById('layout-list');
    if (!list) return;

    list.innerHTML = '';
    savedLayouts.forEach(layout => {
        const btn = document.createElement('button');
        btn.textContent = '불러오기: ' + new Date(Number(layout.id)).toLocaleString();
        btn.addEventListener('click', () => loadLayout(layout.id));
        list.appendChild(btn);
    });
}

// init 확장
const originalInit2 = init;
init = function () {
    originalInit2();
    renderConstraintUI();
    renderSaveLoadUI();
};



let pairHistory = {};

function autoAssign() {
    if (students.length === 0) {
        alert('학생이 없습니다.');
        return;
    }

    // 짝 기록 기반으로 가능한 짝 조합 생성
    const shuffled = [...students];
    shuffled.sort(() => Math.random() - 0.5);

    const pairs = [];
    const used = new Set();

    for (let i = 0; i < shuffled.length; i++) {
        if (used.has(shuffled[i].id)) continue;

        let bestPartner = null;
        let minPairCount = Infinity;

        for (let j = i + 1; j < shuffled.length; j++) {
            if (used.has(shuffled[j].id)) continue;

            const key = getPairKey(shuffled[i].id, shuffled[j].id);
            const count = pairHistory[key] || 0;

            if (count < minPairCount) {
                bestPartner = shuffled[j];
                minPairCount = count;
            }
        }

        if (bestPartner) {
            pairs.push([shuffled[i], bestPartner]);
            used.add(shuffled[i].id);
            used.add(bestPartner.id);

            const pairKey = getPairKey(shuffled[i].id, bestPartner.id);
            pairHistory[pairKey] = (pairHistory[pairKey] || 0) + 1;
        } else {
            // 홀수인 경우 짝이 없는 사람 처리
            pairs.push([shuffled[i]]);
            used.add(shuffled[i].id);
        }
    }

    // 자리 배치 그리드에 배정
    const classroom = document.getElementById('classroom');
    classroom.innerHTML = '';
    classroom.style.gridTemplateColumns = \`repeat(\${classroomCols}, 1fr)\`;

    let i = 0;
    for (let r = 0; r < classroomRows; r++) {
        for (let c = 0; c < classroomCols; c++) {
            const desk = document.createElement('div');
            desk.style.border = '1px solid #aaa';
            desk.style.height = '60px';
            desk.style.display = 'flex';
            desk.style.justifyContent = 'center';
            desk.style.alignItems = 'center';
            desk.textContent = '';

            if (i < students.length) {
                const pair = pairs[Math.floor(i / 2)];
                if (pair) {
                    const indexInPair = i % 2;
                    if (pair[indexInPair]) {
                        desk.textContent = pair[indexInPair].name;
                    }
                }
            }

            classroom.appendChild(desk);
            i++;
        }
    }
}

function getPairKey(id1, id2) {
    return [id1, id2].sort().join('-');
}

// 자동 배치 UI 추가
function renderAutoAssignUI() {
    const app = document.getElementById('app');
    const section = document.createElement('section');
    section.innerHTML = \`
        <hr />
        <h2>5. 자동 배치</h2>
        <button id="auto-assign-btn">자동 자리 배치</button>
    \`;
    app.appendChild(section);

    document.getElementById('auto-assign-btn').addEventListener('click', autoAssign);
}




// 텍스트 기반 자리 배치 HWP 다운로드
function downloadHWPLayout() {
    const classroom = document.getElementById('classroom');
    if (!classroom) {
        alert('먼저 자리를 배치해 주세요.');
        return;
    }

    const desks = classroom.children;
    let output = '교실 자리 배치표\n\n';

    let row = 0;
    const cols = classroomCols;
    for (let i = 0; i < desks.length; i++) {
        const desk = desks[i];
        const name = desk.textContent.trim() || '빈자리';
        output += name.padEnd(10, ' ') + ' ';
        if ((i + 1) % cols === 0) {
            output += '\n';
            row++;
        }
    }

    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '자리배치표.hwp'; // 사용자가 한글로 열 수 있도록 .hwp 확장자
    link.click();
}

// 다운로드 버튼 추가
function renderHWPExportUI() {
    const app = document.getElementById('app');
    const section = document.createElement('section');
    section.innerHTML = \`
        <hr />
        <h2>6. HWP 다운로드</h2>
        <button id="download-hwp-btn">한글 파일로 다운로드</button>
    \`;
    app.appendChild(section);

    document.getElementById('download-hwp-btn').addEventListener('click', downloadHWPLayout);
}

// init 최종 확장
const originalInit4 = init;
init = function () {
    originalInit4();
    renderConstraintUI();
    renderSaveLoadUI();
    renderAutoAssignUI();
    renderHWPExportUI();
};
