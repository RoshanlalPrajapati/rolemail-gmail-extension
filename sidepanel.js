// Elements
const title = document.getElementById("title");
const subject = document.getElementById("subject");
const resume = document.getElementById("resume");
const body = document.getElementById("body");

const saveBtn = document.getElementById("save");
const clearBtn = document.getElementById("clear");
const templatesSelect = document.getElementById("templates");
const useBtn = document.getElementById("use");
const editBtn = document.getElementById("edit");
const deleteBtn = document.getElementById("delete");

function showToast(msg, type="info") {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  switch(type){
    case "success": toast.style.background="#16a34a"; break;
    case "error": toast.style.background="#dc2626"; break;
    case "warning": toast.style.background="#f59e0b"; break;
    default: toast.style.background="#4f7fff";
  }
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
  
  // Optional sound
  const audio = new Audio('ding.mp3'); // add ding.mp3 in extension folder
  audio.play().catch(()=>{});
}


// Clear fields
function clearFields() {
  title.value = "";
  subject.value = "";
  resume.value = "";
  body.value = "";
}

// Load templates from storage
function loadTemplates() {
  chrome.storage.sync.get(["templates"], (res) => {
    const templates = res.templates || {};
    templatesSelect.innerHTML = "";
    Object.keys(templates).forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      templatesSelect.appendChild(opt);
    });
  });
}

// Save template
saveBtn.onclick = () => {
  if(!title.value || !body.value) return showToast("Title and body required", "error");
  chrome.storage.sync.get(["templates"], (res)=>{
    const templates = res.templates || {};
    templates[title.value] = {
      subject: subject.value,
      resume: resume.value,
      body: body.value
    };
    chrome.storage.sync.set({templates}, ()=>{
      clearFields();
      loadTemplates();
      showToast("Template saved", "success");
    });
  });
};

// Clear form
clearBtn.onclick = clearFields;

// Edit template
editBtn.onclick = () => {
  const selected = templatesSelect.value;
  if(!selected) return showToast("Select a template", "error");
  chrome.storage.sync.get(["templates"], (res)=>{
    const t = res.templates[selected];
    if(t){
      title.value = selected;
      subject.value = t.subject;
      resume.value = t.resume;
      body.value = t.body;
      showToast("Editing template", "info");
    }
  });
};

// Delete template
deleteBtn.onclick = () => {
  const selected = templatesSelect.value;
  if(!selected) return showToast("Select a template", "error");
  chrome.storage.sync.get(["templates"], (res)=>{
    const templates = res.templates || {};
    delete templates[selected];
    chrome.storage.sync.set({templates}, ()=>{
      loadTemplates();
      clearFields();
      showToast("Template deleted", "warning");
    });
  });
};

// Paste to Gmail
useBtn.onclick = () => {
  const selected = templatesSelect.value;
  if(!selected) return showToast("Select a template", "error");
  chrome.storage.sync.get(["templates"], (res)=>{
    const t = res.templates[selected];
    chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
      chrome.tabs.sendMessage(tabs[0].id, {
        subject: t.subject,
        body: `${t.body}\n\nResume: ${t.resume}`
      });
      showToast("Pasted to Gmail!", "success");
    });
  });
};

// Load templates on start
loadTemplates();
