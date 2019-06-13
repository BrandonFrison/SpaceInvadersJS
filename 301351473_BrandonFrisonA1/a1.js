var canvas;
var gl;
var vBuffer;
var vertices = [];
var coloursVertices = [];
var botRightPixel = 0.03;
var height = -0.80;
var alienBulletsx = [-1.5,-1.5,-1.5,-1.5,-1.5];
var alienBulletsy = [0,0,0,0,0];
var bulletsy = [-0.85,-0.85,-0.85,-0.85];
var bulletsx = [-1.5,-1.5,-1.5,-1.5];
var aliensxCoordinates = [0,0,0,0,0,0,0,0,0,0];
var aliensyCoordinates = [1,0.85,1,0.85,1,0.85,1,0.85,1,0.85];
var borders = [0,0];
var alienbulletSpeed = -3.0;
var popupalert = true;
var vColourBuffer;
var bulletborders = [0,0,0,0];
var bulletsShots = 0;
var botRowKilled = 0;
var row1Direction, row2Direction, row1hitwall, row2hitwall;
var text = document.getElementById("header");
var bulletNumber = document.getElementById("bullets");
var randomspeed = 400; //starting side to side speed
var endflag = false;
var row1deadflag = false;
var bulletShot = [false,false,false,false];
window.addEventListener("click", shootBullet, false);
window.addEventListener("keydown", getKey, false);

// spaceship vertices       
/*spaceshipVertices = [
        vec2 (width-0.06, -1.00),
        vec2 (width, -1.00),
        vec2 (width, -0.90),
        vec2 (width-0.06, -1.00),
        vec2 (width, -0.90),
        vec2 (width-0.06, -0.90)
    ]; */ 

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    vBuffer = gl.createBuffer();
   // gl.bufferData( gl.ARRAY_BUFFER, flatten(spaceshipVertices), gl.STATIC_DRAW );    
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    var vPosition = gl.getAttribLocation( program, "position" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );    

   //color stuff
    vColourBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vColourBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(coloursVertices), gl.STATIC_DRAW);
    var vColour = gl.getAttribLocation( program, "colour");
    gl.vertexAttribPointer( vColour, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColour );  
       
    
    //functions
      seedAliens();
      render();
      setInterval(uniformDown, 1500);
      randomMovement();
      setTimeout(alienShootBullet,2000); //gives player 2 seconds before shooting at them
      };

function uniformDown(){
    if(!endflag){
        for (var i = 0; i < aliensyCoordinates.length; i++){
            aliensyCoordinates[i] = aliensyCoordinates[i] - 0.08;
            if(aliensyCoordinates[i] < -0.94){
                text.style.color = "red";
                text.style.fontSize = "50px";
                text.innerHTML = "You have lost Aliens landed on earth!<br><br>";
                //setTimeout(restartGame,5000); //waits 5 seconds and restarts
                if(popupalert){
                    window.alert("You have lost Aliens landed on earth!");
                }
                popupalert = false;
                setTimeout(restartGame,2000);
                endflag = true;
            }
        }
        if(randomspeed > 150){
            randomspeed = randomspeed - 20; //speeds up closer to bottom
        }
    }
}

function reseedAlien(val){
    var sign2;
        aliensxCoordinates[val] = Math.random().toFixed(2);
        if(Math.random() > 0.5){
            sign2 = -1;
            aliensxCoordinates[val] = aliensxCoordinates[val] - 0.07; //so that it doesn't go off the left wall
        }else{
            sign2 = 1;
        }
        aliensxCoordinates[val] = aliensxCoordinates[val]*sign2;
        checkForAlienConflict();
}

