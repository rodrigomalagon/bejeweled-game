//---GAME SETUP SECTION----//
{
//Function to get a random color from a pre-defined list of colors
function randomColor() {
    let colors = ['red', 'blue', 'green', 'yellow', 'orange', 'white']; //Colors defined as strings
    return colors[Math.floor((Math.random() * colors.length))];
}
//Function to insert jewel image to cell element given a color name:
function insertImage(cellElement,color){
    let HTMLexpression = '<img src=\"images\/' + color + '.png\" class=\'jewel\'><\/img>';
    cellElement.innerHTML = HTMLexpression;
}

//Function to create cell element (with a suitable index to locate the cell)
function createCell(i,j){
    let newCell = document.createElement("td");
    //index with position:
    newCell.setAttribute('id', String(i) + '-' + String(j));
    //setting color of jewel:
    let newColor = randomColor();
    newCell.setAttribute('data-color',newColor);//storing color as a data-* attribute
    //insert image to cell:
    insertImage(newCell,newColor);
    //adding listeners to cell:
    newCell.addEventListener('click', playSelected); 
    newCell.addEventListener('mouseover', nieghborsHover);
    newCell.addEventListener('mouseout', undoNieghborsHover); 
    return newCell;
}

//Function to create a row at particular row position and of given length (number of columns of the grid)
function createRow(rowPosition,rowLength){
    let newRow = document.createElement("tr");
    for(let j=0; j < rowLength; j++){    
        newRow.appendChild(createCell(rowPosition,j))
    }
    return newRow;
}

//Function to create and return a table element for the grid
function createTable(numRows,numColumns)
{
    let newTable = document.createElement("table");
    let tableBody = document.createElement("tbody");
    for(let i=0; i<numRows; i++){
        tableBody.appendChild(createRow(i,numColumns));
    }
    newTable.appendChild(tableBody);
    return newTable;
}

//Function to alert the user of wrong input type
function focusFunction(event){
    let userInput = event.target;
    if(isNaN(userInput.value)){
        alert('Careful, please give a number as input.');
        userInput.value = '';
    }
    else if(parseInt(userInput.value)<1){
        alert('Careful, please give positive integer as input.');
        userInput.value = '';
    }
    else{
        userInput.value = parseInt(userInput.value);//"corrects" floats into integers
    }
}

//Function to inject grid as table element into webpage
function injectGrid(){
    //Constructing table:
    let numRowsElement = document.getElementById('numRowsID');
    let numRows = parseInt(numRowsElement.value);
    let numColumnsElement = document.getElementById('numColumnsID');
    let numColumns = parseInt(numColumnsElement.value);
    let table = createTable(numRows,numColumns);
    table.id = 'tableID';
    table.className = 'secondary box table';//styling table with class
    //Setting up table section:
    let gameSection = document.getElementById('gameSection');  
    gameSection.innerHTML='';//clearing section
    gameSection.className='primary box gameSection';
    let tableHeader = document.createElement('h1');
    tableHeader.setAttribute('id','tableHeaderID');
    tableHeader.innerText = 'Let\'s play!';
    //Adding table to section:
    gameSection.appendChild(tableHeader);
    gameSection.appendChild(table);
}

//Declaring global variables to store score and turns left
{
let score;
let turnsLeft;
}
}


//---GAMEPLAY FUNCTIONALITY---//
let music = new Audio("audios/recercada_quarta_sobre_la_folia_1553_jordi_savall.mp3");
let soundEffectStatus = 'on';

