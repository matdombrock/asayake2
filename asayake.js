let asa = {};

asa._state = {
    audio: {},
    playlistTitle: "Playlist Title",
    playlistIndex: 0,
    playing: false,
    recording: false,
    volume: 1
};

asa._cfg = {
    fade: 0.025,
    fadeTime: 5,
    width:512,
    colors:{
        background: 'rgb(35,35,35)',
        btnBackground: 'rgb(15,15,15)',
        btnBackgroundHover: 'rgb(25,25,25)',
        borderColor: 'rgb(155,155,155)',
        fontColor: 'rgb(200,200,200)',
        timelineBackground: 'rgb(100,100,100)',
        timelineInner: 'rgb(155,155,155)',
        playhead: 'rgb(200,200,200)',
        playlistItemBackground: 'rgb(45,45,45)',
        playlistItemBackground2: 'rgb(65,65,65)',
        playlistItemHover:'rgb(75,75,75)',
        playlistItemActive:'rgb(100,100,100)',
    },
    show:{
        title: true,
        albumArt: true,
    }
};

asa._playlist = [];

asa.init = function init(newPlaylist, newPlaylistTitle){

    asa.setPlaylist(newPlaylist, newPlaylistTitle);

    asa._buildPlayer();

    asa._state.audio = new Audio();
    asa._playlistClick(0,false,true);
    
    // Updates
    setInterval(()=>{
        const playlistItem = asa._playlist[asa._state.playlistIndex];
        asa._trackInfo.innerHTML = playlistItem.trackName + ' - ' + playlistItem.artist + ' | ' + playlistItem.albumName;
        asa._timestamp.innerHTML = asa._buildTimestamp();
        asa._timelineInner.style.width = ((asa._state.audio.currentTime / asa._state.audio.duration) * asa._cfg.width) + 'px';
        const rect = asa._timelineInner.getBoundingClientRect();
        asa._timelinePlayHead.style.left = rect.right + 'px';
        //
        if(asa._state.audio.currentTime >= asa._state.audio.duration){
            asa._nextTrack();
        }
    },100);
}

asa.setColor = function setColor(colorName, colorValue){
    asa._cfg.colors[colorName] = colorValue;
}

asa.setWidth = function setWidth(newWidth){
    asa._cfg.width = newWidth;
}

asa.hideTitle = function hideTitle(){
    asa._cfg.show.title = false;
}

asa.hideAlbumArt = function hideAlbumArt(){
    asa._cfg.show.albumArt = false;
}