function seedAliens(){
    var sign;
    for(var i = 0; i < aliensxCoordinates.length; i++){
        aliensxCoordinates[i] = Math.random().toFixed(2);
        if(Math.random() > 0.5){
            sign = -1;
            aliensxCoordinates[i] = aliensxCoordinates[i] - 0.07; //so that it doesn't go off the left wall
        }else{
            sign = 1;
        }
        aliensxCoordinates[i] = aliensxCoordinates[i]*sign;
        //need way here to check for conflicts
        
    }
    checkForAlienConflict();
}

function randomMovement(){ //for random movement
    if(!endflag){
        var testNumber = Math.random().toFixed(2);
        if(testNumber > 0.5 && testNumber < 0.75){
            row1Direction = -1;
            row2Direction = -1;
        }else if(testNumber < 0.5 && testNumber > 0.25){
            row1Direction = 1;
            row2Direction = -1;
        }else if(testNumber < 0.25){
            row1Direction = 1
            row2Direction = 1;
        }else if(testNumber > 0.75){
            row1Direction = -1;
            row2Direction = 1;
        }
        //checkWallHits();
        for(var i = 0; i < aliensxCoordinates.length; i++){
            if(!checkIfAlienDead(i)){
                checkWallHits();
                checkAlienHits();
            }
            if(i % 2 == 0){
                if(aliensxCoordinates[i] + (row1Direction*0.02) < 0.99 && aliensxCoordinates[i] + (row1Direction*0.02) > -0.94 || checkIfAlienDead(i)){
                    if(!row1hitwall){
                        //checkWallHits();
                        //checkAlienHits();
                        aliensxCoordinates[i] = aliensxCoordinates[i] + (row1Direction*0.02);
                    }else{
                        //checkWallHits();
                        //checkAlienHits();
                        aliensxCoordinates[i] = aliensxCoordinates[i] + (-row1Direction*0.02);
                    }
                }else{
                    row1hitwall = true;
                }
            }else{
                if(aliensxCoordinates[i] + (row2Direction*0.02) < 0.99 && aliensxCoordinates[i] + (row2Direction*0.02) > -0.94 || checkIfAlienDead(i)){
                    if(!row2hitwall){
                        //checkWallHits();
                        //checkAlienHits();
                        aliensxCoordinates[i] = aliensxCoordinates[i] + (row2Direction*0.02);
                    }else{
                        //checkWallHits();
                        //checkAlienHits();
                        aliensxCoordinates[i] = aliensxCoordinates[i] + (-row2Direction*0.02);
                    }
                }else{
                    row2hitwall = true;
                }    
            }
        }
        row1hitwall = false;
        row2hitwall = false;
        window.setTimeout(randomMovement, randomspeed);
    }
}

function checkIfAlienDead(alien){
    if(aliensxCoordinates[alien] > 5){
        return true;
    }else{
        return false;
    }
}


function checkForAlienConflict(){
    for(var i = 0; i < aliensxCoordinates.length; i++){
        borders[0] = aliensxCoordinates[i]+0.01;
        borders[1] = aliensxCoordinates[i]-0.08;
        for(var j = i+2; j < aliensxCoordinates.length; j = j+2){
            if(borders[1] < aliensxCoordinates[j] && borders[0] > aliensxCoordinates[j]){
                reseedAlien(i);
                console.log("Lconflicts");
            }else if(borders[0] > aliensxCoordinates[j]-0.08 && borders[1] < aliensxCoordinates[j]){
                reseedAlien(i);
                console.log("Rconflicts");
            }
        }
    }
}

function checkAlienHits(){
    for(var i = 0; i < aliensxCoordinates.length; i++){
        borders[0] = aliensxCoordinates[i]+0.01;
        borders[1] = aliensxCoordinates[i]-0.08;
        for(var j = i+2; j < aliensxCoordinates.length; j = j+2){
            if(borders[1] < aliensxCoordinates[j] && borders[0] > aliensxCoordinates[j]){
                changeDirectionAlien(i, "right");
                console.log("Rdirection change");
            }else if(borders[0] > aliensxCoordinates[j]-0.08 && borders[1] < aliensxCoordinates[j]){
                changeDirectionAlien(i, "left");
                console.log("Ldirection change");
            }
        }
    }
}