{
//Function to start whole game 
function startGame(event){
    //playing opening song
    music.play();
    music.loop = true;
    //revealing welcoming section
    let welcomeSection = document.getElementById('WelcomeSection');
    welcomeSection.className = "";
    //hide "start game" button and unhidde controls button
    event.target.className = 'hidden';
    startControlsButton = document.getElementById('startControlsID');
    startControlsButton.className = 'center';
}

//Function to open game controls and show instructions
function startControls(event){
    //hide/unhide sections to present menu with playing controls and instructions:
    let menuSection = document.getElementById('menuSection');
    menuSection.className="primary box menu";
    let gameSection = document.getElementById('gameSection');
    gameSection.className = 'gameSection';
    let welcomeSection = document.getElementById('WelcomeSection');
    welcomeSection.className = "hidden"
    let instructionSection = document.getElementById('Instructions');
    instructionSection.className = "";
    //set initial values to rows and columns
    document.getElementById('numRowsID').value = 10;
    document.getElementById('numColumnsID').value = 10;
    //change buttons' status
    event.target.className = 'hidden';
    let homeButton = document.getElementById('goHomeID');
    homeButton.className = 'center';
}

//Function to start a new play
function playNewGame(event){
    injectGrid();//insert grid
    //Setting initial values of score and turns left (global vars):
    score = 0;
    turnsLeft = 5;
    document.getElementById('score').innerText = String(score);
    document.getElementById('turnsLeft').innerText = String(turnsLeft);
    //Changing play button message:
    event.target.value = 'Reset game';
}

//Function to get the adjacent elements' IDs of a given cell element such that:
    //1. they are inside a given range of rows and columns
    //2. they share the same (jewel) color as the selected cell element
function getEqualNeighborsIDs(cellElementID,numOfRows,numOfCols){
    let rowPosition = parseInt(cellElementID.split('-')[0]);
    let colPosition = parseInt(cellElementID.split('-')[1]);
    //Initially storing all four possible neighbors:
    let initialNeighbors = [
                    [rowPosition-1, colPosition],
                    [rowPosition, colPosition-1],
                    [rowPosition, colPosition+1],
                    [rowPosition+1, colPosition]
                ];
    //Filtering only possible neighbors within the given row-column range:
    let neighborsIDs = [];
    for(let i = 0; i < initialNeighbors.length; i++){
        if((0 <= initialNeighbors[i][0])&& (initialNeighbors[i][0] <=  numOfRows-1) &&
            (0 <= initialNeighbors[i][1]) && (initialNeighbors[i][1] <=  numOfCols-1)
            ){
            neighborsIDs.push(String(initialNeighbors[i][0]) +'-'+ String(initialNeighbors[i][1]));
            }
    }
    //Filtering only neighbors with same color as selected cell element:
    let equalNeighborsIDs = [];
    let selectedColor = document.getElementById(cellElementID).dataset.color;
    for (let i = 0; i < neighborsIDs.length; i++){
        let neighborColor = document.getElementById(neighborsIDs[i]).dataset.color;
        if(neighborColor == selectedColor){
            equalNeighborsIDs.push(neighborsIDs[i]);
        }
    }
    return equalNeighborsIDs;
}

//Function to "mark" a cell and its equal neighbors with a given class
function selectCell(cellElement,className){
    cellElement.className = className;//marking selected cell with class
    //identifying equal neighboring cells with helping function:
        //setting parameters:
        let selectedCellID = cellElement.id;
        let numOfRows = parseInt(document.getElementById('numRowsID').value);
        let numOfColumns = parseInt(document.getElementById('numColumnsID').value);
        //calling function:
        let equalNeighborsIDs = getEqualNeighborsIDs(selectedCellID,numOfRows,numOfColumns);
    //marking equal neighbors with class:
    let numEqualNeighbors = equalNeighborsIDs.length;
    for(let i = 0; i < numEqualNeighbors; i++){
        let element = document.getElementById(equalNeighborsIDs[i]);
        element.className = className;
    }
}

//Function to shift all table elements above a given cell element
function shiftElementsAbove(cellElement) {
    let rowPosition = parseInt(cellElement.id.split('-')[0]);
    let columnPosition = parseInt(cellElement.id.split('-')[1]);
    for (let i = rowPosition; i > 0; i--) { //apply shift from the second row until the row of selected position
        let cellToReplace = document.getElementById(String(i)  + '-' + String(columnPosition));
        let upperCellColor = document.getElementById(String(i-1) + '-' + String(columnPosition)).dataset.color;
        cellToReplace.dataset.color =  upperCellColor; //assign upper jewel's color
        insertImage(cellToReplace,upperCellColor);//insert corresponding new image
    }
    //assign random color to cell at the top of the column:
    let topColumnCell = document.getElementById('0-' + String(columnPosition));
    topColumnCell.dataset.color = randomColor(); 
    insertImage(topColumnCell,topColumnCell.dataset.color);//insert corresponding new image
}

//Function to update score and number of turns left given the number of marked cells to be deleted:
function updateCounters(numMarkedCells){
    //updating global variable "score"
    score = score + numMarkedCells;
    document.getElementById('score').innerText = String(score);
    //updating global variable "turns left" if user deleted less than 4 cells
    if(numMarkedCells < 4){
        turnsLeft--;
        document.getElementById('turnsLeft').innerText = String(turnsLeft);
    }
}

//Function to deploy game functionality as a cell is selecetd
function playSelected(event){
    if(event.target.tagName!= 'IMG'){//making event available just for images
        return;
    }
    //insert breaking sound:
    playSoundEffect();    
    
    let cellElement = event.target.parentElement;//function to act on cell element, rather than the image itself
    //Executing marking of selected cell and its equal neighbors
    selectCell(cellElement,'toBeDeleted');
    //Apply shift function to a selected element and its equal neighbors (class 'toBeDeleted'):
    let deletableElements = document.querySelectorAll('.toBeDeleted');
    let numDeletedCells = deletableElements.length;
    for(let i = 0; i < numDeletedCells; i++){
        let deletableElement = deletableElements[i];
        shiftElementsAbove(deletableElement);
        deletableElement.className = '';//resetting the className of the deleted cells
    }
    //Update the score and turns left:
    updateCounters(numDeletedCells);
    //Verify if the game needs to end:
    endGame(turnsLeft);
}

//Function to end round
function endGame(turnsLeft){
    if (turnsLeft == 0){
        //Printing an "end of the game" message
        let tableHeader = document.getElementById('tableHeaderID');
        tableHeader.innerText  = '-- End of the Game --';
        //remove click listener to all cells to avoid the user to keep clicking
        let cellElements = document.getElementsByTagName('td');
        for(let i = 0; i < cellElements.length; i++){
            let cell = cellElements[i];
            cell.removeEventListener('click',playSelected);
            cell.firstChild.className = cell.firstChild.className + ' opacity';//changing appearance of the image
        }
        let playButtonElement = document.getElementById('playButtonID');
        playButtonElement.value = 'Play again';
    }

}

//Function to return to home page
function goHome(){
    location.reload();
}
}


