const WIDTH = 5, HEIGHT = 4, CPU_POWER = 0.99;
let MATCHING = {}, PLAYER_SCORE, CPU_SCORE, TIME, CURRENT='PLAYER';

function init() {
    createBoard(HEIGHT, WIDTH);
    setTiles(HEIGHT, WIDTH);
    flipAll(4, 5);
    for(let i=0;i<50;i++)
        setTimeout(function(){randomShuffle(4, 5)}, 100*i+50*4*5+500)
}
function $(query) {
    return document.querySelector(query);
}


function tileFactory() {
    let holder = document.createElement('div');
    holder.classList.add('holder');
    let front = document.createElement('div');
    let back = document.createElement('div');
    front.classList.add('front');
    back.classList.add('back');
    holder.appendChild(front);
    holder.appendChild(back);
    return holder;
}

function _div(id, klass){
    let el = document.createElement('div');
    if(id)el.id=id;
    if(klass)el.className = klass;
    return el;
}

function updateHUD() {
    $('#score_player').innerText = 'Player: '+PLAYER_SCORE;
    $('#score_cpu').innerText = 'Cpu: '+CPU_SCORE;
}

function buildHUD(){
    let hud = _div('hud');
    let player = _div('score_player');
    let time = _div('time');
    let cpu = _div('score_cpu');
    hud.appendChild(player);
    hud.appendChild(time);
    hud.appendChild(cpu);
    PLAYER_SCORE = CPU_SCORE = 0;

    return hud;
}
function createBoard(height, width) {
    if((height*width)%2)
        throw "Number of tiles must be even!";

    const board = document.getElementById('board');
    board.innerHTML = '';
    board.appendChild(buildHUD());
    updateHUD();
    
    for(let i=0;i<height;i++) {
        for(let j=0;j<width;j++) {
            let el = tileFactory();
            el.id = 't_'+i+'_'+j;
            board.appendChild(el);
            el.style.left = (180*j)+'px';
            el.style.top = (180*i)+'px';
        }
    }
    board.style.width = (180*width) + 'px';
    board.style.height = (180*height) + 'px';
}

function randomIntegral() {
    let a = Math.floor(10*Math.random());
    let b = a + 1 + Math.floor(10*Math.random());
    let fn, res;
    if(Math.random()<0.3) {
        res = (b*b*b-a*a*a)/3;
        fn = "x^2";
    }else {
        res = 0.5*(b*b - a*a);
        fn = "x";
    }
    
    let text = "\\int_{"+a+"}^{"+b+"} \\! "+fn+" \\, \\mathrm{d}x.";
    return [text, res];
}


function setTiles(height, width) {
    let ids = [];
    for(let i=0;i<height;i++)
        for(let j=0;j<width;j++)
            ids.push('t_'+i+'_'+j);
    ids.sort((a,b)=>(Math.random()-0.5));

    for(let i=0;i<ids.length;i+=2) {
        let [text, res] = randomIntegral();

        MATCHING[ids[i]] = ids[i+1];
        MATCHING[ids[i+1]] = ids[i];

        $('#'+ids[i]+' .front').innerText = '$$'+text+'$$';//;'Math.floor(i);
        $('#'+ids[i+1]+' .front').innerText = res.toFixed(2);//Math.floor(i);
        // $('#'+ids[i+1]+' .front').classList.add('bigger');

        $('#'+ids[i]).addEventListener('click', flip);
        $('#'+ids[i+1]).addEventListener('click', flip);

    }
    MathJax.typeset();
}

function flipAll(height, width) {
    let total = 0;
    for(let i=0;i<height;i++)
        for(let j=0;j<width;j++) {
            setTimeout(function(){
                $('#t_'+i+'_'+j).classList.add('flip');
            }, 50*total);
            total += 1;
        }
}

function getRandom(height, width) {
    let x = Math.floor(width*Math.random());
    let y = Math.floor(height*Math.random());
    return 't_'+y+'_'+x;
}

function randomShuffle(height, width) {
    for(let i=0;i<1;i++) {
        let a = getRandom(height, width);
        let b = getRandom(height, width);

        let el_a = $('#'+a);
        let el_b = $('#'+b);

        console.log(a, b);
        let tmp = el_a.style.left;
        el_a.style.left = el_b.style.left;
        el_b.style.left = tmp;

        tmp = el_a.style.top;
        el_a.style.top = el_b.style.top;
        el_b.style.top = tmp;
    }
}

let FLIPPED = [];

function unFlip() {
    for(let id of FLIPPED)
        $('#'+id).classList.toggle('flip');
    FLIPPED = [];
}

function setMatch(who) {
    for(let id of FLIPPED)
        $('#'+id).classList.add('matched');
    FLIPPED = [];
    if(who == 'PLAYER')PLAYER_SCORE += 1;
    else CPU_SCORE += 1;

    updateHUD();

    if(2*(CPU_SCORE+PLAYER_SCORE)==HEIGHT*WIDTH) {
        CURRENT='GAME_OVER';
        setTimeout(gameOver, 2000);
    } else 
        CURRENT = (who == 'PLAYER' ? 'CPU' : 'PLAYER');
}

function flipTile(id) {
    if(FLIPPED.indexOf(id) == -1 && !$('#'+id).classList.contains('matched')) {
        FLIPPED.push(id);
        $('#'+id).classList.toggle('flip');
    }
}
function flip() {
    if(CURRENT=='CPU' || FLIPPED.length >= 2)return;
    
    let id = this.id;
    flipTile(id);

    if(FLIPPED.length == 2) {
        checkScore('PLAYER')
        setTimeout(cpuMove, 2000);
    }
}

function checkScore(who){
    if(MATCHING[FLIPPED[0]] == FLIPPED[1])
        setTimeout(()=>setMatch(who), 1000);
    else {
        setTimeout(unFlip, 1000);
        CURRENT = (who == 'PLAYER' ? 'CPU' : 'PLAYER');
    }


}

function cpuMove() {
    let a, b;

    while(true) {
        a = getRandom(HEIGHT, WIDTH);
        console.log(a);
        if(!$('#'+a).classList.contains('matched'))
            break;
    }

    if(Math.random() < CPU_POWER)
        b = MATCHING[a];
    else {
        while(true) {
            b = getRandom(HEIGHT, WIDTH);
            if(a!=b&&!$('#'+b).classList.contains('matched'))
                break;
        }
    }
    console.log(a, b);

    setTimeout(function(){
        flipTile(a);
        setTimeout(function(){
            flipTile(b);
            setTimeout(function(){
                checkScore('CPU');
            },1000);
        }, 1200);
    }, 1000);
    
}

function gameOver(){
    $('#hud').innerHTML = '';
    let message = 'Hello World';
    if(PLAYER_SCORE == CPU_SCORE)message="there was a tie!";
    if(PLAYER_SCORE > CPU_SCORE)message="player won!";
    if(PLAYER_SCORE < CPU_SCORE)message="cpu won!";
    $('#board').innerHTML = "<h1>Game Over</h1><h2>"+message+"</h2>";
}