function checkWallHits(){
    for(var i = 0; i < aliensxCoordinates.length; i++){
        borders[0] = aliensxCoordinates[i]+0.01;
        borders[1] = aliensxCoordinates[i]-0.08;
            if(borders[1] < -0.99){
                changeDirectionAlien(i, "right");
                console.log("Rdirection wall change");
            }else if(borders[0] > 0.99){
                changeDirectionAlien(i, "left");
                console.log("Ldirection wall change");
            }
        
    }
}

function changeDirectionAlien(alien, direction){
    if(direction == "right"){
        if(aliensxCoordinates[alien] + 0.08 < 1.0){
            aliensxCoordinates[alien] = aliensxCoordinates[alien] + 0.08;
        }
    }else if(direction == "left"){
        if(aliensxCoordinates[alien] + 0.08 > -1.0){
            aliensxCoordinates[alien] = aliensxCoordinates[alien] - 0.08;
        }   
    }
  
}

function render(){
    vertices = [
            //spaceship
            vec2 (botRightPixel-0.07, -1.00),
            vec2 (botRightPixel, -1.00),
            vec2 (botRightPixel, -0.89),
            vec2 (botRightPixel-0.07, -1.00),
            vec2 (botRightPixel, -0.89),
            vec2 (botRightPixel-0.07, -0.89),
            //alien1
            vec2 (aliensxCoordinates[0]-0.07, aliensyCoordinates[0]),
            vec2 (aliensxCoordinates[0], aliensyCoordinates[0]),
            vec2 (aliensxCoordinates[0], aliensyCoordinates[0]-0.11),
            vec2 (aliensxCoordinates[0]-0.07, aliensyCoordinates[0]),
            vec2 (aliensxCoordinates[0], aliensyCoordinates[0]-0.11),
            vec2 (aliensxCoordinates[0]-0.07, aliensyCoordinates[0]-0.11),
            //alien2
            vec2 (aliensxCoordinates[1]-0.07, aliensyCoordinates[1]),
            vec2 (aliensxCoordinates[1], aliensyCoordinates[1]),
            vec2 (aliensxCoordinates[1], aliensyCoordinates[1]-0.11),
            vec2 (aliensxCoordinates[1]-0.07, aliensyCoordinates[1]),
            vec2 (aliensxCoordinates[1], aliensyCoordinates[1]-0.11),
            vec2 (aliensxCoordinates[1]-0.07, aliensyCoordinates[1]-0.11),
            //alien3
            vec2 (aliensxCoordinates[2]-0.07, aliensyCoordinates[2]),
            vec2 (aliensxCoordinates[2], aliensyCoordinates[2]),
            vec2 (aliensxCoordinates[2], aliensyCoordinates[2]-0.11),
            vec2 (aliensxCoordinates[2]-0.07, aliensyCoordinates[2]),
            vec2 (aliensxCoordinates[2], aliensyCoordinates[2]-0.11),
            vec2 (aliensxCoordinates[2]-0.07, aliensyCoordinates[2]-0.11),
            //alien4
            vec2 (aliensxCoordinates[3]-0.07, aliensyCoordinates[3]),
            vec2 (aliensxCoordinates[3], aliensyCoordinates[3]),
            vec2 (aliensxCoordinates[3], aliensyCoordinates[3]-0.11),
            vec2 (aliensxCoordinates[3]-0.07, aliensyCoordinates[3]),
            vec2 (aliensxCoordinates[3], aliensyCoordinates[3]-0.11),
            vec2 (aliensxCoordinates[3]-0.07, aliensyCoordinates[3]-0.11),
            //alien5
            vec2 (aliensxCoordinates[4]-0.07, aliensyCoordinates[4]),
            vec2 (aliensxCoordinates[4], aliensyCoordinates[4]),
            vec2 (aliensxCoordinates[4], aliensyCoordinates[4]-0.11),
            vec2 (aliensxCoordinates[4]-0.07, aliensyCoordinates[4]),
            vec2 (aliensxCoordinates[4], aliensyCoordinates[4]-0.11),
            vec2 (aliensxCoordinates[4]-0.07, aliensyCoordinates[4]-0.11),
            //alien6
            vec2 (aliensxCoordinates[5]-0.07, aliensyCoordinates[5]),
            vec2 (aliensxCoordinates[5], aliensyCoordinates[5]),
            vec2 (aliensxCoordinates[5], aliensyCoordinates[5]-0.11),
            vec2 (aliensxCoordinates[5]-0.07, aliensyCoordinates[5]),
            vec2 (aliensxCoordinates[5], aliensyCoordinates[5]-0.11),
            vec2 (aliensxCoordinates[5]-0.07, aliensyCoordinates[5]-0.11),
            //alien7
            vec2 (aliensxCoordinates[6]-0.07, aliensyCoordinates[6]),
            vec2 (aliensxCoordinates[6], aliensyCoordinates[6]),
            vec2 (aliensxCoordinates[6], aliensyCoordinates[6]-0.11),
            vec2 (aliensxCoordinates[6]-0.07, aliensyCoordinates[6]),
            vec2 (aliensxCoordinates[6], aliensyCoordinates[6]-0.11),
            vec2 (aliensxCoordinates[6]-0.07, aliensyCoordinates[6]-0.11),
            //alien8
            vec2 (aliensxCoordinates[7]-0.07, aliensyCoordinates[7]),
            vec2 (aliensxCoordinates[7], aliensyCoordinates[7]),
            vec2 (aliensxCoordinates[7], aliensyCoordinates[7]-0.11),
            vec2 (aliensxCoordinates[7]-0.07, aliensyCoordinates[7]),
            vec2 (aliensxCoordinates[7], aliensyCoordinates[7]-0.11),
            vec2 (aliensxCoordinates[7]-0.07, aliensyCoordinates[7]-0.11),   
             //alien9
            vec2 (aliensxCoordinates[8]-0.07, aliensyCoordinates[8]),
            vec2 (aliensxCoordinates[8], aliensyCoordinates[8]),
            vec2 (aliensxCoordinates[8], aliensyCoordinates[8]-0.11),
            vec2 (aliensxCoordinates[8]-0.07, aliensyCoordinates[8]),
            vec2 (aliensxCoordinates[8], aliensyCoordinates[8]-0.11),
            vec2 (aliensxCoordinates[8]-0.07, aliensyCoordinates[8]-0.11),   
             //alien10
            vec2 (aliensxCoordinates[9]-0.07, aliensyCoordinates[9]),
            vec2 (aliensxCoordinates[9], aliensyCoordinates[9]),
            vec2 (aliensxCoordinates[9], aliensyCoordinates[9]-0.11),
            vec2 (aliensxCoordinates[9]-0.07, aliensyCoordinates[9]),
            vec2 (aliensxCoordinates[9], aliensyCoordinates[9]-0.11),
            vec2 (aliensxCoordinates[9]-0.07, aliensyCoordinates[9]-0.11),   
            //bullet1
            vec2(bulletsx[0]-0.05,bulletsy[0]),
            vec2(bulletsx[0]-0.03,bulletsy[0]+0.05),
            vec2(bulletsx[0]-0.01,bulletsy[0]),
            //bullet2
            vec2(bulletsx[1]-0.05,bulletsy[1]),
            vec2(bulletsx[1]-0.03,bulletsy[1]+0.05),
            vec2(bulletsx[1]-0.01,bulletsy[1]),
            //bullet3
            vec2(bulletsx[2]-0.05,bulletsy[2]),
            vec2(bulletsx[2]-0.03,bulletsy[2]+0.05),
            vec2(bulletsx[2]-0.01,bulletsy[2]),
            //bullet4
            vec2(bulletsx[3]-0.05,bulletsy[3]),
            vec2(bulletsx[3]-0.03,bulletsy[3]+0.05),
            vec2(bulletsx[3]-0.01,bulletsy[3]),
            //alienbullet1
            vec2(alienBulletsx[0]-0.05,alienBulletsy[0]),
            vec2(alienBulletsx[0]-0.03,alienBulletsy[0]-0.05),
            vec2(alienBulletsx[0]-0.01,alienBulletsy[0]),
            //alienbullet2
            vec2(alienBulletsx[1]-0.05,alienBulletsy[1]),
            vec2(alienBulletsx[1]-0.03,alienBulletsy[1]-0.05),
            vec2(alienBulletsx[1]-0.01,alienBulletsy[1]),
            //alienbullet3
            vec2(alienBulletsx[2]-0.05,alienBulletsy[2]),
            vec2(alienBulletsx[2]-0.03,alienBulletsy[2]-0.05),
            vec2(alienBulletsx[2]-0.01,alienBulletsy[2]),
            //alienbullet4
            vec2(alienBulletsx[3]-0.05,alienBulletsy[3]),
            vec2(alienBulletsx[3]-0.03,alienBulletsy[3]-0.05),
            vec2(alienBulletsx[3]-0.01,alienBulletsy[3]),
            //alienbullet5
            vec2(alienBulletsx[4]-0.05,alienBulletsy[4]),
            vec2(alienBulletsx[4]-0.03,alienBulletsy[4]-0.05),
            vec2(alienBulletsx[4]-0.01,alienBulletsy[4]),

    ]; 

    coloursVertices = [
    //spaceship
            vec4(0.0,1.0,0.0,1.0),
            vec4(0.0,1.0,0.0,1.0),
            vec4(0.0,1.0,0.0,1.0),
            vec4(0.0,1.0,0.0,1.0),
            vec4(0.0,1.0,0.0,1.0),
            vec4(0.0,1.0,0.0,1.0),
            //alien1
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            //alien2
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            //alien3
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            //alien4
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            //alien5
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            //alien6
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            //alien7
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            //alien8
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            //alien9
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            //alien10
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            //bullet1
            vec4(0.0,1.0,0.0,1.0),
            vec4(0.0,1.0,0.0,1.0),
            vec4(0.0,1.0,0.0,1.0),
            //bullet2
            vec4(0.0,1.0,0.0,1.0),
            vec4(0.0,1.0,0.0,1.0),
            vec4(0.0,1.0,0.0,1.0),
            //bullet3
            vec4(0.0,1.0,0.0,1.0),
            vec4(0.0,1.0,0.0,1.0),
            vec4(0.0,1.0,0.0,1.0),
            //bullet4
            vec4(0.0,1.0,0.0,1.0),
            vec4(0.0,1.0,0.0,1.0),
            vec4(0.0,1.0,0.0,1.0),
            //alienbullet1
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            //alienbullet2
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            //alienbullet3
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            //alienbullet4
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            //alienbullet5
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            vec4(1.0,0.0,0.0,1.0),
            
    ];

        if(bulletShot[0]){
             bulletsy[0] = bulletsy[0]+0.01;
             checkKillAlien();
                if(bulletsy[0] > 1.5){
                    bulletsy[0] = -1.5;
                   //console.log("bullet gone");
                   bulletShot[0] = false;
                }
        }
        if(bulletShot[1]){
             bulletsy[1] = bulletsy[1]+0.01;
             checkKillAlien();
                if(bulletsy[1] > 1.5){
                    bulletsy[1] = -1.5;
                   //console.log("bullet gone");
                   bulletShot[1] = false;
                }
        }
        if(bulletShot[2]){
             bulletsy[2] = bulletsy[2]+0.01;
             checkKillAlien();
                if(bulletsy[2] > 1.5){
                    bulletsy[2] = -1.5;
                   //console.log("bullet gone");
                   bulletShot[2] = false;
                }
        }
        if(bulletShot[3]){
             bulletsy[3] = bulletsy[3]+0.01;
             checkKillAlien();
                if(bulletsy[3] > 1.5){
                    bulletsy[3] = -1.5;
                   //console.log("bullet gone");
                   bulletShot[3] = false;
                }
        }
        if(!endflag){
            for (var i = 0; i < alienBulletsy.length; i++) {
                alienBulletsy[i] = alienBulletsy[i]-0.01;
                checkKillPlayer();
                if(alienBulletsy[i] < alienbulletSpeed){
                    alienShootBullet();
                }
            }
        }


        gl.clear( gl.COLOR_BUFFER_BIT ); 
        //gl.bindBuffer(gl.ARRAY_BUFFER, vColourBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );   

        gl.bindBuffer(gl.ARRAY_BUFFER, vColourBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(coloursVertices), gl.STATIC_DRAW );   

        
        //gl.bufferData(gl.ARRAY_BUFFER, flatten(coloursVertices), gl.STATIC_DRAW);
        
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length );

       
        //gl.bindBuffer(gl.ARRAY_BUFFER, spaceshipBuffer);
        
       
        window.requestAnimationFrame(render);
    
}

