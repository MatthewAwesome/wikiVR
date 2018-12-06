/***************************************************************
****************************************************************
****************************************************************

Part of WIKIVR, a Wikipedia-based virtual reality experiment. 

Author: Matthew Ellis 
   
All rights reserved, 2018. 

****************************************************************
***************************************************************
***************************************************************/

/**********
This is an umbrella component that handles into and out-of VR events. That's really it. 
**********/


AFRAME.registerComponent('einstein', {
  init: function () {
    // Set event handlers for enter/leave VR:
    this.intoVR  = AFRAME.utils.bind(this.intoVR,this);
    this.outOfVR = AFRAME.utils.bind(this.outOfVR,this);
    this.el.addEventListener('enter-vr', this.intoVR);
    this.el.addEventListener('exit-vr', this.outOfVR);
  },
  // Handling the transisition to VR:
  intoVR: async function () {
    // Getting some entities: 
    let sceneCamera        = this.el.sceneEl.querySelector("#scenecam");
    let daydreamController = sceneCamera.querySelector('#lasers');
    let cursor             = await sceneCamera.querySelector('[cursor]'); 
    // Updating the entities for VR: 
    if(cursor){
      cursor.parentNode.removeChild(cursor); 
    }
    daydreamController.setAttribute('light',{type:'spot',color:'#fff',angle:18,penumbra:0.67,intensity:0.5}); 
    daydreamController.setAttribute('user',{inVR:true});
  },
  // Transition out of VR: 
  outOfVR: function () {
    // Essentially doing the opposite of intoVR(). 
    let cursor             = document.createElement('a-entity'); 
    let sceneCamera        = this.el.sceneEl.querySelector("#scenecam");
    let camera             = sceneCamera.querySelector('[camera]'); 
    let light              = document.createElement('a-entity'); 
    let daydreamController = sceneCamera.querySelector('#lasers');
    // Set the attributes:
    cursor.setAttribute('id','camera-cursor'); 
    cursor.setAttribute('position',{x:0,y:0,z:-1}); 
    cursor.setAttribute('geometry',{primitive:'ring',radiusInner:0.02,radiusOuter:0.03}); 
    cursor.setAttribute('material',{color:'#ccc',shader:'flat'}) 
    cursor.setAttribute('cursor',{fuse:true,fuseTimeout:500});     
    light.setAttribute('light',{type:'spot',color:'#fff',angle:18,penumbra:0.67,}); 
    // Package 'em together:
    cursor.appendChild(light);
    camera.appendChild(cursor); 
    // Reset some things on daydreamController: (remove light and set inVR as false)
    daydreamController.setAttribute('user',{inVR:false}); 
    daydreamController.removeAttribute('light'); 
  }
});



