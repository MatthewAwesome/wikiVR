// This is going to contain everthing! 

// A user component: 
AFRAME.registerComponent('user', {
	
})

/* 
	A Wiki-section component. 
	Sections navigate the user to different section when clicked. 
*/
AFRAME.registerComponent('wikisection', {
	// The section need only the section object, 
	// and maybe a couple of handlers. Plug these in as needed. 
	section: {default:{}},
})

/* 
	A Wiki-link component:
	Links change the scene to a different page when clicked. 
*/
AFRAME.registerComponent('wikilink', {
	schema:{
		title:{default:''}, 
		pageid:{default:''},
	}
})

/* 
	A Wiki-scene component:
	The scene is populated with section and link things. 
*/
AFRAME.registerComponent('wikiscene', {
  schema: {
  	title: {default: 'Albert_Einstein'},
    pagedata:{default:{}},
    currentSection:{default:{}},
  }, 
	init: async function(){
		// Pull page data: 
		var wikiData = await wtf.fetch(this.data.title);
		this.constructPage(wikiData); 

		this.el.setAttribute('wikiscene',{pagedata:wikiData}); 
		// register to system. Which will handle the the addition os sections, etc. 
		this.el.sceneEl.systems.wiki.registerPage(this);
		this.el.setAttribute('rotation', {x: 0, y: 180, z: 0}); 
		// We should add the binding circle: 
		var bindingCircle = document.createElement('a-ring'); 
    bindingCircle.setAttribute('radius-outer',24); 
    bindingCircle.setAttribute('radius-inner',18); 
    bindingCircle.setAttribute('color','#BA55D3'); 
    bindingCircle.setAttribute('rotation',{x:-90,y:0,z:0}); 
    this.el.appendChild(bindingCircle);
	}, 
	// To construct the page: 
	constructPage: async function(wikiData){
		// filter sections: 
		var sections = wikiData.sections().filter(x => sectionChecker(x.data.title)).filter( y => y.depth == 0); 
		if(sections.length == 0){
      // We only care about the links in here: 
      var links  = wikiData.sections(0).links();
      for(let i = 0; i < links.length; i++){
      	// we want to place these links into the wikiscene component. 
      }
    }
    else{
      // We run into trouble if we have less than three segments. So.. 
      if(sections.length < 3){
        var v1 = await new THREE.Vector3(24,0,0); 
        if(sections.length == 2){
          var vertices = [v1]; 
        }
        else{
          var v2 = await new THREE.Vector3(-24,0,0); 
          var vertices = [v1,v2]; 
        }
      }
      else{
        var circGeo = await new THREE.CircleGeometry(24, sections.length);
        var vertices = circGeo.vertices.slice(2); 
        vertices.reverse().unshift(circGeo.vertices[1]);  
      }
      if(vertices != null){
        for(let s = 0; s < sections.length; s++){
          var theta = s * (360 / sections.length);
          var sectionEl = await this.constructSection(sections[s],sections,s,theta,vertices);      
          this.el.appendChild(sectionEl); 
        }
      }
    }
	},
	// To construct a section when a user navigate out of page_main. 
  constructSection: async function(baseSection,sections,index,theta,vertices){
    var newEntity = document.createElement('a-entity');
    var height = 10; 
    // Construct column
    var cyl = makeColumn(1.5,height); 
    // Toss some text up ther: 
    var text = await createTextEl(baseSection.data.title,theta,index); 
    // And then we have to build it up! 
    newEntity.appendChild(cyl); 
    // newEntity.appendChild(plane); 
    newEntity.appendChild(text); 
    // We set them up this way with x --> vert.y and z --> vert.x because we want to work in the x-z plane 
    // as opposed to the x-y plane. 
    newEntity.setAttribute('position', {x: vertices[index].y, y: 0, z: vertices[index].x});
    // Again, we rotate via -theta since we are in the x-z plane! 
    newEntity.setAttribute('rotation',{x:0,y:-theta,z:0}); 
    var lineEl = await document.createElement('a-plane');
    lineEl.setAttribute('height',0.2); 
    lineEl.setAttribute('width',20); 
    lineEl.setAttribute('material',{color:"#888888",transparent:true,opacity:0.25}); 
    lineEl.setAttribute('rotation',{x:-90,y:90,z:0}); 
    lineEl.setAttribute('position',{x:0,y:0.1,z:-14}); 
    lineEl.setAttribute('id','lineEl'); 
    newEntity.appendChild(lineEl); 
    newEntity.setAttribute('section',{section:baseSection}); 
    // Add the handlers to catch box; 
    newEntity.addEventListener('raycaster-intersected', function(e){
      if(e.currentTarget != null){
        var sectionDetails = e.currentTarget.getAttribute('wikisection'); 
        var children = sectionDetails; 
        // var id = "#"  + e.currentTarget.id; 
        var cSoundEl = document.querySelector('#csound');
        cSoundEl.components.sound.playSound();
        // Change the line color: 
        var lineEl = e.currentTarget.querySelector('#lineEl'); 
        lineEl.setAttribute('material',{color:"#EEEEEE",transparent:true,opacity:0.9})
        // Update the text: 
        var text = e.currentTarget.querySelector('#sectionText'); 
        text.setAttribute('visible',true); 
        // Update the scale of the portal: 
        var portal = e.currentTarget.querySelector('#portal'); 
        portal.setAttribute('scale',{x:1,y:1,z:1}); 
      }
    })
    newEntity.addEventListener('raycaster-intersected-cleared', function(e){
      // Which element are we looking at? 
      if(e.currentTarget != null){
        // Change things back: 
        var cSoundEl = document.querySelector('#csound');
        cSoundEl.components.sound.stopSound();
        var lineEl = e.currentTarget.querySelector('#lineEl'); 
        lineEl.setAttribute('material',{color:"#888888",transparent:true,opacity:0.25})
        var text = e.currentTarget.querySelector('#sectionText'); 
        text.setAttribute('visible',false); 
        var portal = e.currentTarget.querySelector('#portal'); 
        portal.setAttribute('scale',{x:0.6,y:0.6,z:0.6}); 
      }
    })  

    newEntity.setAttribute('class', 'sectionObject');

    // New entity, we can add the section info here!!! And get the data on click! 
  

    return newEntity
    // Level by level, we build the section tower: 
  }
}); 
// A System to act as the brains of it all: 
AFRAME.registerSystem('wiki', {

	// Our class has to have all sorts of methods and stuff: 

	// Let's start with init: 
	init: async function(){
		// init is used to define the initial state. What does our system care about: 
	}, 
	// This function is called when a new page is registered. Sections are plopped, etc. 
	registerPage: async function(wikiComponent){
		// Add sections to the wikiComponent! 
		console.log('registering page!')
	},
	updatePage: async function(){

	}, 
	updateSection: async function(){

	},
})


