var makePitches = function () {
  var p = []
  var notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
  for (var i = 1; i < 6; i++) {
    for (var j = 0; j < notes.length; j++) {
      p.push(notes[j] + String(i))
    }
  }
  return p.slice(3, -1)
}

var pitchToOffset = function (pitch) {
  let curPitchIndex = PITCHES.indexOf(pitch)
  return curPitchIndex - PITCHES.indexOf('C3')
}

const PITCHES = makePitches()

var getOscillatorType = function (val) {
  return {
    1: 'square2',
    2: 'sine2',
    3: 'triangle2',
    4: 'sawtooth2',
    5: 'square4',
    6: 'sine4',
    7: 'triangle4',
    8: 'sawtooth4',
    9: 'square8',
    10: 'sine8',
    11: 'triangle8',
    12: 'sawtooth8',
    13: 'square12',
    14: 'sine12',
    15: 'sawtooth12',
    16: 'triangle12'
  }[val]
}

var getNoiseType = function (val) {
  return {
    1: 'white',
    2: 'white',
    3: 'pink',
    4: 'pink',
    5: 'brown',
    6: 'brown'
  }[val]
}

var innerDataArrayObj = function () {
  var pitch = 'C3'

  return {
    enabled: false,
    pitch: pitch,
    triplet: {enabled: false},
    e1: false,
    e2: false
  }
}

var createDataArray = function (perMeasure = 4, numInstruments = 12) {
  var numCols = calcNumCols(perMeasure)
  var a = {}
  for (var i = 0; i < numInstruments; i++) {
    var inner = {}
    for (var j = 0; j < numCols; j++) {
      inner[j] = innerDataArrayObj()
    }
    a[i] = inner
  }
  a.perMeasure = perMeasure
  return a
}

var createSongArray = function () {
  return {0: {0: 0, 1: 1, 2: 0, 3: 1}, 1: {}, 2: {}, 3: {}, 4: {}}
}

var calcNumCols = function (perMeasure) {
  return (perMeasure * 8 <= 32) ? perMeasure * 8 : perMeasure * 4
}

var getInstrumentByIndex = function (defs, index) {
  return Object.keys(defs).find(function (key) {
    return defs[key].index === index
  })
}

var createRandomIBeat = function (perMeasure, randomize = true) {
  let numCols = calcNumCols(perMeasure)
  var inner = {}
  for (var j = 0; j < numCols; j++) {
    inner[j] = innerDataArrayObj()
    if (randomize) {
      inner[j].enabled = !!(Math.random() < 0.3)
      inner[j].pitch = PITCHES[Math.floor(Math.random() * PITCHES.length)]
    }
  }
  return inner
}

export default {
  getOscillatorType: getOscillatorType,
  getNoiseType: getNoiseType,
  createDataArray: createDataArray,
  createSongArray: createSongArray,
  innerDataArrayObj: innerDataArrayObj,
  calcNumCols: calcNumCols,
  getInstrumentByIndex: getInstrumentByIndex,
  createRandomIBeat: createRandomIBeat,
  PITCHES: PITCHES,
  pitchToOffset: pitchToOffset
}
