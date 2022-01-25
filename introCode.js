//firebase credentials, enter them here
var firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  };
//stores roomcode and username (also various game parameters)
var roomCode = "";
var username = "";
var host = false;
var stabilizerOn = false;
var classModeOn = false;
var fontName = "Trebuchet MS";
var fontList = [];

//initalize firebase app
firebase.initializeApp(firebaseConfig);
//reformats UI based on screen size on load (to make game compatible with phones and other wonky aspect ratios)
window.addEventListener("load", () => {
  if(document.documentElement.clientWidth < 600){
    var buttons = document.getElementsByClassName('button');
    for(i = 0; i < buttons.length; i++) {
      buttons[i].style.width = "75%";
    }

    var inputs = document.getElementsByClassName('input');
    for(i = 0; i < inputs.length; i++) {
      inputs[i].style.width = "75%";
    }

    document.getElementById("game").style.width = "80vmin";
    document.getElementById("playerStats").style.maxWidth = "80vmin";

    var cells = document.getElementsByClassName('cell');
    for(i = 0; i < cells.length; i++) {
      cells[i].style.width = "20vmin";
      cells[i].style.height = "20vmin";
    }

    var bars = document.getElementsByClassName('word');
    for(i = 0; i < cells.length; i++) {
      bars[i].style.width = "80vmin";
    }
  }
  //initalize dictionary
  $Spelling.DefaultDictionary = "scrabble";

});
//all of these control the UI and menuing
function createNewGame(){
  document.getElementById("intro").style.display = "none";
  document.getElementById("username").style.display = "block";
  document.getElementById("fontInput").style.display = "block";
  document.getElementById("navigation").style.display = "inline-block";
  checkName();
}

function createJoinGame(){
  document.getElementById("intro").style.display = "none";
  document.getElementById("username").style.display = "block";
  document.getElementById("roomCodeInput").style.display = "block";
  document.getElementById("fontInput").style.display = "block";
  document.getElementById("navigation2").style.display = "inline-block";
  checkRoomCode();
}

function backNewGame(){
  document.getElementById("intro").style.display = "block";
  document.getElementById("username").style.display = "none";
  document.getElementById("fontInput").style.display = "none";
  document.getElementById("navigation").style.display = "none";
  document.getElementById("createButton").disabled = true;
}

function backJoinGame(){
  document.getElementById("intro").style.display = "block";
  document.getElementById("username").style.display = "none";
  document.getElementById("roomCodeInput").style.display = "none";
  document.getElementById("fontInput").style.display = "none";
  document.getElementById("navigation2").style.display = "none";
  document.getElementById("roomError").style.display = "none";
  document.getElementById("joinButton").disabled = true;
}
//various checks before creating/joining a game (has a name, valid room code, etc)
function checkName(){
  if(document.getElementById("usernameText").value.length > 0){
    document.getElementById("createButton").disabled = false;
    if(document.getElementById("navigation2").style.display == "inline-block" && document.getElementById("roomCodeText").value.length == 5){
      document.getElementById("joinButton").disabled = false;
    }else{
      document.getElementById("joinButton").disabled = true;
    }
  }else{
    document.getElementById("createButton").disabled = true;
    document.getElementById("joinButton").disabled = true;
  }
}

function checkRoomCode(){

  if(document.getElementById("usernameText").value.length > 0 && document.getElementById("roomCodeText").value.length == 5){
    document.getElementById("joinButton").disabled = false;
  }else{
    document.getElementById("joinButton").disabled = true;
  }
}
//database reference to room data
var roomRefr;
//functions tied to buttons on the menu, creates and joins games
function startNewGame(){
  username = document.getElementById("usernameText").value;

  document.getElementById("username").style.display = "none";
  document.getElementById("fontInput").style.display = "none";
  document.getElementById("navigation").style.display = "none";
  document.getElementById("gameInformation").style.display = "inline-block";
  document.getElementById("createButton").disabled = true;

  roomCode = generateRoomCode();
  roomRefr = firebase.database().ref("rooms/" + roomCode);

  createRoom(roomRefr);
}

