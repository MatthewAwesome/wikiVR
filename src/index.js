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

// A section object to help view page section by section: 
const baseSection = {data:{title:''}}; 

// A base idea-scape. We have an array of nodes. This array of nodes 
// is transformed into an ideascape object, and arranged accordingly. 
const baseIdeaScape = {
  nodes:[{
    name:'Albert_Einstein',
    parent:"",
    image:null,
    model:'#einsteinModel',
  }]
}; 


/************************************
	A Wiki-scene component:
	The scene is populated with section and link things. 

  How do I want to do this? (users have idea-scapes!!!!!)
************************************/ 
AFRAME.registerComponent('wikiscene', {

	dependencies:['raycaster'],

  schema: {
    // Ideascape object: 
    ideascape:{default:{
      nodes:[{
        name:'Albert_Einstein',
        parent:"",
        image:null,
        model:'#einsteinModel',
      }], 
      tree:[],
    }},
    // Title used to render in page-view: 
  	title: {default:""},
    // Data associated with a page: 
    pagedata:{default:{} },
    // Section of page, If a user is in section view. 
    currentSection:{default:baseSection}
  }, 

  // We always start with Einstein: 
	init: async function(){
    // We init the ideaScape...and toss it on the scene! 
		// Place our system into the context of this component: 
		this.wikiSystem = this.el.sceneEl.systems.wiki;
    this.animator = AFRAME.utils.bind(this.animator, this); 
		// Listen for click events: 
		this.el.addEventListener('clicked', (e) => {this.wikiSystem.clicked()});
    // Need a workflow to make the video!! 
    // this.el.addEventListener('animationcomplete',this.animator); 
    // Get the data before doing anything: 

    var einsteinData = await wtf.fetch(this.data.ideascape.nodes[0].name); 
    var integralSections = einsteinData.sections().filter(x => sectionChecker(x.data.title));
    var sectionTree = await this.constructSectionTree(integralSections);
    this.el.appendChild(sectionTree);
    var treeEntity = this.el.querySelector('#sectiontree');
    var sectionGroups = treeEntity.querySelectorAll('.sectiongroup'); 
    for(var g = 0; g<sectionGroups.length; g++){
      var sectionChildren = sectionGroups[g].childNodes; //  querySelectorAll('[position]'); 
      for(var c = 0; c < sectionChildren.length; c++){
        sectionChildren[c].setAttribute('animation',{property:'material.opacity',to:1,dur:2000,easing:'easeInSine',loop:0}); 
      }
    }


    // var ideaScape = await this.constructIdeaScape(this.data.ideascape); 
    // this.el.appendChild(ideaScape); 
    // // Add a text component! Animate it. On animation end, fade in einstein. 
    // var ideaText = document.createElement('a-entity'); 
    // var str = 'IdeaSpace'; 
    // ideaText.setAttribute('geometry',{primitive:'plane',height:'auto',width:'auto'}); 
    // ideaText.setAttribute('material',{color:'#222',transparent:'true',opacity:0}); 
    // ideaText.setAttribute('text',{value:str,color:'white',side:'double',align:'center',baseline:'center',font:'dejavu',wrapCount:str.length+2});;  
    // ideaText.setAttribute('side', 'double');
    // ideaText.setAttribute('scale',{x: 1, y: 1, z: 1})
    // ideaText.setAttribute('position', {x: 0, y: 3, z: -500});
    // ideaText.setAttribute('id','ideatext'); 
    // ideaText.setAttribute('visible',true); 
    // ideaText.setAttribute('animation__move', {property:'position',to:{x:0,y:3,z:0},dur:2000,easing:'easeOutSine',repeat:0}); 
    // ideaText.setAttribute('animation__scale', {property:'scale',to:{x:12,y:12,z:12},dur:2000,easing:'easeOutSine',repeat:0}); 
    // // 
    // this.el.appendChild(ideaText);
    // console.log(this.data.ideascape)

	}, 
  // the animate function: 
  animator: async function(e) {
      if(e.target.id == 'ideatext' && e.detail.name == 'animation__move'){
        e.target.setAttribute('animation__fadeout',{property:'text.opacity',to:0,dur:2000,delay:0,easing:'linear',repeat:0}); 
        var ideascape = this.el.querySelector('#ideascape'); 
        var model = ideascape.querySelector('[ideamodel]'); 
        model.setAttribute('visible',true); 
        model.setAttribute('animation__modelopac',{property:'model-opacity',from:0,to:1,easing:'easeInSine',dur:5000}); 
        var circle = ideascape.querySelector('#linkcircle'); 
        circle.setAttribute('visible',true);
        var children = circle.querySelectorAll('.sector'); 
        var shuffled = shuffle(children); 
        var delayStep = 4000/children.length; 
        for(let i = children.length-1; i>=0; i--){
          var currDelay = (children.length-i+1)*delayStep; 
          shuffled[i].setAttribute('animation',{property:'material.opacity',to:1,dur:100,delay:currDelay}); 
        }
      }
      else if(e.detail.name == 'animation__modelopac'){
        // Move the model upwards! 
        var ideascape = this.el.querySelector('#ideascape'); 
        var model = ideascape.querySelector('[ideamodel]'); 
        var ideaText = this.el.querySelector('#ideatext'); 
        ideaText.setAttribute('visible',false);
        // model.setAttribute('visible',true); 
        model.setAttribute('animation__modelfade',{property:'model-opacity',to:0,easing:'easeInSine',dur:6400}); 
        var circle = ideascape.querySelector('#linkcircle'); 
        // Fan out the links! 
        circle.setAttribute('animation__spread',{property:'scale',to:{x:20,y:1,z:20},easing:'easeInCubic',dur:8000,loop:0});
      }
      else if(e.detail.name == 'animation__spread'){
        // Bring out the model: 
        var ideascape = this.el.querySelector('#ideascape'); 
        var model = ideascape.querySelector('[ideamodel]'); 
        model.setAttribute('visible',false); 
        // Bring in the text: 
      }
      else if(e.detail.name == 'animation__stextin'){
        var ideascape = this.el.querySelector('#ideascape'); 
        // Bring in the text: 
        var scapeText = this.el.querySelector('#scapetext'); 
        scapeText.setAttribute('animation__stextout',{property:'text.opacity',to:0,dur:6000,easing:'easeInSine'}); 
        var circle = ideascape.querySelector('#linkcircle'); 
        var children = circle.querySelectorAll('.sector'); 
        var delayStep = 3000/children.length; 
        for(let i = children.length-1; i>=0; i--){
          var currDelay = (children.length-i+1)*delayStep; 
          children[i].setAttribute('animation__fade',{property:'material.opacity',from:1,to:0,dur:10,delay:currDelay,loop:0}); 
        } 
      }
      else if(e.detail.name == 'animation__stextout'){
        // Once the text is gone, let's move in the pices of the AR article: 
        var ideascape = this.el.querySelector('#ideascape'); 
        var scapeText = this.el.querySelector('#scapetext'); 

        scapeText.setAttribute('visible',false); 

        // Now the circle: 
        var circle = ideascape.querySelector('#linkcircle'); 
        circle.setAttribute('visible',false);
        // Bring in the section balls! 
        var einsteinData = await wtf.fetch(this.data.ideascape.nodes[0].name); 
        var integralSections = einsteinData.sections().filter(x => sectionChecker(x.data.title));
        var sectionTree = await this.constructSectionTree(integralSections);
        this.el.appendChild(sectionTree);
        var treeEntity = this.el.querySelector('#sectiontree');
        var sectionGroups = treeEntity.querySelectorAll('.sectiongroup'); 
        for(var g = 0; g<sectionGroups.length; g++){
          var sectionChildren = sectionGroups[g].childNodes; //  querySelectorAll('[position]'); 
          for(var c = 0; c < sectionChildren.length; c++){
            sectionChildren[c].setAttribute('animation',{property:'material.opacity',to:1,dur:2000,easing:'easeInSine',loop:0}); 
          }
          if(g == sectionGroups.length-1){
            // Flash what these damn balls are:
            var sectionInfoText = document.createElement('a-entity'); 
            var str = "A graphical table of contents! (from Einstein's Wikipedia page)"; 
            sectionInfoText.setAttribute('geometry',{primitive:'plane',height:'auto',width:'auto'}); 
            sectionInfoText.setAttribute('material',{color:'#222',transparent:'true',opacity:0}); 
            sectionInfoText.setAttribute('text',{value:str,color:'white',side:'double',align:'center',baseline:'center',font:'dejavu',wrapCount:str.length/2+2,opacity:0});;  
            sectionInfoText.setAttribute('side', 'double');
            sectionInfoText.setAttribute('scale',{x: 8, y:8, z:8}); // we scale up via animation. 
            sectionInfoText.setAttribute('position', {x: 0, y:4.4, z:-2});
            sectionInfoText.setAttribute('id','sectioninfotext'); 
            sectionInfoText.setAttribute('visible',true); 
            sectionInfoText.setAttribute('animation__graphsections',{property:'text.opacity',to:1,dur:2400,loop:0,easing:'easeInSine'});
            this.el.appendChild(sectionInfoText);  
          }
        }
      }
      else if(e.detail.name == 'animation__graphsections'){
        // Ease out the text. And remove all the elements that aren't id'd 'Patent Office'; 
        var sectionInfoText = this.el.querySelector('#sectioninfotext'); 
        sectionInfoText.setAttribute('animation__sectioninfofade',{property:'text.opacity',to:0,dur:2400,delay:1500,loop:0,easing:'easeOutSine'}); 
        // Now remove all the sections accept patent office. And highlight it! 
        var treeEntity = this.el.querySelector('#sectiontree');
        var sectionGroups = treeEntity.querySelectorAll('.sectiongroup'); 
        for(var g = 0; g<sectionGroups.length; g++){
          var sectionChildren = sectionGroups[g].childNodes; //  querySelectorAll('[position]'); 
          for(var c = 0; c < sectionChildren.length; c++){
            if(sectionChildren[c].getAttribute('id') != 'Patent office'){
              sectionChildren[c].setAttribute('animation__sectionfade',{property:'material.opacity',to:0,delay:1500,dur:2000,easing:'easeOutSine',loop:0}); 
            } 
            else{
              sectionChildren[c].setAttribute('animation__sectiongrow',{property:'geometry.height',to:4,easing:'linear',loop:0,dur:2400,delay:1500}); 
              var position = sectionChildren[c].getAttribute('position'); 
              sectionChildren[c].setAttribute('animation__sectionshift',{property:'position',from:position,delay:1500,to:{x:position.x,y:position.y+2,z:position.z},easing:'linear',loop:0,dur:2400})
            }
          }
        }
      }
      else if(e.detail.name == 'animation__sectionfade'){
        e.target.parentEl.removeChild(e.target); 
      }
      else if(e.detail.name == 'animation__sectiongrow'){
        // Toss on a label
        var sectionText = document.createElement('a-entity'); 
        var str = "Section 1.4: Patent Office"; 
        sectionText.setAttribute('geometry',{primitive:'plane',height:'auto',width:'auto'}); 
        sectionText.setAttribute('material',{color:'#222',transparent:'true',opacity:0}); 
        sectionText.setAttribute('text',{value:str,color:'white',side:'double',align:'center',baseline:'center',font:'dejavu',wrapCount:str.length,opacity:0});;  
        sectionText.setAttribute('side', 'double');
        sectionText.setAttribute('scale',{x: 8, y:8, z:8}); // we scale up via animation. 
        sectionText.setAttribute('position', {x: 0, y:3, z:0});
        sectionText.setAttribute('id','sectioninfotext'); 
        sectionText.setAttribute('visible',true); 
        sectionText.setAttribute('animation__addsectiontext',{property:'text.opacity',to:1,dur:1800,loop:0,easing:'easeInSine'});
        e.target.appendChild(sectionText);         
      }
      else if(e.detail.name == 'animation__addsectiontext'){
        // Now we scale it all up
        console.log(e.target.parentEl);
        e.target.parentEl.setAttribute('animation__sectionexplode',{property:'scale',to:{x:11,y:5,z:11},easing:'easeOutSine',loop:0,delay:2000,dur:5000}); 
      }
      else if(e.detail.name == 'animation__sectionexplode'){
        // remove treeEntity: 
        var treeEntity = this.el.querySelector('#sectiontree');
        this.el.removeChild(treeEntity); 
        var sectionInfoText = this.el.querySelector('#sectioninfotext'); 
        this.el.removeChild(sectionInfoText); 
        // Now construct the link tunnel: 
        var einsteinData = await wtf.fetch(this.data.ideascape.nodes[0].name); 
        var patentOffice = await  einsteinData.sections('Patent office'); 
        var sentences = await patentOffice.sentences(); 
        var lastZ = await this.constructLinkTunnel(this.data.ideascape.nodes[0].linkData,sentences); 
        var tunnelEntity = this.el.querySelector('#linktunnel'); 
        console.log(lastZ,tunnelEntity.getAttribute('position')); 
        // get tunnel children: 
        var thoughtExps = tunnelEntity.querySelector("#Einsteinsthoughtexperiments"); 
        var thoughtText = thoughtExps.querySelector('.linktext'); 
        // thoughtExps.setAttribute('animation__linktext',{property:})
        thoughtText.setAttribute('visible',true); 
        // Some text to explain the tunnel: 
        var tunnelExplain = document.createElement('a-entity'); 
        var stringer = 'Sentence-wise, color-coded, link tunnels!'
        tunnelExplain.setAttribute('geometry',{primitive:'plane',height:'auto',width:'auto'}); 
        tunnelExplain.setAttribute('material',{color:'#000',transparent:'true',opacity:0.7}); 
        tunnelExplain.setAttribute('text',{value:stringer,color:'white',side:'double',align:'center',baseline:'center',font:'dejavu',wrapCount:stringer.length/3+2,opacity:0});;  
        tunnelExplain.setAttribute('side', 'double');
        tunnelExplain.setAttribute('scale',{x: 8, y:8, z:8}); // we scale up via animation. 
        tunnelExplain.setAttribute('position', {x: 0, y:3, z:-2});
        tunnelExplain.setAttribute('id','tunnelexplain'); 
        tunnelExplain.setAttribute('visible',true); 
        tunnelExplain.setAttribute('animation',{property:'text.opacity',to:1,dur:2000,loop:0,easing:'easeInSine'});
        tunnelExplain.setAttribute('animation__moveexplain',{property:'text.opacity',to:0,dur:2000,delay:4000,loop:0,easing:'easeOutSine'});
        tunnelExplain.setAttribute('animation__matfade',{property:'material.opacity',to:0,dur:2000,delay:4000,loop:0,easing:'easeOutSine'});
        this.el.appendChild(tunnelExplain); 
      }
      else if(e.detail.name == 'animation__moveexplain'){
        e.target.setAttribute('visible',false); 
        var tunnelEntity = this.el.querySelector('#linktunnel'); 
        tunnelEntity.setAttribute('animation__tunnelmove',{property:'position',from:{x:0,y:0,z:-108.1},to:{x:0,y:0,z:-58},easing:'linear',dur:12000});
      }

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
      // Add a page to the scene: 
      if(this.data.title != oldData.title && this.data.title != ""){
        console.log('NEW PAGE', this.data.title);
        // Remove the wikiScape, place 

        // Instill the new scene: 
        this.constructScene = AFRAME.utils.bind(this.constructScene, this);
        this.constructSectionComponent = AFRAME.utils.bind(this.constructSectionComponent, this); 
        // Fetch inital page data: 
        var wikiData = await wtf.fetch(this.data.title);
        // Place our system into the context of this component: 
        this.wikiSystem = this.el.sceneEl.systems.wiki;
        // Build a scene based upon the data: 
        var integralSections = wikiData.sections().filter(x => sectionChecker(x.data.title)); 
        var sectionTree = await this.constructSectionTree(integralSections); 
        this.el.appendChild(sectionTree); 
        // Update the component: 
        this.el.setAttribute('wikiscene',{pagedata:wikiData}); 
        // A rotation? 
        // this.el.setAttribute('rotation', {x: 0, y: 180, z: 0});   
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

  constructIdeaScape: async function(ideascape){
    console.log('constructing ideascape'); 
    // Here, we pack our nodes into a d3 hierarchery, and position for scene! 
    var nodes = ideascape.nodes; 
    console.log(nodes);
    // We fetch page data for nodes that don't have it!

    for(let i = 0; i < nodes.length; i++){
      if(nodes[i] && nodes[i].linkInfo == undefined){
        var pageData = await wtf.fetch(nodes[i].name);
        nodes[i].title = await pageData.title();
        nodes[i].pagedata = pageData; 
        var coords = pageData.coordinates(); 
        var categories = pageData.categories(); 
        // Use these to identify what the page is! 
        var links = await pageData.links();
        links = links.filter(removeDuplicateLinks); 
        var linkData = await getPageImages(links); 
        var people = linkData.filter(x => x.type == 'person').length; 
        var things = linkData.filter(x => x.type == 'thing').length; 
        var places = linkData.filter(x => x.type == 'place').length; 
        nodes[i].linkInfo = {people:people,places:places,things:things};
        nodes[i].linkData = linkData; 
        // adding somestuff here 
      } 
    }
    // Turning the ideascape into a hierarchy: 
    var rootNode = d3.stratify()
                     .id(function(d) {return d.name})
                     .parentId(function(d){return d.parent})
                     (nodes);   
    rootNode.sum(d => d.value); 
    // Making a layout: 
    var treeLayout = d3.tree();
    var height = 18; 
    var width = 18; 
    treeLayout.size([width, height]);
    // Giving our hierarchy some layout info! 
    treeLayout(rootNode);

    var noders = rootNode.descendants(); 
    console.log(noders);
    // An ideascape group: 
    
    // Adding pages to our ideascape! 
    var existingEntity = this.el.querySelector('#ideascape'); 
    if(existingEntity){
      // We see how many children it has! 
      var children  = existingEntity.childNodes; 
      console.log(existingEntity,children);
      console.log('children' );
      for(let i = 0; i < noders.length; i++){
        console.log(i);
        if(i<children.length){
          if(i == children.length-1){
            var animString = 'animation__lastnode'; 
          }
          else{
            var animString = 'animation__node' + i.toString(); 
          }
          var xval = noders[i].x-9; 
          var zval = noders[i].y * -1; 
          children[i].setAttribute(animString,{property:'position',to:{x:xval,y:0,z:-noders[i].depth*6}}); 
        }
        else{
          console.log('adding new node')
          var articleEntity = await this.makeIdeaChunk(noders[i],true);
          existingEntity.appendChild(articleEntity); 
        }
      } 
      this.el.setAttribute('wikiscene',{ideascape:{nodes:nodes}});
      return noders; 
    }
    else{
      var ideascapeEntity = document.createElement('a-entity');
      for(let i = 0; i<noders.length; i++){
        var articleEntity = await this.makeIdeaChunk(noders[i],false); 
        articleEntity.setAttribute('visible',true); 
        ideascapeEntity.appendChild(articleEntity); 
      }
      ideascapeEntity.setAttribute('id','ideascape'); 
      this.el.setAttribute('wikiscene',{ideascape:{nodes:nodes}});
      return ideascapeEntity
    }
    
  }, 

  // This is usec to populate our scene with idea nodes! 
  makeIdeaChunk: async function(n,circleVis){
    console.log(n,n.data);
    // Do we have a model: 
    var entity = document.createElement('a-entity'); 
    entity.setAttribute('class','articlenode'); 
    entity.setAttribute('id',n.data.title.replace(/\W/g,'')); 
    if(n.data.model){
      //We add our model to the thing! 
      // console.log(n.model); 
      var modelEntity = document.createElement('a-entity'); 
      modelEntity.setAttribute('gltf-model',n.data.model); 
      modelEntity.setAttribute('scale',{x:0.2,y:0.2,z:0.2}); 
      modelEntity.setAttribute('rotation',{x:0,y:-90,z:0}); 
      modelEntity.setAttribute('ideamodel',{});
      modelEntity.setAttribute('model-opacity',0); 
      modelEntity.setAttribute('visible',false); 
      modelEntity.setAttribute('class','articlemodel'); 
      entity.appendChild(modelEntity); 
    }
    // Do we have an image: 
    else if(n.data.image){
      // image stuff; 
    }
    // We have nothing, how about a generic shape? 
    else{
      // shape stuff...
      var shapeNode = document.createElement('a-entity'); 
      shapeNode.setAttribute('class','articleshape'); 
      shapeNode.setAttribute('geometry',{primitive:'cylinder',radius:0.8,height:1.6}); 
      shapeNode.setAttribute('material',{color:'#639ed8',metalness:0.6,roughness:0.3}) 
      shapeNode.setAttribute('position',{x:0,y:1,z:0}); 
      var textSheet = document.createElement('a-entity');
      var str = n.data.title; 
      var textHeight = 2+(n.x + 9)/18; 
      textSheet.setAttribute('geometry',{primitive:'plane',height:'auto',width:'auto'}); 
      textSheet.setAttribute('material',{color:'#222',opacity:1,side:'double',visible:false}); 
      textSheet.setAttribute('text',{value:str,color:'white',side:'double',align:'center',baseline:'center',font:'sourcecodepro',wrapCount:str.length/2+2,opacity:1}); 
      textSheet.setAttribute('position',{x:0,y:textHeight,z:0});    
      textSheet.setAttribute('scale',{x:4.2,y:4.2,z:4.2}); 
      textSheet.setAttribute('rotation',{x:0,y:0,z:0}); 
      textSheet.setAttribute('class','titletext'); 
      // textSheet.setAttribute('visible',false); 
      entity.appendChild(textSheet);
      // What about text:   

      entity.appendChild(shapeNode); 
    }
    // Make the link apron! 
    var linkCircle = document.createElement('a-entity'); 
    linkCircle.setAttribute('id','linkcircle'); 
    var linkTotal = n.data.linkInfo.people + n.data.linkInfo.places + n.data.linkInfo.things; 
    var thetaStep = 360/linkTotal; 
    var currentLink = 0; 
    var radius = 1.7; 
    var thickness = 0.25; 
    var peopleProb = n.data.linkInfo.people/linkTotal; 
    var placeProb  = n.data.linkInfo.places/linkTotal;
    var thingProb  = n.data.linkInfo.things/linkTotal;

    // Making a link-continum ! 
    for(let i = 0; i < linkTotal; i++){
      var rando = Math.random(); 
      if(peopleProb >= placeProb && peopleProb >= thingProb){
        var peopleThresh = 1-peopleProb; 
        var thingThresh = peopleThresh - thingProb; 
        if(rando >= peopleThresh){
          var color = '#c248C9'; 
        }
        else if(rando >= thingThresh){
          var color = '#639ed8'; 
        }
        else{
          var color = '#63d863'; 
        }
      }
      else if(thingProb >= peopleProb && thingProb >= placeProb){
        var thingThresh = 1-thingProb; 
        var peopleThresh = thingThresh - peopleProb; 
        if(rando >= thingThresh){
          var color = '#639ed8'; 
        }
        else if(rando >= peopleThresh){
          var color = '#c248C9'; 
        }
        else{
          var color = '#63d863';
        }
      }
      else{
        var placeThresh = 1-placeProb; 
        var thingThresh = placeThresh - thingProb; 
        if(rando >= placeThresh){
          var color = '#63d863';
        }
        else if(rando >= thingThresh){
          var color = '#639ed8'; 
        }
        else{
          var color = '#c248C9'; 
        }
      }
      var thetaStart = currentLink * thetaStep;
      var sectorRad = 1.2 + 1*Math.random(); 
      var zpos = -Math.sin(thetaStart * Math.PI/180) * sectorRad; 
      var xpos = Math.cos(thetaStart * Math.PI/180) * sectorRad; 
      var sector = document.createElement('a-entity'); 
      var heightRand = Math.random()/4; 
      var baseheight = (thickness + heightRand)/2; 
      var opac = circleVis ? 1:0; 
      sector.setAttribute('geometry',{primitive:'cylinder',radius:0.01,height:baseheight*2,segmentsRadial:6}); 
      var metalness = currentLink % 2 ? 0.45:0.45; 
      sector.setAttribute('material',{color:color,metalness:metalness,roughness:0.2,transparent:true,opacity:opac}); 
      sector.setAttribute('position',{x:xpos,y:baseheight,z:zpos}); 
      sector.setAttribute('class','sector'); 
      linkCircle.appendChild(sector); 
      currentLink += 1; 
    }
    linkCircle.setAttribute('position',{x:0,y:0,z:0});
    linkCircle.setAttribute('animation__rotation',{property:'rotation',to:{x:0,y:360,z:0},loop:true,dur:24000,easing:'linear',direction:'normal'});
    linkCircle.setAttribute('visible',circleVis); 
    entity.appendChild(linkCircle); 
    var entityPosition = {x:n.x-9,y:0,z:-n.depth*6}; 
    entity.setAttribute('position',entityPosition); 
    // What about a line to connect to parent? 
    if(n.parent){
      var connectingLine = document.createElement('a-entity'); 
      var parentPosition = {x:n.parent.x-9,y:0,z:-n.parent.depth*6}; 
      connectingLine.setAttribute('line',{start:parentPosition,end:{x:n.x-9,y:0,z:-n.depth*6}})
      // entity.appendChild(connectingLine);
    }
    // entity.setAttribute('visible',false); 
    return entity
  },

	// To construct the page: 
	constructScene: async function(sections,links,sentences){

    // Start with a binding ring: 
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

    // These are sections that can be gone into from the parent (e.g. we can go into 1.1 from 1, etc)
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
    tunnelObj.setAttribute('link-tunnel'); 
    tunnelObj.addEventListener('componentchanged', function (evt) {
      console.log(evt); 
    });
    this.el.appendChild(tunnelObj);
    return zposition 
  }, 

  // The tunnel is constructed one sentence at a time: 
  constructSentenceComponent: async function(sentence,links,index,zposition){
    // Get the sentence text: 
    console.log(sentenceLinks)
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
      console.log(sentenceLinks)
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
        sectionElement.setAttribute('id',descendants[j].id); 
        sectionContainer.appendChild(sectionElement); 
      }
      sectionContainer.setAttribute('position',{x:currentPosition,y:0,z:0}); 
      sectionContainer.setAttribute('class','sectiongroup')
      treeEntity.appendChild(sectionContainer); 
      // if(i<rootNode.children.length-1){
      //   currentPosition += rootNode.children[i+1].r*2; 
      // }
      currentPosition = currentPosition + childNode.r*2 + 0.6 ;
    }
    treeEntity.setAttribute('position',{x:-currentPosition/2,y:0,z:-9})
    var lightContainer = document.createElement('a-entity'); 
    var areaLight = document.createElement('a-entity'); 
    areaLight.setAttribute('area-light',{intensity:2,color:"#0ff",width:currentPosition+18,height:currentPosition+18,showHelper:false});
    areaLight.setAttribute('position',{x:-10,y:10,z:0});
    areaLight.setAttribute('rotation',{x:90,y:0,z:0}); 
     
    treeEntity.appendChild(areaLight);
    treeEntity.setAttribute('position',{x:-3,y:0,z:-2})
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
        case 'articleObjet': 
          // Process article clicks here: 
          break; 
        case 'catergoryObject':
          // Process category clicks here: 
          break; 
				case 'sectionObject': 
          // Process section clicks here: 
					// Lets pull out the section item from here: 
					var sectionData = this.activeItem.getAttribute('wikisection'); 
          // update currentSection of the wikiscene component: 
          var wikiSceneEl = this.sceneEl.querySelector('[wikiscene]')
          wikiSceneEl.setAttribute('wikiscene','currentSection', sectionData.section); 
					break; 
				case 'linkObject': 
          // Fires when a user clicks a link (but wait: links are pages). 
					console.log('linkObject'); 
					break; 
				case 'backButton': 
          // Need some navigation, 
					console.log('backButton'); 
					break; 
				case 'homeButton':
          // This takes users back to their idea-scape! 
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


AFRAME.registerComponent('model-opacity', {
  schema: {default: 0.0},
  init: function () {
    this.el.addEventListener('model-loaded', this.update.bind(this));
  },
  update: function () {
    var mesh = this.el.getObject3D('mesh');
    var data = this.data;
    if (!mesh) { return; }
    mesh.traverse(function (node) {
      if (node.isMesh) {
        node.material.opacity = data;
        node.material.transparent = data < 1.0;
        node.material.needsUpdate = true;
      }
    });
  }
});


AFRAME.registerComponent('link-tunnel',{
  init: function(){
    // stuff/// 
  }, 
  update: function(){
    console.log('tunnelupdate'); 
  }, 
  tick: function(){
    console.log('tunnel tick')
  }
})

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
    var colorIndex   = (Math.abs((descendant.height - rootSection.height))/rootSection.height*2)+0.5;
    var sectionColor =  d3.interpolatePurples(colorIndex); 
    // We position relative to the parent: 

      var x_position = rootSection.x-descendant.x; 
      var z_position = (rootSection.y - descendant.y); 
  
    // Okay. Now render the shape. 
    this.el.setAttribute('material',{color:sectionColor,metalness:0.8,roughness:0.1,transparent:true,opacity:true}); 
    this.el.setAttribute('class','sectionshape'); 
    if(descendant.children && descendant.children.length > 0){
      // Its going to be a cylinder: 
      this.el.setAttribute("geometry",{primitive:'cylinder',radius:descendant.r,height:height}); 
      this.el.setAttribute("position",{x:z_position,y:height/2,z:x_position})

    }
    else{
      // Its going to be a sphere: 
      var randomBoost = 2 * Math.random() + 0.2;
      var newColor = d3.interpolatePurples(1);
      this.el.setAttribute('material',{color:newColor,metalness:0.6,roughness:0.4,opacity:0,transparent:true}); 
      this.el.setAttribute("geometry",{primitive:'sphere',radius:descendant.r})
      this.el.setAttribute("position",{x:z_position,y:height+descendant.r+0.2+randomBoost,z:x_position})
    }
    if(descendant == rootSection){
      // console.log(this.el.object3D)
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

AFRAME.registerComponent('ideamodel', {
  /**
    This component declaration interacts with the model of albert einstein. We wait for the model to load,
    which is signified by the addition of chidren to the parent object. Once loaded, we move the model to the to the center of the
    user's view.
   **/
  init: function () {
    // bind modelLoaded function:
    this.onModelLoad = AFRAME.utils.bind(this.onModelLoad, this);
    this.getBox = AFRAME.utils.bind(this.getBox, this);
    // And set the function to execute when the model finishes loading:
    this.el.addEventListener('model-loaded', this.onModelLoad);
  },
  // Update monitor:
  update: function () {
  },
  // The model-loaded event listener:
  onModelLoad: async function () {
    console.log('modelLoaded')
    // That's cool and all, lets see if we can't get a bounding box:
    var bbox = await this.getBox(this.el.object3D);
    var xMid = (bbox.max.x + bbox.min.x) / 2;
    var zMid = (bbox.max.z + bbox.min.z) / 2;
    var yMid = (bbox.max.y + bbox.min.y) / 2;
    this.el.setAttribute('position', {x: -xMid, y:-yMid+1.1, z: -zMid});
  }, 
  getBox: async function(object){
    //console
    var bbox = await new THREE.Box3().setFromObject(object);
    return bbox;
  }
});

/************************************
	Some helper functions down here: 
************************************/ 

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
  var color = i % 2 == 0 ? '#BA55D3' : '#00bfff'; 
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
        console.log('rando')
        var boxColor = randomColor({hue:'monochrome',luminosity:'light'}); 
      }
      linkBox.setAttribute('geometry',{primitive:'cylinder',height:1.5,radius:0.2}); 
      linkBox.setAttribute('position',{x:0,y:0.75,z:0}); 
      linkBox.setAttribute('material',{color:boxColor,metalness:0.6,roughness:0.3}); 
      // makme some link text: 
      var textSheet = document.createElement('a-entity');
      textSheet.setAttribute('geometry',{primitive:'plane',height:'auto',width:'auto'}); 
      textSheet.setAttribute('material',{color:'#222',opacity:0,side:'double',visible:false}); 
      textSheet.setAttribute('text',{value:sentenceLinks[j].page,color:'white',side:'double',align:'center',baseline:'center',font:'sourcecodepro',wrapCount:sentenceLinks[j].page.length+2,opacity:1}); 
      textSheet.setAttribute('position',{x:0,y:2.1,z:0});    
      textSheet.setAttribute('scale',{x:12,y:12,z:12}); 
      textSheet.setAttribute('rotation',{x:0,y:180,z:0}); 
      textSheet.setAttribute('class','linktext'); 
      textSheet.setAttribute('visible',false); 
      linkObj.appendChild(linkBox); 
      linkObj.appendChild(textSheet); 
      linkObj.setAttribute('id',sentenceLinks[j].page.replace(/\W/g,'')); 
      linkObj.setAttribute('class','linkobject'); 
      // We position link object! 
      // if(linkData && linkData.original){
      //   // we have an image! 
      //   var randY      = 2.8; 
      //   let aspect     = linkData.original.height / linkData.original.width; 
      //   let imwidth    = 3; 
      //   let imheight   = imwidth * aspect; 
      //   var imagePlane = document.createElement('a-entity'); 
      //   imagePlane.setAttribute('geometry',{primitive:'plane',height:imheight,width:imwidth}); 
      //   imagePlane.setAttribute('material',{side:'double',src:linkData.original.source,metalness:0,roughness:0})
      //   imagePlane.setAttribute('position',{0:randX,y:randY,z:0}); 
      //   // we can add some text to the top of the image. 
      //   var textSheet = document.createElement('a-entity');
      //   textSheet.setAttribute('geometry',{primitive:'plane',height:'auto',width:'auto'}); 
      //   textSheet.setAttribute('material',{color:'#222',opacity:0,side:'double',visible:false}); 
      //   textSheet.setAttribute('text',{value:sentenceLinks[j].page,color:'white',side:'double',align:'center',baseline:'center',font:'sourcecodepro',wrapCount:sentenceLinks[j].page.length+2}); 
      //   textSheet.setAttribute('position',{x:0,y:-0.4-imheight/2,z:0});    
      //   textSheet.setAttribute('scale',{x:8,y:8,z:8}); 
      //   // textSheet.setAttribute('visible',false); 
      //   imagePlane.setAttribute('visible',false); 
      //   imagePlane.appendChild(textSheet); 
      //   linkObj.appendChild(imagePlane); 
      // }
      // else{
      //   var randY     = 1.6; 
      //   var textSheet = document.createElement('a-entity');
      //   textSheet.setAttribute('geometry',{primitive:'plane',height:'auto',width:'auto'}); 
      //   textSheet.setAttribute('material',{color:'#222',transparent:true,opacity:0,side:'double'}); 
      //   textSheet.setAttribute('text',{value:sentenceLinks[j].page,color:'white',side:'double',align:'center',baseline:'center',font:'sourcecodepro',wrapCount:sentenceLinks[j].page.length+2});
      //   textSheet.setAttribute('scale',{x:10,y:10,z:10}); 
      //   textSheet.setAttribute('position',{x:0,y:randY,z:0});
      //   textSheet.setAttribute('visible',false); 
      //   linkObj.appendChild(textSheet); 
      // }
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
      // Phrasing the title string as such seems to avoid hangups! P
      // Pages will 500+ categories may still throw us for a loop, though
      // and to handle this we may have to yank the troubling page from the batch and carry-on (that's for later though). 
      let baseQuery = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages%7Ccoordinates%7Ccategories&piprop=name%7Coriginal&pilimit=50&pilicense=any&clshow=!hidden&cllimit=500&redirects=1&colimit=max&coprimary=all`
      let queryUrl      = baseQuery + '&' + titleString; 
      let wikiResponse  = await fetch(queryUrl); 
      var wikiObject    = await wikiResponse.json();
      var wikiArray = []; 
      // Check to see if we have a continue and handle accordingly: 
      if(wikiObject && wikiObject.continue){
        var goForth = false; 
        var currentObj = wikiObject; 
        var contObj = currentObj.continue; 
        // We want to see if there is a clcontinue, which there should be, they gum things up 
        while(goForth == false){ 
          if(contObj && contObj.clcontinue){
            var stickyID = parseInt(contObj.clcontinue.split('|')[0]); 
            // pull all objects form query below or equal to the sticky one: 
            var pids = Object.keys(currentObj.query.pages); 
            var idArray = []; 
            var idStr = "pageids="; 
            for(let j = 0; j < pids.length; j++){
              if( parseInt(pids[j]) <= stickyID ){
                wikiArray.push(currentObj.query.pages[pids[j]]); 
              }
              else{
                idArray.push(pids[j]); 
              }
            }
            if(idArray.length > 0){
              // pull new ids: 
              var idString = "&pageids=" + idArray.join("%7C"); 
              var newQuery = baseQuery + idString; 
              var newResponse = await fetch(newQuery); 
              currentObj = await newResponse.json(); 
              if(currentObj && currentObj.continue){
                contObj = currentObj.continue; 
              }
              else{
                // toss the most recent pull into our wikiArray: 
                var newIds = Object.keys(currentObj.query.pages); 
                for(let j = 0; j<newIds.length; j++){
                  wikiArray.push(currentObj.query.pages[newIds[j]]); 
                }
                break; 
              }
            }
            else{
              break; 
            }
          }
        }
      }
      else if(wikiObject){
        var pids = Object.keys(wikiObject.query.pages);  
        for(let j = 0; j < pids.length; j++){
          wikiArray.push(wikiObject.query.pages[pids[j]]); 
        }        
      }

      // Check for revisions: THIS OBJECT IS DIFFERENT. GIVE IT TITLES, GET TITLES IN THE OUTPUT OBJECT. 

      // Redirects: We need to handle these, basically, the page given in the link goes to another page. 
      // thus, when we go through the sentence/section links, the data we seek, which is outputted from the API, 
      // doesn't get matched up unless we make it so. 

      // Loop through the images array, NOT the pages array!
      if(wikiArray){
        // Now we loop through imagesChunk and piece together the output: 
        for(var jj in imagesChunk){
          // Get the corresponding wikiObject: 
          var pageObject = wikiArray.find( x => x.title == imagesChunk[jj].page); 
          // Page found. No redirect!
          if(pageObject){
            pageObject.type = identifyArticle(pageObject); 
            var wikiFields = Object.keys(pageObject); 
            for(var kk in wikiFields){
              imagesChunk[jj][wikiFields[kk]] = pageObject[wikiFields[kk]]; 
            }
           
            outArray.push(imagesChunk[jj]); 
          }
          // Handling redirects! 
          else if(wikiObject.query.redirects){
            // look in redirects: 
            var redirectObject = wikiObject.query.redirects.find(x => x.from == imagesChunk[jj].page);
            // Okay, we have the redirect object. Now get the page object! 
            if(redirectObject){
              var pageObject = wikiArray.find( x => x.title == redirectObject.to); 
              pageObject.type = identifyArticle(pageObject);  
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
    // see what we have: 
    var people = outArray.filter(x => x.type == 'person'); 
    var places = outArray.filter(x => x.type == 'place'); 
    var things = outArray.filter(x => x.type == 'thing');
    return outArray
  }
  catch(error){
    console.log('error fetching page images: ', error); 
  }
}

// Need to identify page as person place or thing: 
function identifyArticle(pageObject){
  if(pageObject && pageObject.coordinates){
    var linkType = 'place'; 
  }
  else if(pageObject && pageObject.categories){
    // Scan the catergories for people things...
    var person = false; 
    for(let jj = 0; jj < pageObject.categories.length; jj += 1){
      var catTitle = pageObject.categories[jj].title; 
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
    var linkType = 'unknown'; 
    console.log('link not identified', pageObject);
  }
  // console.log(linkType,pageObject);
  return linkType
}

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

function removeDuplicateLinks( item, index, inputArray ){
  var slicedArray = inputArray.slice(index+1); 
  if(item.page && slicedArray.length > 0){
    var slicedSearch = slicedArray.findIndex( x => x.page == item.page); 
    if(slicedSearch == -1){
      return true
    }
    else{
      return false
    }
  }
  else{
    return true; 
  }
} 

// To shuffle arrays: 
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

