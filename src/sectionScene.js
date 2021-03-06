// An aframe script to display content of a wikipedia article in a section-wise format. 

// NEED A NAMING CONVENTION FOR OUR ENTITIES! 
// THE IDENTITY CONTROLS HOW THINGS RESPOND UPON INTERSECTION, CLICK, ETC! 

const einsteinImages = [
  'https://upload.wikimedia.org/wikipedia/commons/a/ad/Albert_Einstein_as_a_child.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/1/10/Albert_Einstein_photo_1920.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/d/d5/Niels_Bohr_Albert_Einstein_by_Ehrenfest.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a0/NYT_May_4%2C_1935.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/e/e2/Albert_Einstein_and_Charlie_Chaplin_-_1931.jpg'
];

// THE STUFF THAT HAPPENS BELOW IS AFRAME MAGIC: 
AFRAME.registerComponent('wiki', {
  dependencies: ['raycaster'],
  schema: {
  	title: {default: 'Albert_Einstein'},
  	sections: {default: []},
  	currentSection: {default: ''},
  	level: {default: 0}
  },
  // insert a schema here:

  // Then what? init and update architecture:
  init: async function () {
    var sceneEl = document.querySelector('a-scene');
    // Binding some methods
    this.sceneConstructor = AFRAME.utils.bind(this.sceneConstructor, this);
    this.constructSection = AFRAME.utils.bind(this.constructSection, this);
    // Bring in the WTF: 
    var wtfStuff = await wtf.fetch(this.data.title);
    // We want to construct our scenes using only the good sections: 
  	var sectionStuff = wtfStuff.data.sections; 
  	// The section array will get filled in.
  	this.el.setAttribute('wiki', {sections: sectionStuff});
    // We rotate via 180 to line the user up with the first entity. 
    this.el.setAttribute('rotation', {x: 0, y: 180, z: 0}); 
    // We should filter the sections here! 
    var filteredSections  = sectionStuff.filter( x => sectionChecker(x.data.title)).filter( y => y.depth == 0); 
    // Tossing a binding circle onto it! 
    var bindingCircle = document.createElement('a-ring'); 
    bindingCircle.setAttribute('radius-outer',24); 
    bindingCircle.setAttribute('radius-inner',18); 
    bindingCircle.setAttribute('color','#BA55D3'); 
    bindingCircle.setAttribute('rotation',{x:-90,y:0,z:0}); 
    sceneEl.appendChild(bindingCircle);
  	// Using sections, we can construct a scene:
  	await this.sceneConstructor(this.el,filteredSections);
  },
  // UPDATE: WE HANDLE USER INTERACTION HERE! 
  update: async function () {
  	console.log('wiki update');

    // BASICALLY, WE CHECK THE DATA AND SEE WHAT CHANGED...AND UPDATE OUR SCENE ACCORDINGLY. 

  	// Now, we can update the scene accordingly:

  	// Filter sections according to current section/level...

  	// plop stuff in the scene

  	// move the camera (if necessary)

  	// do it!
  }, 
  // A METHOD TO CONSTRUCT OUR SCENE: 
  sceneConstructor: async function(el,sections){
    // Lets filter the scenes, removing the ones we don't care about:
    if(sections.length == 0){
      // we need to make this work... 
    }
    else{
      // We run into trouble if we have less than three segments. So.. 
      if(sections.length < 3){
        var v1 = await new THREE.Vector3(24,0,0); 
        var v2 = await new THREE.Vector3(-24,0,0); 
        var vertices = [v1,v2]; 
      }
      else{
        var circGeo = await new THREE.CircleGeometry(24, sections.length);
        var vertices = circGeo.vertices.slice(2); 
        vertices.reverse().unshift(circGeo.vertices[1]);  
        console.log(circGeo.vertices);
      }
      if(vertices != null){
        for(let s = 0; s < sections.length; s++){
          var theta = s * (360 / sections.length);
          var sectionEl = await this.constructSection(sections[s],sections,s,theta,vertices); 
          var idStr = 'section_' + (s+1); 
          sectionEl.setAttribute('id',idStr);        
          el.appendChild(sectionEl); 
        }
      }
    }
  }, 
  // A METHOD TO CONSTRUCT AN INDIVIDUAL SECTION (KEEPING IT MODULAR). 
  constructSection: async function(baseSection,sections,index,theta,vertices){
    var newEntity = document.createElement('a-entity');
    var height = 10; 
    // Construct column
    var cyl = makeColumn(1.5,height); 
    // We can have a circle to bind the elements: 

    if(this.data.title == 'Albert_Einstein'){
      // make box: 
      // var imageBox = makeImageBox(index,height); 
      // console.log('ImageBox', imageBox);
      // newEntity.appendChild(imageBox); 
    }
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
    // what about a line: 

    // oh, how about a 10x10x10 box to catch the beam: 
    var catchBox = await document.createElement('a-box'); 
    catchBox.setAttribute('depth', 10);
    catchBox.setAttribute('width', 10);
    catchBox.setAttribute('height', 10);
    catchBox.setAttribute('position',{x:0,y:5,z:0});
    catchBox.setAttribute('material',{transparent:true,opacity:0}); 
    // catchBox.setAttribute('wireframe',true);
    // catchBox.setAttribute('opacity',1);

    // Add the handlers to catch box; 
    catchBox.addEventListener('raycaster-intersected', function(e){
      // Fire the sound: 
      // console.log('CATCHBOX',e);
      if(e.currentTarget != null){
        console.log('INTERSECTED!',e.currentTarget.parentEl)
        // var id = "#"  + e.currentTarget.id; 
        var cSoundEl = document.querySelector('#csound');
        cSoundEl.components.sound.playSound();
        // // Change the line color: 
        // var elToUpdate = document.querySelector(id); 
        var lineEl = e.currentTarget.parentEl.querySelector('#lineEl'); 
        lineEl.setAttribute('material',{color:"#EEEEEE",transparent:true,opacity:0.9})
      }

      // via e.target, we can flash some stuff here, do some stuff, to let the user know they have intersected this section. 
      // similarly, we can do stuff onClick, or buttonPress, and update the scene. 

    })
    catchBox.addEventListener('raycaster-intersected-cleared', function(e){
      // Which element are we looking at? 
      if(e.currentTarget != null){
        // Change things back: 
        var cSoundEl = document.querySelector('#csound');
        cSoundEl.components.sound.stopSound();
        var lineEl = e.currentTarget.parentEl.querySelector('#lineEl'); 
        lineEl.setAttribute('material',{color:"#888888",transparent:true,opacity:0.25})
      }

      // via e.target, we can flash some stuff here, do some stuff, to let the user know they have intersected this section. 
      // similarly, we can do stuff onClick, or buttonPress, and update the scene. 

    })  

    newEntity.appendChild(catchBox);
    newEntity.setAttribute('class', 'interactive');

    return newEntity
    // Level by level, we build the section tower: 
  }
});

