// An aframe script to display content of a wikipedia article in a section-wise format. 

// NEED A NAMING CONVENTION FOR OUR ENTITIES! 
// THE IDENTITY CONTROLS HOW THINGS RESPOND UPON INTERSECTION, CLICK, ETC! 


// THE STUFF THAT HAPPENS BELOW IS AFRAME MAGIC: 

// This component exists in an entity with the ID of 'wikiscene'. 

AFRAME.registerComponent('wiki', {
  // dependencies: ['raycaster','daydream-controls'],
  schema: {
  	title: {default: 'Albert_Einstein'},
    pagedata:{default:{}},
    currentSection:{default:{}},
    loaded:{default:false},
    clicked:{default:false}
  },
  init: async function () {
    var sceneEl = document.querySelector('a-scene');
    var wikiEl = document.querySelector('#wikiscene');
    // Binding some methods
    this.sceneConstructor = AFRAME.utils.bind(this.sceneConstructor, this);
    this.constructSection = AFRAME.utils.bind(this.constructSection, this);
    // Get the page data: 
    var wikiData = await wtf.fetch(this.data.title);
    wikiEl.setAttribute('wiki',{pagedata:wikiData}); 
    // We want to construct our scenes using only the good sections: 
  	var sectionStuff = wikiData.sections(); 
    // We rotate via 180 to line the user up with the first entity. 
    this.el.setAttribute('rotation', {x: 0, y: 180, z: 0}); 

    // Okay, lets give wikiscene a child, which will be a group that contains section and/or link objects. 

    // We should filter the sections here! 
    var filteredSections  = sectionStuff.filter( x => sectionChecker(x.data.title)).filter( y => y.depth == 0); 
    // Some pages have NO good sections, they are a single section thing. Account for this: 
    if(filteredSections.length == 0){
      // The data we care about exists in the first section! 
      filteredSections = wikiData.sections(0); 
    }
    // Tossing a binding circle onto it! 
    var bindingCircle = document.createElement('a-ring'); 
    bindingCircle.setAttribute('radius-outer',24); 
    bindingCircle.setAttribute('radius-inner',18); 
    bindingCircle.setAttribute('color','#BA55D3'); 
    bindingCircle.setAttribute('rotation',{x:-90,y:0,z:0}); 
    sceneEl.appendChild(bindingCircle);
  	// Using sections, we can construct a scene:
  	var check = await this.sceneConstructor(this.el,filteredSections);
    console.log('loaded...', check)
    // after all that stuff is done, we mark it as loaded: 
     // wikiEl.setAttribute('wiki',{loaded:true}); 
  },
  // UPDATE: WE HANDLE USER INTERACTION HERE! 
  update: async function () {
    try{
    	console.log('new wikidata');
      console.log(this);
      // This gets fired when the page load, that damn auto-click on aframe load is damn annoying. 
      if(this.oldData.loaded == false && this.data.loaded == true){

        // change loaded to true, reset section to an empty object. 
        var wikiEl = document.querySelector('#wikiscene');
        wikiEl.setAttribute('wiki',{loaded:true,currentSection:{}}); 
      }
      // Await a change in section: 
      if(this.data.title == this.oldData.title && this.data.loaded == true){
        // Has the user encountered 
        console.log('updating page stuff')
        if(this.data.currentSection != this.oldData.currentSection && this.data.currentSection != {}){
          // get all section nodes and remove them: 
          var sectionEls = this.el.querySelectorAll('.sectionObject'); 
          for(let i = 0; i < sectionEls.length; i++){
            console.log(sectionEls[i]); 
            this.el.removeChild(sectionEls[i]); 
          }
          // bring in the new: 
          var sectionChildren = this.data.currentSection.children(); 
          var links           = this.data.currentSection.links(); 
          console.log(sectionChildren,links);

          // update the color? (let user know they are in a different space so to speak)
        }
      }
      else{
        console.log('new page');
      }
    }
    catch(err){
      console.log('Error in update: ',err); 
    }

    // console.log(this.data.title); 
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
      // we have to display a bunch of links, and only links! 
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
          sectionEl.addEventListener('click', (e) => {onSectionClick(e)});      
          el.appendChild(sectionEl); 
        }
      }
    }
    return true
  }, 
  // A METHOD TO CONSTRUCT AN INDIVIDUAL SECTION (KEEPING IT MODULAR). 
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
    // what about a line: 

    // oh, how about a 10x10x10 box to catch the beam: 
    var catchBox = await document.createElement('a-box'); 
    catchBox.setAttribute('depth', 8);
    catchBox.setAttribute('width', 8);
    catchBox.setAttribute('height', 8);
    catchBox.setAttribute('position',{x:0,y:4,z:0});
    catchBox.setAttribute('material',{transparent:true,opacity:0}); 
    catchBox.setAttribute('class','interactive');

    // Add the handlers to catch box; 
    catchBox.addEventListener('raycaster-intersected', function(e){
      if(e.currentTarget != null){
        var sectionDetails = e.currentTarget.parentEl.getAttribute('section'); 
        var children = sectionDetails; 
        // var id = "#"  + e.currentTarget.id; 
        var cSoundEl = document.querySelector('#csound');
        cSoundEl.components.sound.playSound();
        // Change the line color: 
        var lineEl = e.currentTarget.parentEl.querySelector('#lineEl'); 
        lineEl.setAttribute('material',{color:"#EEEEEE",transparent:true,opacity:0.9})
        // Update the text: 
        var text = e.currentTarget.parentEl.querySelector('#sectionText'); 
        text.setAttribute('visible',true); 
        // Update the scale of the portal: 
        var portal = e.currentTarget.parentEl.querySelector('#portal'); 
        portal.setAttribute('scale',{x:1,y:1,z:1}); 

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
        var text = e.currentTarget.parentEl.querySelector('#sectionText'); 
        text.setAttribute('visible',false); 
        var portal = e.currentTarget.parentEl.querySelector('#portal'); 
        portal.setAttribute('scale',{x:0.6,y:0.6,z:0.6}); 
      }

      // via e.target, we can flash some stuff here, do some stuff, to let the user know they have intersected this section. 
      // similarly, we can do stuff onClick, or buttonPress, and update the scene. 

    })  
    // catchBox.addEventListener('click', function(e){
    //   console.log('clicked!!! BOX')
    //   console.log(e);


    // })
    newEntity.appendChild(catchBox);
    newEntity.setAttribute('class', 'sectionObject');

    // New entity, we can add the section info here!!! And get the data on click! 
    newEntity.setAttribute('section',{section:baseSection}); 

    return newEntity
    // Level by level, we build the section tower: 
  }
});