asa._buildPlayer = function buildPlayer(){
    asa._rootElement = document.getElementById('asayake');
    if(!asa._rootElement){
        alert('Can not find asayake!');
        return;
    }
    // Clear old
    asa._rootElement.innerHTML = '';
    //
    asa._style = document.createElement('style');
    asa._style.type = 'text/css';
    asa._style.innerHTML = `
        button{
            cursor:pointer;
            background:${asa._cfg.colors.btnBackground};
            color:white;
        }
        button:hover{
            background:${asa._cfg.colors.btnBackgroundHover};
        }
        #asayake{
            font-family: 'Trebuchet MS', sans-serif;
            width:${asa._cfg.width}px;
            margin:0 auto;
            border:1px solid ${asa._cfg.colors.borderColor};
            padding:1rem;
            border-radius:0.25rem;
            background:${asa._cfg.colors.background};
            color:${asa._cfg.colors.fontColor};
            overflow:hidden;
        }
        .playlist-title{
            text-align:center;
            font-size:2rem;
            margin-bottom:1rem;
        }
        .album-img-area{
            text-align:center;
        }
        .album-img{
            width:90%;
            max-width:90%;
            margin:0 auto;
        }
        .timeline{
            background:${asa._cfg.colors.timelineBackground};
            width:${asa._cfg.width}px;
            height:24px;
            border-radius:0.25rem;
            margin-bottom:0.25rem;
            cursor:pointer;
        }
        .timeline-inner{
            background:${asa._cfg.colors.timelineInner};
            height:24px;
            display:inline-block;
            border-radius:0.25rem;
        }
        .timeline-playhead{
            display:inline-block;
            width:10px;
            height:24px;
            background:${asa._cfg.colors.playhead};
            position:absolute;
        }
        .timestamp{
            display:inline-block;
            padding-left:1rem;
            padding-right:1rem;
            font-family:monospace;
        }
        .track-info{
            display: -webkit-box;
            xmax-width: 200px;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
            
            text-align:center;
            font-size:1.25rem;
            margin-bottom:0.5rem;
        }
        .playlist{
            margin-bottom:1rem;
            margin-top:1rem;
        }
        .playlist-item{
            padding:0.25rem;
            cursor:pointer;
            background:${asa._cfg.colors.playlistItemBackground};
            max-height:1.5rem;
            line-height:1.5rem;
            overflow:hidden;
        }
        .playlist-item:nth-child(even){
            background:${asa._cfg.colors.playlistItemBackground2};
        }
        .playlist-item:hover{
            background:${asa._cfg.colors.playlistItemHover};
        }
        .playlist-item-active{
            background:${asa._cfg.colors.playlistItemActive}!important;
            font-weight:bolder;
        }
    `;
    asa._rootElement.appendChild(asa._style);


    asa._player = document.createElement('div');
    asa._player.setAttribute('id', 'asayake-player');
    asa._rootElement.appendChild(asa._player);

    asa._playlistTitle = document.createElement('div');
    asa._playlistTitle.setAttribute('id', 'asayake-playlist-title');
    asa._playlistTitle.className = 'playlist-title';
    asa._playlistTitle.innerHTML = asa._state.playlistTitle;
    asa._player.appendChild(asa._playlistTitle);

    asa._albumImgArea = document.createElement('div');
    asa._albumImgArea.setAttribute('id', 'asayake-album-img-area');
    asa._albumImgArea.className = 'album-img-area';
    asa._albumImg = document.createElement('img');
    asa._albumImg.setAttribute('id', 'asayake-album-img');
    asa._albumImg.className = 'album-img';
    asa._albumImgArea.appendChild(asa._albumImg);
    asa._player.appendChild(asa._albumImgArea);

    asa._trackInfo = document.createElement('div');
    asa._trackInfo.setAttribute('id', 'asayake-track-info');
    asa._trackInfo.className = "track-info"
    asa._player.appendChild(asa._trackInfo);

    asa._timeline = document.createElement('div');
    asa._timeline.setAttribute('id', 'asayake-timeline');
    asa._timeline.className = 'timeline';
    asa._timeline.addEventListener('click', asa._timelineClick)
    asa._timelineInner = document.createElement('div');
    asa._timelineInner.className = 'timeline-inner';
    asa._timeline.appendChild(asa._timelineInner);
    asa._timelinePlayHead = document.createElement('div');
    asa._timelinePlayHead.setAttribute('id', 'asayake-timeline-playhead');
    asa._timelinePlayHead.className = 'timeline-playhead';
    asa._timeline.appendChild(asa._timelinePlayHead);
    asa._player.appendChild(asa._timeline);

    

    asa._playBtn = document.createElement('button');
    asa._playBtn.setAttribute('id', 'asayake-pause-play');
    asa._playBtn.innerHTML = '⏵';
    asa._playBtn.addEventListener('click', asa._play);
    asa._player.appendChild(asa._playBtn);

    asa._stopBtn = document.createElement('button');
    asa._stopBtn.setAttribute('id', 'asayake-stop');
    asa._stopBtn.innerHTML = '⏹';
    asa._stopBtn.addEventListener('click', asa._stopNow);
    asa._player.appendChild(asa._stopBtn);

    asa._recBtn = document.createElement('button');
    asa._recBtn.setAttribute('id', 'asayake-rec');
    asa._recBtn.innerHTML = '⏺';
    asa._recBtn.addEventListener('click', asa._rec);
    asa._player.appendChild(asa._recBtn);

    asa._timestamp = document.createElement('div');
    asa._timestamp.setAttribute('id', 'asayake-timestamp');
    asa._timestamp.className = 'timestamp';
    asa._player.appendChild(asa._timestamp);

    asa._playlistArea = document.createElement('div');
    asa._playlistArea.setAttribute('id','asayake-playlist');
    asa._playlistArea.className = 'playlist';
    for(let [i, item] of Object(asa._playlist).entries()){
        const element = document.createElement('div');
        element.setAttribute('id', 'asayake-playlist-item-'+i);
        element.className = 'playlist-item';
        let html = '';
        html += item.trackName;
        html += ' - ';
        html += item.artist;
        html += ' | ';
        html += item.albumName;
        element.innerHTML = html;
        element.addEventListener('click', ()=>{asa._playlistClick(i)});
        asa._playlistArea.appendChild(element);
    }
    asa._player.appendChild(asa._playlistArea);

    // Optional hides
    if(asa._cfg.show.title === false){
        asa._playlistTitle.style.display = 'none';
    }
    if(asa._cfg.show.albumArt === false){
        asa._albumImgArea.style.display = 'none';
    }

};

