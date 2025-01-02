import { Controller } from "@hotwired/stimulus"
import { marked } from "marked";

// Connects to data-controller="voice"
export default class extends Controller {
  static values = {
    token: String
  }

  static targets = ["listening", "transcript", "assistantTranscriptTemplate", "userTranscriptTemplate"]

  transcriptResponsesToElements = {}

  connect() {
    // this.startVoice();
  }

  stopVoice() {
    if (this.peerConnection) {
      // Close data channel if it exists
      if (this.dataChannel) {
        this.dataChannel.close();
        this.dataChannel = null;
      }

      // Close peer connection
      this.peerConnection.close();
      this.peerConnection = null;

      // Stop all media tracks
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
      }

      // Hide listening indicator
      this.toggleListening();
    }
  }

  async startVoice() {
    // Create a peer connection
    const pc = new RTCPeerConnection();
    this.peerConnection = pc;

    // Set up to play remote audio from the model
    const audioEl = document.createElement("audio");
    audioEl.autoplay = true;
    pc.ontrack = e => audioEl.srcObject = e.streams[0];

    // Add local audio track for microphone input in the browser
    const ms = await navigator.mediaDevices.getUserMedia({
      audio: true
    });
    this.mediaStream = ms;
    pc.addTrack(ms.getTracks()[0]);

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel("oai-events");
    this.dataChannel = dc;
    dc.addEventListener("message", this.handleEvent.bind(this));

    // Start the session using the Session Description Protocol (SDP)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-realtime-preview-2024-12-17";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${this.tokenValue}`,
        "Content-Type": "application/sdp"
      },
    });

    const answer = {
      type: "answer",
      sdp: await sdpResponse.text(),
    };

    await pc.setRemoteDescription(answer);

    dc.onopen = () => {
      dc.send(JSON.stringify({
        type: 'session.update',
        session: {
          modalities: [ "text" ],
          input_audio_transcription: {
            model: "whisper-1"
          },
        }
      }));

      this.toggleListening();
    };
  }

  toggleListening() {
    this.listeningTarget.classList.toggle("hidden");
    this.listeningTarget.classList.toggle("flex");
  }

  handleEvent(e) {
    const data = JSON.parse(e.data);
    console.log(data);

    if (data.type === 'response.created') {
      const template = this.assistantTranscriptTemplateTarget.content.cloneNode(true);
      template.children[0].dataset.responseId = data.response.id;
      template.children[0].dataset.responseContent = "";
      this.transcriptTarget.appendChild(template);
    } else if (data.type === 'response.text.delta') {
      const element = this.transcriptTarget.querySelector(`[data-response-id="${data.response_id}"]`);
      element.dataset.responseContent += data.delta;
      element.querySelector('[data-voice-target="transcriptText"]').innerHTML = marked(element.dataset.responseContent);
      this.transcriptTarget.scrollTop = this.transcriptTarget.scrollHeight;
    } else if (data.type === 'input_audio_buffer.speech_started') {
      const template = this.userTranscriptTemplateTarget.content.cloneNode(true);
      template.children[0].dataset.itemId = data.item_id;
      this.transcriptTarget.appendChild(template);
      this.transcriptTarget.scrollTop = this.transcriptTarget.scrollHeight;
    } else if (data.type === 'conversation.item.input_audio_transcription.completed') {
      const template = this.transcriptTarget.querySelector(`[data-item-id="${data.item_id}"]`);
      template.querySelector('[data-voice-target="transcriptText"]').innerHTML = data.transcript;
      this.transcriptTarget.scrollTop = this.transcriptTarget.scrollHeight;
    }
  }
}
