AFRAME.registerComponent('daydream-listener', {
  dependencies: ['raycaster', 'daydream-controls'],
  // insert a schema here:

  // Then what?
  init: function () {
    // Apparently trackpaddown and click are analogous events. Moreover, click is actually better,
    // at least for shooting lasers, that is.

    // Defining a sceneEl:
    var sceneEl = document.querySelector('a-scene');
    var cSoundEl = sceneEl.querySelector('#csound');
    // Firing lasers via trackpaddown. This may have some utility yet, so I'm leaving it here.
    this.el.addEventListener('trackpaddown', (e) => {
      console.log('track down: ');
      // console.log(e);
    });
    // Firing lasers via 'click'. As now, the preferred method.
    this.el.addEventListener('click', (e) => {
      // console.log(e);
      // var b = 1; 
      // // // We Can see what we are intersecting with the e.detail object that is associated with the event.
      // console.log(e.detail);
      // // Process the event and update the scene if necessary:
    });
    // A function for keep track of the beam. I see this being of use for triggering sounds when the beam
    // enters a target of interest.
    this.el.addEventListener('raycaster-intersection', function (e) {
      // console.log(e.detail);
      // cSoundEl.components.sound.playSound();
      for (var el in e.detail.els) {
        // console.log(e.detail.els[el].className);
        if (e.detail.els[el].className == 'interactive') {
          // cSoundEl.components.sound.playSound();
          break;
        }
      }
    });
  },
  update: function () {
    console.log('daydream-updated');
  }
});

// Some functions for handling page update.

// We should be able to add some data and stuff to this badboy and make sure
// information from the scene is available here.

// Think what we need to query and go from there!