// END OF AFRAME COMPONENT CLASS. 

// Some helper functions. (these don't need to be bound to our component class; i.e. we make no references to 'this')

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
  textEl.setAttribute('text',{value:str,color:'white',side:'double',align:'center',baseline:'center',font:'dejavu',wrapCount:str.length+2});;  
  textEl.setAttribute('side', 'double');
  textEl.setAttribute('scale',{x: 12, y: 12, z: 12})
  textEl.setAttribute('position', {x: 0, y: 6.25, z: -10});
  textEl.setAttribute('rotation', {x: 0, y: 180, z: 0});
  textEl.setAttribute('id','sectionText'); 
  textEl.setAttribute('visible',false); 
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

function onSectionClick(e){
  if(e.currentTarget){
    console.log('click on target',e)
    var clickedSection =  e.currentTarget.getAttribute('section'); 
    var wikiEl = document.querySelector('#wikiscene');
    // Update the behavior of this function based on the attribute of wikiEl: 
    var wikiAtt = wikiEl.getAttribute('wiki'); 
    if(wikiAtt.clicked == false){
      console.log('first click');
      wikiEl.setAttribute('wiki',{clicked:true}); 
    }
    else{
      console.log('subsequent click'); 
      wikiEl.setAttribute('wiki',{currentSection:clickedSection}); 
    }
    
  }
}


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

