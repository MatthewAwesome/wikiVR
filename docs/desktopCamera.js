/***************************************************************
****************************************************************
****************************************************************

Part of WIKIVR, a Wikipedia-based virtual reality experiment. 

Author: Matthew Ellis 
	 
All rights reserved, 2018. 

****************************************************************
***************************************************************
***************************************************************/

AFRAME.registerComponent('desktop-camera', {
	// All the magic reallly happens on init here! 
	schema: {
  	needsUpdate: {default: false},
  }, 
	init: function(){
		// remove the existing camera:
		this.el.sceneEl.addEventListener('camera-set-active', (evt) => {console.log(evt.detail);this.el.setAttribute('desktop-camera','needsUpdate',true)});  
	}, 
	// Need a updater. Basically, init gets called before the scene's camera gets injected. 
	// This means the active camera is not this one.    
	update: function(){
		console.log('camera updated'); 
		if(this.data && this.data.needsUpdate == true){
			// grab the existing scene camera. Inactivate it: 
			var existingCamera = this.el.sceneEl.querySelector('[camera]'); 
			existingCamera.setAttribute('camera','active',false); 
			// Add the new one! 
			var camera = document.createElement('a-camera'); 
			// Set camera attributes: 
			camera.setAttribute('id','camera'); 
			camera.setAttribute('look-controls',{enabled:true}); 
			camera.setAttribute('camera', 'active', true);
			// Give the camera a cursor: 
			var cursor = document.createElement('a-entity'); 
			cursor.setAttribute('id','camera-cursor'); 
			cursor.setAttribute('position',{x:0,y:0,z:-1}); 
			// cursor.setAttribute('geometry',{primitive:'ring',radiusInner:0.02,radiusOuter:0.03}); 
			// cursor.setAttribute('material',{color:'#ccc',shader:'flat',transparent:true,opacity:0}) 
			cursor.setAttribute('cursor',{fuse:true,fuseTimeout:500}); 
			var light = document.createElement('a-entity'); 
			light.setAttribute('light',{type:'spot',color:'#fff',angle:36,penumbra:0.67,intensity:0.5}); 
			cursor.appendChild(light); 
			camera.appendChild(cursor); 
			// Append parent entity: 
			this.el.appendChild(camera);
		}
	}
})