/***************************************************************
****************************************************************
****************************************************************

Part of WIKIVR, a Wikipedia-based virtual reality experiment. 

Author: Matthew Ellis 
	 
All rights reserved, 2018. 

****************************************************************
***************************************************************
***************************************************************/

// Some global constants: 
const baseSection = {data:{title:''}}; 

/************************************  
	A user component. 
	Allows user to navigate using various events. 
************************************/ 
AFRAME.registerComponent('user', {
	dependencies:['daydream-controls'],
  schema:{
    inVR:{default:false},
  },
	init: function(){
		// Add an event listener for the daydream controller: 
		this.el.addEventListener('trackpaddown', (e) => {this.el.sceneEl.systems.wiki.clicked()}); 
		// Add an event listener for the desktop site: 
		document.body.addEventListener( 'dblclick', (e) => {this.el.sceneEl.systems.wiki.clicked()});
    this.el.addEventListener('trackpadchanged', (e) => {console.log(e,'trackpadchanged')}); 
		// What about mobile, non-vr? (not essential; we are making VR shit). 
	}
}); 


/************************************ 
	A Wiki-section component. 
************************************/ 
AFRAME.registerComponent('wikisection', {
	// The section need only the section object,
	schema:{
		section: {default: {} },
	}
})

/************************************ 
  A component to take in a section, 
  and in context to the root, 
  return a 3d object based on the section's content. 
************************************/ 
AFRAME.registerComponent('sectionshape', {
  // The section need only the section object,
  schema:{
    descendant: {default: {}},
    rootSection:{default:{}}
  },
  init: async function(){
    var descendant   = this.data.descendant; 
    var rootSection  = this.data.rootSection; 
    // console.log(rootSection);
    var height       = Math.abs(descendant.height - rootSection.height-1)*0.1;  
    // console.log(height)
    var colorIndex   = Math.abs((descendant.height - rootSection.height))/rootSection.height;
    var sectionColor =  d3.interpolatePurples(colorIndex); 
    // We position relative to the parent: 

      var x_position = rootSection.x-descendant.x; 
      var z_position = (rootSection.y - descendant.y); 
  
    // Okay. Now render the shape. 
    this.el.setAttribute('material',{color:sectionColor,metalness:0.6,roughness:0.4}); 
    if(descendant.children && descendant.children.length > 0){
      // Its going to be a cylinder: 
      this.el.setAttribute("geometry",{primitive:'cylinder',radius:descendant.r,height:height}); 
      this.el.setAttribute("position",{x:z_position,y:height/2,z:x_position})
    }
    else{
      // Its going to be a sphere: 
      var randomBoost = 2 * Math.random() + 0.2;
      var newColor = d3.interpolatePurples(1);
      this.el.setAttribute('material',{color:newColor,metalness:0.6,roughness:0.4}); 
      this.el.setAttribute("geometry",{primitive:'sphere',radius:descendant.r})
      this.el.setAttribute("position",{x:z_position,y:height+descendant.r+0.2+randomBoost,z:x_position})
    }
    if(descendant == rootSection){
      console.log(this.el.object3D)
    }
    else{
      // console.log(descendant,rootSection)
    }
  }
})

/************************************
	A Wiki-link component:
	Links change the scene to a different page when clicked. 
************************************/ 
AFRAME.registerComponent('wikilink', {
	schema:{
		title:{default:''}, 
		pageid:{default:''},
	}
})

