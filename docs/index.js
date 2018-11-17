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
		this.el.addEventListener('trackpaddown', (e) => {this.el.sceneEl.systems.wiki.clicked()})
		// Add an event listener for the desktop site: 
		document.body.addEventListener( 'dblclick', (e) => {this.el.sceneEl.systems.wiki.clicked()})
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
    console.log(this.data); 
		this.constructScene = AFRAME.utils.bind(this.constructScene, this);
		this.constructSectionComponent = AFRAME.utils.bind(this.constructSectionComponent, this); 
		// Fetch inital page data: 
		var wikiData = await wtf.fetch(this.data.title);
		// Place our system into the context of this component: 
		this.wikiSystem = this.el.sceneEl.systems.wiki;
		// Listen for click events: 
		this.el.addEventListener('clicked', (e) => {this.wikiSystem.clicked()});
		// Build a scene based upon the data: 
    var initSections = wikiData.sections().filter(x => sectionChecker(x.data.title)).filter( y => y.depth == 0); 
		this.constructScene(initSections,[]); 
		// Update the component: 
		this.el.setAttribute('wikiscene',{pagedata:wikiData}); 
		// register to system. Which will handle the the addition os sections, etc. 
		this.el.setAttribute('rotation', {x: 0, y: 180, z: 0}); 
		// Add a ring and place objects about it; for aesthetics, really.  
    
	}, 
	// Then we proceed to other things: 
	update: async function(oldData){
    console.log(this.data,oldData)
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
        sectionObjects.forEach( x => this.el.removeChild(x)); 
        linkObjects.forEach( x => this.el.removeChild(x)); 
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
    // We run into trouble if we have less than three segments. So.. 
    // console.log(sections);
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
        console.log(verts);
        var thetaStep = 180/(sections.length+1); 
        var thetaVect = []; 
        for(let j = 0; j<verts.length; j++){
          var theta = -90 + (j+1)*thetaStep; 
          thetaVect.push(theta); 
        }
      }

      if(verts != null){
        console.log(verts);
        for(let s = 0; s < sections.length; s++){
          var sectionEl = await this.constructSectionComponent(sections[s],sections,s,thetaVect[s],verts[s]);  
          this.el.appendChild(sectionEl); 
        }
        // add the binding circle: 
        var thetaLength = Math.max(...thetaVect) - Math.min(...thetaVect); 
        var bindingCircle = document.createElement('a-ring'); 
        bindingCircle.setAttribute('radius-outer',24); 
        bindingCircle.setAttribute('radius-inner',18); 
        bindingCircle.setAttribute('material',{color:'#BA55D3',transparent:true,opacity:0.6,metalness:0.4}); 
        bindingCircle.setAttribute('theta-length',thetaLength);
        bindingCircle.setAttribute('theta-start',180+thetaStep);
        bindingCircle.setAttribute('rotation',{x:-90,y:0,z:0}); 
        bindingCircle.setAttribute('id','binding-circle');  
        // this.el.appendChild(bindingCircle);
        var bindingRing = document.createElement('a-cylinder'); 
        bindingRing.setAttribute('radius',24); 
        bindingRing.setAttribute('height',1); 
        bindingRing.setAttribute('material',{color:'#BA55D3',metalness:0.4,side:'double'}); 
        bindingRing.setAttribute('theta-length',thetaLength);
        bindingRing.setAttribute('theta-start',thetaStep-90);
        bindingRing.setAttribute('side','double'); 
        bindingRing.setAttribute('open-ended',true); 
        bindingRing.setAttribute('id','binding-ring'); 
        this.el.appendChild(bindingRing);
        // what about a curved image: WE CAN ADD SOME TEXT TO INFOR THE USER WHERE THEY ARE! 
      }

    }
    if(links.length > 0 && sentences.length > 0){
      // We are going to pull the images for these links. 
      var linkTitles = links.map( x => x.page); 
      var linkImages = await getPageImages(linkTitles);
      this.constructLinkTunnel(linkImages,sentences); 
      // We want to make a link tunnel. Every link will have a node of sorts in this tunnel. 

    }
	},
  // This tunnel will allow users to transverse the links in a linear fashion. 

  constructLinkTunnel: async function(links,sentences){
    // ONE DAMN SETNENCE AT A TIME! 
    var zposition = 0; 
    var tunnelObj = document.createElement('a-entity'); 
    for(let i = 0; i < sentences.length; i++){
      var tunnelStuff = await this.constructSentenceComponent(sentences[i],links,i,zposition); 
      if(tunnelStuff){
        tunnelObj.appendChild(tunnelStuff.tunnel); 
        zposition += tunnelStuff.tunnelLength; 
        console.log(zposition);
      }
    }
    this.el.appendChild(tunnelObj); 
  }, 
  // To make our link tunnel, one sentences at a time. Our border 
  // rails should be of alternating contrast to show the flow of things. 
  // What about paragraphs. 
  constructSentenceComponent: async function(sentence,links,index,zposition){

    // Index is so we can 
    // Get the sentence text: 
    var sentenceText  = await sentence.data.text; 
    var sentenceLinks = await sentence.data.links; 
    var markedSentence = sentenceText; 
    // console.log(sentenceText,sentenceLinks); 
    // Pull these links and grab the image. 

    // Search for link in text: 
    if(sentenceLinks && sentenceLinks != null && sentenceText && sentenceText != null){
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
      console.log(markedSentence,sentenceText,sentenceLinks); 

      // Okay. Let's add a tunnel component using the length of the sentence. 
      var tunnelLength = sentenceText.length/10; 
      var tunnel = await makeTunnel(tunnelLength,index); 

      // var tunnelPosition = tunnel.getAttribute('position'); 
      // tunnelPosition.z = tunnelPosition.z + zposition; 
      tunnel.setAttribute('position',{x:0,y:0,z:-zposition-tunnelLength/2}); 
      return {tunnel:tunnel,tunnelLength:tunnelLength}; 

    }
    else{
      // we have no links, but perhaps we still make the tunnel??
    }

    // Assemble the rails: 

    // Place links into the scene: 
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
        cSoundEl.components.sound.playSound();
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
      // Which element are we looking at? 
      if(e.currentTarget != null){
      	// remove the event listener: 
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
        // portal.setAttribute('animation',{property:'scale',from:{x:1,y:1,z:1},to:{x:0.6,y:0.6,z:0.6},loop:fa,dur:8000,easing:'linear',direction:'normal'})
      }
    })  
    newEntity.setAttribute('class', 'sectionObject');
    // return the newly constructed entity! 
    return newEntity
    // Level by level, we build the section tower: 
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
async function makeTunnel(tunnelLength,i){
  console.log(i)
  var tunnel = document.createElement('a-entity');
  var cylinderOne = document.createElement('a-cylinder'); 
  var color = i % 2 == 0 ? '#ffaaff' : '#00ffff'; 
  var xmin = -15, xmax = 15, ymin = 0, ymax = 15; 
  // Define some cylinder attributes. 
  cylinderOne.setAttribute('height',tunnelLength); 
  cylinderOne.setAttribute('radius',0.2); 
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
  // Add some lines at the start! 
  if(i == 0){
    console.log('ZEROTH INDEX')
    var startLines = document.createElement('a-entity'); 
    startLines.setAttribute('line__0',{start:{x:xmin,y:ymin,z:0},end:{x:xmax,y:ymin,z:0}})
    startLines.setAttribute('line__1',{start:{x:xmin,y:ymax,z:0},end:{x:xmax,y:ymax,z:0}})
    startLines.setAttribute('line__2',{start:{x:xmin,y:ymin,z:0},end:{x:xmin,y:ymax,z:0}})
    startLines.setAttribute('line__3',{start:{x:xmax,y:ymin,z:0},end:{x:xmax,y:ymax,z:0}})
    startLines.setAttribute('position',{x:0,y:0,z:-tunnelLength/2}); 
    tunnel.appendChild(startLines); 
  }
  tunnel.appendChild(lines)
  // Perhaps we make a box to delineate the end of each sentence! 

  // Spit out the tunnel: 
  return tunnel
}

