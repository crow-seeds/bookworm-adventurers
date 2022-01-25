<head>
  <title>Bookworm Adventurers</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.2.3/firebase-app.js"></script>
  <script src="https://www.gstatic.com/firebasejs/8.0.2/firebase-database.js"></script>
  <script type='text/javascript' src='/JavaScriptSpellCheck/include.js' ></script>
  <script type='text/javascript' src='/WORDS/wordCode.js'></script>
  <script type='text/javascript' src='/WORDS/introCode.js'></script>
</head>

<body>
  <style>
  <?php include 'main.css'; ?>
  </style>

  <div class="container" id="titleScreen" style="text-align:center;">
      <p class="title">Bookworm Adventurers</p>
      <p class="subtitle">A Bookworm Battle Royale</p>
      <hr>

      <div id="intro">
        <br>
        <button class="button" onclick="return createNewGame()">New Game</button>
        <br>
        <button class="button" onclick="return createJoinGame()">Join Game</button>
        <br>
        <button class="button" onclick="return faq()">FAQ</button>
      </div>

      <div id="username" style="display:none; text-align:center;">
        <br>
        <input class="input" id="usernameText" onkeyup="return checkName()" placeholder="Username" maxlength="16"></input>
        <br>
      </div>

      <div id="roomCodeInput" style="display:none; text-align:center;">
        <br>
        <input class="input" id="roomCodeText" onkeyup="return checkRoomCode();" placeholder="Room Code" maxlength="5"></input>
        <br>
      </div>

      <div id="fontInput" style="display:none; text-align:center;">
        <br>
        <select class="input" id="fontSelection" onchange="fontChange()">
          <option value="Trebuchet MS" style="font-family:'Trebuchet MS'" selected>Trebuchet</option>
          <option value="Times New Roman" style="font-family:'Times New Roman'">Times New Roman</option>
          <option value="Courier New" style="font-family:'Courier New'">Courier New</option>
          <option value="Comic Sans" style="font-family:'Comic Sans'">Comic Sans</option>
          <option value="Wingdings" style="font-family:'Wingdings'">Wingdings</option>
        </select>
        <button class="button" onclick="return fontInfo()" style="background-color:white; color:black; text-decoration:underline; display: block; padding-bottom: 0px;">Font Info</button>
        <br>
      </div>

      <div id="navigation" style="display:none; text-align:center;">
        <button class="button" onclick="return optionsMenu()" style="background-color:white; color:black; text-decoration:underline; display: block; width: 75%">Options</button>
        <button class="button" style="width: fit-content; width: -moz-fit-content; background-color:white; color:black; text-decoration:underline; display: inline-block;" onclick="return backNewGame()">Back</button>
        <button class="button" id="createButton" style="width: fit-content; width: -moz-fit-content; display: inline-block;" disabled onclick="return startNewGame()">Create</button>
      </div>

      <div id="navigation2" style="display:none; text-align:center;">
        <button class="button" style="width: fit-content; width: -moz-fit-content; background-color:white; color:black; text-decoration:underline; display: inline-block;" onclick="return backJoinGame()">Back</button>
        <button class="button" id="joinButton" style="width: fit-content; width: -moz-fit-content; display: inline-block;" disabled onclick="return startJoinGame()">Join</button>
      </div>

      <div id="roomError" style="display:none; text-align:center;">
        <br>
        <p class="text" id="roomErrorText">Room could not be found.</p>
      </div>

      <div id="gameInformation" style="display:none; text-align:center;">
        <p class="text">Your room code is:</p>
        <p class="text" id="roomCode" style="font-size:4rem"></p>
        <br>
        <br>
        <p class="text" style="text-decoration: underline">Options:</p>
        <p id="stabilizerText" class="text">Stabilizer: Off</p>
        <p id="classModeText" class="text">Class Mode: Off</p>
        <br>
        <p class="text" style="text-decoration: underline">Players:</p>
        <p id="playersList" class="text"></p>
      </div>

      <div id="navigation3" style="display:none; text-align:center;">
        <br>
        <button class="button" style="width: fit-content; width: -moz-fit-content; background-color:white; color:black; text-decoration:underline; display: inline-block;" onclick="return backToMenu()">Back</button>
        <button class="button" id="initiateButton" style="width: fit-content; width: -moz-fit-content; display: inline-block;" onclick="return initiateGame()">Start</button>
      </div>

      <div id="faq" style="display:none; text-align:center;">
        <p class="text" style="text-decoration: underline">Why did you make this?</p>
        <p class="text">In 2006, a company named Popcap released a word-forming puzzle game called Bookworm Adventures. I used to play this game a ton when I was a kid and was shocked to find out that Bookworm Adventures recently got removed from all retailers and was erased from the internet. This was because a company by the name of Electronic Arts bought Popcap a few years ago and purged the universe of Bookworm Adventures with no reasoning provided. I saw this as an injustice and created a free online-multiplayer battle royale version of a game so dearly loved by many. Bookworm Adventures should not die in vain and I want to share the fun I had as a kid with the world.</p>
        <br>
        <p class="text" style="text-decoration: underline">How do I play?</p>
        <p class="text">The game is pretty straightforward. After creating a room and sharing the room code (Other players who aren't the host join through the "Join Game" button), you are greeted to a grid of letters. Click on individual letters to add those letters to your word. Click the letter again to remove the letter from the word. After creating a valid word (When the attack button text becomes black), click on the button to attack a random opponent. This sends a certain amount of <span class="text" style="color:BurlyWood">tan letters</span> to an opponent based on the amount of letters in the word and the rarity of the letters (For instance the letter X would send more than the letter T). If your screen fills entirely with <span class="text" style="color:BurlyWood">tan letters</span>, you lose and are out of the current game (It's best to remove <span class="text" style="color:BurlyWood">tan letters </span> from your grid as soon as possible!). <span class="text" style="color:DarkTurquoise">Blue letters</span> send double the amount of <span class="text" style="color:BurlyWood">tan letters </span> than a normal letter. If you're really in a pickle, you can press the scramble button to generate an entirely new grid of letters at the cost of giving yourself two <span class="text" style="color:BurlyWood">tan letters</span>. The last one standing wins the game!</p>
        <button class="button" style="width: fit-content; width: -moz-fit-content; display: inline-block;" onclick="return backFromFaq()">Back</button>
      </div>

      <div id="optionsMenu" style="display:none; text-align:center">
        <label class="text" for="stabilizerOption" style="display: inline-block; font-size: 2.5rem; text-decoration: underline">Stabilizer</label>
        <p class="text">Attacks target the player with the least amount of tan tiles as opposed to a random opponent.</p>
        <input class="input" type="checkbox" id="stabilizerOption" name="stabilizerOption" style="display: inline-block;"> </input>
        <br>
        <br>
        <label class="text" for="classOption" style="display: inline-block; font-size: 2.5rem; text-decoration: underline">Class Mode</label>
        <p class="text">Each font has different gameplay mechanics.</p>
        <input class="input" type="checkbox" id="classOption" name="classOption" style="display: inline-block;"> </input>
        <br>
        <br>
        <button class="button" style="width: fit-content; width: -moz-fit-content; display: inline-block;" onclick="return backOptions()">Back</button>
      </div>

      <div id="fontInfo" style="display:none; text-align:center">
        <p class="text" id="fontTitle" style="font-size: 2.5rem; text-decoration: underline">Trebuchet</p>
        <p class="text" id="fontInfoText"></p>
        <br>
        <br>
        <button class="button" style="width: fit-content; width: -moz-fit-content; display: inline-block;" onclick="return backFontInfo()">Back</button>
      </div>

  </div>

  <div style="display:none; width: 60vmin; margin:auto" id="game">
    <br>

    <div class="row">
      <div class="word" id="playerStats" style="border-width:medium; border-color:black; text-transform: none; height:auto; max-width: 60vmin;">
        <p class="text" style="text-decoration: underline; padding-top: 10px; font-weight: 700">Players</p>
      </div>
    </div>

    <div class="row">
      <div class="word" id="word" style="height:15vmin"></div>
    </div>

    <div class="row">
      <button class="cell" id="cell_0" onclick="return insertCharacter(0);">?</button><!--
      --><button class="cell" id="cell_1" onclick="return insertCharacter(1);">?</button><!--
      --><button class="cell" id="cell_2" onclick="return insertCharacter(2);">?</button><!--
      --><button class="cell" id="cell_3" onclick="return insertCharacter(3);">?</button>
    </div>

    <div class="row">
      <button class="cell" id="cell_4" onclick="return insertCharacter(4);">?</button><!--
      --><button class="cell" id="cell_5" onclick="return insertCharacter(5);">?</button><!--
      --><button class="cell" id="cell_6" onclick="return insertCharacter(6);">?</button><!--
      --><button class="cell" id="cell_7" onclick="return insertCharacter(7);">?</button>
    </div>

    <div class="row">
      <button class="cell" id="cell_8" onclick="return insertCharacter(8);">?</button><!--
      --><button class="cell" id="cell_9" onclick="return insertCharacter(9);">?</button><!--
      --><button class="cell" id="cell_10" onclick="return insertCharacter(10);">?</button><!--
      --><button class="cell" id="cell_11" onclick="return insertCharacter(11);">?</button>
    </div>

    <div class="row">
      <button class="cell" id="cell_12" onclick="return insertCharacter(12);">?</button><!--
      --><button class="cell" id="cell_13" onclick="return insertCharacter(13);">?</button><!--
      --><button class="cell" id="cell_14" onclick="return insertCharacter(14);">?</button><!--
      --><button class="cell" id="cell_15" onclick="return insertCharacter(15);">?</button>
    </div>

    <div class="row" id="additionalRow" style="display:none;">
      <button class="cell" id="cell_16" onclick="return insertCharacter(16);">?</button><!--
      --><button class="cell" id="cell_17" onclick="return insertCharacter(17);">?</button><!--
      --><button class="cell" id="cell_18" onclick="return insertCharacter(18);">?</button><!--
      --><button class="cell" id="cell_19" onclick="return insertCharacter(19);">?</button>
    </div>

    <div class="row">
      <button class="word" style="height:10vmin; color:lightgrey" id="attack" disabled  onclick="return confirmWord();">ATTACK</button>
      <button class="word" style="height:10vmin; color:black" id="clear" onclick="return clearStuff();">CLEAR</button>
      <button class="word" style="height:10vmin; color:black" id="scramble" onclick="return scramble();">SCRAMBLE (+2)</button>
    </div>

    <div class="row" id="fontChangeInGame" style="text-align:center; display:none;">
      <br>
      <select class="input" id="fontSelection2" onchange="fontChangeInGame()">
        <option value="Trebuchet MS" style="font-family:'Trebuchet MS'" selected>Trebuchet</option>
        <option value="Times New Roman" style="font-family:'Times New Roman'">Times New Roman</option>
        <option value="Courier New" style="font-family:'Courier New'">Courier New</option>
        <option value="Comic Sans" style="font-family:'Comic Sans'">Comic Sans</option>
        <option value="Wingdings" style="font-family:'Wingdings'">Wingdings</option>
      </select>
    </div>

    <div class="row" style="text-align:center">
      <button class="button" id="replayButton" style="width: fit-content; width: -moz-fit-content; display: inline-block; display: none; margin-top: 20px" onclick="return replay()" disabled>Play Again</button>
    </div>
  </div>



</body>
