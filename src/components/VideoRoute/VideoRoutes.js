import React, { useEffect, useRef, useState } from "react";
import { db, stopFirebase } from "../../libs/firebase";
import { collection, doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
import CallButtons from "../CallButtons/CallButtons";
import Video from "../Video/Video";
import { useParams, useNavigate } from "react-router-dom";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

let peerConnection = new RTCPeerConnection(servers);

function VideoRoutes({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const localPlayerRef = useRef();
  const remotePlayerRef = useRef();

  const iceCandidates = useRef([]);
  const localStreamVar = useRef();

  useEffect(() => {
    async function setupLocalPlayer() {
      if (peerConnection.connectionState === 'closed') {
        peerConnection = new RTCPeerConnection(servers)
      }
      try {
        localStreamVar.current = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStreamVar.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStreamVar.current);
        });

        if (localPlayerRef.current) {
          localPlayerRef.current.srcObject = localStreamVar.current;
        }

        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            iceCandidates.current.push(event.candidate);
          }
        };

        peerConnection.ontrack = (event) => {
          if (event.streams[0] && remotePlayerRef.current) {
            remotePlayerRef.current.srcObject = event.streams[0];
          }
        };

        if (mode === "create") {
          createMeeting();
        } else {
          joinMeeting();
        }
      } catch (error) {
        console.log(error);
      }
    }
    setupLocalPlayer();

    return () => {
        hungUp()
    };
  }, []);
  
  async function hungUp() {
    if (localStreamVar.current) {
      localStreamVar.current.getTracks().forEach((track) => track.stop());
    }
    peerConnection.close()
    navigate("/");
  }

  function waitForIceGathering(peerConnection) {
    return new Promise((resolve) => {
      peerConnection.onicegatheringstatechange = () => {
        if (peerConnection.iceGatheringState === "complete") {
          resolve();
        }
      };
    });
  }

  async function createMeeting() {
    await reset();
    const roomCreatorRef = doc(collection(db, "rooms"), id + "-creator");
    const sdp_offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(sdp_offer);

    console.log("Creating new room and gathering iceCandidates...");
    await waitForIceGathering(peerConnection);
    console.log(iceCandidates.current);
    await setDoc(roomCreatorRef, {
      sdp_offer: JSON.stringify(sdp_offer),
      iceCandidates: JSON.stringify(iceCandidates.current),
    });
    console.log(`New room created with SDP offer. Room ID: ${roomCreatorRef.id}`);

    onSnapshot(doc(db, "rooms", id + "-joined"), async (doc) => {
      const data = doc.data();
      if (data && Object.keys(data).length > 0) {
        try {
          console.log(JSON.parse(data.sdpAnswer));
          await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(data.sdpAnswer)));
        } catch (error) {
          console.log(error);
        }
        JSON.parse(data.iceCandidates).forEach(async (candidate) => {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        });
      }
    });
  }

  async function reset() {
    const roomCreatorRef = doc(collection(db, "rooms"), id + "-creator");
    await setDoc(roomCreatorRef, {});
    const roomJoinedRef = doc(collection(db, "rooms"), id + "-joined");
    await setDoc(roomJoinedRef, {});
  }

  async function joinMeeting() {
    const roomCreatorRef = doc(collection(db, "rooms"), id + "-creator");
    const data = (await getDoc(roomCreatorRef)).data();

    if (data && data.sdp_offer) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(JSON.parse(data.sdp_offer)));
      JSON.parse(data.iceCandidates).forEach(async (candidate) => {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      });

      const sdp_answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(sdp_answer);

      const roomJoinedRef = doc(collection(db, "rooms"), id + "-joined");
      console.log(`Joining Room...`);
      await waitForIceGathering(peerConnection);
      await setDoc(roomJoinedRef, {
        sdpAnswer: JSON.stringify(sdp_answer),
        iceCandidates: JSON.stringify(iceCandidates.current),
      });
      console.log(`Room joined with SDP answer. Room ID: ${roomJoinedRef.id}`);
    } else {
      console.log("Unable to join room. Room not found.");
    }
  }

  return (
    <div className="App">
      <Video isRemotePlayer={true} ref={remotePlayerRef} />
      <Video isRemotePlayer={false} ref={localPlayerRef} />
      <CallButtons hungUp={hungUp} />
    </div>
  );
}

export default VideoRoutes;