asa.setPlaylist = function setPlaylist(newPlaylist, newPlaylistTitle){
    asa._playlist = newPlaylist;
    asa._state.playlistTitle = newPlaylistTitle;
}

asa._fadeIn = function fadeIn(){
    asa._state.playing = true;
    setTimeout(()=>{
        if(asa._state.audio.volume < asa._state.volume - asa._cfg.fade){
            asa._state.audio.volume += asa._cfg.fade;
            asa._fadeIn();
        }
    },asa._cfg.fadeTime);
}

asa._fadeOut = function fadeOut(stop=false){
    setTimeout(()=>{
        if(asa._state.audio.volume > asa._cfg.fade){
            asa._state.audio.volume -= asa._cfg.fade;
            asa._fadeOut(stop);
        }
        else{
            console.log('pause');
            if(stop){
                console.log('stopped');
                asa._state.audio.currentTime = 0;
            }
            asa._state.audio.pause();
            asa._state.playing = false;
            asa._updatePlayBtn();
        }
    },asa._cfg.fadeTime);
}

asa._updatePlayBtn = function updatePlayBtn(){
    asa._playBtn.innerHTML = asa._state.playing ? '⏸' : '⏵';
}

asa._play = function play(override = false){
    asa._state.playing = !asa._state.playing;
    asa._updatePlayBtn();
    if(override === true){
        asa._state.playing = true;
    }
    if(asa._state.playing){
        asa._state.audio.volume = 0;
        console.log('play');
        asa._state.audio.play();
        asa._fadeIn();
    }
    else{
        asa._fadeOut();
    }
}

asa._stop = function stop(){
    asa._fadeOut(true);
}
asa._stopNow = function stopNow(){
    asa._state.playing = false;
    asa._state.audio.currentTime = 0;
    asa._state.audio.pause();
    asa._updatePlayBtn();
}

asa._rec = function rec(){
    
    asa._state.recording = !asa._state.recording;
    console.log('rec');
    console.log(asa._state.recording);
    if(asa._state.recording){
        asa._recBtn.style.background = "rgb(255,0,0)";
    }
    else{
        asa._recBtn.style.background = "gainsboro";
    }
}

asa._buildTimestamp = function buildTimestamp(){
    let ct = asa._state.audio.currentTime || 0;
    let dt = asa._state.audio.duration || 0;
    let cur = new Date(ct * 1000).toISOString().substring(14, 19);
    let dur = new Date(dt * 1000).toISOString().substring(14, 19);
    return `${cur} / ${dur}`;
}

asa._timelineClick = function timelineClick(event){
    const rect = asa._timeline.getBoundingClientRect();
    let pos = (event.clientX - rect.left) / asa._cfg.width;
    //debugger;
    asa._state.audio.currentTime = asa._state.audio.duration * pos;
}

asa._playlistClick = function playlistClick(index, playNow = true, override = false){
    if(index === asa._state.playlistIndex && override === false){
        return; // no change
    }
    // Clear old
    asa._stopNow();

    asa._state.playlistIndex = index;
    const playlistItem = asa._playlist[index];
    asa._state.audio = new Audio(playlistItem.url);
    console.log('loaded: '+playlistItem.url);

    asa._albumImg.src = playlistItem.albumArt;

    asa._playlistHighlight(index);
    if(playNow){
        asa._play(true);
    }
}

asa._playlistHighlight = function playlistHighlight(index){
    const elements  = document.getElementsByClassName('playlist-item');
    for(let i = 0; i < elements.length; i++){
        const element = elements[i];
        element.classList.remove('playlist-item-active');
        if(i === index){
            element.classList.add('playlist-item-active');
        }
    }
}

asa._nextTrack = function nextTrack(){
    asa._state.playlistIndex++;
    if(asa._state.playlistIndex >= asa._playlist.length){
        asa._state.playlistIndex = 0;
    }
    asa._stopNow();
    asa._playlistClick(asa._state.playlistIndex, true, true);
}

