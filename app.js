const audioPlayer = document.getElementById('audioPlayer');
const audioStatus = document.getElementById('audioStatus');
const toast = document.getElementById('toast');
const playButtons = [...document.querySelectorAll('.play-button')];
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

const today = new Intl.DateTimeFormat('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
document.getElementById('todayLabel').textContent = today.format(new Date());

playButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const wasPlaying = button.classList.contains('is-playing');
    playButtons.forEach((item) => { item.classList.remove('is-playing'); item.textContent = '▶'; });
    if (wasPlaying) {
      audioPlayer.pause();
      audioStatus.textContent = 'Main balik dijeda.';
      return;
    }
    audioPlayer.src = button.dataset.audio;
    button.classList.add('is-playing');
    button.textContent = 'Ⅱ';
    const title = button.closest('.audio-item').querySelector('.audio-info b').textContent;
    audioStatus.textContent = `Sedang memainkan: ${title}`;
    try { await audioPlayer.play(); }
    catch { audioStatus.textContent = 'Audio tidak dapat dimainkan. Semak sambungan internet anda.'; button.classList.remove('is-playing'); button.textContent = '▶'; }
  });
});
audioPlayer.addEventListener('ended', () => {
  playButtons.forEach((button) => { button.classList.remove('is-playing'); button.textContent = '▶'; });
  audioStatus.textContent = 'Bacaan selesai. Pilih bacaan lain untuk mendengar lagi.';
});
audioPlayer.addEventListener('error', () => {
  if (audioPlayer.src) audioStatus.textContent = 'Audio tidak dapat dimuatkan. Cuba semula sebentar lagi.';
});

document.querySelectorAll('.maqam-card').forEach((card) => {
  card.addEventListener('click', () => showToast(`${card.dataset.maqam} — pilih satu bacaan di Ruang Dengar untuk mula menghayati alunannya.`));
});

document.getElementById('menuToggle').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.nav-link').forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
    document.getElementById('sidebar').classList.remove('open');
  });
});

const recordButton = document.getElementById('recordButton');
const recordHelp = document.getElementById('recordHelp');
const recordPlayback = document.getElementById('recordPlayback');
let recorder;
let chunks = [];
let stream;

recordButton.addEventListener('click', async () => {
  if (recorder?.state === 'recording') {
    recorder.stop();
    recordButton.classList.remove('recording');
    recordButton.innerHTML = '<span>●</span> Mula rakaman';
    recordHelp.textContent = 'Rakaman anda sedia untuk didengar.';
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    recordHelp.textContent = 'Rakaman tidak disokong oleh pelayar ini. Cuba pelayar terkini.';
    return;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = [];
    recorder = new MediaRecorder(stream);
    recorder.addEventListener('dataavailable', (event) => { if (event.data.size) chunks.push(event.data); });
    recorder.addEventListener('stop', () => {
      recordPlayback.src = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
      recordPlayback.hidden = false;
      stream.getTracks().forEach((track) => track.stop());
    }, { once: true });
    recorder.start();
    recordButton.classList.add('recording');
    recordButton.innerHTML = '<span>■</span> Hentikan rakaman';
    recordHelp.textContent = 'Sedang merakam… tekan butang untuk berhenti.';
  } catch {
    recordHelp.textContent = 'Akses mikrofon ditolak. Benarkan akses mikrofon dalam tetapan pelayar anda.';
  }
});
