<template>
  <div id="daw" tabindex="0" ref='app' class='unselectable'
    @keydown.down.prevent="noArg('moveDown', $event)" 
    @keydown.up.prevent="noArg('moveUp', $event)"
    @keydown.right.prevent="noArg('moveRight', $event)"
    @keydown.left.prevent="noArg('moveLeft', $event)"
    @keydown.space.prevent="noArg('spaceDown')"
    @keyup.space="noArg('spaceUp')"
    @keyup.8="noArg('backspace')"
    @keydown.220="noArg('pipeDown')"
    @keyup.220="noArg('pipeUp')"
    @keyup.tab.prevent="tabUp($event)"
    @keydown.81="twoArg('sendKey', 0, 1, $event)"
    @keydown.65="twoArg('sendKey', 0, -1, $event)"
    @keydown.87="twoArg('sendKey', 1, 1, $event)"
    @keydown.83="twoArg('sendKey', 1, -1, $event)"
    @keydown.69="twoArg('sendKey', 2, 1, $event)"
    @keydown.68="twoArg('sendKey', 2, -1, $event)"
    @keydown.82="twoArg('sendKey', 3, 1, $event)"
    @keydown.70="twoArg('sendKey', 3, -1, $event)"
    @keydown.84="twoArg('sendKey', 4, 1, $event)"
    @keydown.71="twoArg('sendKey', 4, -1, $event)"
    @keydown.89="twoArg('sendKey', 5, 1, $event)"
    @keydown.72="twoArg('sendKey', 5, -1, $event)"
    @keydown.85="twoArg('sendKey', 6, 1, $event)"
    @keydown.74="twoArg('sendKey', 6, -1, $event)"
    @keydown.73="twoArg('sendKey', 7, 1, $event)"
    @keydown.75="twoArg('sendKey', 7, -1, $event)"
    @keyup.49="changeBank(1, $event)"
    @keyup.50="changeBank(2, $event)"
    @keyup.51="changeBank(3, $event)"
    @keyup.52="changeBank(4, $event)"
    @keyup.53="changeBank(5, $event)"
    @keyup.54="changeBank(6, $event)"
    @keyup.55="changeBank(7, $event)"
    @keyup.56="changeBank(8, $event)"
    @keyup.57="changeBank(9, $event)"
    @keyup.191="helpOverlay($event)"
    @keyup.enter="noArg('enterUp')"
    @keyup.88="noArg('select')"
    @keyup.67="toggleCP($event)"
    @keydown.90="undoRedo($event)"
    @keyup.27="runEscape($event)"
    @blur="forceFocus"
    @click="runEscape($event)"
  >
    <nav-header ref='navheader'
      :user="user"
      :authCB="doAuth"
      :signedOutCB="doSignout"
      :message="message"
      :crashEvent="crashEvent"
      :workspace="workspace"
      :wsToggle="toggleWS"
      :helpOverlay="helpOverlay"
    ></nav-header>
    <help-overlay
      v-bind:class="{ visible: helpOverlayEnabled == 1, hidden: helpOverlayEnabled == 0}"
    >
    </help-overlay>
    <workspace-manager
      :user="user"
      :otherUser="otherUser"
      :workspace="workspace"
      :publicWorkspace="publicWorkspace"
      v-bind:class="{ visible: wsEnabled == 1, hidden: wsEnabled == 0}"
      v-on:rerouteWorkspace="rerouteWorkspace"
      ref='workspacemanager'
      @readOnly="setReadOnly"
    ></workspace-manager>
    <control-panel ref='controlpanel'
      :user="dataUser"
      :workspace="workspace"
      :readOnly="readOnly"
      v-bind:class="{ visible: cpEnabled == 1, hidden: cpEnabled == 0}"
    ></control-panel>
    <sound-synth ref='soundsynth'
      v-bind:visible="visible"
      v-bind:user="dataUser"
      :workspace="workspace"
      :readOnly="readOnly"
      v-on:updateMessage="updateMessage"
      v-on:switchView="switchView"
    ></sound-synth>
    <beat-maker ref='beatmaker'
      v-bind:visible="visible"
      v-bind:user="dataUser"
      :workspace="workspace"
      :readOnly="readOnly"
      v-bind:cbcb="cbcb"
      v-on:updateMessage="updateMessage"
      v-on:switchView="switchView"
    ></beat-maker>
    <song-maker ref='songmaker'
      v-bind:visible="visible"
      v-on:animateSong="animateSong"
      v-bind:user="dataUser"
      :workspace="workspace"
      :readOnly="readOnly"
      v-bind:cbcb="cbcb"
      v-on:updateMessage="updateMessage"
      v-on:changeBMBank="changeBMBank"
      v-on:selectSMBank="selectSMBank"
      v-on:switchView="switchView"
    ></song-maker>
    <nav-footer
      v-bind:helpOverlay="helpOverlay"
    >
    </nav-footer>
  </div>