/************************************
 A function to get the images from likes! 
************************************/ 
async function getPageImages(images){
  //INPUT: array of pageids or titles!! This has been updated. 
  //OUTPUT: an array of pages, and image data, if available. Basically this function returns an array that is equal in length to the input. 
  try{
    var outArray = []; 
    for(var i = 0; i<images.length; i += 50){
      if(i>= images.length){
        break; 
      }
      // we have titles. 
      var encodedTitles = images.slice(i,i+50).map(
        (title) => {
          var outTitle  = encodeURIComponent(title); 
          return outTitle
        }
      ).join('%7C')
      let titleString   = "titles=" + encodedTitles; 
      let queryUrl      = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&${titleString}&piprop=name%7Coriginal&pilimit=50&pilicense=any&redirects=1`; 
      let wikiResponse  = await fetch(queryUrl); 
      let wikiObject    = await wikiResponse.json(); // JSON.parse(wikiResponse._bodyText);
      var queryPages    = wikiObject.query.pages;
      var keys          = Object.keys(queryPages);
      // Check for revisions: THIS OBJECT IS DIFFERENT. GIVE IT TITLES, GET TITLES IN THE OUTPUT OBJECT. 
      for(var kk in keys){
        if(queryPages[keys[kk]]){
          outArray.push(queryPages[keys[kk]]); 
        }
      }
    }
    // // Map the outArray to the input array! 
    // var sortedOut = images.map( (x) => {
    //   var oo = {title:x}; 
    //   var outIndex = outArray.findIndex( y => y.title == x); 
    //   console.log(outIndex);
    //   if(outArray[outIndex].original){
    //     x.imageInfo = outArray[outIndex].original
    //   }
    //   return x; 
    // }); 
    // console.log(sortedOut); 
    // console.log(outArray); 
    // // return outObject
    return outArray
  }
  catch(error){
    console.log('error fetching page images: ', error); 
  }
}