/************************************
	A Wiki-scene component:
	The scene is populated with section and link things. 
************************************/ 
AFRAME.registerComponent('wikiscene', {

	dependencies:['raycaster'],

  schema: {
  	title: {default: 'Albert_Einstein'},
    pagedata:{default:{} },
    currentSection:{default:baseSection},
  }, 

  // We always start with Einstein: 
	init: async function(){
		// Bind some methods: 
    // console.log(this.data); 
		this.constructScene = AFRAME.utils.bind(this.constructScene, this);
		this.constructSectionComponent = AFRAME.utils.bind(this.constructSectionComponent, this); 
		// Fetch inital page data: 
		var wikiData = await wtf.fetch(this.data.title);
		// Place our system into the context of this component: 
		this.wikiSystem = this.el.sceneEl.systems.wiki;
		// Listen for click events: 
		this.el.addEventListener('clicked', (e) => {this.wikiSystem.clicked()});
		// Build a scene based upon the data: 
    var integralSections = wikiData.sections().filter(x => sectionChecker(x.data.title)); 
    var sectionTree = await this.constructSectionTree(integralSections); 
    this.el.appendChild(sectionTree); 
    console.log(sectionTree); 
    var initSections = wikiData.sections().filter(x => sectionChecker(x.data.title)).filter( y => y.depth == 0); 
    console.log(wikiData.sections()); 
		// this.constructScene(initSections,[]); 
		// Update the component: 
		this.el.setAttribute('wikiscene',{pagedata:wikiData}); 
		// register to system. Which will handle the the addition os sections, etc. 
		// this.el.setAttribute('rotation', {x: 0, y: 180, z: 0}); 
		// Add a ring and place objects about it; for aesthetics, really.
    // this.speaker(); 
   
    
	}, 
  speaker: async function(text){
    var utterThis = new SpeechSynthesisUtterance(text); 
    utterThis.rate = 0.9; 
    window.speechSynthesis.speak(utterThis);
  },
	// Then we proceed to other things: 
	update: async function(oldData){
    console.log(this.data,oldData)
    this.speaker= AFRAME.utils.bind(this.speaker, this);
    if(this.data != oldData && oldData != {}){
      if(this.data.title != 'Albert_Einstein'){
        console.log('NEW PAGE', this.data.title);
        // var sections = wikiData.sections().filter(x => sectionChecker(x.data.title)).filter( y => y.depth == 0); 
        // if(sections.length == 0){
        //   // We only care about the links in here: 
        //   var links  = wikiData.sections(0).links();
        //   for(let i = 0; i < links.length; i++){
        //     // we want to place these links into the wikiscene component. 
        //   }
        // }
      }
      // Breaking into a section for the first time here: 
      else if(oldData.currentSection != null && this.data.currentSection.data.title != oldData.currentSection.data.title){
        console.log('NEW SECTION',this.data.currentSection); 
        // Okay: we need to remove all the section objects and link objects from the scene: 
        var sectionObjects = this.el.querySelectorAll('.sectionObject'); 
        var linkObjects    = this.el.querySelectorAll('.linkObject'); 
        var bindingRing    = this.el.querySelector('#binding-ring'); 
        var linkTunnel     = this.el.querySelector('#linktunnel'); 
        // We could just remove all the nodes from the element! (and then build it up anew!)
        sectionObjects.forEach( x => this.el.removeChild(x)); 
        linkObjects.forEach( x => this.el.removeChild(x)); 
        if(bindingRing){
          try{
            this.el.removeChild(bindingRing);
          }
          catch(err){
            console.log('COULD NOT REMOVE RING!', err); 
          }
        }
        if(linkTunnel){
          try{
            this.el.removeChild(linkTunnel);
          }
          catch(err){
            console.log('COULD NOT TUNNEL!', err); 
          }
        }
        // Nice, now let's add the new sections stuff: 
        var childSections = this.data.currentSection.children().filter( x => x.depth == (this.data.currentSection.depth + 1));
        var links = this.data.currentSection.links();
        var sentences = this.data.currentSection.sentences(); 
        // Plop all of these sections ont the scene! 
        await this.constructScene(childSections,links,sentences); 
      }
    }
	},

	// To construct the page: 
	constructScene: async function(sections,links,sentences){
    var bindingRing = document.createElement('a-cylinder'); 
    bindingRing.setAttribute('radius',24); 
    bindingRing.setAttribute('height',1); 
    bindingRing.setAttribute('material',{color:'#BA55D3',metalness:0.4,side:'double'}); 
    bindingRing.setAttribute('theta-length',180);
    bindingRing.setAttribute('theta-start',-90);
    bindingRing.setAttribute('side','double'); 
    bindingRing.setAttribute('open-ended',true); 
    bindingRing.setAttribute('id','binding-ring'); 
    
    // We can add some connecting pieces, too! 
    var leftCyl = document.createElement('a-cylinder'); 
    var rightCyl = leftCyl.cloneNode(); 
    // Define some cylinder attributes. 
    leftCyl.setAttribute('height',14); 
    leftCyl.setAttribute('radius',0.5); 
    leftCyl.setAttribute('rotation',{x:0,y:0,z:-90}); 
    leftCyl.setAttribute('material',{metalness:0.4,color:'#BA55D3'}); 
    leftCyl.setAttribute('position',{x:17,y:0,z:0}); 
    rightCyl.setAttribute('height',14); 
    rightCyl.setAttribute('radius',0.5); 
    rightCyl.setAttribute('rotation',{x:0,y:0,z:-90}); 
    rightCyl.setAttribute('material',{metalness:0.4,color:'#BA55D3'}); 
    rightCyl.setAttribute('position',{x:-17,y:0,z:0}); 
    bindingRing.appendChild(leftCyl); 
    bindingRing.appendChild(rightCyl); 
    this.el.appendChild(bindingRing);

    if(sections.length > 0){
      if(sections.length == 1){
        var vertCirc = await new THREE.CircleGeometry(24,4,-Math.PI/2,Math.PI);
        var verts = [vertCirc.vertices[3]]; 
        var thetaVect = [0,]; 
        var thetaStep = 90; 
      }
      else{
        var vertCirc = await new THREE.CircleGeometry(24,sections.length+1,-Math.PI/2,Math.PI);
        var verts = vertCirc.vertices.slice(2,vertCirc.vertices.length-1).reverse(); 
        var thetaStep = 180/(sections.length+1); 
        var thetaVect = []; 
        for(let j = 0; j<verts.length; j++){
          var theta = -90 + (j+1)*thetaStep; 
          thetaVect.push(theta); 
        }
      }
      if(verts != null){
        for(let s = 0; s < sections.length; s++){
          var sectionEl = await this.constructSectionComponent(sections[s],sections,s,thetaVect[s],verts[s]);  
          this.el.appendChild(sectionEl); 
        }
      }
    }
    if(links.length > 0 && sentences.length > 0){
      // We are going to pull the images for these links. 
      var linkImages = await getPageImages(links);
      var lastZ      = await this.constructLinkTunnel(linkImages,sentences); 
      // And we move the camera back! 
      // Rotate the camera toward z: 
      var cameraRig = this.el.sceneEl.querySelector('#scenecam'); 
      cameraRig.setAttribute('position',{x:0,y:1.6,z:lastZ+2});
      // Get rotate camera if not in VR: 
      var user = cameraRig.querySelector('[user]').getAttribute('user');  
      if(user.inVR == false){
        console.log('inVR')
        var rotation = cameraRig.querySelector('[camera]').getAttribute('rotation');
        var minus_x = -1 * rotation.x; 
        var minus_y = -1 * rotation.y; 
        var minus_z = -1 * rotation.z; 
        console.log(rotation)
        cameraRig.setAttribute('rotation',{x:0,y:minus_y,z:0}); 
      }

    }
	},

  // This tunnel will allow users to transverse the links in a linear, sentence-wise fashion: 
  constructLinkTunnel: async function(links,sentences){
    // ONE DAMN SETNENCE AT A TIME! 
    var zposition = 0; 
    var tunnelObj = document.createElement('a-entity'); 
    var sentenceIndex = 0; 
    for(let i = 0; i < sentences.length; i++){
      // sentences have link info. So does links. Links has the image data, too! 
      var tunnelStuff = await this.constructSentenceComponent(sentences[i],links,sentenceIndex,zposition); 
      if(tunnelStuff){
        tunnelObj.appendChild(tunnelStuff.tunnel); 
        zposition += tunnelStuff.tunnelLength; 
        sentenceIndex += 1; 
      }
    }
    tunnelObj.setAttribute('position',{x:0,y:0,z:-zposition+0.5})
    tunnelObj.setAttribute('id','linktunnel'); 
    this.el.appendChild(tunnelObj);
    return zposition 
  }, 

  // The tunnel is constructed one sentence at a time: 
  constructSentenceComponent: async function(sentence,links,index,zposition){
    // Get the sentence text: 
    var sentenceText   = await sentence.data.text; 
    // and the links, too:
    var sentenceLinks  = await sentence.data.links; 
    // We use this sentence to display links as the text is spoken. 
    var markedSentence = sentenceText; 
    // Search for link in text: 
    if(sentenceLinks && sentenceLinks != null && sentenceText && sentenceText != null){
      // We mark the sentences for spech/link display synchronization:
      for(let i = 0; i < sentenceLinks.length; i++){
        if(sentenceLinks[i].text){
          var startIndex = markedSentence.search(sentenceLinks[i].text); 
          if(startIndex == -1){
            startIndex = markedSentence.search(sentenceLinks[i].page); 
          }
        }
        else{
          var startIndex = markedSentence.search(sentenceLinks[i].page); 
        }
        var markStr = '<mark name="link"/>'; 
        if(startIndex != -1){
          markedSentence = markedSentence.substring(0,startIndex) + markStr + markedSentence.slice(startIndex); 
        }
        else{
          markedSentence = markedSentence + markStr; 
        }
      }
      // Okay. Let's add a tunnel component using the length of the sentence. (each character is a 0.1m). Which means we should constrain the size of page markers to be < 0.5 in length?
      var tunnelLength = sentenceText.length/10; 
      var tunnel = await makeTunnel(tunnelLength,index,sentenceText,sentenceLinks,links);   
      tunnel.setAttribute('rotation',{x:0,y:180,z:0});
      tunnel.setAttribute('position',{x:0,y:0,z:zposition+tunnelLength/2}); 
      return {tunnel:tunnel,tunnelLength:tunnelLength}; 
    }
    else{
      // Do sentences with no links belong on here? (Depends...they don't really add much content...more or less filler. Knowledge web is all about links!)
    }
  },

	// To construct a section when a user navigate out of page_main. 
  constructSectionComponent: async function(baseSection,sections,index,theta,vert){
    var newEntity = document.createElement('a-entity');
    var height = 10; 
    var portalNumber = index + 1; 
    // Construct column
    var cyl = await makeColumn(1.5,height,portalNumber); 
    // Toss some text up ther: 
    var text = await createTextEl(baseSection.data.title,theta,index); 
    // And then we have to build it up! 
    newEntity.appendChild(cyl); 
    // newEntity.appendChild(plane); 
    newEntity.appendChild(text); 
    // We set them up this way with x --> vert.y and z --> vert.x because we want to work in the x-z plane 
    // as opposed to the x-y plane. 
    newEntity.setAttribute('position', {x: vert.y, y: 0, z: vert.x});
    // Again, we rotate via -theta since we are in the x-z plane! 
    newEntity.setAttribute('rotation',{x:0,y:-theta,z:0}); 
    var lineEl = await document.createElement('a-plane');
    lineEl.setAttribute('height',0.05); 
    lineEl.setAttribute('width',24); 
    lineEl.setAttribute('material',{color:"#888888",transparent:true,opacity:0.25}); 
    lineEl.setAttribute('rotation',{x:-90,y:90,z:0}); 
    lineEl.setAttribute('position',{x:0,y:0.1,z:-12}); 
    lineEl.setAttribute('id','lineEl'); 
    newEntity.appendChild(lineEl); 
    newEntity.setAttribute('wikisection',{section:baseSection}); 
    // Add the handlers to catch box; 
    newEntity.addEventListener('raycaster-intersected', function(e){
      if(e.currentTarget != null){
      	// add an event listener to this entity: 
      	this.sceneEl.systems.wiki.selectSection(e.currentTarget);   
        var sectionDetails = e.currentTarget.getAttribute('wikisection'); 
        var children = sectionDetails; 
        // var id = "#"  + e.currentTarget.id; 
        var cSoundEl = document.querySelector('#csound');
        // cSoundEl.components.sound.playSound();
        // Change the line color: 
        var lineEl = e.currentTarget.querySelector('#lineEl'); 
        lineEl.setAttribute('material',{color:"#EEEEEE",transparent:true,opacity:0.9})
         lineEl.setAttribute('height',0.2); 
        // Update the text: 
        var text = e.currentTarget.querySelector('#sectionText'); 
        text.setAttribute('visible',true); 
        // Update the scale of the portal: 
        var portal = e.currentTarget.querySelector('#portal'); 
        portal.setAttribute('visible',true);
        portal.setAttribute('scale',{x:1,y:1,z:1}); 
      }
    })
    newEntity.addEventListener('raycaster-intersected-cleared', function(e){
      if(e.currentTarget != null){
        // Change things back: 
        this.sceneEl.systems.wiki.deselectItem(e.currentTarget);   
        var cSoundEl = document.querySelector('#csound');
        cSoundEl.components.sound.stopSound();
        var lineEl = e.currentTarget.querySelector('#lineEl'); 
        lineEl.setAttribute('material',{color:"#888888",transparent:true,opacity:0.25})
        lineEl.setAttribute('height',0.05); 
        var text = e.currentTarget.querySelector('#sectionText'); 
        text.setAttribute('visible',false); 
        var portal = e.currentTarget.querySelector('#portal'); 
        portal.setAttribute('scale',{x:0.6,y:0.6,z:0.6}); 
      }
    })  
    newEntity.setAttribute('class', 'sectionObject');
    return newEntity
  }, 
  constructSectionTree: async function(sections){
    // Making a container entity: 
    var treeEntity = document.createElement('a-entity'); 
    treeEntity.setAttribute('id',"sectiontree"); 
    // First we make our arry consisting of objects of {name:section_name,parent:section_parent}. 
    var rootObj = {name:"doc",parent:"",value:0}; 
    var hierarchyArray = [rootObj,]; 
    for(let i = 0; i < sections.length; i++){
      // do something
      var sectionObj = {}; 
      if(sections[i]._title != ""){
        sectionObj.name = sections[i]._title; 
        var text = await sections[i].text(); 
        sectionObj.value = text.length; 
        if(sections[i].depth == 0){
          sectionObj.parent = "doc"; 
        }
        else{
          // snag theh parent: 
          var parent = await sections[i].parent(); 
          sectionObj.parent = parent._title; 
        }
        hierarchyArray.push(sectionObj); 
      }
    }
    // Generate a root node via d3.stratify; 
    var rootNode = d3.stratify()
                     .id(function(d) { return d.name; })
                     .parentId(function(d) { return d.parent; })
                     (hierarchyArray);
    // Sum it: 
    rootNode.sum(d => d.value); 
    var packLayout = d3.pack(); 
    packLayout.size([18,18])
              .padding(1);
    packLayout(rootNode); 
    // Using rootNode as the base, get the children nodes and go through them! 
    var currentPosition = 0; 
    // packLayout(rootNode); 
    for(let i = 0; i < rootNode.children.length; i++){
      // Grab the children iteratively:
      var childNode = rootNode.children[i]; 
      var descendants = childNode.descendants(); 
      var sectionContainer = document.createElement('a-entity'); 
      for(let j = 0; j<descendants.length; j++){
        var sectionElement = document.createElement('a-entity'); 
        sectionElement.setAttribute('sectionshape',{descendant:descendants[j],rootSection:descendants[0]}); 
        sectionContainer.appendChild(sectionElement); 
      }
      console.log(currentPosition);
      sectionContainer.setAttribute('position',{x:currentPosition,y:0,z:0}); 
      treeEntity.appendChild(sectionContainer); 
      // if(i<rootNode.children.length-1){
      //   currentPosition += rootNode.children[i+1].r*2; 
      // }
      currentPosition = currentPosition + childNode.r*2 + 0.6 ;
    }
    treeEntity.setAttribute('position',{x:-currentPosition/2,y:0,z:-9})
    var lightContainer = document.createElement('a-entity'); 
    var areaLight = document.createElement('a-entity'); 
    areaLight.setAttribute('area-light',{intensity:2,color:"#0f0",width:currentPosition+18,height:36});
    areaLight.setAttribute('rotation',{x:90,y:0,z:0}); 
    areaLight.setAttribute('position',{x:0,y:10,z:0}); 
    treeEntity.appendChild(areaLight);
    return treeEntity
  }
}); 


