// SEED13 FIELD GUIDE TO HUMAN MUSIC - Application Logic

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
    currentSong: null,
    isPlaying: false,
    votes: JSON.parse(localStorage.getItem('seed13-votes')) || {},
    audioElement: null
};

// ============================================
// VOTE FUNCTIONALITY
// ============================================

function initializeVoting() {
    // Get all vote buttons
    const voteButtons = document.querySelectorAll('.vote-up, .vote-down');
    
    voteButtons.forEach(button => {
        button.addEventListener('click', handleVote);
    });
    
    // Restore previous votes from localStorage
    restoreVotes();
}

function handleVote(event) {
    const button = event.currentTarget;
    const songItem = button.closest('.song-item');
    const songId = songItem.dataset.songId;
    const genre = songItem.dataset.genre;
    const voteType = button.classList.contains('vote-up') ? 'up' : 'down';
    
    // Toggle vote
    const voteKey = `${genre}-${songId}`;
    const currentVote = state.votes[voteKey];
    
    if (currentVote === voteType) {
        // Remove vote if clicking same button again
        delete state.votes[voteKey];
        button.classList.remove('voted');
    } else {
        // Set new vote
        state.votes[voteKey] = voteType;
        
        // Update UI
        const siblingButton = button.parentElement.querySelector(
            voteType === 'up' ? '.vote-down' : '.vote-up'
        );
        siblingButton.classList.remove('voted');
        button.classList.add('voted');
    }
    
    // Save to localStorage
    localStorage.setItem('seed13-votes', JSON.stringify(state.votes));
    
    // Log vote (in a real application, this would send to a server)
    console.log('Vote registered:', {
        songId,
        genre,
        vote: state.votes[voteKey] || 'removed'
    });
}

function restoreVotes() {
    // Apply saved votes to UI
    Object.entries(state.votes).forEach(([key, voteType]) => {
        const [genre, songId] = key.split('-');
        const songItem = document.querySelector(
            `.song-item[data-genre="${genre}"][data-song-id="${songId}"]`
        );
        
        if (songItem) {
            const button = songItem.querySelector(
                voteType === 'up' ? '.vote-up' : '.vote-down'
            );
            if (button) {
                button.classList.add('voted');
            }
        }
    });
}

// ============================================
// MUSIC PLAYER FUNCTIONALITY
// ============================================

const musicLibrary = {
    // Public domain classical music from Musopen
    'beethoven-9th': 'https://www.mfiles.co.uk/mp3-downloads/beethoven-symphony9-4.mp3',
    'vivaldi-seasons': 'https://www.mfiles.co.uk/mp3-downloads/vivaldi-winter-allegro.mp3',
    'bach-brandenburg': 'https://www.mfiles.co.uk/mp3-downloads/bach-brandenburg-3-1.mp3',
    
    // Note: Most songs would require licensing. In a production app,
    // you would use APIs like Spotify Web Playback SDK, YouTube iframe API,
    // or Apple Music embeds. For demonstration, we'll use placeholder sources.
};

function initializeMusicPlayer() {
    const playButtons = document.querySelectorAll('.play-btn');
    const musicPlayer = document.getElementById('musicPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    
    // Create audio element
    state.audioElement = new Audio();
    state.audioElement.volume = 0.7;
    
    // Event listeners
    playButtons.forEach(button => {
        button.addEventListener('click', handlePlayClick);
    });
    
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Audio events
    state.audioElement.addEventListener('ended', handleSongEnd);
    state.audioElement.addEventListener('play', () => state.isPlaying = true);
    state.audioElement.addEventListener('pause', () => state.isPlaying = false);
}

function handlePlayClick(event) {
    const button = event.currentTarget;
    const songItem = button.closest('.song-item');
    const songId = button.dataset.song;
    const songTitle = songItem.querySelector('.song-title').textContent;
    const artist = songItem.querySelector('.artist').textContent;
    
    // Check if this song is available
    const songUrl = musicLibrary[songId];
    
    if (!songUrl) {
        // Show player with unavailable message
        showPlayer(songTitle, artist, null);
        alert('This song is not available for playback in this demo. In a production version, this would integrate with Spotify, Apple Music, or YouTube APIs for licensed streaming.');
        return;
    }
    
    // If same song, just toggle play/pause
    if (state.currentSong === songId && state.audioElement.src) {
        togglePlayPause();
        return;
    }
    
    // Load and play new song
    state.currentSong = songId;
    state.audioElement.src = songUrl;
    state.audioElement.play();
    
    // Update UI
    showPlayer(songTitle, artist, button);
    updatePlayButtons(button);
}

function showPlayer(title, artist, button) {
    const musicPlayer = document.getElementById('musicPlayer');
    const trackTitle = musicPlayer.querySelector('.track-title');
    const trackArtist = musicPlayer.querySelector('.track-artist');
    
    trackTitle.textContent = title;
    trackArtist.textContent = artist;
    musicPlayer.classList.add('active');
}

function updatePlayButtons(activeButton) {
    // Remove playing class from all buttons
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.classList.remove('playing');
    });
    
    // Add playing class to active button
    if (activeButton) {
        activeButton.classList.add('playing');
    }
}

function togglePlayPause() {
    if (!state.audioElement.src) return;
    
    if (state.isPlaying) {
        state.audioElement.pause();
        updatePlayPauseButton(false);
    } else {
        state.audioElement.play();
        updatePlayPauseButton(true);
    }
}

function updatePlayPauseButton(playing) {
    const btn = document.getElementById('playPauseBtn');
    const iconSVG = playing ? 
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>` :
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    
    btn.innerHTML = iconSVG;
}

function handleSongEnd() {
    state.isPlaying = false;
    updatePlayPauseButton(false);
    updatePlayButtons(null);
}

// ============================================
// VOTING STATISTICS
// ============================================

function getVoteStatistics() {
    const stats = {
        totalVotes: 0,
        upVotes: 0,
        downVotes: 0,
        byGenre: {}
    };
    
    Object.entries(state.votes).forEach(([key, voteType]) => {
        const [genre, songId] = key.split('-');
        
        stats.totalVotes++;
        if (voteType === 'up') {
            stats.upVotes++;
        } else {
            stats.downVotes++;
        }
        
        if (!stats.byGenre[genre]) {
            stats.byGenre[genre] = { up: 0, down: 0 };
        }
        stats.byGenre[genre][voteType]++;
    });
    
    return stats;
}

// Expose stats function to console for debugging
window.getSEED13Stats = getVoteStatistics;

// ============================================
// SMOOTH SCROLLING FOR NAVIGATION
// ============================================

function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('%cSEED13 FIELD GUIDE TO HUMAN MUSIC', 'font-size: 20px; font-weight: bold; color: #D97706;');
    console.log('%cWelcome, cosmic observer. Your votes are being recorded for the interstellar archive.', 'color: #A8A29E;');
    console.log('%cType getSEED13Stats() to view voting statistics.', 'color: #57534E;');
    
    initializeVoting();
    initializeMusicPlayer();
    initializeSmoothScroll();
    
    // Log initial statistics
    console.log('Current vote statistics:', getVoteStatistics());
});

// ============================================
// EXPORT VOTES FUNCTIONALITY
// ============================================

function exportVotes() {
    const stats = getVoteStatistics();
    const data = {
        timestamp: new Date().toISOString(),
        votes: state.votes,
        statistics: stats
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seed13-votes-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Votes exported successfully!');
}

window.exportSEED13Votes = exportVotes;
