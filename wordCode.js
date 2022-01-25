var characters = ["A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A","A", "B","B","B","B","B","B","B","B", "C","C","C","C","C","C","C","C", "D","D","D","D","D","D","D","D","D","D", "E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E","E", "F","F","F","F","F","F","F","F", "G","G","G","G","G","G","G","G","G","G", "H","H","H","H","H","H","H","H", "I","I","I","I","I","I","I","I","I","I","I","I","I","I","I","I","I","I","I","I", "J","J","J","J","J", "K","K","K","K","K", "L","L","L","L","L","L","L","L","L","L", "M","M","M","M","M","M","M","M", "N","N","N","N","N","N","N","N","N","N", "O","O","O","O","O","O","O","O","O","O","O","O","O","O","O","O","O","O","O","O", "P","P","P","P","P","P","P","P", "QU","QU","QU","Q", "R","R","R","R","R","R","R","R","R","R", "S","S","S","S","S","S","S","S","S","S", "T","T","T","T","T","T","T","T","T","T", "U","U","U","U","U","U","U","U","U","U","U","U","U","U","U","U","U","U","U","U", "V","V","V","V","V","V", "W","W","W","W", "X","X","X","X", "Y","Y","Y","Y","Y","Y", "Z","Z","Z","Z", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2", "2"];

var bigrams = ["TH", "TH", "TH", "TH", "TH", "TH", "SH", "SH", "SH", "SH", "SH", "SH", "CH", "CH", "CH", "CH", "CH", "CH", "ER", "ER", "ER", "ER", "ER", "ES", "ES", "ES", "ES", "ES","IN","IN","IN","IN","IN","TI","TI","TI","ON","ON","ON","AT","AT","AT","RE","RE","RE","TE","TE","TE","IS","IS","IS","NG","NG","NG","AN","AN","AN","EN","EN","ST","ST","ED","ED","LI","LI","AL","AL","RI","RI","LE","LE","NS","NS","RA","RA","AR","AR","RS","RS","OR","OR","IO","IO","NT","NT","NE","NE","DE","DE","SE","SE","CO","CO","IT","IT"];

var grid = []; //characters
var avaliable = []; //bool truth array

var isRock = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
var isDouble = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
var isHeal = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
var rockCellsAmount = 0;

var word = "";
var wordLetterModifiers = [];
var roomCode = "";
var wordIndexes = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];

var roomCode;
var username;


var alivePlayers = [];
var alive = true;

var intervalTimer;
var timeBetweenIntervals = 10000;
var intervalRepeatCounter = 6;

var playerCount;
var fontListCopy = [];

var healthOfEveryone;

var amountOfCells = 16;

var timer;

function createGrid(r, u){
  roomCode = r;
  username = u;

  playerCount = playerList.length;

  roomRefr.off("child_added", playerJoin);
  roomRefr.off("child_removed", playerLeave);
  roomRefr.child(username + "/gameState").off("value", playerLoad);
  document.getElementById("fontSelection2").value = fontName;

  var playerIndex = playerList.indexOf(username);
  fontListCopy = [...fontList];
  fontList.splice(playerIndex, 1);

  setUp();

  activatePlayerListener();

  for(i = 0; i < alivePlayers.length; i++){
    otherPlayerListener(alivePlayers[i]);
  }
}

var playerListener;