function startJoinGame(){
  username = document.getElementById("usernameText").value;
  roomCode = document.getElementById("roomCodeText").value.toUpperCase();
  document.getElementById("joinButton").disabled = true;

  roomRefr = firebase.database().ref("rooms/" + roomCode);

  joinRoom(roomRefr);
}
//store some player data locally, all game functions ran on local devices (unfortunately no cloud computing or server side stuff unfortunately)
var playerCount = 1;
var playerList = [];
//checks to see if room snapshot exists, if so add player data to the room reference with all the game parameters attached
function createRoom(ref){
  ref.once("value").then(function(snapshot) {
    if(snapshot.exists()){
      roomCode = generateRoomCode();
      roomRefr = firebase.database().ref("rooms/" + roomCode);
      createRoom(roomRefr);
    }else{
      document.getElementById("roomCode").innerHTML = roomCode;
      firebase.database().ref("rooms/"+roomCode+"/"+username+"/stoneBlocks").set("0");
      firebase.database().ref("rooms/"+roomCode+"/"+username+"/dead").set("0");
      firebase.database().ref("rooms/"+roomCode+"/"+username+"/gameState").set("off");
      firebase.database().ref("rooms/"+roomCode+"/"+username+"/lastWord").set("");
      firebase.database().ref("rooms/"+roomCode+"/"+username+"/health").set("default");
      firebase.database().ref("rooms/"+roomCode+"/"+username+"/font").set(fontName);

      if(document.getElementById("stabilizerOption").checked){
        firebase.database().ref("rooms/"+roomCode+"/"+username+"/stabilizerOn").set("yes");
        document.getElementById("stabilizerText").innerHTML = "Stabilizer: On";
        stabilizerOn = true;
      }

      if(document.getElementById("classOption").checked){
        firebase.database().ref("rooms/"+roomCode+"/"+username+"/classModeOn").set("yes");
        document.getElementById("classModeText").innerHTML = "Class Mode: On";
        classModeOn = true;
      }

      host = true;
      document.getElementById("playersList").innerHTML = username + "<br>";
      playerList.push(username);
      fontList.push(fontName);
      displayPlayers(ref);
    }
  });
}

function joinRoom(ref){
  ref.once("value").then(function(snapshot) {
    if(snapshot.exists()){
      var gameRunning = false;
      var inWaiting = false;

      snapshot.forEach(function(childSnapshot) {
        var stateOfGame = childSnapshot.child("gameState").val();

        if(stateOfGame == "on"){
          gameRunning = true;
        }

        if(stateOfGame == "waiting"){
          inWaiting = true;
        }

        var stabilizerState = childSnapshot.child("stabilizerOn").val();
        var classModeState = childSnapshot.child("classModeOn").val();

        if(stabilizerState == "yes"){
          stabilizerOn = true;
          document.getElementById("stabilizerText").innerHTML = "Stabilizer: On";
        }

        if(classModeState == "yes"){
          classModeOn = true;
          document.getElementById("classModeText").innerHTML = "Class Mode: On";
        }
      });

      if(inWaiting){
        firebase.database().ref("rooms/"+roomCode+"/"+username+"/font").set(fontName);
        firebase.database().ref("rooms/"+roomCode+"/"+username+"/stoneBlocks").set("0");
        firebase.database().ref("rooms/"+roomCode+"/"+username+"/dead").set("0");
        firebase.database().ref("rooms/"+roomCode+"/"+username+"/gameState").set("off");
        firebase.database().ref("rooms/"+roomCode+"/"+username+"/lastWord").set("");
        firebase.database().ref("rooms/"+roomCode+"/"+username+"/health").set("default");

        while(snapshot.hasChild("/" + username)){
          username += " 2";
        }

        host = false;

        document.getElementById("titleScreen").style.display = "none";
        document.getElementById("game").style.display = "block";
        firebase.database().ref("rooms/"+roomCode+"/"+username).onDisconnect().remove();
        playerList.push(username);
        fontList.push(fontName);

        snapshot.forEach(function(childSnapshot) {
          var otherDude = childSnapshot.key;
          if(otherDude != username){
            playerList.push(otherDude);
            fontList.push(childSnapshot.child("font").val());
            playerCount++;
          }
        });

        inLobby(username, roomCode);
      }else if(!gameRunning){
        document.getElementById("username").style.display = "none";
        document.getElementById("roomCodeInput").style.display = "none";
        document.getElementById("fontInput").style.display = "none";
        document.getElementById("navigation2").style.display = "none";
        document.getElementById("gameInformation").style.display = "inline-block";

        document.getElementById("roomCode").innerHTML = roomCode;

        while(snapshot.hasChild("/" + username)){
          username += " 2";
        }

        host = false;

        firebase.database().ref("rooms/"+roomCode+"/"+username+"/font").set(fontName);
        firebase.database().ref("rooms/"+roomCode+"/"+username+"/stoneBlocks").set("0");
        firebase.database().ref("rooms/"+roomCode+"/"+username+"/dead").set("0");
        firebase.database().ref("rooms/"+roomCode+"/"+username+"/gameState").set("off");
        firebase.database().ref("rooms/"+roomCode+"/"+username+"/lastWord").set("");
        firebase.database().ref("rooms/"+roomCode+"/"+username+"/health").set("default");

        document.getElementById("playersList").innerHTML = username + "<br>";
        playerList.push(username);
        fontList.push(fontName);
        displayPlayers(ref);
      }else{
        document.getElementById("roomError").style.display = "block";
        document.getElementById("roomErrorText").innerHTML = "Room already started.";
      }
    }else{
      document.getElementById("roomError").style.display = "block";
      document.getElementById("roomErrorText").innerHTML = "Room could not be found.";
    }
  });
}

