// script.js

// Define the sharp and flat notes
const notesSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const notesFlat  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Keys that typically use flats
const useFlats = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];

// Scale intervals for major and minor scales
const majorScaleIntervals = [2, 2, 1, 2, 2, 2, 1];
const minorScaleIntervals = [2, 1, 2, 2, 1, 2, 2];

// Get references to DOM elements
const keySelect = document.getElementById('key-select');
const scaleSelect = document.getElementById('scale-select');
const chordDisplay = document.getElementById('chord-display');

// Populate key options in the dropdown menu
const allKeys = [...new Set([...notesSharp, ...notesFlat])];
allKeys.forEach(note => {
  const option = document.createElement('option');
  option.value = note;
  option.textContent = note;
  keySelect.appendChild(option);
});

// Roman numerals for chord positions
const romanNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

// Chord qualities for major and minor scales
const chordQualities = {
  major: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
  minor: ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
};

// Function to get the scale notes based on key and scale type
function getScale(key, scaleType) {
  const notes = useFlats.includes(key) ? notesFlat : notesSharp;
  let scale = [];
  let noteIndex = notes.indexOf(key);
  const intervals = scaleType === 'major' ? majorScaleIntervals : minorScaleIntervals;

  scale.push(notes[noteIndex]);

  intervals.forEach(interval => {
    noteIndex = (noteIndex + interval) % notes.length;
    scale.push(notes[noteIndex]);
  });

  return scale;
}

// Function to get the chord notes based on the scale
function getChordNotes(scale, index, chordType) {
  // Chord formulas for triads
  const formulas = {
    major: [0, 2, 4],       // Root, Major 3rd, Perfect 5th
    minor: [0, 2, 4],       // Root, Minor 3rd, Perfect 5th
    diminished: [0, 2, 4],  // Root, Minor 3rd, Diminished 5th
  };

  const modifiers = {
    major: [0, 0, 0],
    minor: [0, -1, 0],
    diminished: [0, -1, -1],
  };

  const formula = formulas[chordType];
  const modifier = modifiers[chordType];

  const chordNotes = formula.map((degree, i) => {
    let scaleNoteIndex = (index + degree) % scale.length;
    let note = scale[scaleNoteIndex];

    let noteList = useFlats.includes(note) ? notesFlat : notesSharp;
    let notePos = noteList.indexOf(note);

    // Apply modifiers for minor and diminished chords
    notePos = (notePos + modifier[i] + noteList.length) % noteList.length;

    return noteList[notePos];
  });

  return chordNotes;
}

// Function to display the chords based on user selection
function displayChords() {
  const key = keySelect.value;
  const scaleType = scaleSelect.value;

  if (!key) {
    chordDisplay.innerHTML = '<p>Please select a key.</p>';
    return;
  }

  const scale = getScale(key, scaleType);
  const qualities = chordQualities[scaleType];

  chordDisplay.innerHTML = ''; // Clear previous chords

  scale.slice(0, 7).forEach((note, index) => {
    const chordType = qualities[index];
    const chordNotes = getChordNotes(scale, index, chordType);

    const chordElement = document.createElement('div');
    chordElement.classList.add('chord');

    // Create Play Button
    const playButton = document.createElement('button');
    playButton.textContent = 'Play';
    playButton.classList.add('play-button');
    playButton.addEventListener('click', () => {
      playChord(chordNotes);
    });

    chordElement.innerHTML = `
      <strong>${romanNumerals[index]}</strong>: ${note} ${chordType}<br>
      Notes: ${chordNotes.join(' - ')}
    `;

    chordElement.appendChild(playButton);
    chordDisplay.appendChild(chordElement);
  });
}

// Function to convert note names to frequencies
function getFrequency(note) {
  const noteFrequencies = {
    'C': 261.63,
    'C#': 277.18,
    'Db': 277.18,
    'D': 293.66,
    'D#': 311.13,
    'Eb': 311.13,
    'E': 329.63,
    'F': 349.23,
    'F#': 369.99,
    'Gb': 369.99,
    'G': 392.00,
    'G#': 415.30,
    'Ab': 415.30,
    'A': 440.00,
    'A#': 466.16,
    'Bb': 466.16,
    'B': 493.88,
  };

  return noteFrequencies[note];
}

// Function to play a chord using the Web Audio API
function playChord(notes) {
  const instrumentSelect = document.getElementById('instrument-select');
  const oscillatorType = instrumentSelect ? instrumentSelect.value : 'sine';

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();

  // Resume AudioContext if suspended (required in some browsers)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;

  notes.forEach(note => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // Set oscillator type based on selected instrument
    oscillator.type = oscillatorType;

    // Convert note to frequency
    const frequency = getFrequency(note);

    oscillator.frequency.setValueAtTime(frequency, now);

    // Set volume
    gainNode.gain.setValueAtTime(0.2, now);

    // Connect oscillator to gain node to audio context
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Start and stop oscillator
    oscillator.start(now);
    oscillator.stop(now + 1); // Play for 1 second
  });
}

// Event listeners for dropdown changes
keySelect.addEventListener('change', displayChords);
scaleSelect.addEventListener('change', displayChords);

// Optional: Display chords on page load
// displayChords();