function setUp(){
  document.getElementById("replayButton").style.display = "none";
  document.getElementById("fontChangeInGame").style.display = "none";

  isRock = [];
  isDouble = [];
  isHeal = [];
  wordIndexes = [];
  rockCellsAmount = 0;
  repeatCount = 0;
  isInLobby = false

  if(classModeOn && (fontName == "Wingdings")){
    amountOfCells = 20;
    document.getElementById("additionalRow").style.display = "block";
  }else{
    amountOfCells = 16;
    document.getElementById("additionalRow").style.display = "none";
  }

  roomRefr.child(username + "/health").set("0");

  word = "";
  document.getElementById("word").innerHTML = "";
  wordLetterModifiers = [];

  document.getElementById("scramble").style.color = "black";
  document.getElementById("scramble").disabled = false;
  document.getElementById("clear").style.color = "black";
  document.getElementById("clear").disabled = false;
  hasWonAlready = false;

  playerCount = playerList.length;
  alivePlayers = [...playerList];
  var playerIndex = alivePlayers.indexOf(username);
  alivePlayers.splice(playerIndex, 1);
  fontList = [...fontListCopy];
  fontList.splice(playerIndex, 1);

  healthOfEveryone = new Map();

  document.getElementById("playerStats").innerHTML = "<p class='text' style='text-decoration: underline; padding-top: 10px; font-weight: 700'>Players</p>";

  document.getElementById("playerStats").innerHTML += "<p class='playerText' style='color:red' id='" + "stats_" + username + "'>" + "</p>";
  document.getElementById("stats_" + username).innerHTML = "(0/" + amountOfCells + ") " + username + ":";

  for(i = 0; i < alivePlayers.length; i++){
    healthOfEveryone.set(alivePlayers[i], 0);
    document.getElementById("playerStats").innerHTML += "<p class='playerText' id='" + "stats_" + alivePlayers[i] + "'>" + "</p>";
    if(classModeOn && fontList[i] == "Wingdings"){
      document.getElementById("stats_" + alivePlayers[i]).innerHTML = "(0/20) " + alivePlayers[i] + ":";
    }else{
      document.getElementById("stats_" + alivePlayers[i]).innerHTML = "(0/16) " + alivePlayers[i] + ":";
    }
    document.getElementById("stats_" + alivePlayers[i]).style.fontFamily = fontList[i];
  }

  if(isSinglePlayer){
    document.getElementById("playerStats").innerHTML += "<p class='text' style='text-decoration: underline; font-weight: 700'>Time</p>";
    document.getElementById("playerStats").innerHTML += "<p class='text' id='timerText' style='font-weight: 700'>0</p>";
  }

  timeBetweenIntervals = 10000;
  clearInterval(intervalTimer);

  if(isSinglePlayer){
    intervalRepeatCounter = 1;
  }else{
    intervalRepeatCounter = 6;
  }


  if(isSinglePlayer){
    var startTime = Date.now();
    timer = setInterval(function() {
      var delta = Date.now() - startTime;
      document.getElementById("timerText").innerHTML = Math.floor(delta / 100) / 10;
    }, 100);
  }


  for (i = 0; i < amountOfCells; i++) {
    isRock.push(false);
    isDouble.push(false);
    isHeal.push(false);
    wordIndexes.push(-1);

    randomInt = Math.floor(Math.random() * parseInt(characters.length));
    randomChar = characters[randomInt];
    if(randomChar == "2"){
      randomChar = bigrams[Math.floor(Math.random() * parseInt(bigrams.length))];
    }
    grid[i] = randomChar;
    avaliable[i] = true;
    document.getElementById("cell_" + i.toString()).innerHTML = randomChar;
    document.getElementById("cell_" + i.toString()).disabled = false;
    document.getElementById("cell_" + i.toString()).style.color = "black";

    if(Math.random() < .06){
      if(!classModeOn || (fontName == "Trebuchet MS")){
        isDouble[i] = true;
        document.getElementById("cell_" + i.toString()).style.backgroundColor = "PaleTurquoise";
      }else if(classModeOn && fontName == "Times New Roman"){
        isHeal[i] = true;
        document.getElementById("cell_" + i.toString()).style.backgroundColor = "Plum";
      }else{
        document.getElementById("cell_" + i.toString()).style.backgroundColor = "white";
      }
    }else{
      document.getElementById("cell_" + i.toString()).style.backgroundColor = "white";
    }
  }

  startIntervals(timeBetweenIntervals);

  lost = false;

  if(classModeOn && fontName == "Comic Sans"){
    document.getElementById("scramble").disabled = true;
    document.getElementById("scramble").style.color = "lightgrey";
  }

  $Spelling.DefaultDictionary = "scrabble";
}