function getKey(key){
    if(key.key == "q"){ //81 is q
        console.log("q click works");
        canvas.style.visibility='hidden';
        text.innerHTML = "";
        endflag = true;
    }else if (key.key == "r") { //82 is r
        restartGame();
    }else if (key.key == "ArrowLeft"){ //37 is l arr
        moveLeft();
    }else if (key.key == "ArrowRight"){ // 39 is r arr
        moveRight();
    }else if (key.key == "z"){
        increaseDifficulty();
    }else if (key.key == "x"){
        decreaseDifficulty();
    }
}

function increaseDifficulty(){
    alienbulletSpeed = -1.3;
}

function decreaseDifficulty(){
    alienbulletSpeed = -5.0;
}

function moveLeft(){
    console.log("move left works");
    if(!endflag){
        if(botRightPixel > -0.92){
            botRightPixel = botRightPixel - 0.02;
        }
    }
}

function moveRight(){
    console.log("move right works");
    if(!endflag){
        if(botRightPixel < 0.99){
            botRightPixel = botRightPixel + 0.02;
        }
    }
}

function shootBullet(){
    if(!endflag){
        if(!bulletShot[0]||!bulletShot[1]||!bulletShot[2]||!bulletShot[3]){
            if(!bulletShot[0]){
                bulletsy[0] = -0.9
                bulletsx[0] = botRightPixel; //sets the bullet to stay in its lane
                bulletShot[0] = true;
                bulletNumber.innerHTML = "Number of bullets: = 3";
            }else if(!bulletShot[1]){
                bulletsy[1] = -0.9
                bulletsx[1] = botRightPixel; //sets the bullet to stay in its lane
                bulletShot[1] = true;
                bulletNumber.innerHTML = "Number of bullets: = 2";
            }else if(!bulletShot[2]){
                bulletsy[2] = -0.9
                bulletsx[2] = botRightPixel; //sets the bullet to stay in its lane
                bulletShot[2] = true;
                bulletNumber.innerHTML = "Number of bullets: 1";
            }else if(!bulletShot[3]){
                bulletsy[3] = -0.9
                bulletsx[3] = botRightPixel; //sets the bullet to stay in its lane
                bulletShot[3] = true;
                bulletNumber.innerHTML = "Number of bullets: 0";
            }
        }
    }
}