var playerLeave;
var playerJoin;
var playerLoad;

function displayPlayers(ref){
  document.getElementById("navigation3").style.display = "block";
  document.getElementById("roomError").style.display = "none";

  playerJoin = ref.on("child_added", function(snapshot, prevChildKey) {
    var otherUser = snapshot.key;
    if(otherUser != username){
      document.getElementById("playersList").innerHTML += "<p style='margin-bottom: 0px;' id='lobby_" + otherUser + "'</p>" //otherUser + "<br>";
      document.getElementById("lobby_" + otherUser).innerHTML = otherUser;
      document.getElementById("lobby_" + otherUser).style.fontFamily = snapshot.child("font").val();
      playerCount++;
      if(host){
        document.getElementById("initiateButton").disabled = false;
      }else{
        document.getElementById("initiateButton").disabled = true;
      }
      playerList.push(otherUser);
      fontList.push(snapshot.child("font").val());
    }
  });

  firebase.database().ref("rooms/"+roomCode+"/"+username).onDisconnect().remove();

  playerLeave = ref.on("child_removed", function(snapshot) {
    var otherUser = snapshot.key;
    document.getElementById("lobby_" + otherUser).outerHTML = "";

    playerCount--;
    if(!host){
      document.getElementById("initiateButton").disabled = true;
    }

    var tempIndex = playerList.indexOf(otherUser)
    playerList.splice(tempIndex, 1);
    fontList.splice(tempIndex, 1);
  });

  playerLoad = ref.child(username + "/gameState").on("value", function(snapshot){
    var state = snapshot.val();

    if(state == "on"){
      loadGame();
    }
  });


}

var alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];


function generateRoomCode(){
  var ret = "";
  for(i = 0; i < 5; i++){
    randomInt = Math.floor(Math.random() * parseInt(alphabet.length));
    ret += alphabet[randomInt];
  }

  return ret;
}

function backToMenu(){
  firebase.database().ref("rooms/"+roomCode+"/").child(username).remove();

  if(playerCount == 0){
    firebase.database().ref("rooms/"+roomCode).remove();
  }

  roomRefr.off("child_added", playerJoin);
  roomRefr.off("child_removed", playerLeave);
  roomRefr.child(username + "/gameState").off("value", playerLoad);

  document.getElementById("navigation3").style.display = "none";
  document.getElementById("intro").style.display = "block";
  document.getElementById("gameInformation").style.display = "none";
  playerCount = 1;
  playerList = [];
  fontList = [];
}

function initiateGame(){
  var ref = firebase.database().ref("rooms/"+roomCode);

  playerList.forEach(function(p){
    ref.child(p + "/gameState").set("on");
  });

}

function loadGame(){
  document.getElementById("titleScreen").style.display = "none";
  document.getElementById("game").style.display = "block";

  if(playerList.length > 1){
    createGrid(roomCode, username);
  }else{
    createGridSinglePlayer(roomCode, username);
  }
}

function faq(){
  document.getElementById("intro").style.display = "none";
  document.getElementById("faq").style.display = "block";
}

function backFromFaq(){
  document.getElementById("intro").style.display = "block";
  document.getElementById("faq").style.display = "none";
}

function rules(){
  document.getElementById("intro").style.display = "none";
  document.getElementById("rules").style.display = "block";
}

function backFromRules(){
  document.getElementById("intro").style.display = "block";
  document.getElementById("rules").style.display = "none";
}

function fontChange(){
  fontName = document.getElementById("fontSelection").value;
  var bodyStuff = document.getElementsByTagName('body');
  for(i = 0; i < bodyStuff.length; i++) {
    bodyStuff[i].style.fontFamily = fontName;
  }
}

function optionsMenu(){
  document.getElementById("navigation").style.display = "none";
  document.getElementById("username").style.display = "none";
  document.getElementById("fontInput").style.display = "none";
  document.getElementById("optionsMenu").style.display = "inline-block";
}

function backOptions(){
  document.getElementById("navigation").style.display = "inline-block";
  document.getElementById("username").style.display = "block";
  document.getElementById("fontInput").style.display = "block";
  document.getElementById("optionsMenu").style.display = "none";
}