/************************************

************************************/ 
AFRAME.registerSystem('wiki', {
	dependencies:['raycaster'],
	// Let's start with init: 
	init: async function(){
		this.activeItem = null; 
    this.raycasterEl = this.el.sceneEl.querySelector('[raycaster]'); 
	}, 
	clicked: async function(){
		if(this.activeItem != null){
			var itemType = this.activeItem.getAttribute('class'); 
			switch(itemType){
				case 'sectionObject': 
					// Lets pull out the section item from here: 
					var sectionData = this.activeItem.getAttribute('wikisection'); 
          // update currentSection of the wikiscene component: 
          var wikiSceneEl = this.sceneEl.querySelector('[wikiscene]')
          wikiSceneEl.setAttribute('wikiscene','currentSection', sectionData.section); 
					break; 
				case 'linkObject': 
					console.log('linkObject'); 
					break; 
				case 'backButton': 
					console.log('backButton'); 
					break; 
				case 'homeButton':
					console.log('homeButton'); 
					break; 
				case 'mapButton': 
					console.log('mapButton'); 
					break; 
				default: 
					console.log('looks like a null response'); 
			}
		}
	}, 
	selectLink: function(link){
		this.activeItem = link; 
	}, 
	selectSection: function(section){
		this.activeItem = section
	}, 
	deselectItem: function(){
		this.activeItem = null;  
	}
})