function activatePlayerListener(){
  playerListener = roomRefr.child(username + "/stoneBlocks").on("value", function(snapshot){
    var amount = parseInt(snapshot.val());

    if(amount != 0){
      for(i = 0; i < amount; i++){
        rockWord();
      }
      roomRefr.child(username + "/stoneBlocks").set("0");
    }

  });

  roomRefr.child(username + "/lastWord").on("value", function(snapshot){
    var lastWord = snapshot.val();

    if(lastWord !== null && lastWord.length > 0){
      var statString = document.getElementById("stats_" + username).innerHTML;
      var closeParIndex = statString.indexOf(")");

      document.getElementById("stats_" + username).innerHTML = statString.substring(0, closeParIndex + 2) + username + ": " + lastWord;
    }
  });

  roomRefr.child(username + "/health").on("value", function(snapshot){
    var health = snapshot.val();

    if(health === null){
      document.getElementById("stats_" + username).style.color = "LightCoral";
      document.getElementById("stats_" + username).style.textDecoration = "line-through";
    }else if(health == "restart"){
        restartGame();

        if(classModeOn && fontName == "Wingdings"){
          document.getElementById("stats_" + username).innerHTML = "(0/20) " + username + ":";
        }else{
          document.getElementById("stats_" + username).innerHTML = "(0/16) " + username + ":";
        }
    }else if(health != "default" && isNaN(health) == false){
      var statString = document.getElementById("stats_" + username).innerHTML;
      var closeParIndex = statString.indexOf(")");

      if(classModeOn && fontName == "Wingdings"){
        document.getElementById("stats_" + username).innerHTML = "(" + health + "/20)" + statString.substring(closeParIndex + 1);
      }else{
        document.getElementById("stats_" + username).innerHTML = "(" + health + "/16)" + statString.substring(closeParIndex + 1);
      }
    }
  });

  roomRefr.on("child_added", function(snapshot, prevChildKey) {
    var otherUser = snapshot.key;

    if(playerList.indexOf(otherUser) == -1){
      playerCount++;
      isSinglePlayer = false;
      playerList.push(otherUser);
      fontListCopy.push(snapshot.child("font").val());
      document.getElementById("playerStats").innerHTML += "<p class='playerText' id='" + "stats_" + otherUser +  "'>" + "</p>";
      if(classModeOn && snapshot.child("font").val() == "Wingdings"){
        document.getElementById("stats_" + otherUser).innerHTML = "(0/20) " + otherUser + ":";
      }else{
        document.getElementById("stats_" + otherUser).innerHTML = "(0/16) " + otherUser + ":";
      }
      document.getElementById("stats_" + otherUser).style.fontFamily = snapshot.child("font").val();
      otherPlayerListener(otherUser);
    }
  });

  roomRefr.on("child_removed", function(snapshot){
    var otherUser = snapshot.key;

    var playerIndex = alivePlayers.indexOf(otherUser);

    if(playerIndex != -1 && playerCount > 1){
      document.getElementById("stats_" + otherUser).style.textDecoration = "line-through";
      document.getElementById("stats_" + otherUser).style.color = "lightgrey";

      healthOfEveryone.delete(otherUser);
      alivePlayers.splice(playerIndex, 1);
      document.getElementById("stats_" + otherUser).innerHTML += " [" + generateCardinal(playerCount) + "]";
      playerCount--;
    }

    var playerIndex2 = playerList.indexOf(otherUser);
    if(playerIndex2 != -1){
      playerList.splice(playerIndex2, 1);
      fontListCopy.splice(playerIndex2, 1);
      if(playerList.length == 1){
        isSinglePlayer = true;
      }
    }

    if(playerCount <= 1){
      gameWin();
      restartReady();
    }

  });
}

