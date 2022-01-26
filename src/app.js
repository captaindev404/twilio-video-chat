import {isSupported, createLocalVideoTrack, connect, createLocalTracks} from 'twilio-video'
import cuid from 'cuid';
import {tokenGenerator} from './tokenGenerator';

if (isSupported) {
  console.log('Twilio is supported')
} else {
  console.error('This browser is not supported by twilio-video')
}


const roomName = 'captain-room'
let identity = cuid()

const container = document.getElementById('local-video')
const joinButton = document.getElementById('join-room')
const exitButton = document.getElementById('exit-room')
const nameInput = document.getElementById('name')
const portal = document.getElementById('portal')

nameInput.innerText = identity

function startVideoUI() {
  exitButton.disabled = false
  container.innerHTML = ''
}

function endVideoUI() {
  exitButton.disabled = true
  container.innerHTML = ''
}

function stopVideo(track) {
  track.stop()
  endVideoUI()
}


function participantConnected(participant){
  console.log('participant %s connected', participant.identity)

  const div = document.createElement('div')
  div.id = participant.sid
  div.innerText = participant.identity

  participant.on('trackSubscribed', track => trackSubscribed(div, track))
  participant.on('trackUnsubscribed', trackUnsubscribed)

  participant.tracks.forEach(publication => {
    if(publication.isSubscribed){
      trackSubscribed(div, publication.track)
    }
  })

  portal.appendChild(div)
}

function participantDisconnected(participant){
  console.log('Participant %s disconnected', participant.identity)
  document.getElementById(participant.sid).remove()
}

function trackUnsubscribed(track){
  track.detach().forEach(element => element.remove())
}

function trackSubscribed(div, track){
  div.appendChild(track.attach())
}

async function startVideo() {
  startVideoUI()

  const tracks = await createLocalTracks()

  const localVideoTrack = tracks.find(track => track.kind === 'video')
  container.append(localVideoTrack.attach())

  //TODO: handle exit button
  exitButton.addEventListener('click', function(){
    stopVideo(localVideoTrack)
  })

  const generatedToken = tokenGenerator(identity, roomName);


  const room = await connect(generatedToken, {
    name: roomName, tracks
  })

  room.participants.forEach(participantConnected)
  room.on('participantConnected', participantConnected)
  room.on('participantDisconnected', participantDisconnected)
  room.once('disconnected', error => room.participants.forEach(participantDisconnected))

  window.addEventListener('beforeunload', () => room.disconnect())
  window.addEventListener('pagehide', () => room.disconnect())
}

//nameInput.addEventListener('keypress', onNameKeyPress)
joinButton.addEventListener('click', startVideo)