//---ENHANCE APPEARANCE---//
{
//Function to mark equal neighbors when hovering over a jewel
function nieghborsHover(event){
    if(event.target.tagName!= 'IMG'){//making event available just for images
        return;
    }
    let cellElement = event.target.parentElement;
    selectCell(cellElement,'markedNeighbor');
}

//Function to unmark equal neighbors when unhovering over a jewel
function undoNieghborsHover(event){
    if(event.target.tagName!= 'IMG'){//making event available just for images
        return;
    }
    let markedNeighbors = document.querySelectorAll('.markedNeighbor');
    for(let i = 0; i < markedNeighbors.length; i++){
        markedNeighbors[i].className = '';//reseting the className of the marked elements
    }
}
}


//---SOUND CONTROLS---//
{

//Play sound effect function
function playSoundEffect(){
    if(soundEffectStatus === 'on'){
        let soundEffect = new Audio("audios/breaking_sound.mp4");
        soundEffect.play();        
    }
}


// Mute-unmute sound handlers
function muteUnmuteMusic(event){
    event.preventDefault()//Prevent default submission and reloading of the webpage

    if(music.muted){
        event.target.attributes.src.nodeValue='images/sound-on.png';
    } else {
        event.target.attributes.src.nodeValue='images/sound-off.png';
    }
    music.muted = !music.muted;
} 

function muteUnmuteEffect(event){
    event.preventDefault()//Prevent default submission and reloading of the webpage

    if(soundEffectStatus == 'on'){
        soundEffectStatus = 'off';
        event.target.attributes.src.nodeValue='images/sound-off.png';
    } else {
        soundEffectStatus = 'on';
        event.target.attributes.src.nodeValue='images/sound-on.png';
    }
}

}