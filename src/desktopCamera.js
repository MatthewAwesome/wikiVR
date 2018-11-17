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
	init: function(){
		//We append this element with some stuff. Namely a camera and cursor: 
		var camera = document.createElement('a-camera'); 
		// Set camera attributes: 
		camera.setAttribute('id','camera'); 
		camera.setAttribute('look-controls'); 
		camera.setAttribute('position',{x:0,y:1.6,z:0}); 
		camera.setAttribute('active',true);
		// Give the camera a cursor: 
		var cursor = document.createElement('a-entity'); 
		cursor.setAttribute('id','camera-cursor'); 
		cursor.setAttribute('position',{x:0,y:0,z:-1}); 
		cursor.setAttribute('geometry',{primitive:'ring',radiusInner:0.02,radiusOuter:0.03}); 
		cursor.setAttribute('material',{color:'#ccc',shader:'flat'}) 
		cursor.setAttribute('cursor',{fuse:true,fuseTimeout:500}); 
		var light = document.createElement('a-entity'); 
		light.setAttribute('light',{type:'spot',color:'#fff',angle:18,penumbra:0.67,}); 
		cursor.appendChild(light); 
		camera.appendChild(cursor); 
		// Append parent entity: 
		this.el.appendChild(camera); 
		// That should do it! 
	}
})