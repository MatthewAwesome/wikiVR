
AFRAME.registerComponent('raylight',{
	dependencies:['raycaster'], 
	init: function{
		this.el.setAttribute('raycaster',{recursive:true}); 
		// add a spotlight to it: 
		let light = document.createElement('a-entity'); 
    light.setAttribute('light',{type:'spot',color:'#ccc',angle:15,penumbra:0.67,}); 
    this.el.appendChild(light); 
	}
})