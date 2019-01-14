AFRAME.registerComponent('albertmodel', {
  /**
    This component declaration interacts with the model of albert einstein. We wait for the model to load,
    which is signified by the addition of chidren to the parent object. Once loaded, we move the model to the to the center of the
    user's view.
   **/
  init: function () {
    // bind modelLoaded function:
    this.onModelLoad = AFRAME.utils.bind(this.onModelLoad, this);
    this.getBox = AFRAME.utils.bind(this.getBox, this);
    // And set the function to execute when the model finishes loading:
    this.el.addEventListener('model-loaded', this.onModelLoad);
  },
  // Update monitor:
  update: function () {
  },
  // The model-loaded event listener:
  onModelLoad: async function () {
    // That's cool and all, lets see if we can't get a bounding box:
    var bbox = await getBox(this.el.object3D);
    var xMid = (bbox.max.x + bbox.min.x) / 2;
    var zMid = (bbox.max.z + bbox.min.z) / 2;
    var yMid = (bbox.max.y + bbox.min.y) / 2;
    this.el.setAttribute('position', {x: -xMid, y: -yMid + 4, z: -zMid - 6});
  }, 
  getBox: async function(object){
    var bbox = await new THREE.Box3().setFromObject(object);
    return bbox;
  }
});
