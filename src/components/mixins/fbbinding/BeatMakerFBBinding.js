import firebaseBridge from '../../../assets/instrumentDefs/firebaseBridge'

module.exports = {
  methods: {
    doFBBinding: function (beatBankNum, cb) {
      this.loading = true
      firebaseBridge.bmdefRef(this.user, this.workspace, this.beatBankChoice).on('value', snapshot => {
        this.loading = false
        let v = snapshot.val()
        if (!v || !Object.keys(v).length) {
          this.loadBeat(this.beatBankChoice)
        } else {
          this.perMeasure = v.perMeasure
          this.dataArray = v
          if (cb) {
            cb()
          }
        }
      })
    }
  }
}
