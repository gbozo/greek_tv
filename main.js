document.addEventListener('DOMContentLoaded', function() {
    let timeout;
    const videoContainer = document.getElementById('videoContainer');
    const video = document.getElementById('video');
    const channelsContainer = document.getElementById('channelsContainer');
    const hls = new Hls();
    var currentChannel;
    video.addEventListener('error', function() {
        console.error('Video error:', video.error);
    });
    
    hls.on(Hls.Events.ERROR, function(event, data) {
        console.error('HLS error:', data.type, data.details, data.fatal);
    });

    // Load the m3u8 list and generate channels
    fetch('iptv.m3u8')
    .then(response => response.text())
    .then(data => {
        let lines = data.split('\n');
        let firstChannel = true;
        for(let i = 0; i < lines.length; i++) {
            if(lines[i].startsWith('#EXTINF:')) {
                let title = lines[i].split(',')[1];
                let link = lines[i+1];
                
                let channel = document.createElement('div');
                channel.classList.add('channel');
                if(!firstChannel) {
                    channel.classList.add('hidden');
                }
                firstChannel = false;

                channel.textContent = title;
                channel.addEventListener('click', function() {
                    // Set this channel as the current channel
                    currentChannel = channel;
                    // Update channel visibility based on the current channel
                    document.querySelectorAll('.channel').forEach(ch => {
                        if (ch === currentChannel) {
                            ch.classList.remove('hidden');                            
                        } else {
                            ch.classList.add('hidden');
                        }
                    });
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = link;
                    } else if (Hls.isSupported()) {
                        if (hls) hls.destroy(); // Destroy any existing HLS instance
                        var hls = new Hls();
                        hls.loadSource(link);
                        hls.attachMedia(video);
                    }
                    video.play();
                                    
                });
                channelsContainer.appendChild(channel);
            }
        }
    });
    channelsContainer.addEventListener('mouseover', function() {
        // Show all channels when hovering over the channelsContainer
        document.querySelectorAll('.channel').forEach(channel => channel.classList.remove('hidden'));
    });
    
    channelsContainer.addEventListener('mouseout', function() {
        // Hide all channels except the current one when the mouse is not hovering
        document.querySelectorAll('.channel').forEach(channel => {
            if (channel !== currentChannel) {
                channel.classList.add('hidden');
            } else {
                channel.classList.remove('hidden');
            }
        });
    });
    

    videoContainer.addEventListener('mousemove', function() {
        clearTimeout(timeout);
        document.body.classList.remove('hideCursor');
        channelsContainer.style.display = 'block';
        setTimeout(function() {
            channelsContainer.style.opacity = '1';
        }, 50);  // Allow the div to render first
        
        timeout = setTimeout(function() {
            channelsContainer.style.opacity = '0';
            document.body.classList.add('hideCursor');
            setTimeout(function() {
                if (channelsContainer.style.opacity === '0') {
                    channelsContainer.style.display = 'none';
                }
            }, 500);  // Match the CSS transition duration
        }, 3000);  // 3 seconds without movement
    });
    
});