/************************************
	Some helper functions down here: 
************************************/ 

function catTitleChecker(title){
  const peopleStrings = [/births/gi, /deaths/gi, /people/gi, /family/gi];
  for(var s in peopleStrings){
    var result = title.search(peopleStrings[s]); 
    if(result != -1){
      return true;  
      break; 
    }
  }
  return false
}; 

function sectionChecker (sectTitle) {
  const badHeadings = ['content', 'See also', 'Notes', 'References', 'External links', 'Further reading', 'Sources'];
  const badStrings = [/publications/gi, /notes/gi, /references/gi, /citations/gi, /sources/gi, /works cited/gi];
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

/************************************
	To make a portal thingy: 
************************************/ 
function makeColumn(radius,height,portalNumber){
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
  torusOne.setAttribute('metalness',0.5); 
  // and 2: A portal torus: 
  var torusTwo = document.createElement('a-torus'); 
  torusTwo.setAttribute('color',"#00CE22"); 
  torusTwo.setAttribute('radius',radius*2);
  torusTwo.setAttribute('segments-radial',16); 
  torusTwo.setAttribute('segments-tubular',12); 
  torusTwo.setAttribute('radius-tubular',0.15); 
  torusTwo.setAttribute('animation',{property:'rotation',from:{x:0,y:0,z:-180},to:{x:0,y:0,z:180},loop:true,dur:8000,easing:'linear',direction:'normal'});
  torusTwo.setAttribute('position',{x:0,y:radius*2+0.5,z:-radius+0.25}); 
  torusTwo.setAttribute('metalness',0.5); 
  torusTwo.setAttribute('side','double')
  // a black-hole, too: 
  var blackHole = document.createElement('a-circle');
  blackHole.setAttribute('material',{color:'#222',transparent:true,opacity:0.6}); 
  blackHole.setAttribute('radius',radius*2-0.5);
  blackHole.setAttribute('position',{x:0,y:radius*2+0.5,z:-radius-1});    
  blackHole.setAttribute('side','double');
  blackHole.setAttribute('text',{value:portalNumber,color:'white',side:'front',align:'center',baseline:'center',font:'sourcecodepro',wrapCount:2,width:radius*2,height:radius*2});
  blackHole.setAttribute('rotation',{x:0,y:180,z:0}); 
  // blackHole.setAttribute('class', 'interactive');
  // MAKE THE BLACKHOLE THE ENTITY WITHIN WHICH WE INTERACT! 
  // PERHAPS WE MAKE A BOUNDING BOX OF THE COLUMN ENTITY AND INTERACT WITH THAT? 
  column.appendChild(torusTwo); 
  column.appendChild(torusOne); 
  column.appendChild(blackHole);
  column.setAttribute('id','portal'); 
  column.setAttribute('scale',{x:0.6,y:0.6,z:0.6}); 
  column.setAttribute('visible',true);
  // return the column! 
  return column;
}

/************************************
	Adding text to the scene: 
************************************/ 
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

/************************************
 A function to make a tunnel of links! 
************************************/ 
async function makeTunnel(tunnelLength,i,sentenceText,sentenceLinks,allLinks){

  var tunnel = document.createElement('a-entity');
  var cylinderOne = document.createElement('a-cylinder'); 
  var color = i % 2 == 0 ? '#BA55D3' : '#00ff00'; 
  var xmin = -12, xmax = 12, ymin = 0, ymax = 10; 
  // Define some cylinder attributes. 
  cylinderOne.setAttribute('height',tunnelLength); 
  cylinderOne.setAttribute('radius',0.5); 
  cylinderOne.setAttribute('rotation',{x:-90,y:0,z:0}); 
  cylinderOne.setAttribute('material',{metalness:0.4,color:color}); 
  // Make the other three columns. 
  var cylinderTwo = cylinderOne.cloneNode(); 
  var cylinderThree = cylinderOne.cloneNode(); 
  var cylinderFour = cylinderOne.cloneNode(); 
  // Materials:
  cylinderTwo.setAttribute('material',{metalness:0.4,color:color}); 
  cylinderThree.setAttribute('material',{metalness:0.4,color:color}); 
  cylinderFour.setAttribute('material',{metalness:0.4,color:color}); 
  // Rotations: 
  cylinderTwo.setAttribute('rotation',{x:-90,y:0,z:0}); 
  cylinderThree.setAttribute('rotation',{x:-90,y:0,z:0}); 
  cylinderFour.setAttribute('rotation',{x:-90,y:0,z:0}); 
  // Positions: 
  cylinderOne.setAttribute('position',{x:xmin,y:ymin,z:0}); 
  cylinderTwo.setAttribute('position',{x:xmax,y:ymin,z:0}); 
  cylinderThree.setAttribute('position',{x:xmin,y:ymax,z:0}); 
  cylinderFour.setAttribute('position',{x:xmax,y:ymax,z:0}); 
  // Add them to the tunnel object: 
  tunnel.appendChild(cylinderOne); 
  tunnel.appendChild(cylinderTwo);
  tunnel.appendChild(cylinderThree);
  tunnel.appendChild(cylinderFour);
  var lines = document.createElement('a-entity'); 
  lines.setAttribute('line__0',{start:{x:xmin,y:ymin,z:0},end:{x:xmax,y:ymin,z:0}})
  lines.setAttribute('line__1',{start:{x:xmin,y:ymax,z:0},end:{x:xmax,y:ymax,z:0}})
  lines.setAttribute('line__2',{start:{x:xmin,y:ymin,z:0},end:{x:xmin,y:ymax,z:0}})
  lines.setAttribute('line__3',{start:{x:xmax,y:ymin,z:0},end:{x:xmax,y:ymax,z:0}})
  lines.setAttribute('position',{x:0,y:0,z:tunnelLength/2}); 
  // Add some lines at the start. Some aesthetic stuff here. 
  if(i == 0){
    var startLines = document.createElement('a-entity'); 
    startLines.setAttribute('line__0',{start:{x:xmin,y:ymin,z:0},end:{x:xmax,y:ymin,z:0}})
    startLines.setAttribute('line__1',{start:{x:xmin,y:ymax,z:0},end:{x:xmax,y:ymax,z:0}})
    startLines.setAttribute('line__2',{start:{x:xmin,y:ymin,z:0},end:{x:xmin,y:ymax,z:0}})
    startLines.setAttribute('line__3',{start:{x:xmax,y:ymin,z:0},end:{x:xmax,y:ymax,z:0}})
    startLines.setAttribute('position',{x:0,y:0,z:-tunnelLength/2}); 
    tunnel.appendChild(startLines); 
  }
  tunnel.appendChild(lines)
  // We add the links NOW! (want to search all links!)
  for(let j = 0; j<sentenceLinks.length; j++){
    // Where is the link? 
    if(sentenceLinks[j].text){
      var startIndex   = sentenceText.indexOf(sentenceLinks[j].text); 
    }
    else{
      var startIndex   = sentenceText.indexOf(sentenceLinks[j].page); 
    }
    if(startIndex){
      let zPosition    = startIndex/sentenceText.length * tunnelLength - tunnelLength/2; 
      // See what we have cooking in the main links (where the images live). 
      let linkData = allLinks.find( x => x.page == sentenceLinks[j].page); 
      // This container is a group housing link stuff. 
      let linkObj = document.createElement('a-entity'); 
      // Make a little box for this thing, only show that box! 
      let linkBox = document.createElement('a-entity'); 
      // We color the linkbox based on the type of page it is... 
      if(linkData && linkData.coordinates){
        var linkType = 'place'; 
        
      }
      else if(linkData && linkData.categories){
        // Scan the catergories for people things...
        var person = false; 
        for(let jj = 0; jj < linkData.categories.length; jj += 1){
          var catTitle = linkData.categories[jj].title; 
          var titleSearch = catTitleChecker(catTitle); 
          if(titleSearch == true){
            person = true; 
            var linkType = 'person';  
            break; 
          }
          // We check cat title for the strings indicative of people: 
        }; 
        if(person != true){
          var linkType = 'thing'; 
        }
      }
      else{
        console.log('link not identified', linkData,allLinks);
        
      };
      // Set a random x and shift it based on the type of link! 
      var randX = Math.random() * 4; 
      if(linkType == 'place'){
        var boxColor = '#63d863'; 
        randX -= 8; 
      }
      else if(linkType == 'person'){
        var boxColor = '#c248C9'; 
        randX -= 2; 
      }
      else if(linkType == 'thing'){
        var boxColor = '#639ed8'; 
        randX += 2; 
      }
      else{
        var boxColor = randomColor({hue:'monochrome',luminosity:'light'}); 
      }
      linkBox.setAttribute('geometry',{primitive:'box',height:1.5,width:0.5,depth:0.5}); 
      linkBox.setAttribute('position',{x:0,y:0.6,z:0}); 
      linkBox.setAttribute('material',{color:boxColor,metalness:0.,roughness:0.9}); 
      linkObj.appendChild(linkBox); 
      // We position link object! 
      if(linkData && linkData.original){
        // we have an image! 
        var randY      = 2.8; 
        let aspect     = linkData.original.height / linkData.original.width; 
        let imwidth    = 3; 
        let imheight   = imwidth * aspect; 
        var imagePlane = document.createElement('a-entity'); 
        imagePlane.setAttribute('geometry',{primitive:'plane',height:imheight,width:imwidth}); 
        imagePlane.setAttribute('material',{side:'double',src:linkData.original.source,metalness:0,roughness:0})
        imagePlane.setAttribute('position',{0:randX,y:randY,z:0}); 
        // we can add some text to the top of the image. 
        var textSheet = document.createElement('a-entity');
        textSheet.setAttribute('geometry',{primitive:'plane',height:'auto',width:'auto'}); 
        textSheet.setAttribute('material',{color:'#222',opacity:0,side:'double',visible:false}); 
        textSheet.setAttribute('text',{value:sentenceLinks[j].page,color:'white',side:'double',align:'center',baseline:'center',font:'sourcecodepro',wrapCount:sentenceLinks[j].page.length+2}); 
        textSheet.setAttribute('position',{x:0,y:-0.4-imheight/2,z:0});    
        textSheet.setAttribute('scale',{x:8,y:8,z:8}); 
        // textSheet.setAttribute('visible',false); 
        imagePlane.setAttribute('visible',false); 
        imagePlane.appendChild(textSheet); 
        linkObj.appendChild(imagePlane); 
      }
      else{
        var randY     = 1.6; 
        var textSheet = document.createElement('a-entity');
        textSheet.setAttribute('geometry',{primitive:'plane',height:'auto',width:'auto'}); 
        textSheet.setAttribute('material',{color:'#222',transparent:true,opacity:0,side:'double'}); 
        textSheet.setAttribute('text',{value:sentenceLinks[j].page,color:'white',side:'double',align:'center',baseline:'center',font:'sourcecodepro',wrapCount:sentenceLinks[j].page.length+2});
        textSheet.setAttribute('scale',{x:10,y:10,z:10}); 
        textSheet.setAttribute('position',{x:0,y:randY,z:0});
        textSheet.setAttribute('visible',false); 
        linkObj.appendChild(textSheet); 
      }
      linkObj.setAttribute('position',{x:randX,y:0,z:zPosition}); 
      // We should add some event listeners here? We should move this function into the component class that house our scene! 
      tunnel.appendChild(linkObj); 
    }
  }
  // Spit out the tunnel: 
  return tunnel
}

/************************************
 A function to get the images from likes! 
************************************/ 
async function getPageImages(images){
  //INPUT: array of page objects. Each will have a page field. 
  //OUTPUT: an array of pages, and image data, if available. Basically this function returns an array that is equal in length to the input. 

  // The inputdata comes from the wikiparser. It looks like: {page:"pagestring",text:"textstring"}. 
  try{
    var outArray = []; 
    for(var i = 0; i<images.length; i += 50){
      if(i>= images.length){
        break; 
      }
      // we have titles. 
      var imagesChunk = images.slice(i,i+50); 
      var encodedTitles = images.slice(i,i+50).map(
        (imgObject) => {
          var outTitle  = encodeURIComponent(imgObject.page); 
          return outTitle
        }
      ).join('%7C'); 
      let titleString   = "titles=" + encodedTitles; 
      let queryUrl      = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages%7Ccoordinates%7Ccategories&${titleString}&piprop=name%7Coriginal&pilimit=50&pilicense=any&cllimit=500&redirects=1`; 
      let wikiResponse  = await fetch(queryUrl); 
      let wikiObject    = await wikiResponse.json();
      var queryPages    = wikiObject.query.pages;
      var keys          = Object.keys(queryPages);
      // Check for revisions: THIS OBJECT IS DIFFERENT. GIVE IT TITLES, GET TITLES IN THE OUTPUT OBJECT. 

      // Redirects: We need to handle these, basically, the page given in the link goes to another page. 
      // thus, when we go through the sentence/section links, the data we seek, which is outputted from the API, 
      // doesn't get matched up unless we make it so. 
      console.log(wikiObject,images);

      // Loop through the images array, NOT the pages array!
      if(queryPages){
        var wikiArray = []; 
        for(var kk in keys){
          wikiArray.push(queryPages[keys[kk]]); 
        }; 
        // Now we loop through imagesChunk and piece together the output: 
        for(var jj in imagesChunk){
          // Get the corresponding wikiObject: 
          var pageObject = wikiArray.find( x => x.title == imagesChunk[jj].page); 
          if(pageObject){
            var wikiFields = Object.keys(pageObject); 
            for(var kk in wikiFields){
              imagesChunk[jj][wikiFields[kk]] = pageObject[wikiFields[kk]]; 
            }
            outArray.push(imagesChunk[jj]); 
          }
          else if(wikiObject.query.redirects){
            // look in redirects: 
            var redirectObject = wikiObject.query.redirects.find(x => x.from == imagesChunk[jj].page);
            // Okay, we have the redirect object. Now get the page object! 
            if(redirectObject){
              var pageObject = wikiArray.find( x => x.title == redirectObject.to); 
              // tack page object data onto imageChunk data, and toss into output! 
              var wikiFields = Object.keys(pageObject); 
              for(var kk in wikiFields){
                imagesChunk[jj][wikiFields[kk]] = pageObject[wikiFields[kk]]; 
              }
              outArray.push(imagesChunk[jj]); 
            } 
          }
        }
      }
    }
    // return the array: 
    console.log(outArray);
    return outArray
  }
  catch(error){
    console.log('error fetching page images: ', error); 
  }
}