// END OF AFRAME COMPONENT CLASS. 

// Some helper functions. (these don't need to be bound to our component class; i.e. we make no references to this.)

// Function to make a cylinder: 
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
  cylEl.setAttribute('class', 'interactive');
  var torusOne = document.createElement('a-torus'); 
  torusOne.setAttribute('color',"#00CE22"); 
  torusOne.setAttribute('radius',radius*2);
  torusOne.setAttribute('segments-radial',16); 
  torusOne.setAttribute('segments-tubular',12); 
  torusOne.setAttribute('radius-tubular',0.25); 
  // torusOne.setAttribute('animation',{property:'rotation',to:{x:0,y:0,z:360},loop:true,dur:6000,easing:'linear',direction:'normal'});
  torusOne.setAttribute('position',{x:0,y:radius*2+0.5,z:-radius-0.5}); 
  torusOne.setAttribute('metalness',0.22); 
  // torusOne.setAttribute('class', 'interactive');
  // and 2: A portal torus: 
  var torusTwo = document.createElement('a-torus'); 
  torusTwo.setAttribute('color',"#00CE22"); 
  torusTwo.setAttribute('radius',radius*2);
  torusTwo.setAttribute('segments-radial',16); 
  torusTwo.setAttribute('segments-tubular',12); 
  torusTwo.setAttribute('radius-tubular',0.15); 
  // torusTwo.setAttribute('animation',{property:'rotation',from:{x:0,y:0,z:-180},to:{x:0,y:0,z:180},loop:true,dur:8000,easing:'linear',direction:'normal'});
  torusTwo.setAttribute('position',{x:0,y:radius*2+0.5,z:-radius+0.25}); 
  torusTwo.setAttribute('metalness',0.2); 
  // torusTwo.setAttribute('class', 'interactive');
  torusTwo.setAttribute('side','double')
  // a black-hole, too: 
  var blackHole = document.createElement('a-circle');
  // blackHole.setAttribute('color','#111111');
  blackHole.setAttribute('material',{color:'#222'}); 
  blackHole.setAttribute('radius',radius*2);
  blackHole.setAttribute('position',{x:0,y:radius*2+0.5,z:-radius-0.1});    
  blackHole.setAttribute('side','double');
  blackHole.setAttribute('text',{value:'?',color:'white',side:'front',align:'center',baseline:'center',font:'sourcecodepro',wrapCount:1,width:radius*2,height:radius*2});
  blackHole.setAttribute('rotation',{x:0,y:180,z:0}); 
  blackHole.setAttribute('class', 'interactive');
  // blackHole.addEventListener('raycaster-intersected', function(){
  //   console.log('INTERSECTED!!!!')
  // })
  // blackHole.setAttribute('transparent',true); 
  // blackHole.setAttribute('opacity',1.0);

  // Rotate the portal: 

  // Put the cylinder and torus together to make the column!
  // column.appendChild(cylEl); 
  column.appendChild(torusTwo); 
  column.appendChild(torusOne); 
  column.appendChild(blackHole);
  column.setAttribute('id','portal'); 
  // return the column! 
  return column;
}