function restartGame(){
    console.log("r click works");
    location.reload();
}

function alienShootBullet(){
    //for row 1 shooters
    if(!row1deadflag){
        alienBulletsy[0] = aliensyCoordinates[1];
        alienBulletsx[0] = aliensxCoordinates[1];
        alienBulletsy[1] = aliensyCoordinates[3];
        alienBulletsx[1] = aliensxCoordinates[3];
        alienBulletsy[2] = aliensyCoordinates[5];
        alienBulletsx[2] = aliensxCoordinates[5];
        alienBulletsy[3] = aliensyCoordinates[7];
        alienBulletsx[3] = aliensxCoordinates[7];
        alienBulletsy[4] = aliensyCoordinates[9];
        alienBulletsx[4] = aliensxCoordinates[9];
    }else{
        //for row 2 shooters
        alienBulletsy[0] = aliensyCoordinates[0];
        alienBulletsx[0] = aliensxCoordinates[0];
        alienBulletsy[1] = aliensyCoordinates[2];
        alienBulletsx[1] = aliensxCoordinates[2];
        alienBulletsy[2] = aliensyCoordinates[4];
        alienBulletsx[2] = aliensxCoordinates[4];
        alienBulletsy[3] = aliensyCoordinates[6];
        alienBulletsx[3] = aliensxCoordinates[6];
        alienBulletsy[4] = aliensyCoordinates[8];
        alienBulletsx[4] = aliensxCoordinates[8];
    }   
}

