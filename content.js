chrome.runtime.onMessage.addListener((msg) => {
  try {
    // Gmail subject
    const subjectBox = document.querySelector('input[name="subjectbox"], input[name="subject"]');
    if (subjectBox && msg.subject) {
      subjectBox.focus();
      subjectBox.value = msg.subject;
      subjectBox.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Gmail body
    const bodyBox = document.querySelector('div[aria-label="Message Body"][contenteditable="true"]');
    if (bodyBox && msg.body) {
      bodyBox.focus();
      
      // Paste content
      bodyBox.innerHTML = msg.body.replace(/\n/g, "<br>");
      
      // Trigger input events so Gmail detects changes
      bodyBox.dispatchEvent(new InputEvent('input', { bubbles: true }));
      bodyBox.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Optional toast in sidepanel
    chrome.runtime.sendMessage({ action: "paste-success" });
  } catch (err) {
    console.error("Failed to paste:", err);
    chrome.runtime.sendMessage({ action: "paste-failed" });
  }
});
