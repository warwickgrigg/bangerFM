import Tone from './tone.js'
import Tonal from 'tonal'
import soundBridge from './soundBridge.js'
// import utils from './instrumentUtils.js'

var startTransport = function () {
  Tone.Transport.start()
}

var stopTransport = function () {
  Tone.Transport.cancel(0)
  Tone.Transport.stop()
}

var changePitch = function (cur, direction, pitchKey) {
  let notes = Tonal.scale(pitchKey.toLowerCase())
  let note = Tonal.note.pc(cur)
  let octave = Tonal.note.oct(cur) || 3
  let index = notes.indexOf(note) + direction

  if (index < 0 && octave > 1) {
    octave = 1
    index = notes.length - 1
  } else if (index >= notes.length && octave < 5) {
    octave += 1
    index = 0
  }
  let attempt = notes[index] + octave
  return attempt || cur
}

var tripletTime = new Tone.Time('32t').toSeconds()
var doubledTripletTime = tripletTime + tripletTime
window.Tone = Tone
var dataFunc = function (vm, animateFunc, defs, endcb, songIndex) {
  return function (time, col) {
    for (var i = 0; i < vm.defsLength; i++) {
      if (vm.deep && vm.deepPlaying) {
        i = vm.selected[1]
      }
      var square = (vm.dataArray[i] || {})[col]
      if (!square) { break }
      let idef = vm.idefLookup[i]
      let qTime = time
      if (square.measureSub) {
        qTime = Tone.Time(time).quantize(square.measureSub).toSeconds()
      }
      if (square.enabled) {
        soundBridge.startBeat(idef, square.pitch, qTime, i)
      }
      if (square.triplet.enabled) {
        soundBridge.startBeat(idef, square.pitch, qTime + tripletTime, i)
        soundBridge.startBeat(idef, square.pitch, qTime + doubledTripletTime, i)
      }
      if (vm.deep && vm.deepPlaying) {
        break
      }
    }
    Tone.Draw.schedule(function () {
      animateFunc(col, !endcb, songIndex)
    }, time)

    if (endcb && col === (getLength(vm.dataArray[0]) - 1)) {
      endcb(songIndex)
    }
  }
}

var getLength = function (obj) {
  return obj.length || Object.keys(obj).length
}

var makeLoop = function (dataFunc, numCols) {
  var la = []
  for (var i = 0; i < numCols; i++) {
    la.push(i)
  }
  return new Tone.Sequence(dataFunc, la, '16n')
}

export default {
  makeLoop: makeLoop,
  dataFunc: dataFunc,
  startTransport: startTransport,
  changePitch: changePitch,
  stopTransport: stopTransport
}