function otherPlayerListener(playerName){
  roomRefr.child(playerName + "/dead").on("value", function(snapshot){
    var aliveState = parseInt(snapshot.val());

    if(aliveState == "1"){
      var playerIndex = alivePlayers.indexOf(playerName);

      if(playerIndex != -1){
        alivePlayers.splice(playerIndex, 1);

        document.getElementById("stats_" + playerName).style.textDecoration = "line-through";
        document.getElementById("stats_" + playerName).style.color = "lightgrey";

        if(!isInLobby){
          document.getElementById("stats_" + playerName).innerHTML += " [" + generateCardinal(playerCount) + "]";
        }

        playerCount--;

        if(playerCount <= 1){
          gameWin();
          restartReady();
        }

      }

    }
  });

  roomRefr.child(playerName + "/lastWord").on("value", function(snapshot){
    var lastWord = snapshot.val();
    if(lastWord !== null && lastWord.length > 0 ){
      var statString = document.getElementById("stats_" + playerName).innerHTML;
      var closeParIndex = statString.indexOf(")");

      document.getElementById("stats_" + playerName).innerHTML = statString.substring(0, closeParIndex + 2) + playerName + ": " + lastWord;
    }
  });

  roomRefr.child(playerName + "/health").on("value", function(snapshot){
    var health = snapshot.val();

    if(health == "restart"){
      health = "0";
    }

    if(health === null){
      document.getElementById("stats_" + playerName).style.textDecoration = "line-through";
      document.getElementById("stats_" + playerName).style.color = "lightgrey";
    }else if(health != "default" && isNaN(health) == false){
      var statString = document.getElementById("stats_" + playerName).innerHTML;
      var closeParIndex = statString.indexOf(")");
      healthOfEveryone.set(playerName, parseInt(health));

      var tempFont = document.getElementById("stats_" + playerName).style.fontFamily;

      if(tempFont == "Wingdings" && classModeOn){
        document.getElementById("stats_" + playerName).innerHTML = "(" + health + "/20)" + statString.substring(closeParIndex + 1);
      }else{
        document.getElementById("stats_" + playerName).innerHTML = "(" + health + "/16)" + statString.substring(closeParIndex + 1);
      }
    }


  });

  roomRefr.child(playerName + "/font").on("value", function(snapshot){
    var otherPlayerFont = snapshot.val();

    document.getElementById("stats_" + playerName).style.fontFamily = otherPlayerFont;
    var otherPlayerIndex = playerList.indexOf(playerName);
    fontListCopy[otherPlayerIndex] = otherPlayerFont;
  });

}

function insertCharacter(x){
  if(avaliable[x]){
    avaliable[x] = false;
    wordIndexes[x] = word.length;
    word += grid[x];

    if(isDouble[x]){
      for(i = 0; i < grid[x].length; i++){
        wordLetterModifiers.push(2);
      }
    }else if(isHeal[x]){
      for(i = 0; i < grid[x].length; i++){
        wordLetterModifiers.push(-1);
      }
    }else{
      for(i = 0; i < grid[x].length; i++){
        wordLetterModifiers.push(1);
      }
    }

    document.getElementById("word").innerHTML = word;
    document.getElementById("cell_" + x.toString()).style.color = "lightgrey";
  }else{
    avaliable[x] = true;

    if(grid[x].length == 2){
      wordLetterModifiers.splice(word.indexOf(wordIndexes[x]), 2);
      word = word.slice(0, wordIndexes[x]) + word.slice(wordIndexes[x] + 2);
      for(i = 0; i < amountOfCells; i++){
        if(wordIndexes[i] > wordIndexes[x]){
          wordIndexes[i] -= 2;
        }
      }
    }else{
      wordLetterModifiers.splice(word.indexOf(wordIndexes[x]), 1);
      word = word.slice(0, wordIndexes[x]) + word.slice(wordIndexes[x] + 1);
      for(i = 0; i < amountOfCells; i++){
        if(wordIndexes[i] > wordIndexes[x]){
          wordIndexes[i]--;
        }
      }
    }

    wordIndexes[x] = -1;
    document.getElementById("word").innerHTML = word;
    document.getElementById("cell_" + x.toString()).style.color = "black";
  }

  if($Spelling.BinSpellCheck(word) && word.length > 2){
    document.getElementById("attack").style.color = "black";
    document.getElementById("attack").disabled = false;

    if(word.length >= 6 && classModeOn && fontName == "Courier New"){
      document.getElementById("word").style.color = "Red";
    }else{
      document.getElementById("word").style.color = "Black";
    }
  }else{
    document.getElementById("attack").style.color = "lightgrey";
    document.getElementById("attack").disabled = true;
    document.getElementById("word").style.color = "Black";
  }
}