// Function to make a platform: 
function makePlatform(radius,level,height){
  var rep = 16 / (2 ** (level-1)); 
  var planeEl = document.createElement('a-circle'); 
  planeEl.setAttribute('radius',radius);
  planeEl.setAttribute('material',{src:"./assets/floorTexture.png",transparent:true,repeat:{x:rep,y:rep},side:'double',color:'#0FA'}); 
  if(level == 1){
     planeEl.setAttribute('rotation',{x:-90,y:0,z:0}); 
  }
  planeEl.setAttribute('position',{x:0,y:height,z:0});
  return planeEl; 
}

// Adding text to the scene: 
async function createTextEl (str, theta,index) { 
  var value = 'Section ' + (index+1);  
  var textEl = document.createElement('a-entity');
  textEl.setAttribute('geometry',{primitive:'plane',height:'auto',width:'auto'}); 
  textEl.setAttribute('material',{color:'#222',transparent:'true',opacity:0.5}); 
  textEl.setAttribute('text',{value:value,color:'white',side:'double',align:'center',baseline:'center',font:'dejavu',wrapCount:value.length+2});;  
  // textEl.setAttribute('align', 'center');
  // textEl.setAttribute('anchor', 'center');
  // textEl.setAttribute('baseline', 'bottom');
  // textEl.setAttribute();
  textEl.setAttribute('side', 'double');
  textEl.setAttribute('scale',{x: 12, y: 12, z: 12})
  textEl.setAttribute('position', {x: 0, y: 6.25, z: -10});
  textEl.setAttribute('rotation', {x: 0, y: 180, z: 0});
  textEl.setAttribute('id','sectionText'); 
  // textEl.setAttribute('font', 'dejavu');
  // textEl.setAttribute('color','white')
  
  return textEl;
}

// A function to add image boxes to scene: 
function makeImageBox(i,height){
  var box = document.createElement('a-box');
  box.setAttribute('depth', 8);
  box.setAttribute('width', 8);
  box.setAttribute('height', 8);
    // box.setAttribute('color','#000');
  box.setAttribute('src', einsteinImages[i]);
  box.setAttribute('class', 'interactive');
  box.setAttribute('rotation',{x:-12,y:0,z:0})
  // box.setAttribute('animation',{property:'rotation',to:{x:360,y:0,z:0},loop:true,dur:6000,easing:'linear',direction:'normal'});
  // elevate the box to plane height: 
  box.setAttribute('position',{x:0,y:height+5,z:0}); 
  return box
}

// Seeing how many levels we must assemble: 
function getLevels(currentSection,sections){
    var childrenSections = sections.filter(
    (x) =>  {
      if(x.number.startsWith(currentSection.number) == true && x.toclevel == currentSection.toclevel + 1){
        return true
      }
      else{
        return false
      }
    }
  ); 
  // determine the maximum level: 
  var levels = childrenSections.map( x => x.toclevel); 
  var maxLevel = Math.max(...levels); 
  return maxLevel; 
}

// To get children sections: 
function getChildrenSections(currentSection,sections){
  var childrenSections = sections.filter(
    (x) =>  {
      if(x.number.startsWith(currentSection.number) == true && x.toclevel == currentSection.toclevel + 1){
        return true
      }
      else{
        return false
      }
    }
  ); 
  // return them: 
  return childrenSections; 
}

// changing this to work with wtf_wikipedia: 
// doc.data.sections ...this is an array of section objects; 
// to access sections data for the i-th section: sections[i].data.title

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

// a function for getting a bounding box: 
async function getBox (object) {
  var bbox = await new THREE.Box3().setFromObject(object);
  var newB = awa
  return bbox;
}
// We can do this agnostic to display right now!

// Get data into the container....then build up! #00ce00

// Think about what we need to do here....


  // We are going to put some children columns atop planeEl, if possible! 

  // var childrenSections = getChildrenSections(baseSection,sections); 
  // if(childrenSections.length > 0){
  //   if(childrenSections.length >= 3){
  //     var childCircle =  await new THREE.CircleGeometry(32, childrenSections.length);
  //     var verts = childCircle.vertices; 
  //   }
  //   else{
  //     var a = await new THREE.Vector3(0,0,0); 
  //     var b = await new THREE.Vector3(32,0,0); 
  //     var c = await new THREE.Vector3(-32,0,0); 
  //     var verts = [a,b,c]; 
  //   }
  //   for(let j = 0; j < childrenSections.length; j++){
  //     // We are adding to planeEl here! 
  //     var childCyl = makeColumn(3,30); 
  //     childCyl.setAttribute('rotation',{x:-90,y:0,z:0})
  //     var childPlane = makePlatform(16,2); 
  //     var childGroup = document.createElement('a-entity'); 
  //     childGroup.appendChild(childCyl); 
  //     childGroup.appendChild(childPlane); 
  //     childGroup.setAttribute('position', {x: verts[j+1].y, z: 30, y: verts[j+1].x});
  //     plane.appendChild(childGroup); 
  //   }
  // }