</template>

<script>
import SoundSynth from './SoundSynth'
import BeatMaker from './BeatMaker'
import ControlPanel from './ControlPanel'
import SongMaker from './SongMaker'
import HelpOverlay from './HelpOverlay'
import NavHeader from './NavHeader'
import NavFooter from './NavFooter'
import mutils from '../assets/movementUtils'
import soundBridge from '../assets/soundBridge'
import firebaseBridge from '../assets/instrumentDefs/firebaseBridge'
import Tone from '../assets/tone.js'
import StartAudioContext from 'startaudiocontext'
import HistoryModifier from './mixins/HistoryModifier'
import WorkspaceManager from './WorkspaceManager'
// import defLoader from '../assets/instrumentDefs/defLoader'
import soundsynthUtils from '../assets/soundsynthUtils'
import waveform from '../assets/instruments/waveform'

export default {
  name: 'daw',
  mixins: [HistoryModifier],
  components: {
    SoundSynth,
    BeatMaker,
    ControlPanel,
    SongMaker,
    HelpOverlay,
    NavHeader,
    NavFooter,
    WorkspaceManager
  },
  data: function () {
    return {
      visible: 'beatmaker',
      helpOverlayEnabled: 0,
      cpEnabled: 0,
      wsEnabled: 0,
      user: false,
      message: 'Welcome! Banger is in beta. If (when) anything goes wrong, just refresh!',
      workspace: 1,
      otherUser: false,
      readOnly: false,
      statusMessage: 'Current Status: Paused. Press space to play in the selected area.'
    }
  },
  mounted: function () {
    if (this.$route.params.otherUser) {
      this.otherUser = this.$route.params.otherUser
    }
    if (this.$route.params.workspaceId && this.$route.params.workspaceId !== this.workspace) {
      this.changeWorkspace(this.$route.params.workspaceId)
    }
    document.getElementsByClassName('loading-app')[0] && document.getElementsByClassName('loading-app')[0].remove() // get rid of pre vue loading info
    this.cbcb()
    StartAudioContext(Tone.context)
  },
  watch: {
    user: function (val1, val2) {
      if (val2 && !val1) {
        firebaseBridge.fbdb.ref('userDefs/' + val2).off()
        this.$router.push('/')
      }
    },
    '$route': function (to, from) {
      if (to.params.otherUser !== from.params.otherUser) {
        this.otherUser = to.params.otherUser
      }
      if (to.params.workspaceId !== from.params.workspaceId && (from.params.workspaceId !== undefined)) {
        this.changeWorkspace(to.params.workspaceId)
      }
    }
  },
  computed: {
    publicWorkspace: function () {
      return (![1, 2, 3, 4, 5, 6, 7, 8, 9].includes(this.workspace))
    },
    dataUser: function () {
      return this.otherUser || this.user
    }
  },
  methods: {
    updateMessage: function (message, statusUpdate = false) {
      this.message = message
      if (statusUpdate) { this.statusMessage = message }
      setTimeout(() => {
        this.message = this.statusMessage
      }, 3000)
    },
    toggleWS: function () {
      this.wsEnabled = !this.wsEnabled
    },
    setReadOnly: function (val) {
      this.readOnly = val
    },
    doAuth: function (user) {
      this.user = user
      let url = '/app/'
      if (this.otherUser) {
        url += this.otherUser + '/'
      }
      this.$router.push(url + this.workspace)
    },
    crashEvent: function () {
      console.log('crash event!')
      this.message = 'Web Audio has crashed, restarting nodes now. Should be back in no time.'
      this.$refs.songmaker.stopPlaying()
      this.$refs.beatmaker.stopPlaying()
      this.redoSound(this.$refs.songmaker.running, this.$refs.beatmaker.running)
    },
    redoSound: function (wasPlayingSM, wasPlayingBM) {
      soundBridge.reconstructInstruments(() => {
        waveform.analyser = waveform.newAnalyser()
        this.$refs.controlpanel.doSetEQ()
        this.$refs.soundsynth.redoDefs()
        StartAudioContext(Tone.context)
        if (wasPlayingSM) { this.$refs.songmaker.startPlaying() }
        if (wasPlayingBM) { this.$refs.beatmaker.startPlaying() }
      })
    },
    doSignout: function () {
      this.user = false
      this.$refs.songmaker.loading = false
      this.wsEnabled = false
    },
    forceFocus: function () {
      if (!this.wsEnabled) {
        this.$refs.app.focus()
      }
    },
    toggleCP: function (event) {
      if (event.shiftKey || event.metaKey) {
        if (this.visible === 'beatmaker') {
          let dest = this.getDest()
          dest.clearInstrumentRow()
        }
        return
      }
      this.cpEnabled = !this.cpEnabled
    },
    getDest: function () {
      if (this.wsEnabled) {
        return false
      }
      return this.$refs[this.visible]
    },
    switchView: function (component) {
      this.visible = component
    },
    noArg: function (functionName, event) {
      var dest = this.getDest()
      if (!dest) { return }
      if (event && (event.ctrlKey || event.shiftKey)) {
        if (this.visible === 'beatmaker' && ['moveLeft', 'moveRight'].includes(functionName)) {
          return dest.autoFill(functionName)
        } else if (['moveUp', 'moveDown'].includes(functionName)) {
          this.$refs['songmaker'].defs = this.$refs['soundsynth'].defs
          this.visible = mutils.switchView(this.visible, functionName)
          return
        }
      }
      if (functionName === 'spaceUp') {
        if (this.$refs['songmaker'].running && this.visible === 'beatmaker') {
          return
        } else if (this.$refs['beatmaker'].running && this.visible === 'songmaker') {
          return this.$refs['beatmaker'].stopPlaying() // for now
        }
      }
      dest[functionName]()
    },
    tabUp: function ($event) {
      if (this.visible !== 'beatmaker') { return }
      if (!this.$refs.beatmaker.deep) {
        return this.noArg('enterUp')
      }
      return this.$refs.beatmaker.$refs.beatmakerdeep.tabOver($event.shiftKey)
    },
    cbcb: function () {
      this.$refs.beatmaker.defs = this.$refs.soundsynth.defs1
      this.$refs.songmaker.defs = this.$refs.soundsynth.defs1
      this.$refs.soundsynth.idefLookup = soundsynthUtils.createIDefLookup(this.$refs.soundsynth.defs1)
    },
    changeBank: function (num, event) {
      var dest = this.getDest()
      if (!dest) { return }
      dest.changeBank(num - 1, dest.bankType, event.shiftKey, false, this.cbcb)
    },
    rerouteWorkspace: function (workspaceName) {
      let url = '/app/'
      if (this.otherUser) {
        url += this.otherUser + '/'
      }
      this.$router.push(url + workspaceName)
    },
    changeWorkspace: function (workspaceName) {
      this.workspace = workspaceName
      // defLoader.clearCookies()
      this.$nextTick(() => {
        this.$refs.songmaker.doFBBinding()
        this.$refs.soundsynth.clearWatchers()
        this.$refs.soundsynth.changeBank(0, 'soundBank', false, false, this.cbcb)
        this.$refs.controlpanel.doFBBinding()
        this.$refs.beatmaker.changeBank(0, 'beatBank', false)
        this.$refs.workspacemanager.loading = false
        if (this.wsEnabled && !this.publicWorkspace) { this.toggleWS() }
      })
    },
    oneArg: function (functionName, argument, event) {
      var dest = this.getDest()
      dest[functionName](argument)
    },
    twoArg: function (functionName, arg1, arg2, event) {
      var dest = this.getDest()
      if (event && event.metaKey) {
        return
      }
      if (event.key === 'R' && event.shiftKey) {
        return dest['randomize']()
      }
      if (event.key === 'D') {
        return this.noArg('backspace')
      }
      if (dest[functionName]) {
        dest[functionName](arg1, arg2)
      }
    },
    animateSong: function (col, curBeat) {
      if (curBeat === this.$refs.beatmaker.beatBankChoice) {
        this.$refs.beatmaker.animate(col, true)
      }
    },
    changeBMBank: function (bankNum) {
      this.$refs.beatmaker.changeBank(bankNum, 'beatBank')
    },
    selectSMBank: function () {
      this.$refs.songmaker.changeBank(this.$refs.beatmaker.beatBankChoice)
    },
    playSelected: function () {
      StartAudioContext(Tone.context)
      if (this.visible === 'soundsynth') {
        this.$refs.soundsynth.spaceDown()
        setTimeout(() => {
          this.$refs.soundsynth.spaceUp()
        }, 1000)
      } else {
        if (this.visible === 'beatmaker') {
          this.$refs.beatmaker.spaceUp()
        } else {
          this.$refs.songmaker.spaceUp()
        }
      }
    },
    helpOverlay: function (event, click, click2) {
      if (click || event.key === '?') {
        this.helpOverlayEnabled = !this.helpOverlayEnabled
        return
      }
      if (click2 && this.helpOverlayEnabled) {
        this.helpOverlayEnabled = !this.helpOverlayEnabled
      }
    },
    runEscape: function (event) {
      // todo: escape other possible popup tools as well
      return this.helpOverlay(event, false, true)
    }
  }
}
</script>

<style>
#daw {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 1px;
  width: auto;
  min-width: 1238px;
  border: 4px solid black;
  padding: 2px;
  outline: none;
  margin-bottom: 10px;
  flex: 1;
}

#daw div.hidden {
  display: none;
}
.view-choice-wrapper {
  display: inline-flex;
}
.view-button {
  padding: 4px;
  margin: 4px;
}
</style>