function confirmWord(){
  if($Spelling.BinSpellCheck(word) && word.length > 2){

    for(i = 0; i < amountOfCells; i++){
      if(!avaliable[i]){
        document.getElementById("cell_" + i.toString()).style.color = "black";

        if(isRock[i]){
          document.getElementById("cell_" + i.toString()).style.backgroundColor = "White";
          isRock[i] = false;
          rockCellsAmount--;
          roomRefr.child(username + "/health").set(rockCellsAmount.toString());

          if(rockCellsAmount < (amountOfCells - 2)){
            document.getElementById("scramble").disabled = false;
            document.getElementById("scramble").style.color = "black";
          }

          if(classModeOn && fontName == "Comic Sans"){
            document.getElementById("scramble").disabled = true;
            document.getElementById("scramble").style.color = "lightgrey";
          }
        }

        randomInt = Math.floor(Math.random() * parseInt(characters.length-1));
        randomChar = characters[randomInt];
        if(randomChar == "2"){
          randomChar = bigrams[Math.floor(Math.random() * parseInt(bigrams.length))];
        }
        grid[i] = randomChar;
        avaliable[i] = true;
        document.getElementById("cell_" + i.toString()).innerHTML = randomChar;

        if(Math.random() < .12){
          if(!classModeOn || (fontName == "Trebuchet MS")){
            isDouble[i] = true;
            document.getElementById("cell_" + i.toString()).style.backgroundColor = "PaleTurquoise";
          }

          if(classModeOn && fontName == "Times New Roman"){
            isHeal[i] = true;
            document.getElementById("cell_" + i.toString()).style.backgroundColor = "Plum";
          }
        }else{
          isDouble[i] = false;
          isHeal[i] = false;
          document.getElementById("cell_" + i.toString()).style.backgroundColor = "white";
        }
      }
    }

    var points = calculatePoints();
    attackPlayers(points - 3);
    word = "";
    wordLetterModifiers = [];
    var wordIndexes = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
    document.getElementById("word").innerHTML = word;
    document.getElementById("attack").style.color = "lightgrey";
    document.getElementById("attack").disabled = true;

    if(classModeOn && fontName == "Comic Sans"){
      scramble();
    }
  }
}

function attackPlayers(points){
  if(!isSinglePlayer){
    if(!stabilizerOn || Math.random() < .25){
      randInt = Math.floor(Math.random() * alivePlayers.length);

      roomRefr.child(username + "/lastWord").set(word + " -> " + alivePlayers[randInt] + " (+" + points + ")");
      roomRefr.child(alivePlayers[randInt] + "/stoneBlocks").set(points.toString());
    }else{
      var min = 20;

      for (let hp of healthOfEveryone.values()) {
        if(hp < min){
          min = hp;
        }
      }

      var listOfLowestHealthPlayers = [];

      for(let player of healthOfEveryone.keys()){
        if(healthOfEveryone.get(player) == min && alivePlayers.includes(player)){
          listOfLowestHealthPlayers.push(player);
        }
      }

      randInt = Math.floor(Math.random() * listOfLowestHealthPlayers.length);
      roomRefr.child(username + "/lastWord").set(word + " -> " + listOfLowestHealthPlayers[randInt] + " (+" + points + ")");
      roomRefr.child(listOfLowestHealthPlayers[randInt] + "/stoneBlocks").set(points.toString());

    }
  }else{
    roomRefr.child(username + "/lastWord").set(word + " -> " + "???" + " (+" + points + ")");
  }
}

var pointsCategory1 = ['A', 'D', 'E', 'G', 'I', 'L', 'N', 'O', 'R', 'S', 'T', 'U'];
var pointsCategory2 = ['B', 'C', 'F', 'H', 'M', 'P'];
var pointsCategory3 = ['V', 'W', 'Y'];
var pointsCategory4 = ['J', 'K', 'Q'];
var pointsCategory5 = ['X', 'Z'];

function calculatePoints(){
  var ret = 0;

  for(i = 0; i < word.length; i++){
    var letter = word.charAt(i);

    if(wordLetterModifiers[i] < 0){
      healLetter();
      wordLetterModifiers[i] = 1;
    }

    if(pointsCategory1.includes(letter)){
      ret += 1 * wordLetterModifiers[i];
    }else if(pointsCategory2.includes(letter)){
      ret += 1.25 * wordLetterModifiers[i];
    }else if(pointsCategory3.includes(letter)){
      ret += 1.5 * wordLetterModifiers[i];
    }else if(pointsCategory4.includes(letter)){
      ret += 1.75 * wordLetterModifiers[i];
    }else if(pointsCategory5.includes(letter)){
      ret += 2 * wordLetterModifiers[i];
    }

  }

  if(classModeOn && fontName == "Courier New" && word.length >= 6){
    ret *= 1.3;
  }

  return Math.round(ret);

}