var fromCreate = true;


fontParagraphs = new Map([
    ["Trebuchet MS", "Commissioned by Microsoft in 1996, Trebuchet is a favorite among font enthusiasts. Though named after a powerful siege weapon that can launch 90kg projectiles over 300 meters, it’s debatable whether the typeface manages to live up to its name origin. Trebuchet fans get really pissy when you confuse the font with Arial or Helvetica, touting statistics such as “The uppercase M forms a 10 degree angle to the vertical!” or “The bar of capital A has a really low bar compared to other fonts!”. Trebuchet is perfect for those who are boring but don’t want to be seen as boring by avoiding default fonts such as Arial and Times New Roman. <br> <br> In class mode, Trebuchet gets the power to randomly generate blue tiles which do double damage, essentially having the same gameplay mechanics as in normal mode."],
    ["Times New Roman", "This classic font was created in 1931 by British newspaper company, The Times. Since then, this font has made its way to newspapers around the world and is a staple on computer word processors. This is partly because Times New Roman has the magical ability make any sentence look academic and formal, no matter how stupid the sentence is. Ducks are to geese as bread is to toast. See! Because of the typeface, most wouldn’t have questioned that logic in that sentence! Fun tip for essay writers: When proof-reading your papers, change your font from Times New Roman to something stupid-looking like Comic Sans. You remove the academic facade the font gave your paper and you start to notice more mistakes. <br> <br> In class mode, Times New Roman makes purple tiles appear instead of blue tiles. These tiles, when used in a word, remove another tan tile from your grid."],
    ["Courier New", "Wikipedia won’t tell me when Courier New was created but from some inferencing, it can be concluded that the font is the new version of the Courier typeface. It’s monospaced, slick, and supposedly easy to read. I say supposedly because good luck telling the difference between “1” and “l”. For a font that’s widely used in many programming language text editors, it sure messes up the one thing programmers want in a font: distinguishable characters. Also, I’m not completely sure why Courier New outright replaces Courier, there’s virtually no difference between the two typefaces. Courier New is perfect for amateur scriptwriters and dudes who find programming memes funny for some reason. <br> <br> In class mode, Courier New doesn’t have any special tiles spawn but makes long words (6+ letters) send more tan tiles to opponents."],
    ["Comic Sans", "Comic Sans is the king of ironic fonts. Created for Microsoft in 1994 to mimic comic book lettering. It has since become the language of sarcasm. Hell, two thirds of the font’s Wikipedia article is about its reputation as a joke font. It’s not very serious, but that doesn’t make it bad. It’s a fun way to communicate a light-hearted tone in text. According to a study, it helps dyslexic people read better which already makes it miles better than Courier New or Times New Roman. To the people who hate this font: You’re a square, an unfun snobby square who probably uses fonts like Times New Roman and Garamond in a casual setting. <br> <br> In class mode, Comic Sans scrambles the grid every time you attack an opponent. It also disables the scramble button. No special tiles! Embrace the chaos!"],
    ["Wingdings", "Before emojis, there was Wingdings. Wingdings is not your normal font. It was created for Microsoft in 1990 to allow people to put symbols and images into Microsoft Word. Technology has since progressed to a point where emojis have taken over and image support for word processors is common. Wingdings has since been used in cryptic ironic memes and as fifteen minutes of entertainment for elementary schoolers around the world messing around in Microsoft Word. <br> <br> To make Wingdings actually playable, this typeface starts with 20 letter tiles instead of the normal 16. This means that it has more health and a bigger variety of letters to choose from."]
]);

function fontInfo(){
  document.getElementById("username").style.display = "none";
  document.getElementById("fontInput").style.display = "none";
  document.getElementById("fontInfo").style.display = "block";

  if(document.getElementById("roomCodeInput").style.display == "block"){
    fromCreate = false;
    document.getElementById("roomCodeInput").style.display = "none";
    document.getElementById("navigation2").style.display = "none";
    document.getElementById("roomError").style.display = "none";
  }else{
    fromCreate = true;
    document.getElementById("navigation").style.display = "none";
  }

  document.getElementById("fontTitle").innerHTML = fontName;
  document.getElementById("fontInfoText").innerHTML = fontParagraphs.get(fontName);
}

function backFontInfo(){
  document.getElementById("username").style.display = "block";
  document.getElementById("fontInput").style.display = "block";
  document.getElementById("fontInfo").style.display = "none";
  if(fromCreate){
    document.getElementById("navigation").style.display = "inline-block";
  }else{
    document.getElementById("roomCodeInput").style.display = "block";
    document.getElementById("navigation2").style.display = "inline-block";
  }
}
