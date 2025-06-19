var firebaseConfig = {
  apiKey: "AIzaSyC7hCH0cCbPLXyNtIGw-pHYWK7YJP_lipE",
  authDomain: "time-9317d.firebaseapp.com",
  projectId: "time-9317d",
  storageBucket: "time-9317d.firebasestorage.app",
  messagingSenderId: "617854968503",
  appId: "1:617854968503:web:8a02ccce7c704d413fe332",
  measurementId: "G-HGLRR43ZN3"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

const form = document.getElementById('diaryForm');
const messageDiv = document.getElementById('message');
const showEntriesBtn = document.getElementById('showEntriesBtn');
const allCapsulesDiv = document.getElementById('allCapsules');

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = e => reject(e);
    reader.readAsDataURL(file);
  });
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const entry = document.getElementById('entry').value;
  const unlockDate = document.getElementById('unlockDate').value;
  const unlockTime = document.getElementById('unlockTime').value;
  const photo = document.getElementById('photo').files[0];

  let photoData = '';
  if (photo) {
    photoData = await toBase64(photo);
  }

  await db.collection("capsules").add({
    entry,
    unlockDate: new Date(`${unlockDate}T${unlockTime}`),
    photoData,
    createdAt: new Date(),
    sent: false
  });

  messageDiv.textContent = 'Entry saved!';
  setTimeout(() => messageDiv.textContent = '', 3000);
  form.reset();
});

showEntriesBtn.addEventListener('click', async () => {
  allCapsulesDiv.innerHTML = '<p>Loading...</p>';
  const snapshot = await db.collection('capsules').orderBy('unlockDate', 'desc').get();

  if (snapshot.empty) {
    allCapsulesDiv.innerHTML = '<p>No capsules found.</p>';
    return;
  }

  allCapsulesDiv.innerHTML = snapshot.docs.map((doc, i) => {
    const data = doc.data();
    const unlock = new Date(data.unlockDate.seconds ? data.unlockDate.seconds * 1000 : data.unlockDate);
    const now = new Date();
    const deleteBtn = `<button class='delete-btn' onclick='deleteCapsuleFirestore("${doc.id}")'>Delete</button>`;

    if (now >= unlock) {
      return `
        <div style="border-left:5px solid #8ec5fc; background:#f7f8fa; border-radius:12px; box-shadow:0 2px 8px rgba(90,24,154,0.06); padding:1.1rem; margin-bottom:1.3rem;">
          <strong>Unlocked Capsule #${i + 1}</strong><br/>
          <p>${data.entry}</p>
          <div><small>Unlock Date: ${unlock.toLocaleString()}</small></div>
          ${data.photoData ? `<img src="${data.photoData}" alt="Photo" style="max-width: 100%; margin-top: 10px;" />` : ''}
          ${deleteBtn}
        </div>`;
    } else {
      return `
        <div style="border-left:5px solid #8ec5fc; background:#f7f8fa; border-radius:12px; box-shadow:0 2px 8px rgba(90,24,154,0.06); padding:1.1rem; margin-bottom:1.3rem;">
          <strong class="locked">Locked Capsule #${i + 1}</strong><br/>
          <div>This entry will unlock on ${unlock.toLocaleString()}.</div>
          ${deleteBtn}
        </div>`;
    }
  }).join('');
});

window.deleteCapsuleFirestore = async function (id) {
  if (confirm('Are you sure you want to delete this capsule?')) {
    await db.collection('capsules').doc(id).delete();
    showEntriesBtn.click();
  }
}

const notifiedCapsules = new Set();
setInterval(async () => {
  const snapshot = await db.collection('capsules').get();
  const now = new Date();

  snapshot.forEach(doc => {
    const data = doc.data();
    const unlock = new Date(data.unlockDate.seconds ? data.unlockDate.seconds * 1000 : data.unlockDate);

    if (!notifiedCapsules.has(doc.id) && now >= unlock) {
      playReminderSound();
      alert('Your Time Capsule is unlocked!');
      notifiedCapsules.add(doc.id);
    }
  });
}, 10000);

function playReminderSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.connect(ctx.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      ctx.close();
    }, 500);
  } catch (e) {
    alert('Your Time Capsule is unlocked! (Enable sound by interacting with the page)');
  }
}