function healLetter(){
  for(j = 0; j < amountOfCells; j++){
    if(isRock[j] && avaliable[j]){
      isRock[j] = false;
      if(isHeal[j]){
        document.getElementById("cell_" + j.toString()).style.backgroundColor = "Plum";
      }else{
        document.getElementById("cell_" + j.toString()).style.backgroundColor = "White";
      }
      rockCellsAmount--;
      roomRefr.child(username + "/health").set(rockCellsAmount.toString());
      break;
    }
  }
}

function rockWord(){
  if(rockCellsAmount < amountOfCells){
    var randInt = Math.floor(Math.random() * 16);

    while(isRock[randInt]){
        randInt++;
        if(randInt == amountOfCells){
          randInt = 0;
        }
    }

    isRock[randInt] = true;
    rockCellsAmount++;
    document.getElementById("cell_" + randInt.toString()).style.backgroundColor = "AntiqueWhite";

    if(isDouble[randInt]){
      document.getElementById("cell_" + randInt.toString()).style.backgroundColor = "#D5EDE3";
    }

    if(isHeal[randInt]){
      document.getElementById("cell_" + randInt.toString()).style.backgroundColor = "#ECC6DA";
    }

    if(rockCellsAmount == amountOfCells){
      gameOver();
    }

    if(rockCellsAmount > (amountOfCells - 3)){
      document.getElementById("scramble").disabled = true;
      document.getElementById("scramble").style.color = "lightgrey";
    }

    roomRefr.child(username + "/health").set(rockCellsAmount.toString());
  }
}

function scramble(){
  rockWord();
  if(!classModeOn || fontName != "Comic Sans"){
    rockWord();
  }

  word = "";
  wordLetterModifiers = [];

  document.getElementById("word").innerHTML = "";

  for (i = 0; i < amountOfCells; i++) {
    wordIndexes.push(-1);
    randomInt = Math.floor(Math.random() * parseInt(characters.length));
    randomChar = characters[randomInt]
    if(randomChar == "2"){
      randomChar = bigrams[Math.floor(Math.random() * parseInt(bigrams.length))];
    }
    grid[i] = randomChar;
    avaliable[i] = true;

    document.getElementById("cell_" + i.toString()).innerHTML = randomChar;
    document.getElementById("cell_" + i.toString()).style.color = "black";

    if(isDouble[i] || isHeal[i]){
        isDouble[i] = false;
        isHeal[i] = false;
        if(isRock[i]){
          document.getElementById("cell_" + i.toString()).style.backgroundColor = "AntiqueWhite";
        }else{
          document.getElementById("cell_" + i.toString()).style.backgroundColor = "white";
        }
    }

    if(Math.random() < .04){
      if(!classModeOn || (fontName == "Trebuchet MS")){
        isDouble[i] = true;
        if(isRock[i]){
          document.getElementById("cell_" + i.toString()).style.backgroundColor = "#D5EDE3";
        }else{
          document.getElementById("cell_" + i.toString()).style.backgroundColor = "PaleTurquoise";
        }
      }

      if(classModeOn && fontName == "Times New Roman"){
        isHeal[i] = true;
        if(isRock[i]){
          document.getElementById("cell_" + i.toString()).style.backgroundColor = "#ECC6DA";
        }else{
          document.getElementById("cell_" + i.toString()).style.backgroundColor = "Plum";
        }
      }
    }
  }
}

