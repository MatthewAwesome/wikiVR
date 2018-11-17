// A little component to combine a cursor and light into a single thing. 
AFRAME.registerComponent('cursor-light', {
	init: function(){
		// set Cursor attributes: 
		this.el.setAttribute('position',{x:0,y:0,z:-1}); 
		this.el.setAttribute('geometry',{primitive:'ring',radiusInner:0.02,radiusOuter:0.03}); 
		this.el.setAttribute('material',{color:'#ccc',shader:'flat'}) 
		this.el.setAttribute('cursor',{fuse:true,fuseTimeout:500}); 
		var light = document.createElement('a-entity'); 
		light.setAttribute('light',{type:'spot',color:'#fff',angle:18,penumbra:0.67,}); 
		this.el.appendChild(light); 
	}
})