function checkKillPlayer(){
    for(var i = 0; i < alienBulletsx.length; i++){
        if(botRightPixel > alienBulletsx[i]-0.04 && botRightPixel-0.06 < alienBulletsx[i]-0.02 && alienBulletsy[i] < -0.85 && alienBulletsy[i] > -1.0){
            //bullet hit the player
            text.style.color = "red";
            text.style.fontSize = "50px";
            text.innerHTML = "You have lost Aliens destroyed your spaceship!<br><br>";
            //setTimeout(restartGame,5000); //waits 5 seconds and restarts
            //window.alert("You have lost Aliens landed on earth!");
            if(popupalert){
                    window.alert("You have lost Aliens destroyed your spaceship!");
            }
            popupalert = false;
            setTimeout(restartGame,2000);

            endflag = true;
        }
    }
}

function checkKillAlien(){
    //needs to see if bullet passes any borders of the aliens
    for(var i = 0; i < aliensxCoordinates.length; i++){
        //save borders of alien
        bulletborders[0] = aliensxCoordinates[i]; //right border
        bulletborders[1] = aliensxCoordinates[i]-0.06; //left border
        bulletborders[2] = aliensyCoordinates[i]; //bottom border
        bulletborders[3] = aliensyCoordinates[i]+0.1; //top border
        //if the bullet crosses any of these borders then it will make alien go away.
        for(var j = 0; j < bulletsx.length; j++){
            if(bulletborders[0] > bulletsx[j]-0.04 && bulletborders[1] < bulletsx[j]-0.02 && bulletborders[2] < bulletsy[j]+0.04 && bulletborders[3] > bulletsy[j]){
                    bulletsx[j] = 200;
                    console.log("alien " + i + " hit");
                    aliensxCoordinates[i] = 100;
                    aliensyCoordinates[i] = 1;
                    if(i % 2 == 1){
                        botRowKilled += 1;
                        if(botRowKilled == 5){
                            row1deadflag = true;
                        }
                    }
                    checkForWin();
                }
            }
    }
}
function checkForWin(){
    var goal = 10;
    for(var i = 0; i < aliensxCoordinates.length; i++){
        if(aliensxCoordinates[i] > 1){
            goal -= 1;
            if(goal == 0){
                text.style.color = "green";
                text.style.fontSize = "50px";
                text.innerHTML = "You have won all Aliens destroyed!<br><br>";
                //setTimeout(restartGame,5000); //waits 5 seconds and restarts
                //window.alert("You have won all Aliens destroyed!");
                if(popupalert){
                    window.alert("You have won all Aliens destroyed!");
                }
                popupalert = false;
                setTimeout(restartGame,2000);

                endflag = true;
            }
        }
    }
}