// Some helper functions down here: 
function sectionChecker (sectTitle) {
  const badHeadings = ['content', 'See also', 'Notes', 'References', 'External links', 'Further reading', 'Sources'];
  const badStrings = [/publications/gi, /notes/gi, /references/gi, /citations/gi, /sources/gi];
  var index = badHeadings.indexOf(sectTitle);
  var searches = true;
  if (index != -1) {
		// We've matched a bad heading
    return false;
  } else {
		// we check further:
    var result;
    for (var s in badStrings) {
      result = sectTitle.search(badStrings[s]);
      if (result != -1) {
        break;
      }
    }
    // we handl
    if (result == -1 && sectTitle.length != 0) {
      return true;
    } else {
      return false;
    }
  }
}

// To make a portal thingy: 
function makeColumn(radius,height){
  // We have a column container: 
  var column = document.createElement('a-entity'); 
  // Which contains 1: a cylinder: 
  var cylEl = document.createElement('a-cylinder');
  cylEl.setAttribute('color',"#00CE00");
  cylEl.setAttribute('radius',radius);
  cylEl.setAttribute('height',height);
  cylEl.setAttribute('segments-radial',12);
  cylEl.setAttribute('metalness',0.1);
  cylEl.setAttribute('roughness',0.8);
  cylEl.setAttribute('side','double');
  cylEl.setAttribute('position',{x:0,y:height/2,z:0});
  // cylEl.setAttribute('class', 'interactive');
  var torusOne = document.createElement('a-torus'); 
  torusOne.setAttribute('color',"#00CE22"); 
  torusOne.setAttribute('radius',radius*2);
  torusOne.setAttribute('segments-radial',16); 
  torusOne.setAttribute('segments-tubular',12); 
  torusOne.setAttribute('radius-tubular',0.25); 
  torusOne.setAttribute('animation',{property:'rotation',to:{x:0,y:0,z:360},loop:true,dur:6000,easing:'linear',direction:'normal'});
  torusOne.setAttribute('position',{x:0,y:radius*2+0.5,z:-radius-0.5}); 
  torusOne.setAttribute('metalness',0.22); 
  // and 2: A portal torus: 
  var torusTwo = document.createElement('a-torus'); 
  torusTwo.setAttribute('color',"#00CE22"); 
  torusTwo.setAttribute('radius',radius*2);
  torusTwo.setAttribute('segments-radial',16); 
  torusTwo.setAttribute('segments-tubular',12); 
  torusTwo.setAttribute('radius-tubular',0.15); 
  torusTwo.setAttribute('animation',{property:'rotation',from:{x:0,y:0,z:-180},to:{x:0,y:0,z:180},loop:true,dur:8000,easing:'linear',direction:'normal'});
  torusTwo.setAttribute('position',{x:0,y:radius*2+0.5,z:-radius+0.25}); 
  torusTwo.setAttribute('metalness',0.2); 
  torusTwo.setAttribute('side','double')
  // a black-hole, too: 
  var blackHole = document.createElement('a-circle');
  blackHole.setAttribute('material',{color:'#222',transparent:true,opacity:0.6}); 
  blackHole.setAttribute('radius',radius*2-0.5);
  blackHole.setAttribute('position',{x:0,y:radius*2+0.5,z:-radius-1});    
  blackHole.setAttribute('side','double');
  blackHole.setAttribute('text',{value:'?',color:'white',side:'front',align:'center',baseline:'center',font:'sourcecodepro',wrapCount:1,width:radius*2,height:radius*2});
  blackHole.setAttribute('rotation',{x:0,y:180,z:0}); 
  // blackHole.setAttribute('class', 'interactive');
  // MAKE THE BLACKHOLE THE ENTITY WITHIN WHICH WE INTERACT! 
  // PERHAPS WE MAKE A BOUNDING BOX OF THE COLUMN ENTITY AND INTERACT WITH THAT? 
  column.appendChild(torusTwo); 
  column.appendChild(torusOne); 
  column.appendChild(blackHole);
  column.setAttribute('id','portal'); 
  column.setAttribute('scale',{x:0.6,y:0.6,z:0.6}); 

  // return the column! 
  return column;
}

// Adding text to the scene: 
async function createTextEl (str, theta,index) { 
  var value = 'Section ' + (index+1);  
  var textEl = document.createElement('a-entity');
  textEl.setAttribute('geometry',{primitive:'plane',height:'auto',width:'auto'}); 
  textEl.setAttribute('material',{color:'#222',transparent:'true',opacity:0.5}); 
  textEl.setAttribute('text',{value:str,color:'white',side:'double',align:'center',baseline:'center',font:'dejavu',wrapCount:str.length+2});;  
  textEl.setAttribute('side', 'double');
  textEl.setAttribute('scale',{x: 12, y: 12, z: 12})
  textEl.setAttribute('position', {x: 0, y: 6.25, z: -10});
  textEl.setAttribute('rotation', {x: 0, y: 180, z: 0});
  textEl.setAttribute('id','sectionText'); 
  textEl.setAttribute('visible',false); 
  return textEl;
}