function clearStuff(){
  word = "";
  wordLetterModifiers = [];
  var wordIndexes = [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
  document.getElementById("word").innerHTML = "";

  for (i = 0; i < amountOfCells; i++) {
    document.getElementById("cell_" + i.toString()).style.color = "black";
    avaliable[i] = true;
  }
}

var lost = false;

function gameOver(){
  roomRefr.child(username + "/dead").set("1");
  document.getElementById("attack").style.color = "lightgrey";
  document.getElementById("attack").disabled = true;
  document.getElementById("scramble").style.color = "lightgrey";
  document.getElementById("scramble").disabled = true;
  document.getElementById("clear").style.color = "lightgrey";
  document.getElementById("clear").disabled = true;
  document.getElementById("word").innerHTML = "X_X";

  for(i = 0; i < amountOfCells; i++){
    document.getElementById("cell_" + i.toString()).disabled = true;
    document.getElementById("cell_" + i.toString()).style.color = "lightgrey";
  }
  lost = true;
  document.getElementById("stats_" + username).innerHTML += " [" + generateCardinal(playerCount) + "]";
  playerCount--;
  document.getElementById("stats_" + username).style.color = "LightCoral";
  document.getElementById("stats_" + username).style.textDecoration = "line-through";

  if(playerCount <= 1){
    restartReady();
  }
}

var hasWonAlready = false;

function gameWin(){
  if(rockCellsAmount < amountOfCells && !lost && !hasWonAlready){
    document.getElementById("attack").style.color = "lightgrey";
    document.getElementById("attack").disabled = true;
    document.getElementById("scramble").style.color = "lightgrey";
    document.getElementById("scramble").disabled = true;
    document.getElementById("clear").style.color = "lightgrey";
    document.getElementById("clear").disabled = true;
    document.getElementById("word").innerHTML = "YOU WIN!";
    document.getElementById("stats_" + username).innerHTML += " [1st]";
    hasWonAlready = true;

    for(i = 0; i < amountOfCells; i++){
      document.getElementById("cell_" + i.toString()).disabled = true;
      document.getElementById("cell_" + i.toString()).style.color = "lightgrey";
    }
  }
}

var times = [10000, 9000, 8000, 7000, 6000, 5000, 4500, 4000, 3700, 3500, 3200, 3000, 2800, 2600, 2400, 2200, 2000, 1900, 1800, 1700, 1600, 1500, 1400, 1300, 1200, 1100, 1000, 920, 840, 760, 700, 640, 580, 500, 450, 400, 350];
var repeatCount = 0;

function startIntervals(time){
  intervalTimer = setInterval(intervalRockWord, time);
  console.log(time);
}

function intervalRockWord(){
  if(alivePlayers.length >= 1 || isSinglePlayer){
    intervalRepeatCounter--;
    rockWord();
    if(intervalRepeatCounter <= 0){
      clearInterval(intervalTimer);
      if(repeatCount < times.length - 1){
        repeatCount++;
      }

      timeBetweenIntervals = times[repeatCount];

      if(isSinglePlayer){
        intervalRepeatCounter = 3;
        if(repeatCount <= 5){
          intervalRepeatCounter = 1;
        }
      }else{
        intervalRepeatCounter = 6;
      }


      startIntervals(timeBetweenIntervals);
    }
  }
}

function restartReady(){
  if(lost && !hasWonAlready){
    if(!isSinglePlayer){
      document.getElementById("stats_" + alivePlayers[0]).innerHTML += " [1st]";
    }
    hasWonAlready = true;
  }

  document.getElementById("replayButton").style.display = "table-cell";
  document.getElementById("fontChangeInGame").style.display = "block";

  clearInterval(intervalTimer);
  clearInterval(timer);

  roomRefr.child(username + "/gameState").set("waiting");
  if(host){
    document.getElementById("replayButton").disabled = false;
  }else{
    document.getElementById("replayButton").disabled = true;
  }
}

function fontChangeInGame(){
  fontName = document.getElementById("fontSelection2").value;
  var bodyStuff = document.getElementsByTagName('body');
  for(i = 0; i < bodyStuff.length; i++) {
    bodyStuff[i].style.fontFamily = fontName;
  }
  firebase.database().ref("rooms/"+roomCode+"/"+username+"/font").set(fontName);
}

function replay(){
  if(!isSinglePlayer){
    var tempArray = [...playerList];

    var playerIndex = tempArray.indexOf(username);
    tempArray.splice(playerIndex, 1);

    for(i = 0; i < tempArray.length; i++){
      roomRefr.child(tempArray[i] + "/gameState").set("on");
      roomRefr.child(tempArray[i] + "/dead").set("0");
      roomRefr.child(tempArray[i] + "/health").set("restart");
      roomRefr.child(tempArray[i] + "/lastWord").set("");
      roomRefr.child(tempArray[i] + "/stoneBlocks").set("0");
    }
  }

  roomRefr.child(username + "/dead").set("0");
  roomRefr.child(username + "/health").set("restart");
  roomRefr.child(username + "/lastWord").set("");
  roomRefr.child(username + "/stoneBlocks").set("0");
  roomRefr.child(username + "/gameState").set("on");
}

function restartGame(){
  setUp();
}

function generateCardinal(x){
  if(isInLobby){
    return "";
  }

  if(x % 10 == 1){
    return x.toString() + "st";
  }

  if(x % 10 == 2){
    return x.toString() + "nd";
  }

  if(x % 10 == 3){
    return x.toString() + "rd";
  }

  return x.toString() + "th";
}

var isInLobby = false;

function inLobby(u, r){
  isInLobby = true;

  var playerIndex = playerList.indexOf(username);
  fontListCopy = [...fontList];
  fontList.splice(playerIndex, 1);

  roomCode = r;
  username = u;

  playerCount = playerList.length;

  document.getElementById("playerStats").innerHTML = "<p class='text' style='text-decoration: underline; padding-top: 10px; font-weight: 700'>Players</p>";
  document.getElementById("playerStats").innerHTML += "<p class='playerText' style='color:red' id='" + "stats_" + username + "'>" + "</p>";
  document.getElementById("stats_" + username).innerHTML = "(0/" + amountOfCells + ") " + username + ":";

  lost = true;
  healthOfEveryone = new Map();

  document.getElementById("attack").style.color = "lightgrey";
  document.getElementById("attack").disabled = true;
  document.getElementById("scramble").style.color = "lightgrey";
  document.getElementById("scramble").disabled = true;
  document.getElementById("clear").style.color = "lightgrey";
  document.getElementById("clear").disabled = true;
  document.getElementById("word").innerHTML = "X_X";

  for(i = 0; i < amountOfCells; i++){
    document.getElementById("cell_" + i.toString()).disabled = true;
    document.getElementById("cell_" + i.toString()).style.color = "lightgrey";
  }

  activatePlayerListener();

  alivePlayers = [...playerList];
  var playerIndex = alivePlayers.indexOf(username);
  alivePlayers.splice(playerIndex, 1);

  for(i = 0; i < alivePlayers.length; i++){
    healthOfEveryone.set(alivePlayers[i], 0);
    document.getElementById("playerStats").innerHTML += "<p class='playerText' id='" + "stats_" + alivePlayers[i] + "'>" + "</p>";
    if(classModeOn && fontList[i] == "Wingdings"){
      document.getElementById("stats_" + alivePlayers[i]).innerHTML = "(0/20) " + alivePlayers[i] + ":";
    }else{
      document.getElementById("stats_" + alivePlayers[i]).innerHTML = "(0/16) " + alivePlayers[i] + ":";
    }
    document.getElementById("stats_" + alivePlayers[i]).style.fontFamily = fontList[i];
  }

  for(i = 0; i < alivePlayers.length; i++){
    otherPlayerListener(alivePlayers[i]);
  }

  document.getElementById("stats_" + username).style.color = "LightCoral";
  document.getElementById("stats_" + username).style.textDecoration = "line-through";
}

var isSinglePlayer = false;

function createGridSinglePlayer(r, u){
  roomCode = r;
  username = u;

  isSinglePlayer = true;

  roomRefr.off("child_added", playerJoin);
  roomRefr.off("child_removed", playerLeave);
  roomRefr.child(username + "/gameState").off("value", playerLoad);
  document.getElementById("fontSelection2").value = fontName;

  var playerIndex = playerList.indexOf(username);
  fontListCopy = [...fontList];
  fontList.splice(playerIndex, 1);

  setUp();

  activatePlayerListener();
}

window.addEventListener("keyup", event => {
  if (event.isComposing || event.keyCode === 229) {
    return;
  }

  if(event.keyCode == 32 || event.key === ' '){
    if(document.getElementById("game").style.display != "none"){
      event.preventDefault()
      if(!document.getElementById("attack").disabled){
        confirmWord();
      }
    }
  }
});

window.addEventListener('keydown', function(e) {
  if(e.keyCode == 32 && e.target == document.body) {
    e.preventDefault();
  }
});
