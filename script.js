// --- Constants ---
const scriptURL = "https://script.google.com/macros/s/AKfycbycacQ5QMsDUicyqL9OrDzysVq8kEWMC5eyfYkhmbBc-p4ZlDeYnfylw2XelDO9hzc/exec"; // TODO: Replace with your Apps Script URL
const shareLimit = 5;

// --- DOM Elements ---
const form = document.getElementById('registrationForm');
const whatsappBtn = document.getElementById('whatsappShare');
const shareCountSpan = document.getElementById('shareCount');
const fileInput = document.getElementById('fileUpload');
const fileNameSpan = document.getElementById('fileName');
const filePreview = document.getElementById('filePreview');
const submitBtn = document.getElementById('submitBtn');
const finalMessage = document.getElementById('finalMessage');
const backToTopBtn = document.getElementById('backToTop');

// --- LocalStorage Keys ---
const SHARE_KEY = 'shareCount';
const SHARE_DONE_KEY = 'shareComplete';
const SUBMIT_KEY = 'submitted';

// --- State ---
let shareCount = parseInt(localStorage.getItem(SHARE_KEY)) || 0;
let shareComplete = localStorage.getItem(SHARE_DONE_KEY) === 'true';
let submitted = localStorage.getItem(SUBMIT_KEY) === 'true';

// --- On Load ---
window.onload = function() {
  updateShareUI();
  if (submitted) {
    disableForm();
    showFinalMessage('🎉 Your submission has been recorded. Thanks for being part of Tech for Girls!');
  }
  // Back to top button
  window.addEventListener('scroll', function() {
    backToTopBtn.style.display = window.scrollY > 200 ? 'block' : 'none';
  });
  backToTopBtn.onclick = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Animation enhancements
  window.addEventListener('DOMContentLoaded', () => {
    // Fade in form container
    document.querySelector('.container').classList.add('animate-fadein');

    // Animate final message pop-in
    const observer = new MutationObserver(() => {
      if (finalMessage.textContent.trim() !== '') {
        finalMessage.classList.add('animated-message');
      } else {
        finalMessage.classList.remove('animated-message');
      }
    });
    observer.observe(finalMessage, { childList: true });

    // Button bounce on hover
    document.querySelectorAll('.animated-btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        btn.classList.add('btn-bounce');
        setTimeout(() => btn.classList.remove('btn-bounce'), 400);
      });
    });

    // Shimmer effect on submit button
    submitBtn.addEventListener('mouseenter', () => {
      submitBtn.classList.add('shimmer-btn');
    });
    submitBtn.addEventListener('mouseleave', () => {
      submitBtn.classList.remove('shimmer-btn');
    });

    // Back to top button bounce
    backToTopBtn.classList.add('bounce');
  });
};

// --- WhatsApp Share Logic ---
whatsappBtn.onclick = function() {
  if (shareCount < shareLimit) {
    const message = "Hey Buddy, Join Tech For Girls Community!";
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    shareCount++;
    localStorage.setItem(SHARE_KEY, shareCount);
    if (shareCount >= shareLimit) {
      shareComplete = true;
      localStorage.setItem(SHARE_DONE_KEY, 'true');
    }
    updateShareUI();
  }
};
function updateShareUI() {
  shareCountSpan.textContent = `Click Count: ${shareCount}/${shareLimit}`;
  if (shareComplete) {
    whatsappBtn.disabled = true;
    shareCountSpan.textContent = '✅ Sharing complete. Please continue.';
  } else {
    whatsappBtn.disabled = false;
  }
}

// --- File Upload Preview ---
fileInput.onchange = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  fileNameSpan.textContent = file.name;
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = function(ev) {
      filePreview.src = ev.target.result;
      filePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    filePreview.style.display = 'none';
    filePreview.src = '';
  }
};

// --- Form Submission ---
form.onsubmit = async function(e) {
    e.preventDefault();
    if (submitted) return;
    if (!validateForm()) return;
  
    disableForm();
    showFinalMessage('⏳ Submitting...');
  
    const file = fileInput.files[0];
    const reader = new FileReader();
  
    reader.onload = async function(event) {
      const base64String = event.target.result.split(',')[1];
  
      const payload = new FormData();
      payload.append("name", form.fullName.value.trim());
      payload.append("phone", form.phone.value.trim());
      payload.append("email", form.email.value.trim());
      payload.append("college", form.college.value.trim());
      payload.append("file", base64String);
      payload.append("filename", file.name);
      payload.append("mimeType", file.type);
  
      try {
        const response = await fetch(scriptURL, {
          method: "POST",
          body: payload
        });
  
        const text = await response.text();
        if (text.includes("Success")) {
          localStorage.setItem(SUBMIT_KEY, 'true');
          showFinalMessage('🎉 Your submission has been recorded. Thanks for being part of Tech for Girls!');
        } else {
          throw new Error(text);
        }
      } catch (err) {
        showFinalMessage('❌ Submission failed. Please try again later.');
        enableForm();
      }
    };
  
    reader.readAsDataURL(file);
  };

function validateForm() {
  const name = form.fullName.value.trim();
  const phone = form.phone.value.trim();
  const email = form.email.value.trim();
  const college = form.college.value.trim();
  const file = fileInput.files[0];
  if (!name || !phone || !email || !college) {
    showFinalMessage('⚠️ Please fill all fields.');
    enableForm();
    return false;
  }
  if (!file) {
    showFinalMessage('⚠️ Please upload a file.');
    enableForm();
    return false;
  }
  if (!shareComplete) {
    showFinalMessage('⚠️ Please complete WhatsApp sharing.');
    enableForm();
    return false;
  }
  return true;
}

function disableForm() {
  Array.from(form.elements).forEach(el => el.disabled = true);
  whatsappBtn.disabled = true;
  submitBtn.disabled = true;
}
function enableForm() {
  if (!submitted) {
    Array.from(form.elements).forEach(el => el.disabled = false);
    updateShareUI();
    submitBtn.disabled = false;
  }
}
function showFinalMessage(msg) {
  finalMessage.textContent = msg;
  finalMessage.style.display = 'block';
} 
