// 1. GLOBAL VARIABLES: Program ki yaad-daasht
let arr = [];               // Numbers ki list
let sorted_indices = [];    // Wo index jo apni final jagah par hain
let swapping_indices = [];  // Wo index jo abhi adla-badli ho rahe hain
let fixing_index = -1;      // Wo index jisay system abhi check kar raha hai
let is_sorting = false;     // Sorting chal rahi hai ya nahi?

// 2. CANVAS SETUP: Drawing board taiyar karna
const canvas = document.getElementById("treeCanvas");
const ctx = canvas.getContext("2d");

// Sleep function taake animation dheere chale aur samajh aaye
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function render() {
    /* Ye function screen ko refresh karke naya data dikhata hai */
    const container = document.getElementById("arrayDisplay");
    container.innerHTML = "";  // Purani array strip saaf karo
    
    // Array ke dabba (Node Boxes) banana
    arr.forEach((val, i) => {
        const box = document.createElement("div");
        box.className = "node-box";
        
        // Color badalne ki logic
        if (sorted_indices.includes(i)) {
            box.style.background = "var(--steel-blue)";
            box.style.color = "#0f172a";
        } else if (swapping_indices.includes(i)) {
            box.style.background = "var(--accent-purple)";
            box.style.color = "white";
        } else if (i === fixing_index) {
            box.style.background = "var(--accent-red)";
            box.style.color = "white";
        }
        
        box.innerText = val;
        container.appendChild(box);
    });
    
    draw_tree(); // Tree draw karne wala function call karo
}

function draw_tree() {
    /* Canvas par lines aur circles draw karne ka logic */
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (arr.length === 0) return;
    
    const n = arr.length;
    const positions = {};
    
    // Har node ki (x, y) location calculate karo
    for (let i = 0; i < n; i++) {
        const level = Math.floor(Math.log2(i + 1));
        const pos_in_level = (i + 1) - Math.pow(2, level);
        const nodes_in_level = Math.pow(2, level);
        const x = (canvas.width / (nodes_in_level + 1)) * (pos_in_level + 1);
        const y = 50 + (level * 80);
        positions[i] = { x: x, y: y };
    }

    // Lines kheenchna (Parent to Child)
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    for (let i = 0; i < n; i++) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        if (l < n) {
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[l].x, positions[l].y);
            ctx.stroke();
        }
        if (r < n) {
            ctx.beginPath();
            ctx.moveTo(positions[i].x, positions[i].y);
            ctx.lineTo(positions[r].x, positions[r].y);
            ctx.stroke();
        }
    }

    // Circles aur unke andar text banana
    for (let i = 0; i < n; i++) {
        const pos = positions[i];
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
        
        if (sorted_indices.includes(i)) {
            ctx.fillStyle = "#38bdf8";
        } else if (swapping_indices.includes(i)) {
            ctx.fillStyle = "#a855f7";
        } else if (i === fixing_index) {
            ctx.fillStyle = "#f43f5e";
        } else {
            ctx.fillStyle = "#0f172a";
        }
        
        ctx.fill();
        
        // Font setup aur text drawing
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Segoe UI";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(arr[i], pos.x, pos.y);
    }
}

async function heapify(n, i, mode) {
    /* Heap Sort ka engine: Parent aur Child ko compare karna */
    let extreme = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    const speed = parseInt(document.getElementById("speedSelect").value);
    
    fixing_index = i;
    render();
    await sleep(speed);

    // Mode ke mutabiq check: Bada (Max) ya Chota (Min)?
    if (mode === "max") {
        if (l < n && arr[l] > arr[extreme]) extreme = l;
        if (r < n && arr[r] > arr[extreme]) extreme = r;
    } else {
        if (l < n && arr[l] < arr[extreme]) extreme = l;
        if (r < n && arr[r] < arr[extreme]) extreme = r;
    }

    // Agar Parent sahi jagah par nahi hai to Swap karo
    if (extreme !== i) {
        swapping_indices = [i, extreme];
        let temp = arr[i];
        arr[i] = arr[extreme];
        arr[extreme] = temp;
        
        render();
        await sleep(speed);
        
        swapping_indices = [];
        await heapify(n, extreme, mode); // Neeche ja kar dubara check karo
    }
}

async function startSort() {
    /* Main Sort Button ka function */
    if (arr.length < 2 || is_sorting) return;
    
    is_sorting = true;
    sorted_indices = [];
    const mode = document.getElementById("heapMode").value;
    const speed = parseInt(document.getElementById("speedSelect").value);
    const statusDiv = document.getElementById("status");
    
    statusDiv.innerText = `Status: Building initial ${mode.toUpperCase()} HEAP...`;

    // Step 1: Poore array ka Heap banao (Build Heap)
    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
        await heapify(arr.length, i, mode);
    }

    statusDiv.innerText = "Status: Sorting elements one by one...";

    // Step 2: Root ko aakhir mein bhejo aur baqi ko dobara fix karo
    for (let i = arr.length - 1; i > 0; i--) {
        let temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        
        sorted_indices.push(i);
        render();
        await sleep(speed);
        
        await heapify(i, 0, mode);
    }

    sorted_indices.push(0);
    is_sorting = false;
    fixing_index = -1;
    statusDiv.innerText = "System Live: Sorting Completed Successfully!";
    render();
}

function addKey() {
    /* Input box se number lekar list mein dalna */
    const input = document.getElementById("inputVal");
    const val = input.value;
    if (val !== "") {
        arr.push(parseInt(val));
        input.value = "";
        render();
    }
}

function clearAll() {
    /* Sab kuch saaf karna */
    if (is_sorting) return;
    arr = [];
    sorted_indices = [];
    swapping_indices = [];
    fixing_index = -1;
    document.getElementById("status").innerText = "System Live: Add nodes to start";
    render();
}

// Buttons ko functions ke sath connect karna (Event Listeners)
document.getElementById("addBtn").addEventListener("click", addKey);
document.getElementById("clearBtn").addEventListener("click", clearAll);
document.getElementById("sortBtn").addEventListener("click", startSort);

// Enter key se key insert karne ki sahulat
document.getElementById("inputVal").addEventListener("keypress", function(e) {
    if (e.key === 'Enter') addKey();
});

// Start-up display
render();